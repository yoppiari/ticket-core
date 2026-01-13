<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

use Illuminate\Support\Facades\Log;

class PublicEventController extends Controller
{
    /**
     * Subscribe to event reminders.
     */
    public function remind(Request $request, $tenantSlug, $eventSlug)
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $event = Event::where('tenant_id', $tenant->id)
            ->where('slug', $eventSlug)
            ->firstOrFail();

        $request->validate([
            'email' => 'required|email'
        ]);

        try {
            $event->reminders()->create([
                'tenant_id' => $tenant->id,
                'email' => $request->email
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Check for duplicate entry constraint violation
            if ($e->errorInfo[1] == 1062 || str_contains($e->getMessage(), 'unique constraint')) {
                return response()->json([
                    'message' => 'You are already subscribed to reminders for this event.'
                ], 409); // Conflict
            }
            throw $e;
        }

        return response()->json([
            'message' => 'Reminder set successfully! We will notify you when sales open.'
        ], 201);
    }

    /**
     * Show public event details.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Event::with('tenant')
            ->where('status', 'published');

        if ($request->has('tenant_slug')) {
            $slug = $request->query('tenant_slug');
            $query->whereHas('tenant', function ($q) use ($slug) {
                $q->where('slug', $slug);
            });
        }

        // Timeframe filter
        $timeframe = $request->query('timeframe', 'upcoming');
        if ($timeframe === 'past') {
            $query->where('end_date', '<', now())
                ->orderBy('start_date', 'desc'); // Past events usually wanted latest first
        } elseif ($timeframe === 'upcoming') {
            $query->where('end_date', '>', now())
                ->orderBy('start_date', 'asc');
        } else {
            // timeframe=all, no date filter
            $query->orderBy('start_date', 'desc');
        }

        // Cache key based on query params to ensure filters work
        $cacheKey = 'public_events_' . md5(json_encode($request->all()));

        $events = \Illuminate\Support\Facades\Cache::remember($cacheKey, 600, function () use ($query) {
            return $query->withMin('ticketTypes', 'price')
                ->limit(12)
                ->get();
        });

        return response()->json($events->map(function ($event) {
            return [
                'id' => $event->id,
                'slug' => $event->slug,
                'name' => $event->name,
                'banner_url' => $event->banner_url,
                'start_time' => $event->start_date,
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
        try {
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
            // For now, we allow accessing drafts via direct URL for preview purposes.
            // if ($event->status === 'draft') { ... }

            return response()->json([
                'tenant' => [
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'branding' => $tenant->branding ?? [], // Default to empty array
                ],
                'event' => $event,
                'settings' => $tenant->settings ?? [], // Default to empty array
            ]);
        } catch (\Throwable $e) {
            Log::error('Error showing public event: ' . $e->getMessage(), [
                'tenant' => $tenantSlug,
                'event' => $eventSlug,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'An unexpected error occurred while loading the event.',
                'debug_message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
