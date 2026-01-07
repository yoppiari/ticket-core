<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AddonManagementTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function tenant_admin_can_add_addons_to_event()
    {
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
            'name' => 'T-Shirt',
            'price' => 250000,
            'stock' => 100,
            'type' => 'merch'
        ];

        $response = $this->postJson("/api/admin/events/{$event->id}/addons", $payload);

        $response->assertStatus(201)
            ->assertJsonPath('name', 'T-Shirt')
            ->assertJsonPath('type', 'merch');

        $this->assertDatabaseHas('addons', [
            'event_id' => $event->id,
            'name' => 'T-Shirt',
            'price' => 250000.00
        ]);
    }

    /** @test */
    public function validate_addon_input()
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

        $response = $this->postJson("/api/admin/events/{$event->id}/addons", [
            'name' => 'Bad Addon',
            'price' => -10, // Invalid
            'stock' => 'lots', // Invalid
            'type' => 'alien_tech' // Invalid
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['price', 'stock', 'type']);
    }

    /** @test */
    public function cannot_add_addon_to_other_tenant_event()
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

        $response = $this->postJson("/api/admin/events/{$eventA->id}/addons", [
            'name' => 'Hacked Addon',
            'price' => 100,
            'stock' => 10,
            'type' => 'merch'
        ]);

        $response->assertStatus(403);
    }
}
