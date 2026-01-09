<?php

namespace Tests\Feature;

use App\Models\Affiliate;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AffiliateAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_can_list_affiliates()
    {
        // 1. Create Tenant and User
        $tenant = Tenant::create([
            'name' => 'Test Tenant',
            'slug' => 'test-tenant',
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);

        // 2. Create Affiliate for this Tenant
        $affiliateUser = User::factory()->create();
        Affiliate::create([
            'user_id' => $affiliateUser->id,
            'tenant_id' => $tenant->id,
            'referral_code' => 'TESTCODE',
            'commission_rate' => 0.05,
        ]);

        // 3. Act as Tenant Admin
        $response = $this->actingAs($user)
            ->getJson('/api/admin/affiliates?tenant_id=' . $tenant->id);

        // 4. Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.0.referral_code', 'TESTCODE')
            ->assertJsonPath('data.0.email', $affiliateUser->email);
    }

    public function test_cannot_list_affiliates_without_tenant_context()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/admin/affiliates');

        // Should fail or try to infer. Since user has no tenant, it should 400.
        $response->assertStatus(400);
    }
}
