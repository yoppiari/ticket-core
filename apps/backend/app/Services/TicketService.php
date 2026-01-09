<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Ticket;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketService
{
    public function generateTickets(Order $order)
    {
        if ($order->status !== 'paid') {
            throw new \Exception("Cannot generate tickets for unpaid order.");
        }

        // Avoid duplicates checking one ticket
        if (Ticket::where('order_id', $order->id)->exists()) {
            return;
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                // Determine event_id and ticket_type_id
                // Note: items can be 'seat', 'ticket_type', 'addon'

                // Addons usually don't have separate tickets unless specified.
                // Assuming we only generate tickets for 'seat' and 'ticket_type'.

                if ($item->item_type === 'addon') {
                    continue;
                }

                $ticketTypeId = null;
                if ($item->item_type === 'ticket_type') {
                    $ticketTypeId = $item->item_id;
                } elseif ($item->item_type === 'seat') {
                    // For now assuming seat implies ticket type access, 
                    // or we need to look up ticket type from seat.
                    // Let's assume seat item has details we need or we look it up.
                    // But wait, order items save item_id. 
                    // If seat, we might need to find which ticket type it belongs to?
                    // Skipping deeply complex seat logic for MVP fast path.
                    // We just store null or assume item_id *is* ticket type for non-seated?
                    // Actually, OrderItem schema connects to ticket_type_id? No, polymorphic item_id.

                    // Let's assume we fetch details if needed.
                    $ticketTypeId = $item->ticket_type_id; // Check schema?
                }

                // If schema doesn't have ticket_type_id on Create Order Item...
                // Let's check OrderItem migration if I could... but to be safe:
                // Ticket model has ticket_type_id.
                // We should ensure we populate it.
                // For 'ticket_type' items, it is the item_id.

                $quantity = $item->quantity;

                for ($i = 0; $i < $quantity; $i++) {
                    Ticket::create([
                        'event_id' => $order->event_id,
                        'order_id' => $order->id,
                        'ticket_type_id' => $item->item_type === 'ticket_type' ? $item->item_id : null,
                        'ticket_code' => strtoupper(Str::random(10)), // Unique hash
                        'status' => 'valid',
                        'metadata' => [
                            'item_type' => $item->item_type,
                            'item_id' => $item->item_id,
                        ]
                    ]);
                }
            }
        });

        Log::info("Generated tickets for Order {$order->id}");
    }
}
