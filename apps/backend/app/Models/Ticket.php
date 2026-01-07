<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'event_id',
        'order_id',
        'ticket_type_id',
        'ticket_code',
        'status',
        'checked_in_at',
        'metadata',
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    public function ticketType()
    {
        return $this->belongsTo(TicketType::class);
    }
}
