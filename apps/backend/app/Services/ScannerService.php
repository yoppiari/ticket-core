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
    public function getTicketsForEvent($eventId)
    {
        return Ticket::where('event_id', $eventId)
            ->where('status', '!=', 'revoked')
            ->select(['id', 'ticket_code', 'status', 'checked_in_at', 'metadata', 'ticket_type_id'])
            ->get();
    }

    /**
     * Process a batch of scan logs from offline device.
     */
    public function processSyncLogs(array $logs, $gateStaffId)
    {
        $results = [];

        foreach ($logs as $logData) {
            try {
                DB::transaction(function () use ($logData, $gateStaffId, &$results) {
                    $ticketCode = $logData['ticket_code'];
                    $eventId = $logData['event_id'];
                    $scannedAt = $logData['scanned_at']; // client timestamp
                    $deviceId = $logData['device_id'] ?? null;

                    // Find Ticket
                    $ticket = Ticket::where('ticket_code', $ticketCode)
                        ->where('event_id', $eventId)
                        ->first();

                    if (!$ticket) {
                        // Cannot log to ScanLog due to FK constraint if ticket missing.
                        // In real system, maybe log to 'failed_scans' table.
                        // For now, ignore or return error.
                        $results[] = ['ticket_code' => $ticketCode, 'status' => 'error', 'message' => 'Ticket not found'];
                        return;
                    }

                    // Determine Status based on Server State vs Client Log
                    // Client said it was 'valid' or 'duplicate', but server is truth.
                    // If server already checked in, it's duplicate.
                    $status = 'valid';
                    if ($ticket->checked_in_at) {
                        // If scanned_at is AFTER checked_in_at, it is duplicate.
                        // If scanned_at is BEFORE, maybe late sync? 
                        // Let's assume simplest: if already checked in, duplicate.
                        $status = 'duplicate';
                    }

                    // Log it
                    // Check if this specific scan log already exists (idempotency by scanned_at + ticket?)
                    // Or just always add log?
                    // Let's prevent massive dupes if client re-syncs.
                    $exists = ScanLog::where('ticket_id', $ticket->id)
                        ->where('scanned_at', $scannedAt)
                        ->exists();

                    if ($exists) {
                        $results[] = ['ticket_code' => $ticketCode, 'status' => 'skipped', 'message' => 'Already synced'];
                        return;
                    }

                    ScanLog::create([
                        'id' => $logData['id'] ?? (string) \Illuminate\Support\Str::uuid(), // use client ID if provided? Or generate new.
                        // Safest to generate new or validate client UUID. Let's create new for server to avoid uuid collision issues if client is buggy.
                        // Actually, if we want robust sync, client ID is better. Let's use it if valid UUID.
                        // For simplicity, let Laravel generate.
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
}
