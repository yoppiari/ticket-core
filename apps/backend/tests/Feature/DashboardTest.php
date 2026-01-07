<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function tenant_owner_can_view_dashboard_stats()
    {
        // 1. Setup Tenant and Owner
        $tenant = Tenant::factory()->create();
        $owner = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);

        // 2. Setup Events
        $event = Event::factory()->create(['tenant_id' => $tenant->id]);

        // 3. Setup Orders (Paid and Unpaid)
        $order = Order::create([
            'event_id' => $event->id,
            'user_id' => User::factory()->create()->id,
            'total_amount' => 100000,
            'status' => 'paid',
            'expires_at' => now()->addHour(),
        ]);

        $order->items()->create([
            'item_type' => 'seat',
            'item_id' => \Illuminate\Support\Str::uuid(),
            'quantity' => 2,
            'unit_price' => 50000,
            'subtotal' => 100000,
        ]);

        // Unpaid order (should be ignored)
        $unpaidOrder = Order::create([
            'event_id' => $event->id,
            'user_id' => User::factory()->create()->id,
            'total_amount' => 50000,
            'status' => 'pending',
            'expires_at' => now()->addHour(),
        ]);

        // 4. Act
        $response = $this->actingAs($owner, 'sanctum')->getJson('/api/admin/dashboard/stats');

        // 5. Assert
        $response->assertStatus(200)
            ->assertJson([
                'events_count' => 1,
                'total_sales' => 100000,
                'tickets_sold' => 2,
            ]);
    }
}
