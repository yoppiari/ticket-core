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
            'leaderboard_config' => 'nullable|array',
        ]);

        $event = Event::create([
            ...$validated,
            'status' => 'draft',
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
        if ($event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'venue_name' => 'sometimes|string',
            'venue_address' => 'nullable|string',
            'status' => 'sometimes|in:draft,published,ended',
            'leaderboard_config' => 'nullable|array',
        ]);

        $event->update($validated);

        return response()->json($event);
    }
}
