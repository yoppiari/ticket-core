<?php

namespace App\Services\Gateways;

use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use Illuminate\Support\Str;

class MockGateway implements PaymentGatewayInterface
{
    public function createInvoice(Order $order): array
    {
        // Simulate an external provider ID
        $transactionId = 'mock_' . Str::random(12);

        // In a real gateway, this would be the URL to Xendit/Midtrans page.
        // For Mock, we can just return a success page URL on our own app, or a special debug route.
        // Let's assume we redirect to a frontend "success" page immediately for now, 
        // OR a "mock payment page" if we want to be fancy.
        // Simulating "Redirect" flow:

        return [
            'redirect_url' => "/mock-payment-gateway?order_id={$order->id}&amount={$order->total_amount}&ref={$transactionId}",
            'transaction_id' => $transactionId,
            'status' => 'pending'
        ];
    }

    public function verifyPayment(string $providerId): string
    {
        // Mock always says paid for now if asked
        return 'paid';
    }

    public function processWebhook(array $payload): array
    {
        // Mock Gateway expects: { "order_id": "...", "status": "PAID" }
        // In real life, verify signature here.
        if (($payload['token'] ?? '') !== 'valid-mock-token') {
            throw new \Exception("Invalid signature token");
        }

        return [
            'order_id' => $payload['order_id'] ?? null,
            'status' => strtolower($payload['status'] ?? 'failed'), // 'paid' or 'failed'
            'external_id' => $payload['external_id'] ?? Str::random(10)
        ];
    }
}
