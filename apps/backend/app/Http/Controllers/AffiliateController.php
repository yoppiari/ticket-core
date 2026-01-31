<?php

namespace App\Http\Controllers;

use App\Services\AffiliateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AffiliateController extends Controller
{
    protected AffiliateService $affiliateService;

    public function __construct(AffiliateService $affiliateService)
    {
        $this->affiliateService = $affiliateService;
    }

    public function track(Request $request)
    {
        $request->validate([
            'ref' => 'required|string|exists:affiliates,referral_code'
        ]);

        $code = $request->input('ref');

        // Increment Clicks
        \App\Models\Affiliate::where('referral_code', $code)->increment('clicks');

        return response()->json(['success' => true]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'referral_code' => 'nullable|string|min:3|max:20|alpha_dash',
            'bank_details' => 'nullable|array',
            'tenant_id' => 'nullable|exists:tenants,id'
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $tenant = null;
        if ($request->has('tenant_id')) {
            $tenant = \App\Models\Tenant::find($request->tenant_id);
        }

        try {
            $affiliate = $this->affiliateService->register($user, $tenant, $request->all());
            return response()->json($affiliate, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * List events available for affiliation.
     */
    public function marketplace(Request $request)
    {
        // Return events where affiliate_enabled = true
        $events = \App\Models\Event::where('affiliate_enabled', true)
            ->where('status', 'published') // Only published events
            ->with('tenant:id,name,slug') // Include tenant name
            ->orderBy('start_date', 'asc')
            ->paginate(50) // High limit for marketplace
            ->through(function ($event) use ($request) {
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'slug' => $event->slug,
                    'tenant_name' => $event->tenant->name,
                    'tenant_slug' => $event->tenant->slug,
                    'start_date' => $event->start_date,
                    'venue_name' => $event->venue_name,
                    'commission_type' => $event->commission_type,
                    'commission_value' => $event->commission_value,
                    'commission_display' => $event->commission_type === 'percent'
                        ? (float) $event->commission_value . '%'
                        : 'Rp ' . number_format($event->commission_value, 0, ',', '.'),
                    'event_url' => url("/{$event->tenant->slug}/e/{$event->slug}"), // Or frontend URL
                ];
            });

        return response()->json($events);
    }

    public function stats(Request $request)
    {
        $user = Auth::user();
        if (!$user)
            return response()->json(['message' => 'Unauthorized'], 401);

        // Get Affiliate Record (Assuming one per tenant context or just first for now)
        // If user can be affiliate for multiple tenants, we need tenant context.
        // Or return list of affiliate accounts.
        // Let's assume passed tenant_id or return all.
        // Story 6-4: "I can see a list of recent conversions".

        $affiliates = \App\Models\Affiliate::where('user_id', $user->id)
            ->with([
                'tenant',
                'orders' => function ($q) {
                    $q->latest()->limit(10);
                }
            ])
            ->withCount('orders as total_conversions')
            ->withSum('orders as total_commission', 'commission_amount')
            ->get();

        $data = $affiliates->map(function ($aff) {
            return [
                'tenant_name' => $aff->tenant ? $aff->tenant->name : 'Global',
                'referral_code' => $aff->referral_code,
                'clicks' => $aff->clicks,
                'conversions' => $aff->orders->count(), // Count of recently loaded orders
                'total_conversions' => $aff->total_conversions ?? 0,
                'total_commission' => $aff->total_commission ?? 0,
                'recent_orders' => $aff->orders
            ];
        });

        return response()->json($data);
    }

    /**
     * Admin: List all affiliates for the current tenant.
     */
    public function index(Request $request)
    {
        // Assuming Tenant Admin is authenticated and has a 'tenant_id' or associated tenant.
        // In this project, it seems Admins are global or tied to a tenant via a header/relation.
        // Let's assume the user IS the tenant owner or we pass tenant_id.
        // Based on other controllers, we might look for a 'tenant_id' or rely on Auth.

        // WARNING: Simplification. We need to know WHICH tenant triggers this.
        // If the user is a Tenant Owner, we fetch their tenant.
        // For now, let's assume we pass ?tenant_id=XYZ or infer from user.

        // Let's try to get tenant from user relation or request.
        // If 'admin' middleware checks tenant ownership, great.

        // Code adaptation:
        $user = Auth::user();
        // Assuming a simple "First tenant owned" or "Head" specific logic.
        // In Admin routes, usually we deal with the 'current' tenant context.

        // Quick Fix: Allow passing tenant_id if Super Admin, or rely on User's tenant.
        $tenantId = $request->query('tenant_id');

        if (!$tenantId) {
            // Check if user belongs to a tenant (Tenant Admin/Staff)
            if ($user->tenant_id) {
                $tenantId = $user->tenant_id;
            }
        }

        if (!$tenantId) {
            return response()->json(['message' => 'Tenant context required.'], 400);
        }

        $affiliates = \App\Models\Affiliate::where('tenant_id', $tenantId)
            ->with(['user', 'orders'])
            ->withCount('orders as total_conversions')
            ->withSum('orders as total_commission', 'commission_amount')
            ->paginate(20)
            ->through(function ($aff) {
                return [
                    'id' => $aff->id,
                    'name' => $aff->user->name,
                    'email' => $aff->user->email,
                    'referral_code' => $aff->referral_code,
                    'commission_rate' => $aff->commission_rate,
                    'clicks' => $aff->clicks,
                    'total_conversions' => $aff->total_conversions,
                    'total_commission' => $aff->total_commission ?? 0,
                    'joined_at' => $aff->created_at->toIso8601String(),
                ];
            });

        return response()->json($affiliates);
    }
}
