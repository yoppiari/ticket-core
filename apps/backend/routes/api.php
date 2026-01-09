<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // ... existing routes
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    Route::get('/me', [\App\Http\Controllers\AuthController::class, 'me']);

    Route::post('/withdrawals', [\App\Http\Controllers\WithdrawalController::class, 'store']);

    // Admin Routes (Should have 'admin' middleware in real app)
    Route::prefix('admin')->group(function () {
        Route::post('/withdrawals/{id}/approve', [\App\Http\Controllers\AdminWithdrawalController::class, 'approve']);
        Route::post('/withdrawals/{id}/reject', [\App\Http\Controllers\AdminWithdrawalController::class, 'reject']);
    });
    // Scanner App Routes
    Route::prefix('scanner')->group(function () {
        Route::get('/events/{eventId}/tickets', [\App\Http\Controllers\ScannerController::class, 'getTickets']);
        Route::post('/events/{eventId}/logs', [\App\Http\Controllers\ScannerController::class, 'syncLogs']);
    });

    // Affiliate Routes
    Route::prefix('affiliates')->group(function () {
        Route::post('/register', [\App\Http\Controllers\AffiliateController::class, 'register']);
        Route::get('/stats', [\App\Http\Controllers\AffiliateController::class, 'stats']);
    });
});

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/tenants', [\App\Http\Controllers\TenantController::class, 'store']);
    Route::get('/tenants', [\App\Http\Controllers\TenantController::class, 'index']);
    Route::put('/tenants/{tenant}', [\App\Http\Controllers\TenantController::class, 'update']);

    // Team Management
    Route::post('/team/invite', [\App\Http\Controllers\TeamController::class, 'invite']);
    Route::get('/team', [\App\Http\Controllers\TeamController::class, 'index']);
    Route::delete('/team/{userId}', [\App\Http\Controllers\TeamController::class, 'destroy']);

    // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);

    // Event Management
    Route::apiResource('events', \App\Http\Controllers\EventController::class);

    // Leaderboard Management (Nested under Events)
    Route::get('events/{event}/leaderboards', [\App\Http\Controllers\LeaderboardController::class, 'index']);
    Route::post('events/{event}/leaderboards', [\App\Http\Controllers\LeaderboardController::class, 'store']);
    Route::put('leaderboards/{id}', [\App\Http\Controllers\LeaderboardController::class, 'update']);
    Route::delete('leaderboards/{id}', [\App\Http\Controllers\LeaderboardController::class, 'destroy']);
    Route::get('leaderboards/{id}', [\App\Http\Controllers\LeaderboardController::class, 'show']);

    // Ticket Inventory (Nested)
    Route::resource('events.ticket-types', \App\Http\Controllers\TicketTypeController::class)->shallow();

    // Pricing Tier Management (Nested under Ticket Types)
    Route::get('ticket-types/{ticketTypeId}/pricing-tiers', [\App\Http\Controllers\PricingTierController::class, 'index']);
    Route::post('ticket-types/{ticketTypeId}/pricing-tiers', [\App\Http\Controllers\PricingTierController::class, 'store']);
    Route::put('pricing-tiers/{id}', [\App\Http\Controllers\PricingTierController::class, 'update']);
    Route::delete('pricing-tiers/{id}', [\App\Http\Controllers\PricingTierController::class, 'destroy']);
    Route::get('pricing-tiers/{id}', [\App\Http\Controllers\PricingTierController::class, 'show']);

    // Addons Management (Nested)
    Route::resource('events.addons', \App\Http\Controllers\AddonController::class)->shallow();
});

Route::get('/tenants/{slug}', [\App\Http\Controllers\TenantController::class, 'show']);

// Public Event Routes (Throttled by Waiting Room)
Route::middleware('waiting_room')->group(function () {
    Route::get('/public/events', [\App\Http\Controllers\PublicEventController::class, 'index']);
    Route::get('/public/tenants/{tenantSlug}/events/{eventSlug}', [\App\Http\Controllers\PublicEventController::class, 'show']);
    Route::post('/public/tenants/{tenantSlug}/events/{eventSlug}/remind', [\App\Http\Controllers\PublicEventController::class, 'remind']);
});

// Waiting Room API
Route::prefix('public/events/{eventSlug}')->group(function () {
    Route::get('/seats', [\App\Http\Controllers\SeatController::class, 'index']);
    Route::get('/addons', [\App\Http\Controllers\PublicAddonController::class, 'index']);
    Route::post('/reservations', [\App\Http\Controllers\ReservationController::class, 'reserve']);
    Route::delete('/reservations', [\App\Http\Controllers\ReservationController::class, 'release']);

    Route::post('/checkout', [\App\Http\Controllers\CheckoutController::class, 'store']);
    Route::get('/checkout/{orderId}', [\App\Http\Controllers\CheckoutController::class, 'show']);
    Route::post('/checkout/{orderId}/pay', [\App\Http\Controllers\PaymentController::class, 'pay']);

    Route::get('/queue-status', [\App\Http\Controllers\WaitingRoomController::class, 'status']);
    Route::post('/heartbeat', [\App\Http\Controllers\WaitingRoomController::class, 'heartbeat']);
});

// Embeddable Widgets API
Route::get('/embed/leaderboards/{id}', [\App\Http\Controllers\LeaderboardController::class, 'embed']);

Route::post('/webhooks/payment/{provider}', [\App\Http\Controllers\WebhookController::class, 'handle']);
