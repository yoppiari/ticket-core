<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class PublicAddonController extends Controller
{
    /**
     * List addons for a specific event (public).
     */
    public function index(string $eventSlug)
    {
        $event = Event::where('slug', $eventSlug)->firstOrFail();

        $addons = $event->addons()
            ->where('stock', '>', 0)
            ->get();

        return response()->json($addons);
    }
}
