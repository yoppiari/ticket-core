<?php

namespace Tests\Feature;

use App\Mail\TeamInvitation;
use App\Models\Invitation;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TeamInvitationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function tenant_owner_can_invite_team_member()
    {
        Mail::fake();

        // 1. Arrange
        $tenant = Tenant::create(['name' => 'FEST', 'slug' => 'fest', 'status' => 'active']);
        $owner = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);
        Sanctum::actingAs($owner);

        $payload = [
            'email' => 'staff@fest.com',
            'role' => 'scanner',
        ];

        // 2. Act
        $response = $this->postJson('/api/admin/team/invite', $payload);

        // 3. Assert Response
        $response->assertStatus(201)
            ->assertJsonPath('invitation.email', 'staff@fest.com');

        // 4. Assert Database
        $this->assertDatabaseHas('invitations', [
            'email' => 'staff@fest.com',
            'tenant_id' => $tenant->id,
            'role' => 'scanner',
        ]);

        // 5. Assert Email Sent
        Mail::assertSent(TeamInvitation::class, function ($mail) use ($payload) {
            return $mail->hasTo('staff@fest.com');
        });
    }

    /** @test */
    public function non_owner_cannot_invite()
    {
        $tenant = Tenant::create(['name' => 'FEST', 'slug' => 'fest', 'status' => 'active']);
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'scanner']); // Just a scanner
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/admin/team/invite', [
            'email' => 'new@fest.com',
            'role' => 'scanner'
        ]);

        $response->assertStatus(403);
    }
}
