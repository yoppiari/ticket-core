<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\WaitingRoomService;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class WaitingRoomTest extends TestCase
{
    protected $waitingRoomService;
    protected $eventId = 'test-event';

    protected function setUp(): void
    {
        parent::setUp();
        $this->waitingRoomService = app(WaitingRoomService::class);
        Redis::flushall();
        config(['ticketing.waiting_room_limit' => 2]);
    }

    public function test_user_is_admitted_when_under_limit()
    {
        $token = (string) Str::uuid();
        $status = $this->waitingRoomService->checkStatus($this->eventId, $token);

        $this->assertEquals('admitted', $status['status']);
    }

    public function test_user_is_queued_when_over_limit()
    {
        // Admit 2 users
        $this->waitingRoomService->checkStatus($this->eventId, 'user-1');
        $this->waitingRoomService->checkStatus($this->eventId, 'user-2');

        // Third user should be waiting
        $token = 'user-3';
        $status = $this->waitingRoomService->checkStatus($this->eventId, $token);

        $this->assertEquals('waiting', $status['status']);
        $this->assertEquals(1, $status['position']);
    }

    public function test_user_is_admitted_after_active_user_becomes_inactive()
    {
        // 1. Admit 2 users
        $this->waitingRoomService->checkStatus($this->eventId, 'user-1');
        $this->waitingRoomService->checkStatus($this->eventId, 'user-2');

        // 2. User 3 is waiting
        $this->waitingRoomService->checkStatus($this->eventId, 'user-3');

        // 3. Fast forward time for user-1 (make them inactive)
        // In real use, we'd wait or mock time. Here we can manually adjust Redis score.
        $activeKey = "waiting_room:{$this->eventId}:active";
        Redis::zadd($activeKey, time() - 40, 'user-1');

        // 4. Try admit
        $this->waitingRoomService->tryAdmit($this->eventId);

        // 5. Check status for user-3
        $status = $this->waitingRoomService->checkStatus($this->eventId, 'user-3');
        $this->assertEquals('admitted', $status['status']);
    }

    public function test_fifo_admission()
    {
        // Admit 2 users
        $this->waitingRoomService->checkStatus($this->eventId, 'user-1');
        $this->waitingRoomService->checkStatus($this->eventId, 'user-2');

        // Queue 2 users
        $this->waitingRoomService->checkStatus($this->eventId, 'user-3');
        $this->waitingRoomService->checkStatus($this->eventId, 'user-4');

        // Free 1 slot
        $activeKey = "waiting_room:{$this->eventId}:active";
        Redis::zrem($activeKey, 'user-1');

        // Try admit
        $this->waitingRoomService->tryAdmit($this->eventId);

        // user-3 should be admitted, user-4 still waiting
        $this->assertEquals('admitted', $this->waitingRoomService->checkStatus($this->eventId, 'user-3')['status']);
        $this->assertEquals('waiting', $this->waitingRoomService->checkStatus($this->eventId, 'user-4')['status']);
        $this->assertEquals(1, $this->waitingRoomService->checkStatus($this->eventId, 'user-4')['position']);
    }
}
