<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TenantController extends Controller
{
    /**
     * Store a new tenant and its owner.
     */
    public function store(Request $request)
    {
        // 1. Validation (System Admin level)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|unique:tenants,slug|alpha_dash',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        return DB::transaction(function () use ($validated) {
            // 2. Create Tenant
            $tenant = Tenant::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'status' => 'active',
                'branding' => null, // Defaults
            ]);

            // 3. Create Owner User
            $owner = User::create([
                'name' => $validated['name'] . ' Owner',
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'tenant_id' => $tenant->id,
                'role' => 'owner',
            ]);

            return response()->json([
                'message' => 'Tenant and Owner created successfully.',
                'tenant' => $tenant,
                'owner' => $owner,
            ], 201);
        });
    }

    /**
     * List all tenants (System Admin only).
     */
    public function index()
    {
        return response()->json(Tenant::all());
    }


    /**
     * Update tenant branding and settings.
     */
    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'branding' => 'sometimes|array',
            'branding.logo' => 'sometimes|string', // Assuming URL or base64 for now
            'branding.primary_color' => ['sometimes', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'settings' => 'sometimes|array',
            'settings.show_past_events' => 'sometimes|boolean',
            'settings.bank_details' => 'sometimes|array',
            'settings.bank_details.bank_name' => 'required_with:settings.bank_details|string',
            'settings.bank_details.account_number' => 'required_with:settings.bank_details|string',
            'settings.bank_details.account_holder' => 'required_with:settings.bank_details|string',
        ]);

        $tenant->update($validated);

        return response()->json([
            'message' => 'Tenant updated successfully.',
            'tenant' => $tenant,
        ]);
    }

    /**
     * Get tenant by slug (Public).
     */
    public function show($slug)
    {
        $tenant = Tenant::where('slug', $slug)->firstOrFail();
        return response()->json($tenant);
    }
}
