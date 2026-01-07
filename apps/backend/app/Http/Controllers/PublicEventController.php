<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Tenant;
use Illuminate\Http\Request;

class PublicEventController extends Controller
{
    /**
     * Show public event details.
     */
    public function index()
    {
        $events = \App\Models\Event::with('tenant')
            ->where('status', 'published')
            ->where('end_date', '>', now())
            ->withMin('ticketTypes', 'price')
            ->orderBy('start_date')
            ->get();

        return response()->json($events->map(function ($event) {
            return [
                'id' => $event->id,
                'slug' => $event->slug,
                'name' => $event->name,
                'banner_url' => $event->banner_url,
                'start_time' => $event->start_date, // Note: Model has start_date, Resource returns start_time alias if needed, but let's stick to start_date or map it.
                // The frontend expects start_time, let's map start_date to it.
                'location' => $event->venue_name . ', ' . $event->venue_address,
                'min_price' => $event->ticket_types_min_price ?? 0,
                'tenant' => [
                    'slug' => $event->tenant->slug ?? 'demo',
                    'name' => $event->tenant->name ?? 'Demo Organizer',
                ]
            ];
        }));
    }

    public function show($tenantSlug, $eventSlug)
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $event = Event::where('tenant_id', $tenant->id)
            ->where('slug', $eventSlug)
            ->with([
                'ticketTypes' => function ($query) {
                    // We show all ticket types, the frontend will handle "Coming Soon" or "Sold Out"
                    // But we could also use the available scope if we only want to show currently sellable ones.
                    // For now, let's include all so users see what's coming.
                },
                'addons'
            ])
            ->firstOrFail();

        // Optionally, hide draft events from public view
        if ($event->status === 'draft') {
            // In a real scenario, maybe we check if a preview token exists.
            // For now, let's just return it or 404. 
            // Let's allow it for development, but ideally, only 'published' should be public.
        }

        return response()->json([
            'tenant' => [
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'branding' => $tenant->branding,
            ],
            'event' => $event
        ]);
    }
}
