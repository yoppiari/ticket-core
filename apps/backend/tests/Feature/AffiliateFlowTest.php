<?php

namespace Tests\Feature;

use App\Models\Affiliate;
use App\Models\Event;
use App\Models\Order;
use App\Models\Seat;
use App\Models\Tenant;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cookie;
use Tests\TestCase;

class AffiliateFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_affiliate_registration()
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/affiliates/register', [
            'tenant_id' => $tenant->id,
            'referral_code' => 'TESTCODE',
            'bank_details' => ['bank' => 'BCA', 'number' => '12345'],
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['referral_code' => 'TESTCODE']);

        $this->assertDatabaseHas('affiliates', [
            'user_id' => $user->id,
            'tenant_id' => $tenant->id,
            'referral_code' => 'TESTCODE',
        ]);
    }

    public function test_affiliate_tracking_cookie()
    {
        // Test middleware
        // Use a user to bypass auth
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/api/affiliates/stats?ref=REF123');
        // Note: stats endpoint returns 200, middleware should run.

        // Middleware should queue cookie
        $response->assertCookie('affiliate_ref');
    }

    public function test_order_attribution_and_commission()
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create([
            'tenant_id' => $tenant->id,
            'slug' => 'test-event',
            'affiliate_enabled' => true,
            'commission_type' => 'percent',
            'commission_value' => 10,
        ]);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id, 'price' => 100000]);
        $seat = Seat::factory()->create(['event_id' => $event->id, 'ticket_type_id' => $ticketType->id]);

        $affiliateUser = User::factory()->create();
        $affiliate = Affiliate::create([
            'user_id' => $affiliateUser->id,
            'tenant_id' => $tenant->id,
            'referral_code' => 'MONEYMAKER',
            'commission_rate' => 0.10, // 10%
        ]);

        $buyer = User::factory()->create();

        // Simulate cookie
        $this->withCookie('affiliate_ref', 'MONEYMAKER');

        // Reserve Seat First
        $this->actingAs($buyer)->postJson("/api/public/events/{$event->slug}/reservations", [
            'seat_ids' => [$seat->id],
        ])->assertStatus(200);

        // Send checkout request WITH cookie via call()
        $response = $this->actingAs($buyer)->call(
            'POST',
            "/api/public/events/{$event->slug}/checkout?ref=MONEYMAKER",
            [
                'seat_ids' => [$seat->id],
                'buyer_name' => 'John Doe',
                'buyer_email' => 'john@example.com',
                'buyer_whatsapp' => '1234567890',
                'delivery_method' => 'email'
            ],
            ['affiliate_ref' => 'MONEYMAKER'] // Cookies
        );

        $response->assertStatus(201);
        $orderId = $response->json('order_id');

        $order = Order::find($orderId);
        $this->assertEquals($affiliate->id, $order->affiliate_id);
        // Total should be 100,000. Commission 10% = 10,000.
        $this->assertEquals(10000, $order->commission_amount);

        // Verification of Stats
        // 1. Clicks (incremented by middleware)
        // Wait, did we hit middleware in this test? "Simulate cookie" -> $this->withCookie sets cookie for Request, but doesn't trigger Middleware logic that runs on Response? 
        // Middleware `handle` -> checks request cookie? No, checks request query `?ref=`.
        // Let's hitting a route with `?ref=` to trigger click increment.
        $this->get("/api/public/events/{$event->slug}?ref=MONEYMAKER");

        $responseStats = $this->actingAs($affiliateUser)->getJson('/api/affiliates/stats');
        $responseStats->assertStatus(200)
            // Expect array
            ->assertJsonFragment(['referral_code' => 'MONEYMAKER'])
            ->assertJsonFragment(['clicks' => 1]) // 1 click from above
            ->assertJsonFragment(['total_conversions' => 1]) // 1 order
            ->assertJsonFragment(['total_commission' => "10000.00"]); // Decimal string
    }
}
