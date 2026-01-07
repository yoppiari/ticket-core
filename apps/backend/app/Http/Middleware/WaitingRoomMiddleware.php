<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\WaitingRoomService;

class WaitingRoomMiddleware
{
    protected $waitingRoomService;

    public function __construct(WaitingRoomService $waitingRoomService)
    {
        $this->waitingRoomService = $waitingRoomService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Try to get event slug from route
        $eventSlug = $request->route('eventSlug') ?? $request->route('event');

        // If no event context, skip
        if (!$eventSlug) {
            return $next($request);
        }

        // Get or generate user token
        $token = $this->waitingRoomService->getSessionToken();

        // Check status
        $status = $this->waitingRoomService->checkStatus($eventSlug, $token);

        if ($status['status'] === 'waiting') {
            return response()->json([
                'message' => 'Waiting Room',
                'status' => 'waiting',
                'position' => $status['position'],
                'total_waiting' => $status['total_waiting'],
            ], 429)->withCookie(cookie('wr_token', $token, 1440));
        }

        // Add token to cookie if admitted
        $response = $next($request);

        if ($response instanceof \Illuminate\Http\Response || $response instanceof \Illuminate\Http\JsonResponse) {
            $response->withCookie(cookie('wr_token', $token, 1440));
        }

        return $response;
    }
}
