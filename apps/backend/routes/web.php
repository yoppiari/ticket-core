<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

// Serve SPA frontend
Route::get('/', [SpaController::class, 'index']);

// Catch-all route for SPA client-side routing (except API routes)
Route::get('/{path}', [SpaController::class, 'catchAll'])->where('path', '^(?!api).*');

Route::get('/{path}', function ($path) {
    return file_get_contents(public_path('spa/index.html'));
})->where('path', '^(?!api).*');
