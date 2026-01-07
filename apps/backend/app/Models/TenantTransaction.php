<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantTransaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'amount',
        'type',
        'reference_type',
        'reference_id',
        'description',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }
}
