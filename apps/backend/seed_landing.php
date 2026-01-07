<?php

use App\Models\Tenant;
use App\Models\Event;
use App\Models\TicketType;

$tenant = Tenant::updateOrCreate(
    ['slug' => 'fest-a'],
    [
        'name' => 'Glory Festival',
        'status' => 'active',
        'branding' => ['primary_color' => '#8b5cf6'] // Purple
    ]
);

$event = Event::updateOrCreate(
    ['slug' => 'glory-fest', 'tenant_id' => $tenant->id],
    [
        'name' => 'Glory Fest 2026',
        'start_date' => now()->addDays(30),
        'end_date' => now()->addDays(31),
        'venue_name' => 'Gelora Bung Karno',
        'venue_address' => 'Jakarta, Indonesia',
        'status' => 'published'
    ]
);

TicketType::updateOrCreate(
    ['name' => 'Early Bird', 'event_id' => $event->id],
    [
        'price' => 250000,
        'stock' => 100,
        'sale_start_date' => now()->subDays(1),
        'sale_end_date' => now()->addDays(5),
    ]
);

TicketType::updateOrCreate(
    ['name' => 'Regular', 'event_id' => $event->id],
    [
        'price' => 500000,
        'stock' => 1000,
        'sale_start_date' => now()->addDays(5),
    ]
);

TicketType::updateOrCreate(
    ['name' => 'Sold Out Tier', 'event_id' => $event->id],
    [
        'price' => 1000000,
        'stock' => 0,
    ]
);

echo "Seed Success: http://localhost:3002/fest-a/e/glory-fest\n";
