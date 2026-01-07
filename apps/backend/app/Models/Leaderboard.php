<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Leaderboard extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'event_id',
        'addon_id',
        'name',
        'description',
        'config',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected $casts = [
        'config' => 'array',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function addon()
    {
        return $this->belongsTo(Addon::class);
    }

    public function entries()
    {
        return $this->hasMany(LeaderboardEntry::class);
    }
}
