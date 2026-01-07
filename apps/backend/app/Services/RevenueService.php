<?php

namespace App\Services;

use App\Models\Order;
use App\Models\TenantTransaction;
use Illuminate\Support\Facades\DB;

class RevenueService
{
    // Fixed fees for MVP. In future, these could be configurable per tenant.
    const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%
    const GATEWAY_FEE_PERCENTAGE = 0.03; // 3%

    public function processRevenueShare(Order $order)
    {
        // Look up the event and tenant associated with the order
        // Order belongsTo Event belongsTo Tenant
        // Wait, Order doesn't directly have tenant_id? Let's check Order model.
        // Usually Order -> Event -> Tenant. Or we can assume order has event_id.

        $event = $order->event;
        if (!$event) {
            throw new \Exception("Order {$order->id} has no associated event.");
        }

        $tenant = $event->tenant;
        if (!$tenant) {
            throw new \Exception("Event {$event->id} has no associated tenant.");
        }

        // Avoid double processing
        // Check if transaction already exists for this order
        $existing = TenantTransaction::where('reference_type', Order::class)
            ->where('reference_id', $order->id)
            ->exists();

        if ($existing) {
            return; // Already processed
        }

        $gross = $order->total_amount;
        $platformFee = $gross * self::PLATFORM_FEE_PERCENTAGE;
        $gatewayFee = $gross * self::GATEWAY_FEE_PERCENTAGE;
        $commission = $order->commission_amount ?? 0;
        $netAmount = $gross - $platformFee - $gatewayFee - $commission;

        // Ensure calculations are precise enough (floor/ceil?) 
        // For financial apps, usually we use integers, but we are using decimal(15,2).
        // Let's rely on database math or cast carefully.

        DB::transaction(function () use ($tenant, $netAmount, $order, $platformFee, $gatewayFee, $commission) {
            // 1. Credit Net Amount to Tenant
            $tenant->balance += $netAmount;
            $tenant->save();

            // 2. Record Transaction
            TenantTransaction::create([
                'tenant_id' => $tenant->id,
                'amount' => $netAmount,
                'type' => 'credit',
                'reference_type' => Order::class,
                'reference_id' => $order->id,
                'description' => "Revenue for Order #{$order->id} (Fees: Platform " . number_format($platformFee) . ", Gateway " . number_format($gatewayFee) . ", Commission " . number_format($commission) . ")",
            ]);
        });
    }
}
