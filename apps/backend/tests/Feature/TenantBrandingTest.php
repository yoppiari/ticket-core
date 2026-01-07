<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantBrandingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function tenant_owner_can_update_branding()
    {
        // 1. Arrange
        $tenant = Tenant::create([
            'name' => 'Original Name',
            'slug' => 'orig',
            'status' => 'active'
        ]);

        $owner = User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => 'owner'
        ]);

        Sanctum::actingAs($owner);

        $payload = [
            'name' => 'Updated Festival',
            'branding' => [
                'logo' => 'https://example.com/logo.png',
                'primary_color' => '#FF0000',
            ]
        ];

        // 2. Act
        $response = $this->putJson("/api/admin/tenants/{$tenant->id}", $payload);

        // 3. Assert
        $response->assertStatus(200)
            ->assertJsonPath('tenant.name', 'Updated Festival')
            ->assertJsonPath('tenant.branding.primary_color', '#FF0000');

        $this->assertDatabaseHas('tenants', [
            'id' => $tenant->id,
            'name' => 'Updated Festival',
        ]);

        $tenant->refresh();
        $this->assertEquals('#FF0000', $tenant->branding['primary_color']);
    }

    /** @test */
    public function primary_color_must_be_hex()
    {
        $tenant = Tenant::create(['name' => 'Test', 'slug' => 'test']);
        $owner = User::factory()->create(['role' => 'owner']);
        Sanctum::actingAs($owner);

        $payload = [
            'branding' => [
                'primary_color' => 'not-a-color',
            ]
        ];

        $response = $this->putJson("/api/admin/tenants/{$tenant->id}", $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['branding.primary_color']);
    }
}
