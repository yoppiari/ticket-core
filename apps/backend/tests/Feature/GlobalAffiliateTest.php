<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\TicketType;
use App\Models\User;
use App\Models\Affiliate;
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GlobalAffiliateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed database to have permissions/roles if needed, or simple models
        $this->seed(DemoSeeder::class);
        $this->disableCookieEncryption();
    }

    public function test_user_can_register_as_global_affiliate()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/affiliates/register', [
            'referral_code' => 'GLOBAL123',
            'bank_details' => ['bank' => 'BCA', 'number' => '123'],
            // No tenant_id provided -> global
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('referral_code', 'GLOBAL123')
            ->assertJsonPath('tenant_id', null);

        $this->assertDatabaseHas('affiliates', [
            'user_id' => $user->id,
            'tenant_id' => null,
            'referral_code' => 'GLOBAL123'
        ]);
    }

    public function test_marketplace_lists_promotable_events()
    {
        $tenant = Tenant::first();
        $promotableEvent = Event::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Promotable Event',
            'slug' => 'promotable',
            'status' => 'published',
            'affiliate_enabled' => true,
            'commission_type' => 'percent',
            'commission_value' => 10,
        ]);

        $hiddenEvent = Event::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Hidden Event',
            'slug' => 'hidden',
            'status' => 'published',
            'affiliate_enabled' => false,
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/affiliates/marketplace');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Promotable Event');
    }

    public function test_commission_calculation_percent()
    {
        // 1. Setup Event with Percent Commission
        $tenant = Tenant::first();
        $event = Event::factory()->create([
            'tenant_id' => $tenant->id,
            'status' => 'published',
            'affiliate_enabled' => true,
            'commission_type' => 'percent',
            'commission_value' => 10, // 10%
        ]);

        $ticketType = TicketType::factory()->create([
            'event_id' => $event->id,
            'price' => 100000,
            'stock' => 100,
        ]);

        // 2. Register Global Affiliate
        $affiliateUser = User::factory()->create();
        $affiliate = Affiliate::create([
            'user_id' => $affiliateUser->id,
            'referral_code' => 'TESTCommission',
            'tenant_id' => null, // Global
        ]);

        // 3. Create Order via Checkout Service (simulated via POST /checkout or direct service call)
        // Let's use service directly for granular test, or endpoint for integration.
        // Endpoint requires auth token etc, let's use endpoint to verify cookie logic too if possible.
        // Actually, Feature test allows withCookie.

        // Simulating the flow:
        // User visits with ?ref=TESTCommission -> Cookie set (Frontend)
        // Backend Checkout checks Cookie.

        $buyer = User::factory()->create();
        $response = $this->actingAs($buyer)
            ->withCookie('affiliate_ref', 'TESTCommission')
            ->postJson("/api/public/events/{$event->slug}/checkout?ref=TESTCommission", [
                'event_id' => $event->id,
                'tickets' => [
                    (string) $ticketType->id => 2 // 200,000 total
                ],
                'payment_method' => 'manual',
                'buyer_name' => 'Test Buyer',
                'buyer_email' => 'test@example.com',
                'buyer_whatsapp' => '08123456789',
                'delivery_method' => 'email',
            ]);

        // Note: Route might fail if not fully set up or mocking payment gateway. 
        // Assuming checkout is standard.
        // If checkout hits payment gateway, it might 500 if not mocked. 
        // We'll see. If it fails, we mock the CheckoutService or PaymentGateway.

        $response->assertStatus(201); // Created
        $orderId = $response->json('order_id');

        $order = Order::find($orderId);
        $this->assertEquals($affiliate->id, $order->affiliate_id);

        // 2 tickets * 100,000 = 200,000
        // Commission 10% = 20,000
        $this->assertEquals(20000, $order->commission_amount);
    }

    public function test_commission_calculation_fixed()
    {
        // 1. Setup Event with Fixed Commission
        $tenant = Tenant::first();
        $event = Event::factory()->create([
            'tenant_id' => $tenant->id,
            'status' => 'published',
            'affiliate_enabled' => true,
            'commission_type' => 'fixed',
            'commission_value' => 5000, // 5,000 per item
        ]);

        $ticketType = TicketType::factory()->create([
            'event_id' => $event->id,
            'price' => 50000,
            'stock' => 100,
        ]);

        // 2. Register Global Affiliate
        $affiliateUser = User::factory()->create();
        $affiliate = Affiliate::create([
            'user_id' => $affiliateUser->id,
            'referral_code' => 'FIXEDREF',
            'tenant_id' => null,
        ]);

        // 3. Checkout
        $buyer = User::factory()->create();
        $response = $this->actingAs($buyer)
            ->withCookie('affiliate_ref', 'FIXEDREF')
            ->postJson("/api/public/events/{$event->slug}/checkout?ref=FIXEDREF", [
                'event_id' => $event->id,
                'tickets' => [
                    (string) $ticketType->id => 3 // 3 items
                ],
                'payment_method' => 'manual',
                'buyer_name' => 'Test Buyer 2',
                'buyer_email' => 'test2@example.com',
                'buyer_whatsapp' => '08123456789',
                'delivery_method' => 'email',
            ]);

        $response->assertStatus(201);
        $orderId = $response->json('order_id');

        $order = Order::find($orderId);

        // 3 items * 5,000 = 15,000 commission
        $this->assertEquals(15000, $order->commission_amount);
    }
}
