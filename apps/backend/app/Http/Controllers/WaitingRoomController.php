<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\WaitingRoomService;

class WaitingRoomController extends Controller
{
    protected $waitingRoomService;

    public function __construct(WaitingRoomService $waitingRoomService)
    {
        $this->waitingRoomService = $waitingRoomService;
    }

    /**
     * Get the user's current position in the queue.
     */
    public function status(Request $request, string $eventSlug)
    {
        $token = $this->waitingRoomService->getSessionToken();

        // Try to admit anyone waiting
        $this->waitingRoomService->tryAdmit($eventSlug);

        $status = $this->waitingRoomService->checkStatus($eventSlug, $token);

        return response()->json($status);
    }

    /**
     * Heartbeat to keep session alive.
     */
    public function heartbeat(Request $request, string $eventSlug)
    {
        $token = $this->waitingRoomService->getSessionToken();
        $this->waitingRoomService->heartbeat($eventSlug, $token);

        return response()->json(['status' => 'ok']);
    }
}
