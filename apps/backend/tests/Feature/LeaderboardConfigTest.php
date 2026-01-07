<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LeaderboardConfigTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function tenant_admin_can_store_leaderboard_config()
    {
        $tenant = Tenant::create(['name' => 'FEST', 'slug' => 'fest', 'status' => 'active']);
        $admin = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'admin']);
        Sanctum::actingAs($admin);

        $payload = [
            'name' => 'Gamified Event',
            'slug' => 'gamified',
            'start_date' => now()->addDays(10)->toDateTimeString(),
            'end_date' => now()->addDays(12)->toDateTimeString(),
            'venue_name' => 'Arena',
            'leaderboard_config' => [
                'points_per_ticket' => 10,
                'points_per_referral' => 50,
                'bonus_multiplier' => 1.5
            ]
        ];

        $response = $this->postJson('/api/admin/events', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('leaderboard_config.points_per_ticket', 10);

        $this->assertDatabaseHas('events', [
            'slug' => 'gamified',
        ]);

        $event = Event::where('slug', 'gamified')->first();
        $this->assertEquals(10, $event->leaderboard_config['points_per_ticket']);
    }

    /** @test */
    public function leaderboard_config_must_be_array()
    {
        $tenant = Tenant::create(['name' => 'T', 'slug' => 't', 'status' => 'active']);
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/events', [
            'name' => 'Bad Config',
            'slug' => 'bad',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
            'venue_name' => 'V',
            'leaderboard_config' => "STRING NOT ARRAY"
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['leaderboard_config']);
    }

    /** @test */
    public function can_update_leaderboard_config()
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
            'tenant_id' => $tenant->id,
            'leaderboard_config' => ['points' => 10]
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/events/{$event->id}", [
            'leaderboard_config' => ['points' => 20]
        ]);

        $response->assertOk()
            ->assertJsonPath('leaderboard_config.points', 20);
    }
}
