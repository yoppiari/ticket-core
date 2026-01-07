<?php

namespace App\Http\Controllers;

use App\Services\WithdrawalService;
use Illuminate\Http\Request;

class AdminWithdrawalController extends Controller
{
    protected WithdrawalService $withdrawalService;

    public function __construct(WithdrawalService $withdrawalService)
    {
        $this->withdrawalService = $withdrawalService;
    }

    public function approve($id)
    {
        try {
            $request = $this->withdrawalService->approve($id);
            return response()->json($request);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function reject(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);

        try {
            $withdrawalRequest = $this->withdrawalService->reject($id, $request->reason);
            return response()->json($withdrawalRequest);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
