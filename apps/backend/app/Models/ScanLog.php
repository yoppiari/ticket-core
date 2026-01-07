<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScanLog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'event_id',
        'ticket_id',
        'gate_staff_id',
        'status',
        'scanned_at',
        'device_id',
        'is_offline_sync',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'is_offline_sync' => 'boolean',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
    public function gateStaff()
    {
        return $this->belongsTo(User::class, 'gate_staff_id');
    }
}
