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

    public function register(Request $request)
    {
        $request->validate([
            'referral_code' => 'nullable|string|min:3|max:20|alpha_dash',
            'bank_details' => 'nullable|array',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Determine tenant. 
        // If public user registers for an event affiliate, they need to specify event/tenant?
        // Story 6.1 says "register as an affiliate for an event".
        // Let's assume request context provides tenant or event.
        // For simpler implementation, let's assume they register for the current tenant context.
        // We'll require tenant_id in body or header. 
        // For now, let's assume body 'tenant_id'.

        $request->validate(['tenant_id' => 'required|exists:tenants,id']);
        $tenant = \App\Models\Tenant::findOrFail($request->tenant_id);

        try {
            $affiliate = $this->affiliateService->register($user, $tenant, $request->all());
            return response()->json($affiliate, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
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
                'tenant_name' => $aff->tenant->name,
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
}
