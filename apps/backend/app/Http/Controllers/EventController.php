<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    /**
     * List events for the current tenant.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->tenant_id)
            return response()->json([], 200);

        return response()->json(Event::where('tenant_id', $user->tenant_id)->get());
    }

    /**
     * Get a specific event.
     */
    public function show(Request $request, Event $event)
    {
        $user = $request->user();

        // Tenant Scope Check
        if ($user->role !== 'super_admin' && $event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $event->load(['ticketTypes.pricingTiers', 'addons', 'leaderboards']);

        return response()->json($event);
    }

    /**
     * Create a new event.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->tenant_id)
            return response()->json(['message' => 'No Tenant'], 400);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'alpha_dash',
                Rule::unique('events')->where('tenant_id', $user->tenant_id)
            ],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'venue_name' => 'required|string',
            'venue_address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'leaderboard_config' => 'nullable|array',
            'description' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'facilities' => 'nullable|string',
            'social_media' => 'nullable|array',

            'status' => 'required|in:draft,published',
            // Affiliate Settings
            'affiliate_enabled' => 'nullable|boolean',
            'commission_type' => 'required_if:affiliate_enabled,true|in:percent,fixed',
            'commission_value' => 'required_if:affiliate_enabled,true|numeric|min:0',
        ]);

        $event = Event::create([
            ...$validated,
            'tenant_id' => $user->tenant_id,
        ]);

        return response()->json($event, 201);
    }

    /**
     * Update an event.
     */
    public function update(Request $request, Event $event)
    {
        $user = $request->user();

        // Tenant Scope Check
        if ($user->role !== 'super_admin' && $event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'venue_name' => 'sometimes|string',
            'venue_address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'sometimes|in:draft,published,ended',
            'leaderboard_config' => 'nullable|array',
            'description' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'facilities' => 'nullable|string',
            'social_media' => 'nullable|array',
            'affiliate_enabled' => 'nullable|boolean',
            'commission_type' => 'nullable|in:percent,fixed',
            'commission_value' => 'nullable|numeric|min:0',
        ]);

        $event->update($validated);

        return response()->json($event);
    }

    /**
     * Delete an event.
     */
    public function destroy(Request $request, Event $event)
    {
        $user = $request->user();

        // Tenant Scope Check
        if ($user->role !== 'super_admin' && $event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Role Check: Staff simply cannot delete events
        if (in_array($user->role, ['staff', 'scanner'])) {
            return response()->json(['message' => 'Unauthorized. Staff/Scanner tidak memiliki akses hapus event.'], 403);
        }

        $event->delete();

        return response()->json(['message' => 'Event deleted']);
    }
}
