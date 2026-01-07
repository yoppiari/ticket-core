<?php

namespace App\Http\Controllers;

use App\Services\ScannerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScannerController extends Controller
{
    protected ScannerService $scannerService;

    public function __construct(ScannerService $scannerService)
    {
        $this->scannerService = $scannerService;
    }

    public function getTickets(Request $request, $eventId)
    {
        // Add Gate Staff Check Middleware or Policy here in real app
        // e.g. $this->authorize('view', $event);

        $tickets = $this->scannerService->getTicketsForEvent($eventId);
        return response()->json($tickets);
    }

    public function syncLogs(Request $request, $eventId)
    {
        $request->validate([
            'logs' => 'required|array',
            'logs.*.ticket_code' => 'required|string',
            'logs.*.scanned_at' => 'required|date',
            'logs.*.event_id' => 'required|in:' . $eventId,
        ]);

        $gateStaffId = Auth::id(); // Assumes auth:sanctum

        $results = $this->scannerService->processSyncLogs($request->logs, $gateStaffId);

        return response()->json(['results' => $results]);
    }
}
