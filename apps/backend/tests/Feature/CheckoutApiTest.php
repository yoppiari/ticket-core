<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Seat;
use App\Models\TicketType;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Addon;
use App\Services\ReservationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

class CheckoutApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Redis::flushall();
    }

    public function test_can_checkout_with_reserved_seats(): void
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id, 'slug' => 'test-event']);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id, 'price' => 1000]);
        $seat = Seat::create([
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'label' => 'A1',
            'row' => 0,
            'column' => 0,
            'status' => 'available'
        ]);

        $user = User::factory()->create();

        // 1. Reserve Seat logic manually or via API
        // Let's use service directly to ensure Redis state is clean
        $reservationService = app(ReservationService::class);
        $reservationService->reserveSeats($event, [$seat->id], $user->id);

        // 2. Checkout
        $response = $this->actingAs($user)->postJson("/api/public/events/test-event/checkout", [
            'seat_ids' => [$seat->id],
            'addons' => []
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['success', 'order_id', 'redirect_url']);

        $orderId = $response->json('order_id');

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'user_id' => $user->id,
            'total_amount' => 1000,
            'status' => 'pending'
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'item_type' => 'seat',
            'item_id' => $seat->id
        ]);
    }

    public function test_cannot_checkout_unreserved_seat(): void
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id, 'slug' => 'test-event']);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id, 'price' => 1000]);
        $seat = Seat::create([
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'label' => 'A1',
            'status' => 'available'
        ]);

        $user = User::factory()->create();

        // Skip reservation

        $response = $this->actingAs($user)->postJson("/api/public/events/test-event/checkout", [
            'seat_ids' => [$seat->id],
            'addons' => []
        ]);

        $response->assertStatus(422)
            ->assertJson(['success' => false]);
    }

    public function test_checkout_with_addons(): void
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id, 'slug' => 'test-event']);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id, 'price' => 1000]);
        $seat = Seat::create([
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'label' => 'A1',
            'status' => 'available'
        ]);

        $addon = Addon::create([
            'event_id' => $event->id,
            'name' => 'Parking',
            'price' => 500,
            'stock' => 10
        ]);

        $user = User::factory()->create();

        // Reserve
        $reservationService = app(ReservationService::class);
        $reservationService->reserveSeats($event, [$seat->id], $user->id);

        $response = $this->actingAs($user)->postJson("/api/public/events/test-event/checkout", [
            'seat_ids' => [$seat->id],
            'addons' => [
                $addon->id => 2 // 2 parking spots = 1000
            ]
        ]);

        $response->assertStatus(201);
        $orderId = $response->json('order_id');

        // Total = 1000 (seat) + 1000 (addons) = 2000
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'total_amount' => 2000
        ]);
    }
}
