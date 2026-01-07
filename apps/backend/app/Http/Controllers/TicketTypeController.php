<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\TicketType;
use Illuminate\Http\Request;

class TicketTypeController extends Controller
{
    /**
     * List ticket types for a specific event.
     */
    public function index(Request $request, Event $event)
    {
        $user = $request->user();

        // 1. Authorization: User must belong to the same tenant as the event
        if ($event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($event->ticketTypes);
    }

    /**
     * Create a new ticket type for an event.
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
            'sale_start_date' => 'nullable|date',
            'sale_end_date' => 'nullable|date|after:sale_start_date',
        ]);

        $ticketType = $event->ticketTypes()->create($validated);

        return response()->json($ticketType, 201);
    }

    /**
     * Update a ticket type.
     */
    public function update(Request $request, TicketType $ticketType)
    {
        $user = $request->user();

        // Check ownership via the related event
        if ($ticketType->event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'sale_start_date' => 'nullable|date',
            'sale_end_date' => 'nullable|date|after:sale_start_date',
        ]);

        $ticketType->update($validated);

        return response()->json($ticketType);
    }

    /**
     * Delete a ticket type.
     */
    public function destroy(Request $request, TicketType $ticketType)
    {
        $user = $request->user();

        if ($ticketType->event->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticketType->delete();

        return response()->json(['message' => 'Ticket type deleted.']);
    }
}
