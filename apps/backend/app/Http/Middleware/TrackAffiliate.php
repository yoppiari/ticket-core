<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cookie;

class TrackAffiliate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Check for ?ref=CODE param
        if ($request->has('ref')) {
            $code = $request->query('ref');

            // Queue cookie for 30 days (43200 minutes)
            // 'affiliate_ref' cookie

            // Note: If response is JsonResponse, queue() works.
            // If we are redirecting (Next.js handling this?), implementation depends on app structure.
            // In API-only backend, usually frontend reads URL and sends Header or specific 'track' endpoint.
            // But if Backend serves public pages (e.g. initial load) or if we want API to set cookie.

            // Assuming Next.js Frontend will forward the 'ref' or better yet:
            // Frontend Middleware sets cookie, and Backend Checkout reads cookie/header.

            // BUT, user asked for Backend Middleware.
            // Let's assume this middleware is applied to Public Event Routes.

            $cookie = cookie('affiliate_ref', $code, 43200);
            $response->withCookie($cookie);

            // Increment Clicks
            // Use DB::table or Model to avoid overhead? Model is fine.
            // Check if code exists to avoid incrementing non-existent?
            // Yes.
            \App\Models\Affiliate::where('referral_code', $code)->increment('clicks');
        }

        return $response;
    }
}
