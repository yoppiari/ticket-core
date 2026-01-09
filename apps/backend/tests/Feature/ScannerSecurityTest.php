<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Tenant;
use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScannerSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_scanner_routes()
    {
        $response = $this->getJson('/api/scanner/events/1/tickets');
        $response->assertStatus(401);
    }

    public function test_staff_can_download_tickets_for_their_tenant_event()
    {
        $tenant = Tenant::factory()->create();
        $staff = User::factory()->create(['tenant_id' => $tenant->id]);
        $event = Event::factory()->create(['tenant_id' => $tenant->id]);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id]);
        $ticket = Ticket::factory()->create(['event_id' => $event->id, 'ticket_type_id' => $ticketType->id]);

        $response = $this->actingAs($staff)->getJson("/api/scanner/events/{$event->id}/tickets");

        $response->assertStatus(200)
            ->assertJsonFragment(['ticket_code' => $ticket->ticket_code]);
    }

    public function test_staff_cannot_download_tickets_for_other_tenant_event()
    {
        $tenant1 = Tenant::factory()->create();
        $staff1 = User::factory()->create(['tenant_id' => $tenant1->id]);

        $tenant2 = Tenant::factory()->create();
        $event2 = Event::factory()->create(['tenant_id' => $tenant2->id]);
        $ticketType2 = TicketType::factory()->create(['event_id' => $event2->id]);
        Ticket::factory()->create(['event_id' => $event2->id, 'ticket_type_id' => $ticketType2->id]);

        $response = $this->actingAs($staff1)->getJson("/api/scanner/events/{$event2->id}/tickets");

        $response->assertStatus(403);
    }

    public function test_staff_cannot_sync_logs_for_other_tenant_ticket()
    {
        $tenant1 = Tenant::factory()->create();
        $staff1 = User::factory()->create(['tenant_id' => $tenant1->id]);

        $tenant2 = Tenant::factory()->create();
        $event2 = Event::factory()->create(['tenant_id' => $tenant2->id]);
        $ticketType2 = TicketType::factory()->create(['event_id' => $event2->id]);
        $ticket2 = Ticket::factory()->create([
            'event_id' => $event2->id,
            'ticket_type_id' => $ticketType2->id,
            'ticket_code' => 'TICKET-TENANT-2'
        ]);

        $logs = [
            [
                'id' => 'log-uuid-1',
                'ticket_code' => $ticket2->ticket_code,
                'event_id' => $event2->id,
                'scanned_at' => now()->toIso8601String(),
                'status' => 'valid'
            ]
        ];

        // Staff 1 tries to sync log for Ticket 2 (Tenant 2)
        // Since we pass event_id of Event 2, but Staff is Tenant 1. 
        // Logic check: Ticket must belong to Staff's Tenant.
        // Also ScannerController validates event_id match?
        // Service code: checks ticket belongs to event_id AND ticket->event->tenant_id matches staff->tenant_id.

        $response = $this->actingAs($staff1)->postJson("/api/scanner/events/{$event2->id}/logs", ['logs' => $logs]);

        // The request might technically succeed (200 OK) but return an error result in the JSON
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'ticket_code' => $ticket2->ticket_code,
            'status' => 'error',
            'message' => 'Ticket not found or access denied'
        ]);

        // Ensure ticket was NOT checked in
        $this->assertNull($ticket2->fresh()->checked_in_at);
    }
}
