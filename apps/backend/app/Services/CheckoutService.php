<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Order;
use App\Models\Seat;
use App\Models\Addon;
use App\Models\TicketType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutService
{
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }


    public function createOrder(Event $event, $userId, array $seatIds = [], array $ticketQuantities = [], array $addonSelections = [], $affiliateId = null, $buyerName = null, $buyerEmail = null, $buyerWhatsapp = null, $deliveryMethod = 'email')
    {
        // ... (validation logic same as before) ...
        // 1. Validate Seats
        if (!empty($seatIds)) {
            $reservationStatus = $this->reservationService->checkReservations($event, $seatIds, (string) $userId);

            $validSeatIds = [];
            foreach ($reservationStatus as $seatId => $status) {
                if ($status['is_mine']) {
                    $validSeatIds[] = $seatId;
                }
            }

            if (count($validSeatIds) !== count($seatIds)) {
                throw new \Exception("Some seats are no longer reserved. Please select again.");
            }
        }

        return DB::transaction(function () use ($event, $userId, $seatIds, $ticketQuantities, $addonSelections, $affiliateId, $buyerName, $buyerEmail, $buyerWhatsapp, $deliveryMethod) {
            $totalAmount = 0;
            $orderItemsData = [];

            // 1.5 Process Tickets (Non-seated)
            if (!empty($ticketQuantities)) {
                $ticketTypeIds = array_keys($ticketQuantities);
                $ticketTypes = TicketType::whereIn('id', $ticketTypeIds)->lockForUpdate()->get();

                foreach ($ticketTypes as $ticketType) {
                    $qty = $ticketQuantities[$ticketType->id];
                    if ($qty > 0) {
                        if ($ticketType->stock < $qty) {
                            throw new \Exception("Ticket {$ticketType->name} has insufficient stock.");
                        }

                        $ticketType->decrement('stock', $qty);

                        $subtotal = $ticketType->price * $qty;
                        $totalAmount += $subtotal;

                        $orderItemsData[] = [
                            'item_type' => 'ticket_type',
                            'item_id' => $ticketType->id,
                            'quantity' => $qty,
                            'unit_price' => $ticketType->price,
                            'subtotal' => $subtotal,
                        ];
                    }
                }
            }

            // 2. Process Seats
            $seats = Seat::whereIn('id', $seatIds)->with('ticketType')->get();
            foreach ($seats as $seat) {
                $price = $seat->ticketType->price;
                $totalAmount += $price;

                $orderItemsData[] = [
                    'item_type' => 'seat',
                    'item_id' => $seat->id,
                    'quantity' => 1,
                    'unit_price' => $price,
                    'subtotal' => $price,
                ];
            }

            // 3. Process Addons
            if (!empty($addonSelections)) {
                $addonIds = array_keys($addonSelections);
                $addons = Addon::whereIn('id', $addonIds)->get();

                foreach ($addons as $addon) {
                    $qty = $addonSelections[$addon->id];
                    if ($qty > 0) {
                        if ($addon->stock < $qty) {
                            throw new \Exception("Addon {$addon->name} has insufficient stock.");
                        }

                        $subtotal = $addon->price * $qty;
                        $totalAmount += $subtotal;

                        $orderItemsData[] = [
                            'item_type' => 'addon',
                            'item_id' => $addon->id,
                            'quantity' => $qty,
                            'unit_price' => $addon->price,
                            'subtotal' => $subtotal,
                        ];
                    }
                }
            }

            // Calculate Commission
            $commissionAmount = 0;
            if ($affiliateId && $event->affiliate_enabled) {
                // Verify affiliate exists (global or tenant specific check if we kept it)
                // With global affiliates, we just need to ensure the ID is valid.
                $affiliate = \App\Models\Affiliate::find($affiliateId);

                if ($affiliate) {
                    if ($event->commission_type === 'percent') {
                        $commissionAmount = $totalAmount * ($event->commission_value / 100);
                    } else {
                        // Fixed amount per TICKET/ITEM? Or per ORDER? 
                        // Usually fixed is per ticket sold.
                        // Impl Plan said: event->commission_value * ticket_quantity

                        // Calculate total items quantity (tickets + seats)
                        $totalItems = 0;
                        foreach ($orderItemsData as $item) {
                            if (in_array($item['item_type'], ['ticket_type', 'seat'])) {
                                $totalItems += $item['quantity'];
                            }
                        }
                        $commissionAmount = $totalItems * $event->commission_value;
                    }
                } else {
                    $affiliateId = null; // Reset if invalid
                }
            } else {
                $affiliateId = null; // Clear if disabled
            }

            // 4. Create Order
            // Determine user_id or session_id
            $realUserId = null;
            $sessionId = null;

            if (is_numeric($userId)) {
                $realUserId = $userId;
            } else {
                $sessionId = $userId;
            }

            $order = Order::create([
                'event_id' => $event->id,
                'user_id' => $realUserId,
                'session_id' => $sessionId,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'expires_at' => now()->addMinutes(15),
                'affiliate_id' => $affiliateId,
                'commission_amount' => $commissionAmount,
                'buyer_name' => $buyerName,
                'buyer_email' => $buyerEmail,
                'buyer_whatsapp' => $buyerWhatsapp,
                'delivery_method' => $deliveryMethod,
            ]);

            // 5. Save Items
            foreach ($orderItemsData as $item) {
                $order->items()->create($item);
            }

            return $order;
        });
    }
}
