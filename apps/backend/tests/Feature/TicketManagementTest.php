<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Tenant;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketManagementTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function tenant_admin_can_add_ticket_types_to_event()
    {
        // 1. Arrange
        $tenant = Tenant::create(['name' => 'FEST', 'slug' => 'fest', 'status' => 'active']);
        $admin = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'admin']);
        $event = Event::create([
            'name' => 'Concert',
            'slug' => 'concert',
            'start_date' => now(),
            'end_date' => now()->addDay(),
            'venue_name' => 'V',
            'status' => 'draft',
            'tenant_id' => $tenant->id
        ]);

        Sanctum::actingAs($admin);

        $payload = [
            'name' => 'VIP',
            'price' => 1000000,
            'stock' => 50,
        ];

        // 2. Act
        $response = $this->postJson("/api/admin/events/{$event->id}/ticket-types", $payload);

        // 3. Assert
        $response->assertStatus(201)
            ->assertJsonPath('name', 'VIP')
            ->assertJsonPath('stock', 50);

        $this->assertDatabaseHas('ticket_types', [
            'event_id' => $event->id,
            'name' => 'VIP',
            'price' => 1000000.00
        ]);
    }

    /** @test */
    public function stock_must_be_positive()
    {
        $tenant = Tenant::create(['name' => 'T', 'slug' => 't', 'status' => 'active']);
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $event = Event::create([
            'name' => 'E',
            'slug' => 'e',
            'start_date' => now(),
            'end_date' => now()->addDay(),
            'venue_name' => 'V',
            'status' => 'draft',
            'tenant_id' => $tenant->id
        ]);
        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/events/{$event->id}/ticket-types", [
            'name' => 'Bad Stock',
            'price' => 100,
            'stock' => -5
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['stock']);
    }

    /** @test */
    public function event_capacity_is_calculated_correctly()
    {
        $tenant = Tenant::create(['name' => 'T', 'slug' => 't', 'status' => 'active']);
        $event = Event::create([
            'name' => 'E',
            'slug' => 'e',
            'start_date' => now(),
            'end_date' => now()->addDay(),
            'venue_name' => 'V',
            'status' => 'draft',
            'tenant_id' => $tenant->id
        ]);

        // Add tickets directly via DB
        TicketType::create(['event_id' => $event->id, 'name' => 'A', 'stock' => 100]);
        TicketType::create(['event_id' => $event->id, 'name' => 'B', 'stock' => 50]);

        // Refresh event model to calculate accessor
        $event->refresh();

        $this->assertEquals(150, $event->capacity);
    }

    /** @test */
    public function cannot_add_ticket_to_other_tenant_event()
    {
        $tenantA = Tenant::create(['name' => 'A', 'slug' => 'a', 'status' => 'active']);
        $eventA = Event::create([
            'name' => 'Event A',
            'slug' => 'evt-a',
            'start_date' => now(),
            'end_date' => now()->addDay(),
            'venue_name' => 'V',
            'status' => 'draft',
            'tenant_id' => $tenantA->id
        ]);

        $tenantB = Tenant::create(['name' => 'B', 'slug' => 'b', 'status' => 'active']);
        $adminB = User::factory()->create(['tenant_id' => $tenantB->id]);

        Sanctum::actingAs($adminB);

        $response = $this->postJson("/api/admin/events/{$eventA->id}/ticket-types", [
            'name' => 'Hacked Ticket',
            'price' => 0,
            'stock' => 100
        ]);

        $response->assertStatus(403);
    }
}
