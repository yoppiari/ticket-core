<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RevenueCalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_revenue_is_calculated_correctly_on_webhook_payment()
    {
        // 1. Setup Tenant and Event
        $tenant = Tenant::factory()->create(['balance' => 0]);
        $event = Event::factory()->create(['tenant_id' => $tenant->id]);

        // 2. Create Order
        $order = Order::factory()->create([
            'event_id' => $event->id,
            'total_amount' => 100000, // 100k
            'status' => 'pending'
        ]);

        // 3. Simulate Webhook Call
        $response = $this->postJson('/api/webhooks/payment/mock', [
            'order_id' => $order->id,
            'status' => 'paid',
            'token' => 'valid-mock-token'
        ]);

        $response->assertStatus(200);

        // 4. Update References
        $tenant->refresh();

        // 5. Verify Balance
        // Gross: 100,000
        // Platform (5%): 5,000
        // Gateway (3%): 3,000
        // Net: 92,000
        $this->assertEquals(92000, $tenant->balance);

        // 6. Verify Transaction Record
        $this->assertDatabaseHas('tenant_transactions', [
            'tenant_id' => $tenant->id,
            'reference_id' => $order->id,
            'amount' => 92000,
            'type' => 'credit'
        ]);
    }

    public function test_revenue_is_only_calculated_once()
    {
        $tenant = Tenant::factory()->create(['balance' => 0]);
        $event = Event::factory()->create(['tenant_id' => $tenant->id]);
        $order = Order::factory()->create([
            'event_id' => $event->id,
            'total_amount' => 100000,
            'status' => 'pending'
        ]);

        // First Call
        $this->postJson('/api/webhooks/payment/mock', [
            'order_id' => $order->id,
            'status' => 'paid',
            'token' => 'valid-mock-token'
        ]);

        $this->assertEquals(92000, $tenant->fresh()->balance);

        // Second Call (Idempotency)
        // Manually reset order status to pending to force potential re-processing logic check
        // Or just let it handle "paid" status check?
        // Let's modify order status back to pending to see if `exists()` check prevents double counting
        // even if status check passes (unlikely in real world but good for testing service logic).
        // Actually, PaymentService checks `$order->status !== 'paid'`.
        // So idempotency is handled at PaymentService level mostly.
        // But RevenueService also has `exists` check.
        // Let's rely on PaymentService check primarily, but for this test, we want to ensure
        // if for some reason it gets called again, it won't duplicate.

        // Manually invoke service to bypass PaymentService status check if we want strict unit test,
        // but for Feature test, ensuring double webhook doesn't double balance is enough.

        $this->postJson('/api/webhooks/payment/mock', [
            'order_id' => $order->id,
            'status' => 'paid',
            'token' => 'valid-mock-token'
        ]);

        $this->assertEquals(92000, $tenant->fresh()->balance);
    }
}
