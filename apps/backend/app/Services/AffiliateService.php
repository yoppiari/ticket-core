<?php

namespace App\Services;

use App\Models\Affiliate;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Str;

class AffiliateService
{
    public function register(User $user, Tenant $tenant, array $data)
    {
        // Check if already registered for this tenant
        $exists = Affiliate::where('user_id', $user->id)
            ->where('tenant_id', $tenant->id)
            ->exists();

        if ($exists) {
            throw new \Exception("User is already an affiliate for this tenant.");
        }

        // Generate Referral Code
        // Attempt to use provided code or generate one
        $code = $data['referral_code'] ?? Str::upper(Str::random(8));

        // Validate uniqueness
        if (Affiliate::where('referral_code', $code)->exists()) {
            throw new \Exception("Referral code is already taken.");
        }

        return Affiliate::create([
            'user_id' => $user->id,
            'tenant_id' => $tenant->id,
            'referral_code' => $code,
            'commission_rate' => 0.05, // Default 5%
            'bank_details' => $data['bank_details'] ?? null,
        ]);
    }

    public function getByCode($code)
    {
        return Affiliate::where('referral_code', $code)->first();
    }
}
