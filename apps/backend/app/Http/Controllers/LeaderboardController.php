<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Leaderboard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        // Check permissions (Tenant Owner/Admin only)
        // For MVP, assuming auth middleware handles basic check, but ideally we check tenant ownership

        return $event->leaderboards()
            ->with('addon')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'addon_id' => 'nullable|exists:addons,id',
            'config' => 'nullable|array',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $leaderboard = $event->leaderboards()->create($validated);

        return response()->json($leaderboard, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $leaderboard = Leaderboard::with([
            'addon',
            'entries' => function ($query) {
                $query->orderBy('points', 'desc')->limit(50);
            }
        ])->findOrFail($id);

        return response()->json($leaderboard);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $leaderboard = Leaderboard::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'addon_id' => 'nullable|exists:addons,id',
            'config' => 'nullable|array',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $leaderboard->update($validated);

        return response()->json($leaderboard);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $leaderboard = Leaderboard::findOrFail($id);
        $leaderboard->delete();

        return response()->noContent();
    }

    /**
     * Public API for embedding
     */
    public function embed($id)
    {
        $leaderboard = Leaderboard::findOrFail($id);

        if (!$leaderboard->is_active) {
            return response()->json(['message' => 'Leaderboard is not active'], 404);
        }

        // Get Top 100
        $entries = $leaderboard->entries()
            ->orderBy('points', 'desc')
            ->take(100)
            ->get()
            ->map(function ($entry, $index) {
                return [
                    'rank' => $index + 1,
                    'name' => $this->maskName($entry->buyer_name),
                    'points' => $entry->points,
                ];
            });

        return response()->json([
            'name' => $leaderboard->name,
            'description' => $leaderboard->description,
            'entries' => $entries
        ]);
    }

    private function maskName($name)
    {
        // Simple masking: "John Doe" -> "Jo** D**"
        return preg_replace('/(?<=..)./', '*', $name);
    }
}
