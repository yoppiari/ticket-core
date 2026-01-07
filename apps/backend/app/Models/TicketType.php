<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketType extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'event_id',
        'name',
        'description',
        'price',
        'stock',
        'sale_start_date',
        'sale_end_date',
        'image_url',
    ];

    protected $casts = [
        'sale_start_date' => 'datetime',
        'sale_end_date' => 'datetime',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function pricingTiers()
    {
        return $this->hasMany(PricingTier::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('sale_start_date')
                ->orWhere('sale_start_date', '<=', now());
        })->where(function ($q) {
            $q->whereNull('sale_end_date')
                ->orWhere('sale_end_date', '>=', now());
        });
    }
}
