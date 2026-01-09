<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class CheckoutController extends Controller
{
    protected $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    public function store(Request $request, $eventSlug)
    {
        $event = Event::where('slug', $eventSlug)->firstOrFail();

        $validated = $request->validate([
            'seat_ids' => 'sometimes|array',
            'seat_ids.*' => 'string',
            'tickets' => 'sometimes|array',
            'tickets.*' => 'integer|min:1',
            'addons' => 'nullable|array',
            'addons.*' => 'integer|min:0',
            'buyer_name' => 'required|string',
            'buyer_email' => 'required|email',
            'buyer_phone' => 'missing', // removed
            'buyer_whatsapp' => 'required|string',
            'delivery_method' => 'required|in:email,whatsapp,both',
        ]);

        if (empty($validated['seat_ids']) && empty($validated['tickets'])) {
            return response()->json(['message' => 'Please select at least one ticket or seat.'], 422);
        }

        $userId = auth()->id() ?? Session::getId();

        // 6-3 Affiliate Logic
        $refCode = $request->cookie('affiliate_ref') ?? $request->query('ref');

        if ($refCode) {
            // Lazy load service or direct model usage
            $affiliate = \App\Models\Affiliate::where('referral_code', $refCode)->first();

            if ($affiliate && ($affiliate->tenant_id === null || $affiliate->tenant_id === $event->tenant_id)) {
                $affiliateId = $affiliate->id;
            }
        }

        try {
            $order = $this->checkoutService->createOrder(
                $event,
                $userId,
                $validated['seat_ids'] ?? [],
                $validated['tickets'] ?? [],
                $validated['addons'] ?? [],
                $affiliateId,
                $validated['buyer_name'],
                $validated['buyer_email'],
                $validated['buyer_whatsapp'],
                $validated['delivery_method']
            );

            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'redirect_url' => "/{$event->slug}/checkout/{$order->id}"
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function show(Request $request, $eventSlug, $orderId)
    {
        // For the summary page - ensure user owns the order
        $userId = auth()->id() ?? Session::getId();

        $order = \App\Models\Order::with(['items', 'event.tenant'])
            ->where('id', $orderId)
            ->firstOrFail();

        // Authorization check
        // If auth user: check user_id
        // If guest: check session_id

        $isOwner = false;
        if ($order->user_id && $order->user_id == auth()->id()) {
            $isOwner = true;
        } elseif ($order->session_id && $order->session_id == Session::getId()) {
            $isOwner = true;
        }

        if (!$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Helper to group items
        $order->items->transform(function ($item) {
            if ($item->item_type === 'seat') {
                $item->details = \App\Models\Seat::find($item->item_id); // N+1 but ok for single order
            } elseif ($item->item_type === 'ticket_type') {
                $item->details = \App\Models\TicketType::find($item->item_id);
            } else {
                $item->details = \App\Models\Addon::find($item->item_id);
            }
            return $item;
        });

        return response()->json($order);
    }
}
