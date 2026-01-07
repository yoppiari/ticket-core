<?php

namespace App\Http\Controllers;

use App\Models\Addon;
use App\Models\Event;
use Illuminate\Http\Request;

class AddonController extends Controller
{
    /**
     * List addons for a specific event.
     */
    public function index(Request $request, Event $event)
    {
        $user = $request->user();

        if ($event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($event->addons);
    }

    /**
     * Create a new addon for an event.
     */
    public function store(Request $request, Event $event)
    {
        $user = $request->user();

        if ($event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'type' => 'required|string|in:merch,service,parking',
        ]);

        $addon = $event->addons()->create($validated);

        return response()->json($addon, 201);
    }

    /**
     * Update an addon.
     */
    public function update(Request $request, Addon $addon)
    {
        $user = $request->user();

        if ($addon->event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'type' => 'sometimes|string|in:merch,service,parking',
        ]);

        $addon->update($validated);

        return response()->json($addon);
    }

    /**
     * Delete an addon.
     */
    public function destroy(Request $request, Addon $addon)
    {
        $user = $request->user();

        if ($addon->event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $addon->delete();

        return response()->json(['message' => 'Addon deleted.']);
    }
}
