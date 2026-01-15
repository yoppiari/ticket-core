<?php

namespace App\Services\Gateways;

use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use Exception;

class SwanQrisGateway implements PaymentGatewayInterface
{
    protected $service;

    public function __construct()
    {
        $this->service = new SwanQrisService();
    }

    public function createInvoice(Order $order): array
    {
        // Use order_number or id as reference. Ideally order_number.
        // Assuming order_number is generated when order is created.
        $ref = $order->order_number ?? (string) $order->id;

        $response = $this->service->generateQr(
            $ref,
            $order->total_amount, // or whatever field holds the total
            900 // Default 15 mins validity
        );

        // Analyze response from SwanQRIS generate
        // Example response not fully detailed in doc summary, assuming standard fields:
        // { "qrContent": "...", "responseCode": "00" } 
        // We'll map this.

        // If the library/API returns the raw QR string (payload), we pass it.
        // If there's a url, we use it.

        $qrString = $response['qrContent'] ?? $response['qr_content'] ?? ''; // Guessing field name based on typical APIs

        // If we don't have a redirect URL, the FE must render the QR.
        // We can return a specific structure.

        return [
            'transaction_id' => $ref, // Using our ref as their ID isn't returned for future reference usually?
            'redirect_url' => null, // No hosted page
            'qr_string' => $qrString,
            'amount' => $order->total_amount,
            // Pass the whole response in case FE needs other fields
            'gateway_response' => $response
        ];
    }

    public function verifyPayment(string $providerId): string
    {
        $response = $this->service->queryTransaction($providerId);
        // Map status
        // Doc says 5.2 Query: check 'latestTransactionStatus' or similar in response
        $status = $response['transactionStatus'] ?? $response['latestTransactionStatus'] ?? null;

        if ($status === '00' || $status === 'Success') {
            return 'paid';
        }

        return 'pending'; // or failed
    }

    public function processWebhook(array $payload): array
    {
        // Payload from Notify
        // {
        //   "originalPartnerReferenceNo": "...",
        //   "latestTransactionStatus": "00",
        //   ...
        // }

        $status = 'pending';
        if (($payload['latestTransactionStatus'] ?? '') === '00') {
            $status = 'paid';
        } elseif (($payload['transactionStatusDesc'] ?? '') === 'Success') {
            $status = 'paid';
        }

        return [
            'order_id' => $payload['originalPartnerReferenceNo'] ?? null, // We used this as ref
            'status' => $status,
            'external_id' => $payload['additionalInfo']['paymentReferenceNo'] ?? null,
            'raw' => $payload
        ];
    }
}
