<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'terms_and_conditions',
        'facilities',
        'social_media',
        'start_date',
        'end_date',
        'venue_name',
        'venue_address',
        'latitude',
        'longitude',
        'status',
        'tenant_id',
        'leaderboard_config',
        'banner_url',
        'seat_map_layout',
        // Affiliate Settings
        'affiliate_enabled',
        'commission_type',
        'commission_value',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'seat_map_layout' => 'array',
        'leaderboard_config' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'social_media' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function seats()
    {
        return $this->hasMany(Seat::class);
    }

    public function ticketTypes()
    {
        return $this->hasMany(TicketType::class);
    }

    public function addons()
    {
        return $this->hasMany(Addon::class);
    }

    public function reminders()
    {
        return $this->hasMany(EventReminder::class);
    }

    public function leaderboards()
    {
        return $this->hasMany(Leaderboard::class);
    }

    public function getCapacityAttribute()
    {
        return $this->ticketTypes()->sum('stock');
    }
}
