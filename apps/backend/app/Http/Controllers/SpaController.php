<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SpaController extends Controller
{
    public function index()
    {
        $path = public_path('spa/index.html');
        if (file_exists($path)) {
            return response(file_get_contents($path), 200, ['Content-Type' => 'text/html']);
        }
        abort(404);
    }

    public function catchAll($path = null)
    {
        $indexPath = public_path('spa/index.html');
        if (file_exists($indexPath)) {
            return response(file_get_contents($indexPath), 200, ['Content-Type' => 'text/html']);
        }
        abort(404);
    }
}