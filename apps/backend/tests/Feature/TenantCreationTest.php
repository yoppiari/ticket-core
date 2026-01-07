<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantCreationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function system_admin_can_create_a_tenant()
    {
        // 1. Arrange: Create Admin User (acting as system admin)
        $admin = User::factory()->create([
            'role' => 'admin' // Assuming we rely on role column
        ]);

        Sanctum::actingAs($admin);

        $payload = [
            'name' => 'Festival A',
            'slug' => 'fest-a',
            'email' => 'organizer@festa.com',
            'password' => 'password123',
        ];

        // 2. Act: POST to endpoint
        $response = $this->postJson('/api/admin/tenants', $payload);

        // 3. Assert: 201 Created
        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'tenant' => ['id', 'name', 'slug'],
                'owner' => ['id', 'name', 'email', 'tenant_id'],
            ]);

        // 4. Verification: Database State
        $this->assertDatabaseHas('tenants', [
            'name' => 'Festival A',
            'slug' => 'fest-a',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'organizer@festa.com',
            'role' => 'owner',
        ]);

        // Use first() to get ID if needed, or check relationship
        $tenant = Tenant::where('slug', 'fest-a')->first();
        $this->assertNotNull($tenant);
        $this->assertDatabaseHas('users', [
            'email' => 'organizer@festa.com',
            'tenant_id' => $tenant->id,
        ]);
    }

    /** @test */
    public function slug_must_be_unique()
    {
        $admin = User::factory()->create();
        Sanctum::actingAs($admin);

        Tenant::create([
            'name' => 'Existing',
            'slug' => 'taken',
            'status' => 'active'
        ]);

        $payload = [
            'name' => 'New',
            'slug' => 'taken', // Duplicate
            'email' => 'new@email.com',
            'password' => 'password',
        ];

        $response = $this->postJson('/api/admin/tenants', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }
}
