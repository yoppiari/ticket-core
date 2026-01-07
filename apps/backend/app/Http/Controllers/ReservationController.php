<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Services\ReservationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class ReservationController extends Controller
{
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    /**
     * Reserve multiple seats for the current session.
     */
    public function reserve(Request $request, string $eventSlug)
    {
        $request->validate([
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'exists:seats,id',
        ]);

        $event = Event::where('slug', $eventSlug)->firstOrFail();

        // Use session ID if guest, or user ID if authenticated
        $userId = auth()->id() ?? Session::getId();

        $result = $this->reservationService->reserveSeats(
            $event,
            $request->seat_ids,
            $userId
        );

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }

    /**
     * Release multiple seats for the current session.
     */
    public function release(Request $request, string $eventSlug)
    {
        $request->validate([
            'seat_ids' => 'required|array',
        ]);

        $event = Event::where('slug', $eventSlug)->firstOrFail();
        $userId = auth()->id() ?? Session::getId();

        $this->reservationService->releaseSeats($event, $request->seat_ids, $userId);

        return response()->json(['success' => true]);
    }
}
