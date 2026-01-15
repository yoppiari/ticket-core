<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Order;
use App\Services\RevenueService;
use App\Services\TicketService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SwanQrisCallbackController extends Controller
{
    protected $revenueService;
    protected $ticketService;
    protected $notificationService;

    public function __construct(
        RevenueService $revenueService,
        TicketService $ticketService,
        NotificationService $notificationService
    ) {
        $this->revenueService = $revenueService;
        $this->ticketService = $ticketService;
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the B2B Token request from Loket Bayar.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    /**
     * Handle the B2B Token request from Loket Bayar.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getToken(Request $request)
    {
        Log::info('SwanQRIS Inbound Token Request:', $request->all());

        // Validate X-KODE-LOKET to ensure request is for us
        $incomingKodeLoket = $request->header('X-KODE-LOKET');
        $myKodeLoket = config('services.swanqris.kode_loket', env('SWANQRIS_KODE_LOKET'));

        if ($incomingKodeLoket !== $myKodeLoket) {
            Log::warning("SwanQRIS: Invalid X-KODE-LOKET: $incomingKodeLoket");
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // In a real production environment, validate "X-Signature" using Client Secret here.
        // For now, we proceed assuming signature is valid if Kode Loket matches.

        $accessToken = Str::random(64);
        // Expiry 1 hour from now
        $expiredAt = Carbon::now()->addHour()->toIso8601String();

        return response()->json([
            'accessToken' => $accessToken,
            'expiredAt' => $expiredAt,
        ]);
    }

    /**
     * Handle the Notify Callback from Loket Bayar.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function notify(Request $request)
    {
        Log::info('SwanQRIS Notify Received:', $request->all());

        $originalPartnerReferenceNo = $request->input('originalPartnerReferenceNo');
        $latestTransactionStatus = $request->input('latestTransactionStatus');

        // Find the order using the reference number. 
        // We assume partnerReferenceNo was stored as order_number or is the order ID.
        // Adjust the query based on your Order model schema.
        $order = Order::where('order_number', $originalPartnerReferenceNo)->first();

        if (!$order) {
            // Also try finding by ID if referenced as ID
            $order = Order::find($originalPartnerReferenceNo);
        }

        if (!$order) {
            Log::error("SwanQRIS Notify: Order not found for ref: {$originalPartnerReferenceNo}");
            // Return 404 so they know it failed? Or 200 to stop retries?
            // Usually 404 implies path not found. 
            // Let's return 404 to be semantic if the resource is missing.
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Process Success
        if ($latestTransactionStatus === '00') {
            if ($order->status !== 'paid') {
                try {
                    DB::transaction(function () use ($order) {
                        $order->status = 'paid';
                        $order->payment_method = 'qris'; // Ensure we record method
                        $order->save();
                    });

                    // Trigger post-payment services
                    $this->revenueService->processRevenueShare($order);
                    $this->ticketService->generateTickets($order);

                    // Sending tickets involves email/external calls, put in try-catch to not fail the response
                    try {
                        $this->notificationService->sendTickets($order);
                    } catch (\Exception $e) {
                        Log::error("SwanQRIS Notify: Failed to send tickets: " . $e->getMessage());
                    }

                    Log::info("SwanQRIS Notify: Order {$order->id} marked as paid.");
                } catch (\Exception $e) {
                    Log::error("SwanQRIS Notify: Processing Error: " . $e->getMessage());
                    return response()->json(['message' => 'Internal Server Error'], 500);
                }
            } else {
                Log::info("SwanQRIS Notify: Order {$order->id} was already paid. Skipping.");
            }
        } elseif ($latestTransactionStatus != '00') {
            // Handle failed/pending status if applicable
            if ($order->status !== 'paid') {
                $order->status = 'failed';
                $order->save();
                Log::info("SwanQRIS Notify: Order {$order->id} marked as failed.");
            }
        }

        // Return the mandated success response
        return response()->json([
            'responseCode' => '2005200',
            'responseMessage' => 'Request has been processed successfully'
        ]);
    }
}
