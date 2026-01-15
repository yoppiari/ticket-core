<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'swanqris' => [
        'base_url' => env('SWANQRIS_BASE_URL'),
        'merchant_id' => env('SWANQRIS_MERCHANT_ID'),
        'sub_merchant_id' => env('SWANQRIS_SUB_MERCHANT_ID'),
        'store_id' => env('SWANQRIS_STORE_ID'),
        'email' => env('SWANQRIS_EMAIL'),
        'password' => env('SWANQRIS_PASSWORD'),
        'api_key' => env('SWANQRIS_API_KEY'),
        'client_secret' => env('SWANQRIS_CLIENT_SECRET'),
        'kode_loket' => env('SWANQRIS_KODE_LOKET'),
        'partner_id' => env('SWANQRIS_PARTNER_ID'),
        'mock_mode' => env('SWANQRIS_MOCK_MODE', false),
    ],

];
