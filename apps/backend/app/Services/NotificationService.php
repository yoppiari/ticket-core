<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function sendTickets(Order $order, $tickets = [])
    {
        $method = $order->delivery_method ?? 'email';

        Log::info("Starting ticket delivery for Order {$order->id} via {$method}");

        if ($method === 'email' || $method === 'both') {
            $this->sendEmail($order);
        }

        if ($method === 'whatsapp' || $method === 'both') {
            $this->sendWhatsApp($order);
        }
    }

    protected function sendEmail(Order $order)
    {
        // Mock Implementation
        // In real app: Mail::to($order->buyer_email)->send(new TicketMail($order));

        Log::info("[MOCK EMAIL] Sending tickets to {$order->buyer_email}");
        Log::info("[MOCK EMAIL] Subject: Your Tickets for {$order->event->name}");
        Log::info("[MOCK EMAIL] Body: Here are your tickets...");
    }

    protected function sendWhatsApp(Order $order)
    {
        // Mock Implementation
        // In real app: Http::post('wa-gateway.com/send', ...)

        $phone = $order->buyer_whatsapp;
        Log::info("[MOCK WA] Sending tickets to {$phone}");
        Log::info("[MOCK WA] Message: Hello {$order->buyer_name}, here are your tickets for {$order->event->name}. Download here: [Link]");
    }
}
