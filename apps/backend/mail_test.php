<?php
use App\Models\Tenant;
use App\Models\Invitation;
use App\Mail\TeamInvitation;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

$tenant = Tenant::firstOrCreate(
    ['slug' => 'mail-test'],
    ['name' => 'Mail Test', 'status' => 'active']
);

Invitation::where('email', 'mailpit@test.com')->delete();

$invitation = Invitation::create([
    'email' => 'mailpit@test.com',
    'role' => 'scanner',
    'token' => Str::random(32),
    'tenant_id' => $tenant->id,
    'expires_at' => now()->addDays(1),
]);

Mail::to($invitation->email)->send(new TeamInvitation($invitation));
echo "Email sent to " . $invitation->email;
