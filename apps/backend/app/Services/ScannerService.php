<?php

namespace App\Services;

use App\Models\ScanLog;
use App\Models\Ticket;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScannerService
{
    /**
     * Get all tickets for an event for offline sync.
     * Returns minimal data needed for validation.
     */
    public function getTicketsForEvent($eventId, $tenantId)
    {
        // Check if event belongs to tenant
        $eventExists = \App\Models\Event::where('id', $eventId)
            ->where('tenant_id', $tenantId)
            ->exists();

        if (!$eventExists) {
            throw new \Exception("Event not found or access denied.");
        }

        return Ticket::where('event_id', $eventId)
            ->where('status', '!=', 'revoked')
            ->select(['id', 'ticket_code', 'status', 'checked_in_at', 'metadata', 'ticket_type_id', 'event_id'])
            ->get();
    }

    /**
     * Process a batch of scan logs from offline device.
     */
    public function processSyncLogs(array $logs, $gateStaff)
    {
        $gateStaffId = $gateStaff->id;
        $tenantId = $gateStaff->tenant_id;
        $results = [];

        foreach ($logs as $logData) {
            try {
                DB::transaction(function () use ($logData, $gateStaffId, $tenantId, &$results) {
                    $ticketCode = $logData['ticket_code'];
                    $eventId = $logData['event_id'];
                    $scannedAt = $logData['scanned_at']; // client timestamp
                    $deviceId = $logData['device_id'] ?? null;

                    // Find Ticket AND ensure it belongs to the Staff's Tenant
                    $ticket = Ticket::where('ticket_code', $ticketCode)
                        ->where('event_id', $eventId)
                        ->whereHas('event', function ($query) use ($tenantId) {
                            $query->where('tenant_id', $tenantId);
                        })
                        ->first();

                    if (!$ticket) {
                        $results[] = ['ticket_code' => $ticketCode, 'status' => 'error', 'message' => 'Ticket not found or access denied'];
                        return;
                    }

                    // Determine Status based on Server State vs Client Log
                    $status = 'valid';
                    if ($ticket->checked_in_at) {
                        $status = 'duplicate';
                    }

                    // Check idempotency
                    $exists = ScanLog::where('ticket_id', $ticket->id)
                        ->where('scanned_at', $scannedAt)
                        ->exists();

                    if ($exists) {
                        $results[] = ['ticket_code' => $ticketCode, 'status' => 'skipped', 'message' => 'Already synced'];
                        return;
                    }

                    ScanLog::create([
                        'id' => $logData['id'] ?? (string) \Illuminate\Support\Str::uuid(),
                        'event_id' => $eventId,
                        'ticket_id' => $ticket->id,
                        'gate_staff_id' => $gateStaffId,
                        'status' => $status,
                        'scanned_at' => $scannedAt,
                        'device_id' => $deviceId,
                        'is_offline_sync' => true,
                    ]);

                    // Update Ticket State
                    if ($status === 'valid') {
                        $ticket->checked_in_at = $scannedAt;
                        $ticket->save();
                    }

                    $results[] = ['ticket_code' => $ticketCode, 'status' => 'processed', 'server_status' => $status];
                });
            } catch (\Exception $e) {
                Log::error("Sync Error for ticket {$logData['ticket_code']}: " . $e->getMessage());
                $results[] = ['ticket_code' => $logData['ticket_code'], 'status' => 'error', 'message' => $e->getMessage()];
            }
        }

        return $results;
    }

    /**
     * Validate a single ticket in real-time (Online Mode).
     */
    public function validateTicket($ticketCode, $eventId, $gateStaff)
    {
        $tenantId = $gateStaff->tenant_id;

        // 1. Find Ticket
        $ticket = Ticket::where('ticket_code', $ticketCode)
            ->where('event_id', $eventId)
            ->whereHas('event', function ($query) use ($tenantId) {
                $query->where('tenant_id', $tenantId);
            })
            ->first();

        if (!$ticket) {
            return [
                'status' => 'invalid',
                'message' => 'Ticket not found or access denied',
                'ticket' => null
            ];
        }

        // 2. Check Validity
        if ($ticket->status === 'revoked') {
            return [
                'status' => 'invalid',
                'message' => 'Ticket is revoked',
                'ticket' => $ticket
            ];
        }

        // 3. Check Duplicate
        if ($ticket->checked_in_at) {
            return [
                'status' => 'duplicate',
                'message' => 'Already scanned at ' . $ticket->checked_in_at,
                'ticket' => $ticket
            ];
        }

        // 4. Success - Update Ticket & Log
        $scannedAt = now();
        
        DB::transaction(function() use ($ticket, $gateStaff, $eventId, $scannedAt) {
            $ticket->checked_in_at = $scannedAt;
            $ticket->save();

            ScanLog::create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'event_id' => $eventId,
                'ticket_id' => $ticket->id,
                'gate_staff_id' => $gateStaff->id,
                'status' => 'valid',
                'scanned_at' => $scannedAt,
                'is_offline_sync' => false,
            ]);
        });

        return [
            'status' => 'valid',
            'message' => 'Welcome!',
            'ticket' => $ticket
        ];
    }
}
