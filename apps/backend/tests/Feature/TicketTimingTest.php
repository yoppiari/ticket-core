<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Tenant;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketTimingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function ticket_is_hidden_before_start()
    {
        $tenant = Tenant::create(['name' => 'T', 'slug' => 't', 'status' => 'active']);
        $event = Event::create(['name' => 'E', 'slug' => 'e', 'start_date' => now(), 'end_date' => now()->addDay(), 'venue_name' => 'V', 'tenant_id' => $tenant->id]);

        $ticket = TicketType::create([
            'event_id' => $event->id,
            'name' => 'Future',
            'sale_start_date' => now()->addDay(), // Starts tomorrow
            'price' => 100,
            'stock' => 10
        ]);

        // Using Scope directly to verify logic
        $this->assertFalse(TicketType::available()->where('id', $ticket->id)->exists());
    }

    /** @test */
    public function ticket_is_available_during_window()
    {
        $tenant = Tenant::create(['name' => 'T', 'slug' => 't', 'status' => 'active']);
        $event = Event::create(['name' => 'E', 'slug' => 'e', 'start_date' => now(), 'end_date' => now()->addDay(), 'venue_name' => 'V', 'tenant_id' => $tenant->id]);

        $ticket = TicketType::create([
            'event_id' => $event->id,
            'name' => 'Now',
            'sale_start_date' => now()->subDay(),
            'sale_end_date' => now()->addDay(),
            'price' => 100,
            'stock' => 10
        ]);

        $this->assertTrue(TicketType::available()->where('id', $ticket->id)->exists());
    }

    /** @test */
    public function ticket_is_expired_after_end()
    {
        $tenant = Tenant::create(['name' => 'T', 'slug' => 't', 'status' => 'active']);
        $event = Event::create(['name' => 'E', 'slug' => 'e', 'start_date' => now(), 'end_date' => now()->addDay(), 'venue_name' => 'V', 'tenant_id' => $tenant->id]);

        $ticket = TicketType::create([
            'event_id' => $event->id,
            'name' => 'Past',
            'sale_end_date' => now()->subDay(), // Ended yesterday
            'price' => 100,
            'stock' => 10
        ]);

        $this->assertFalse(TicketType::available()->where('id', $ticket->id)->exists());
    }

    /** @test */
    public function controller_validates_timing_dates()
    {
        $tenant = Tenant::create(['name' => 'T', 'slug' => 't', 'status' => 'active']);
        $admin = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'admin']);
        $event = Event::create(['name' => 'E', 'slug' => 'e', 'start_date' => now(), 'end_date' => now()->addDay(), 'venue_name' => 'V', 'tenant_id' => $tenant->id]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/events/{$event->id}/ticket-types", [
            'name' => 'Bad Dates',
            'price' => 10,
            'stock' => 10,
            'sale_start_date' => now()->addDay()->toDateTimeString(),
            'sale_end_date' => now()->toDateTimeString(), // Before Start
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['sale_end_date']);
    }
}
