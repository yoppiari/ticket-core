<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_initiate_mock_payment(): void
    {
        $user = User::factory()->create();
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id, 'slug' => 'test-event']);

        $order = Order::create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'total_amount' => 50000,
            'status' => 'pending'
        ]);

        $response = $this->actingAs($user)->postJson("/api/public/events/test-event/checkout/{$order->id}/pay");

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'redirect_url']);

        $redirectUrl = $response->json('redirect_url');
        $this->assertStringContainsString('/mock-payment-gateway', $redirectUrl);
        $this->assertStringContainsString($order->id, $redirectUrl);
    }

    public function test_cannot_pay_unauthorized_order(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id]);

        $order = Order::create([
            'event_id' => $event->id,
            'user_id' => $otherUser->id, // Owned by other user
            'total_amount' => 50000,
            'status' => 'pending'
        ]);

        $response = $this->actingAs($user)->postJson("/api/public/events/test/checkout/{$order->id}/pay");

        $response->assertStatus(403);
    }
}
