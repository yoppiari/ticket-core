<?php

namespace App\Services;

use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use App\Services\Gateways\MockGateway;
// use App\Services\Gateways\XenditGateway; // Future

class PaymentService
{
    protected PaymentGatewayInterface $gateway;
    protected RevenueService $revenueService;
    protected TicketService $ticketService;
    protected NotificationService $notificationService;

    public function __construct(
        RevenueService $revenueService,
        TicketService $ticketService,
        NotificationService $notificationService
    ) {
        $this->revenueService = $revenueService;
        $this->ticketService = $ticketService;
        $this->notificationService = $notificationService;

        // Simple factory logic based on config
        // In real app, bind this in AppServiceProvider
        $driver = config('ticketing.payment.default', 'mock');

        switch ($driver) {
            case 'mock':
                $this->gateway = new MockGateway();
                break;
            // case 'xendit': ...
            default:
                throw new \Exception("Payment driver [$driver] not supported.");
        }
    }

    public function initiatePayment(Order $order)
    {
        if ($order->status !== 'pending') {
            // If already paid, return null or throw?
            // Let's assume we allow re-initiating if pending/failed
            if ($order->status === 'paid') {
                throw new \Exception("Order is already paid.");
            }
        }

        $result = $this->gateway->createInvoice($order);

        // Update order with transaction ID?
        // Ideally we have a 'transactions' table, but for now let's keep it simple or store in metadata column?
        // Or just rely on order tables. 
        // Let's store external_id in a new column or just a basic check.
        // Actually, let's keep it robust.

        return $result;
    }

    public function handleWebhook(array $payload)
    {
        // 1. Parse payload via Gateway
        $data = $this->gateway->processWebhook($payload);

        if (empty($data['order_id'])) {
            throw new \Exception("Invalid webhook payload: Missing Order ID");
        }

        // 2. Find Order
        $order = Order::findOrFail($data['order_id']);

        // 3. Update Status
        if ($data['status'] === 'paid' && $order->status !== 'paid') {
            $order->status = 'paid';
            $order->save();

            // 4. Calculate Revenue
            $this->revenueService->processRevenueShare($order);

            // 5. Generate & Send Tickets
            try {
                $this->ticketService->generateTickets($order);
                $this->notificationService->sendTickets($order);
            } catch (\Exception $e) {
                // Log but don't fail the webhook response
                \Illuminate\Support\Facades\Log::error("Failed to deliver tickets: " . $e->getMessage());
            }
        } elseif ($data['status'] === 'failed') {
            $order->status = 'failed';
            $order->save();
        }

        return $order;
    }
}
