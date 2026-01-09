<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the current tenant.
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!$user->tenant_id) {
            return response()->json(['message' => 'No Tenant Context'], 400);
        }

        $tenant = Tenant::find($user->tenant_id);

        if (!$tenant) {
            return response()->json(['message' => 'Tenant Not Found'], 404);
        }

        // 1. Total Events
        $eventsCount = $tenant->events()->count();

        // 2. Total Sales (Revenue) - aggregated from Orders
        // Assuming 'paid' status for completed orders.
        // If status logic varies, adjust accordingly.
        $totalSales = \App\Models\Order::whereHas('event', function ($q) use ($tenant) {
            $q->where('tenant_id', $tenant->id);
        })
            ->where('status', 'paid')
            ->sum('total_amount');

        // 3. Tickets Sold
        // Count OrderItems of type 'seat' linked to paid orders
        $ticketsSold = \App\Models\OrderItem::whereHas('order', function ($q) use ($tenant) {
            $q->whereHas('event', function ($e) use ($tenant) {
                $e->where('tenant_id', $tenant->id);
            })
                ->where('status', 'paid');
        })
            ->where('item_type', 'seat')
            ->sum('quantity');

        // Mock usage for testing/demo purposes
        $mockUsage = $request->query('mock_usage');
        $usage = $mockUsage !== null ? (int) $mockUsage : $ticketsSold;

        $limit = $tenant->plan_limit;
        $percent = $limit > 0 ? round(($usage / $limit) * 100, 1) : 0;

        return response()->json([
            'events_count' => $eventsCount,
            'total_sales' => $totalSales,
            'tickets_sold' => $ticketsSold,
            'limit' => $limit,
            'usage' => $usage,
            'percent' => $percent,
        ]);
    }
}
