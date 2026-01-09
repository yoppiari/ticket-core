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
        $user = Auth::user();
        if (!$user->tenant_id) {
            abort(403, 'User does not belong to a tenant');
        }

        try {
            $tickets = $this->scannerService->getTicketsForEvent($eventId, $user->tenant_id);
            return response()->json($tickets);
        } catch (\Exception $e) {
            abort(403, $e->getMessage());
        }
    }

    public function syncLogs(Request $request, $eventId)
    {
        $request->validate([
            'logs' => 'required|array',
            'logs.*.ticket_code' => 'required|string',
            'logs.*.scanned_at' => 'required|date',
            'logs.*.event_id' => 'required|in:' . $eventId,
        ]);

        $user = Auth::user();
        if (!$user->tenant_id) {
            abort(403, 'User does not belong to a tenant');
        }

        $results = $this->scannerService->processSyncLogs($request->logs, $user);

        return response()->json(['results' => $results]);
    }
}
