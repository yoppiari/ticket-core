<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Seat;
use App\Services\ReservationService;
use Illuminate\Http\Request;

class SeatController extends Controller
{
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    /**
     * Display a listing of seats for a specific event.
     */
    public function index(string $eventSlug)
    {
        $event = Event::where('slug', $eventSlug)->firstOrFail();

        $seats = $event->seats()
            ->select(['id', 'ticket_type_id', 'label', 'row', 'column', 'section', 'status'])
            ->get();

        $userId = auth()->id() ?? \Illuminate\Support\Facades\Session::getId();
        $seatIds = $seats->pluck('id')->toArray();
        $reservations = $this->reservationService->checkReservations($event, $seatIds, $userId);

        $seatsWithStatus = $seats->map(function ($seat) use ($reservations) {
            $res = $reservations[$seat->id] ?? null;
            $status = $seat->status;

            if ($res && $res['is_reserved']) {
                $status = 'reserved';
                // You could also add 'is_mine' if needed for the frontend
            }

            return array_merge($seat->toArray(), [
                'status' => $status,
                'is_mine' => $res['is_mine'] ?? false,
            ]);
        });

        return response()->json([
            'layout' => $event->seat_map_layout,
            'seats' => $seatsWithStatus
        ]);
    }
}
