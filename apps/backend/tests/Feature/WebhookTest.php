<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_requires_valid_signature()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->postJson('/api/webhooks/payment/mock', [
            'order_id' => $order->id,
            'status' => 'paid',
            // Missing token
        ]);

        $response->assertStatus(400);
    }

    public function test_webhook_processes_successful_payment()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->postJson('/api/webhooks/payment/mock', [
            'order_id' => $order->id,
            'status' => 'paid',
            'token' => 'valid-mock-token'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('paid', $order->fresh()->status);
    }

    public function test_webhook_processes_failed_payment()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->postJson('/api/webhooks/payment/mock', [
            'order_id' => $order->id,
            'status' => 'failed',
            'token' => 'valid-mock-token'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('failed', $order->fresh()->status);
    }
}
