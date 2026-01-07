<?php

namespace App\Interfaces;

use App\Models\Order;

interface PaymentGatewayInterface
{
    /**
     * Create an invoice/payment request for the order.
     * 
     * @param Order $order
     * @return array Contains 'redirect_url', 'transaction_id', etc.
     */
    public function createInvoice(Order $order): array;

    /**
     * Verify a callback or status check.
     * 
     * @param string $providerId
     * @return string Status (paid, pending, expired, failed)
     */
    public function verifyPayment(string $providerId): string;

    /**
     * Process a webhook payload and return normalized status.
     * 
     * @param array $payload
     * @return array ['order_id' => ..., 'status' => ..., 'external_id' => ...]
     */
    public function processWebhook(array $payload): array;
}
