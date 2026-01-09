<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventReminder extends Model
{
    use HasFactory, \Illuminate\Database\Eloquent\Concerns\HasUuids;

    protected $fillable = [
        'tenant_id',
        'event_id',
        'email',
        'is_notified'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
