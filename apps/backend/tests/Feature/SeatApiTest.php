<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Seat;
use App\Models\Tenant;
use App\Models\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeatApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_fetch_seats_for_an_event(): void
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id, 'slug' => 'test-event']);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id]);

        Seat::create([
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'label' => 'A1',
            'row' => 0,
            'column' => 0,
            'status' => 'available'
        ]);

        $response = $this->getJson("/api/public/events/test-event/seats");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'layout',
                'seats' => [
                    '*' => ['id', 'label', 'row', 'column', 'status']
                ]
            ])
            ->assertJsonCount(1, 'seats');
    }

    public function test_returns_404_if_event_not_found(): void
    {
        $response = $this->getJson("/api/public/events/non-existent/seats");
        $response->assertStatus(404);
    }
}
