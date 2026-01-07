<x-mail::message>
    # You have been invited to join {{ $tenantName }}

    You have been invited to join the team as a **{{ ucfirst($role) }}**.

    <x-mail::button :url="$url">
        Accept Invitation
    </x-mail::button>

    If you did not expect this invitation, you can ignore this email.

    Thanks,<br>
    {{ config('app.name') }}
</x-mail::message>