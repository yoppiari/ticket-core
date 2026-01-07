<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Seat;
use App\Models\Tenant;
use App\Models\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

class ReservationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Redis::flushall();
    }

    public function test_can_reserve_a_seat(): void
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id, 'slug' => 'test-event']);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id]);
        $seat = Seat::create([
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'label' => 'A1',
            'row' => 0,
            'column' => 0,
            'status' => 'available'
        ]);

        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user)->postJson("/api/public/events/test-event/reservations", [
            'seat_ids' => [$seat->id]
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verify via Seat API
        $seatResponse = $this->actingAs($user)->getJson("/api/public/events/test-event/seats");
        $seatData = collect($seatResponse->json('seats'))->firstWhere('id', $seat->id);

        $this->assertEquals('reserved', $seatData['status']);
        $this->assertTrue($seatData['is_mine']);
    }

    public function test_cannot_reserve_already_reserved_seat(): void
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id, 'slug' => 'test-event']);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id]);
        $seat = Seat::create([
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'label' => 'A1',
            'row' => 0,
            'column' => 0,
            'status' => 'available'
        ]);

        // Manually lock it
        Redis::set("ticket:reservation:{$event->id}:{$seat->id}", 'other-user');

        $response = $this->postJson("/api/public/events/test-event/reservations", [
            'seat_ids' => [$seat->id]
        ]);

        $response->assertStatus(422)
            ->assertJson(['success' => false]);
    }

    public function test_can_release_reservation(): void
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id, 'slug' => 'test-event']);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id]);
        $seat = Seat::create([
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'label' => 'A1',
            'row' => 0,
            'column' => 0,
            'status' => 'available'
        ]);

        $user = \App\Models\User::factory()->create();

        $this->actingAs($user)->postJson("/api/public/events/test-event/reservations", [
            'seat_ids' => [$seat->id]
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/public/events/test-event/reservations", [
            'seat_ids' => [$seat->id]
        ]);

        $response->assertStatus(200);

        // Verify via Seat API
        $seatResponse = $this->actingAs($user)->getJson("/api/public/events/test-event/seats");
        $seatData = collect($seatResponse->json('seats'))->firstWhere('id', $seat->id);

        $this->assertEquals('available', $seatData['status']);
    }
}
