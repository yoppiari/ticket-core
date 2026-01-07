<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function tenant_owner_can_view_dashboard_stats()
    {
        $tenant = Tenant::create([
            'name' => 'Test Tenant',
            'slug' => 'test-tenant',
            'status' => 'active',
            'plan_limit' => 2000
        ]);

        $owner = User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => 'owner'
        ]);

        Sanctum::actingAs($owner);

        $response = $this->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)
            ->assertJson([
                'limit' => 2000,
                'usage' => 0,
                'percent' => 0
            ]);
    }

    /** @test */
    public function can_mock_usage_for_warning_check()
    {
        $tenant = Tenant::create(['name' => 'T', 'slug' => 't', 'status' => 'active', 'plan_limit' => 1000]);
        $owner = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);
        Sanctum::actingAs($owner);

        // Mock usage 950 (95%)
        $response = $this->getJson('/api/admin/dashboard/stats?mock_usage=950');

        $response->assertOk()
            ->assertJson([
                'limit' => 1000,
                'usage' => 950,
                'percent' => 95
            ]);
    }
}
