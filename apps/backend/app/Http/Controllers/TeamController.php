<?php

namespace App\Http\Controllers;

use App\Mail\TeamInvitation;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class TeamController extends Controller
{
    public function invite(Request $request)
    {
        $user = $request->user();

        // 1. Authorization: Only Tenant Owners can invite
        // Move to Policy later, simplified check here
        if ($user->role !== 'owner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$user->tenant_id) {
            return response()->json(['message' => 'User does not belong to a tenant'], 400);
        }

        $validated = $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:admin,scanner,staff',
        ]);

        // 2. Check if user is already a member
        $existingMember = User::where('email', $validated['email'])
            ->where('tenant_id', $user->tenant_id)
            ->exists();

        if ($existingMember) {
            return response()->json(['message' => 'User is already a team member.'], 422);
        }

        // 3. Create Invitation
        $invitation = Invitation::create([
            'email' => $validated['email'],
            'role' => $validated['role'],
            'token' => Str::upper(Str::random(32)), // Basic token
            'tenant_id' => $user->tenant_id,
            'expires_at' => now()->addDays(2),
        ]);

        // 4. Send Email
        Mail::to($invitation->email)->send(new TeamInvitation($invitation));

        return response()->json([
            'message' => 'Invitation sent successfully.',
            'invitation' => $invitation
        ], 201);
    }
}
