<?php

require __DIR__ . '/apps/backend/vendor/autoload.php';

$app = require_once __DIR__ . '/apps/backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\Gateways\SwanQrisService;
use Illuminate\Support\Facades\Config;

// Force Enable Mock Mode for this test
Config::set('services.swanqris.mock_mode', true);

echo "\n--- Testing SwanQRIS Mock Mode ---\n";

try {
    $service = new SwanQrisService();

    // Test 1: Generate QR
    echo "\n[1] Testing generateQr()...\n";
    $refNo = 'TEST-ORDER-MOCK-' . time();
    $response = $service->generateQr($refNo, 15000);

    if (isset($response['responseCode']) && $response['responseCode'] === '2005200') {
        echo "✅ SUCCESS: Mock QR Generated.\n";
        echo "   Message: " . $response['responseMessage'] . "\n";
        echo "   QR Content: " . substr($response['qrContent'], 0, 30) . "...\n";
    } else {
        echo "❌ FAILED: Start check response structure.\n";
        print_r($response);
    }

    // Test 2: Query Transaction
    echo "\n[2] Testing queryTransaction()...\n";
    $queryResponse = $service->queryTransaction($refNo);

    if (isset($queryResponse['latestTransactionStatus']) && $queryResponse['latestTransactionStatus'] === '00') {
        echo "✅ SUCCESS: Mock Transaction Query Success.\n";
        echo "   Status: " . $queryResponse['transactionStatusDesc'] . "\n";
    } else {
        echo "❌ FAILED: Query response incorrect.\n";
        print_r($queryResponse);
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n--- End Test ---\n";
