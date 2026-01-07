<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Addon;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddonApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_addons_for_event(): void
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id, 'slug' => 'test-event']);

        Addon::create([
            'event_id' => $event->id,
            'name' => 'Parking',
            'price' => 100,
            'stock' => 10,
            'type' => 'parking'
        ]);

        $response = $this->getJson("/api/public/events/test-event/addons");

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['name' => 'Parking']);
    }

    public function test_does_not_show_out_of_stock_addons(): void
    {
        $tenant = Tenant::factory()->create();
        $event = Event::factory()->create(['tenant_id' => $tenant->id, 'slug' => 'test-event']);

        Addon::create([
            'event_id' => $event->id,
            'name' => 'Sold Out Item',
            'price' => 100,
            'stock' => 0,
            'type' => 'merch'
        ]);

        $response = $this->getJson("/api/public/events/test-event/addons");

        $response->assertStatus(200)
            ->assertJsonCount(0);
    }
}
