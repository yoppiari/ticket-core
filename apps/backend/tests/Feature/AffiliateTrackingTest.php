<?php

namespace Tests\Feature;

use App\Models\Affiliate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AffiliateTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_tracking_endpoint_increments_clicks()
    {
        $user = User::factory()->create();
        $affiliate = Affiliate::create([
            'user_id' => $user->id,
            'referral_code' => 'TRACKME',
            'clicks' => 0
        ]);

        $response = $this->postJson('/api/affiliates/track', [
            'ref' => 'TRACKME'
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('affiliates', [
            'id' => $affiliate->id,
            'clicks' => 1
        ]);

        // Track again
        $this->postJson('/api/affiliates/track', ['ref' => 'TRACKME']);

        $this->assertDatabaseHas('affiliates', [
            'id' => $affiliate->id,
            'clicks' => 2
        ]);
    }

    public function test_tracking_validates_ref_code()
    {
        $response = $this->postJson('/api/affiliates/track', [
            'ref' => 'INVALID_CODE'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ref']);
    }
}
