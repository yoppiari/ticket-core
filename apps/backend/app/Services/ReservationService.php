<?php

namespace App\Services;

use App\Models\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class ReservationService
{
    protected string $prefix = 'ticket:reservation:';
    protected int $defaultTtl = 600; // 10 minutes

    /**
     * Attempt to reserve multiple seats for a user/session.
     *
     * @param Event $event
     * @param array $seatIds
     * @param string $userId
     * @return array Result with success and reserved/failed IDs
     */
    public function reserveSeats(Event $event, array $seatIds, string $userId): array
    {
        $reserved = [];
        $failed = [];
        $ttl = config('ticketing.reservation_timeout', $this->defaultTtl);

        foreach ($seatIds as $seatId) {
            $key = $this->getRedisKey($event->id, $seatId);

            // Atomically set if not exists
            $success = Redis::set($key, $userId, 'EX', $ttl, 'NX');

            if ($success) {
                $reserved[] = $seatId;
            } else {
                // Check if it's already reserved by the SAME user (extending)
                $existingUser = Redis::get($key);
                if ($existingUser === $userId) {
                    Redis::expire($key, $ttl);
                    $reserved[] = $seatId;
                } else {
                    $failed[] = $seatId;
                }
            }
        }

        return [
            'success' => count($failed) === 0,
            'reserved' => $reserved,
            'failed' => $failed,
            'expires_at' => now()->addSeconds($ttl)->toIso8601String(),
        ];
    }

    /**
     * Release specific seats reserved by a user.
     */
    public function releaseSeats(Event $event, array $seatIds, string $userId): void
    {
        foreach ($seatIds as $seatId) {
            $key = $this->getRedisKey($event->id, $seatId);
            $existingUser = Redis::get($key);

            if ($existingUser == $userId) {
                Redis::del($key);
            }
        }
    }

    /**
     * Check if a set of seats is currently reserved by anyone else.
     */
    public function checkReservations(Event $event, array $seatIds, string $userId): array
    {
        $status = [];
        foreach ($seatIds as $seatId) {
            $key = $this->getRedisKey($event->id, $seatId);
            $owner = Redis::get($key);

            $status[$seatId] = [
                'is_reserved' => (bool) $owner,
                'is_mine' => $owner === $userId,
            ];
        }
        return $status;
    }

    protected function getRedisKey(string $eventId, string $seatId): string
    {
        return "{$this->prefix}{$eventId}:{$seatId}";
    }
}
