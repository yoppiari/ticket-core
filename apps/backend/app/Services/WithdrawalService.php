<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantTransaction;
use App\Models\WithdrawalRequest;
use Illuminate\Support\Facades\DB;

class WithdrawalService
{
    const APPROVAL_THRESHOLD = 10000000; // 10 Million IDR

    public function request(Tenant $tenant, float $amount, array $bankDetails)
    {
        if ($amount <= 0) {
            throw new \Exception("Withdrawal amount must be greater than zero.");
        }

        if ($tenant->balance < $amount) {
            throw new \Exception("Insufficient balance.");
        }

        return DB::transaction(function () use ($tenant, $amount, $bankDetails) {
            // 1. Deduct Balance
            $tenant->balance -= $amount;
            $tenant->save();

            // 2. Determine Status
            $status = ($amount > self::APPROVAL_THRESHOLD) ? 'pending_approval' : 'approved';

            // 3. Create Request Record
            $request = WithdrawalRequest::create([
                'tenant_id' => $tenant->id,
                'amount' => $amount,
                'bank_name' => $bankDetails['bank_name'],
                'account_number' => $bankDetails['account_number'],
                'status' => $status,
            ]);

            // 4. Record Transaction (Debit)
            TenantTransaction::create([
                'tenant_id' => $tenant->id,
                'amount' => $amount,
                'type' => 'debit',
                'reference_type' => WithdrawalRequest::class,
                'reference_id' => $request->id,
                'description' => "Withdrawal Request #{$request->id} ({$status})",
            ]);

            return $request;
        });
    }

    public function approve($requestId)
    {
        $request = WithdrawalRequest::findOrFail($requestId);

        if ($request->status !== 'pending_approval') {
            throw new \Exception("Request is not pending approval.");
        }

        $request->status = 'approved';
        $request->save();

        // In real app: Trigger Payout Gateway here.

        return $request;
    }

    public function reject($requestId, $reason)
    {
        return DB::transaction(function () use ($requestId, $reason) {
            $request = WithdrawalRequest::findOrFail($requestId);

            if ($request->status === 'rejected' || $request->status === 'processed') {
                throw new \Exception("Request cannot be rejected.");
            }

            // Only refund if it was debiting the balance (which it always does on request).
            // Status could be pending_approval or approved (cancelation?). 
            // Let's assume we can reject pending or approved ones before processed.

            $previousStatus = $request->status;
            $request->status = 'rejected';
            $request->admin_notes = $reason;
            $request->save();

            // Refund Balance
            $tenant = $request->tenant;
            $tenant->balance += $request->amount;
            $tenant->save();

            // Record Refund Transaction
            TenantTransaction::create([
                'tenant_id' => $tenant->id,
                'amount' => $request->amount,
                'type' => 'credit', // Refund is a credit back to balance
                'reference_type' => WithdrawalRequest::class,
                'reference_id' => $request->id,
                'description' => "Refund for Withdrawal #{$request->id}: $reason",
            ]);

            return $request;
        });
    }
}
