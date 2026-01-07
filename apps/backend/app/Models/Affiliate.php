<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Affiliate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'tenant_id',
        'referral_code',
        'commission_rate',
        'bank_details',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:4',
        'bank_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
