<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class WaitingRoomService
{
    protected string $prefix = 'waiting_room';

    /**
     * Get or create a session token for the user.
     */
    public function getSessionToken(): string
    {
        return request()->cookie('wr_token') ?? (string) Str::uuid();
    }

    /**
     * Remove inactive users from active set.
     */
    protected function cleanupActiveUsers(string $eventId): void
    {
        $activeKey = "{$this->prefix}:{$eventId}:active";
        Redis::zremrangebyscore($activeKey, '-inf', time() - 30);
    }

    /**
     * Check if a user is admitted or should be in the waiting room.
     */
    public function checkStatus(string $eventId, string $token): array
    {
        $this->cleanupActiveUsers($eventId);

        $limit = config('ticketing.waiting_room_limit', 1000);
        $activeKey = "{$this->prefix}:{$eventId}:active";

        // 1. Is user already active?
        if (Redis::zscore($activeKey, $token) !== null) {
            // Update heartbeat
            Redis::zadd($activeKey, time(), $token);
            return ['status' => 'admitted'];
        }

        // 2. Is there room? (And no one is waiting)
        $waitingListKey = "{$this->prefix}:{$eventId}:waiting_list";
        $activeCount = Redis::zcard($activeKey);
        $waitingCount = Redis::zcard($waitingListKey);

        if ($activeCount < $limit && $waitingCount === 0) {
            // Admit user
            Redis::zadd($activeKey, time(), $token);
            return ['status' => 'admitted'];
        }

        // 3. User is waiting. Add to queue if not already there.
        // Note: Finding position in List is expensive, but we check if they are in queue.
        // Simple strategy: If they aren't active, they are "waiting".
        // Actually, let's use a Sorted Set for waiting too to avoid duplicates easily.

        $waitingListKey = "{$this->prefix}:{$eventId}:waiting_list";
        $position = Redis::zrank($waitingListKey, $token);

        if ($position === null) {
            Redis::zadd($waitingListKey, time(), $token);
            $position = Redis::zrank($waitingListKey, $token);
        }

        return [
            'status' => 'waiting',
            'position' => $position + 1,
            'total_waiting' => Redis::zcard($waitingListKey)
        ];
    }

    /**
     * Heartbeat to keep session alive.
     */
    public function heartbeat(string $eventId, string $token): void
    {
        $activeKey = "{$this->prefix}:{$eventId}:active";
        if (Redis::zscore($activeKey, $token) !== null) {
            Redis::zadd($activeKey, time(), $token);
        }
    }

    /**
     * Try to admit users from the waiting list.
     */
    public function tryAdmit(string $eventId): void
    {
        $this->cleanupActiveUsers($eventId);

        $limit = config('ticketing.waiting_room_limit', 1000);
        $activeKey = "{$this->prefix}:{$eventId}:active";
        $waitingListKey = "{$this->prefix}:{$eventId}:waiting_list";

        $activeCount = Redis::zcard($activeKey);
        $availableSlots = $limit - $activeCount;

        if ($availableSlots > 0) {
            $toAdmit = Redis::zrange($waitingListKey, 0, $availableSlots - 1);
            if (!empty($toAdmit)) {
                foreach ($toAdmit as $token) {
                    Redis::zadd($activeKey, time(), $token);
                    Redis::zrem($waitingListKey, $token);
                }
            }
        }
    }
}
