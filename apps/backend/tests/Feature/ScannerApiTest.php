<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScannerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_download_tickets_for_offline_sync()
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id]);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id]);
        $order = Order::factory()->create(['event_id' => $event->id]);

        // Create Tickets
        Ticket::create([
            'event_id' => $event->id,
            'order_id' => $order->id,
            'ticket_type_id' => $ticketType->id,
            'ticket_code' => 'HASH123',
            'status' => 'valid'
        ]);

        $gateStaff = User::factory()->create(['tenant_id' => $tenant->id]);

        $response = $this->actingAs($gateStaff)->getJson("/api/scanner/events/{$event->id}/tickets");

        $response->assertStatus(200)
            ->assertJsonFragment(['ticket_code' => 'HASH123']);
    }

    public function test_can_sync_scan_logs_up()
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id]);
        $ticketType = TicketType::factory()->create(['event_id' => $event->id]);
        $order = Order::factory()->create(['event_id' => $event->id]);

        $ticket = Ticket::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'event_id' => $event->id,
            'order_id' => $order->id,
            'ticket_type_id' => $ticketType->id,
            'ticket_code' => 'HASH123',
            'status' => 'valid'
        ]);

        $gateStaff = User::factory()->create(['tenant_id' => $tenant->id]);

        $logs = [
            [
                'ticket_code' => 'HASH123',
                'event_id' => $event->id,
                'scanned_at' => now()->toIso8601String(),
                'device_id' => 'device-1',
            ]
        ];

        $response = $this->actingAs($gateStaff)->postJson("/api/scanner/events/{$event->id}/logs", [
            'logs' => $logs
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('scan_logs', [
            'ticket_id' => $ticket->id,
            'gate_staff_id' => $gateStaff->id,
            'status' => 'valid',
            'is_offline_sync' => true,
        ]);

        $this->assertNotNull($ticket->fresh()->checked_in_at);
    }
}
