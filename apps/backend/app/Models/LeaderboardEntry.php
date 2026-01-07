<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaderboardEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'leaderboard_id',
        'buyer_email',
        'buyer_name',
        'total_quantity',
        'points',
        'rank',
    ];

    public function leaderboard()
    {
        return $this->belongsTo(Leaderboard::class);
    }
}
