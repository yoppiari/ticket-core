<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventManagementTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function tenant_admin_can_create_event()
    {
        $tenant = Tenant::create(['name' => 'FEST', 'slug' => 'fest', 'status' => 'active']);
        $admin = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'admin']);
        Sanctum::actingAs($admin);

        $payload = [
            'name' => 'Music Fest 2026',
            'slug' => 'mf2026',
            'start_date' => now()->addDays(10)->toDateTimeString(),
            'end_date' => now()->addDays(12)->toDateTimeString(),
            'venue_name' => 'Main Stadium',
            'venue_address' => '123 Stadium Rd',
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/admin/events', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('name', 'Music Fest 2026')
            ->assertJsonPath('status', 'draft');

        $this->assertDatabaseHas('events', [
            'slug' => 'mf2026',
            'tenant_id' => $tenant->id,
            'venue_name' => 'Main Stadium',
        ]);
    }

    /** @test */
    public function end_date_must_be_after_start_date()
    {
        $tenant = Tenant::create(['name' => 'T', 'slug' => 't', 'status' => 'active']);
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($admin);

        $payload = [
            'name' => 'Invalid Event',
            'slug' => 'invalid',
            'start_date' => now()->addDays(10)->toDateTimeString(),
            'end_date' => now()->addDays(9)->toDateTimeString(), // Invalid: Before start
            'venue_name' => 'Venue',
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/admin/events', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }

    /** @test */
    public function users_can_only_see_their_tenant_events()
    {
        // Tenant A
        $tenantA = Tenant::create(['name' => 'A', 'slug' => 'a', 'status' => 'active']);
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        Event::create([
            'name' => 'Event A',
            'slug' => 'evt-a',
            'start_date' => now(),
            'end_date' => now()->addDay(),
            'venue_name' => 'V',
            'status' => 'draft',
            'tenant_id' => $tenantA->id
        ]);

        // Tenant B
        $tenantB = Tenant::create(['name' => 'B', 'slug' => 'b', 'status' => 'active']);
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);
        Event::create([
            'name' => 'Event B',
            'slug' => 'evt-b',
            'start_date' => now(),
            'end_date' => now()->addDay(),
            'venue_name' => 'V',
            'status' => 'draft',
            'tenant_id' => $tenantB->id
        ]);

        // Act as User A
        Sanctum::actingAs($userA);
        $response = $this->getJson('/api/admin/events');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Event A'); // Should ONLY see Event A
    }

    /** @test */
    public function cannot_update_other_tenant_event()
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
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]); // User from Tenant B

        Sanctum::actingAs($userB);

        $response = $this->putJson("/api/admin/events/{$eventA->id}", [
            'name' => 'Hacked Event'
        ]);

        $response->assertStatus(403); // Forbidden
    }
}
