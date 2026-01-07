<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PricingTier extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'ticket_type_id',
        'name',
        'price',
        'starts_at',
        'ends_at',
        'quantity_limit',
        'priority',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function ticketType()
    {
        return $this->belongsTo(TicketType::class);
    }
}
