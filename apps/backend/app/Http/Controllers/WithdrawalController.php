<?php

namespace App\Http\Controllers;

use App\Services\WithdrawalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WithdrawalController extends Controller
{
    protected WithdrawalService $withdrawalService;

    public function __construct(WithdrawalService $withdrawalService)
    {
        $this->withdrawalService = $withdrawalService;
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10000',
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
        ]);

        // Assuming User has 'tenant' relationship or we get tenant from context
        // For MVP, if User belongsTo Tenant
        $user = Auth::user();
        if (!$user || !$user->tenant) {
            return response()->json(['message' => 'User does not belong to a tenant.'], 403);
        }

        try {
            $withdrawalRequest = $this->withdrawalService->request(
                $user->tenant,
                $request->amount,
                ['bank_name' => $request->bank_name, 'account_number' => $request->account_number]
            );

            return response()->json($withdrawalRequest, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
