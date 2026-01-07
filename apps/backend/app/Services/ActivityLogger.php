<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    public static function log($action, $description = null, $model = null, $properties = [])
    {
        try {
            ActivityLog::create([
                'tenant_id' => $model && method_exists($model, 'hasAttribute') && $model->hasAttribute('tenant_id') ? $model->tenant_id : (Auth::user()->tenant_id ?? null),
                'user_id' => Auth::id(),
                'actable_type' => $model ? get_class($model) : null,
                'actable_id' => $model ? $model->id : null,
                'action' => $action,
                'description' => $description,
                'properties' => $properties,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]);
        } catch (\Exception $e) {
            // Fail silently to not disrupt main flow
            // Log::error($e->getMessage());
        }
    }
}
