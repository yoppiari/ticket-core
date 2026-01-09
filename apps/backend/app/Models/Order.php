<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'event_id',
        'user_id',
        'session_id',
        'total_amount',
        'status',
        'expires_at',
        'affiliate_id',
        'commission_amount',
        'buyer_name',
        'buyer_email',
        'buyer_whatsapp',
        'delivery_method',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
