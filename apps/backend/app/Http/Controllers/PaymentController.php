<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function pay(Request $request, $eventSlug, $orderId)
    {
        $order = Order::findOrFail($orderId);

        // Security check
        $userId = auth()->id() ?? Session::getId();
        $isOwner = ($order->user_id && $order->user_id == auth()->id()) ||
            ($order->session_id && $order->session_id == Session::getId());

        if (!$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $paymentData = $this->paymentService->initiatePayment($order);

            return response()->json([
                'success' => true,
                'data' => $paymentData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
