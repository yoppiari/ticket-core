<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Tenant;
use App\Models\TicketType;
use App\Models\Addon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicEventApiTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function anyone_can_access_event_details()
    {
        $tenant = Tenant::create(['name' => 'FEST', 'slug' => 'fest', 'status' => 'active']);
        $event = Event::create([
            'name' => 'Public Concert',
            'slug' => 'concert',
            'start_date' => now(),
            'end_date' => now()->addDay(),
            'venue_name' => 'Arena',
            'status' => 'published',
            'tenant_id' => $tenant->id
        ]);

        $ticket = TicketType::create([
            'event_id' => $event->id,
            'name' => 'General Admission',
            'price' => 100000,
            'stock' => 500
        ]);

        $addon = Addon::create([
            'event_id' => $event->id,
            'name' => 'Parking Pass',
            'price' => 50000,
            'stock' => 100,
            'type' => 'parking'
        ]);

        $response = $this->getJson("/api/public/tenants/{$tenant->slug}/events/{$event->slug}");

        $response->assertStatus(200)
            ->assertJsonPath('tenant.slug', 'fest')
            ->assertJsonPath('event.slug', 'concert')
            ->assertJsonCount(1, 'event.ticket_types')
            ->assertJsonCount(1, 'event.addons');
    }

    /** @test */
    public function returns_404_if_event_or_tenant_not_found()
    {
        $response = $this->getJson("/api/public/tenants/invalid/events/invalid");
        $response->assertStatus(404);
    }

    /** @test */
    public function can_list_published_events()
    {
        $tenant = Tenant::create(['name' => 'FEST', 'slug' => 'fest', 'status' => 'active']);
        $event = Event::create([
            'name' => 'Public Concert',
            'slug' => 'concert',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
            'venue_name' => 'Arena',
            'status' => 'published',
            'tenant_id' => $tenant->id
        ]);

        TicketType::create([
            'event_id' => $event->id,
            'name' => 'GA',
            'price' => 75000,
            'stock' => 100
        ]);

        $response = $this->getJson("/api/public/events");

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonPath('0.slug', 'concert')
            ->assertJsonPath('0.min_price', '75000.00');
    }
}
