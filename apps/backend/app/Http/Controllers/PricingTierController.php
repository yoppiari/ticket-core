<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\PricingTier;
use App\Models\TicketType;
use Illuminate\Http\Request;

class PricingTierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($ticketTypeId)
    {
        $ticketType = TicketType::findOrFail($ticketTypeId);

        return $ticketType->pricingTiers()
            ->orderBy('priority', 'asc')
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $ticketTypeId)
    {
        $ticketType = TicketType::findOrFail($ticketTypeId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'quantity_limit' => 'nullable|integer|min:1',
            'priority' => 'required|integer',
        ]);

        $tier = $ticketType->pricingTiers()->create($validated);

        return response()->json($tier, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return PricingTier::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $tier = PricingTier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'price' => 'numeric|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'quantity_limit' => 'nullable|integer|min:1',
            'priority' => 'integer',
        ]);

        $tier->update($validated);

        return response()->json($tier);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        PricingTier::findOrFail($id)->delete();
        return response()->noContent();
    }
}
