<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WithdrawalRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'amount',
        'bank_name',
        'account_number',
        'status',
        'admin_notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
