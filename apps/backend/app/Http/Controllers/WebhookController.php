<?php

namespace App\Http\Controllers;

use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function handle(Request $request, $provider)
    {
        Log::info("Webhook Received [$provider]: " . json_encode($request->all()));

        try {
            // In a real multi-provider setup, we might resolve a specific service or gateway here.
            // For now, our PaymentService defaults to the configured driver (Mock).

            $this->paymentService->handleWebhook($request->all());

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error("Webhook Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
