<?php

namespace App\Services\Gateways;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Exception;

class SwanQrisService
{
    protected $baseUrl;
    protected $merchantId;
    protected $subMerchantId;
    protected $storeId;
    protected $email;
    protected $password;
    protected $apiKey;
    protected $clientSecret;
    protected $kodeLoket;
    protected $partnerId;
    protected $mockMode;

    public function __construct()
    {
        $this->baseUrl = config('services.swanqris.base_url', env('SWANQRIS_BASE_URL'));
        $this->merchantId = config('services.swanqris.merchant_id', env('SWANQRIS_MERCHANT_ID'));
        $this->subMerchantId = config('services.swanqris.sub_merchant_id', env('SWANQRIS_SUB_MERCHANT_ID'));
        $this->storeId = config('services.swanqris.store_id', env('SWANQRIS_STORE_ID'));
        $this->email = config('services.swanqris.email', env('SWANQRIS_EMAIL'));
        $this->password = config('services.swanqris.password', env('SWANQRIS_PASSWORD'));
        $this->apiKey = config('services.swanqris.api_key', env('SWANQRIS_API_KEY'));
        $this->clientSecret = config('services.swanqris.client_secret', env('SWANQRIS_CLIENT_SECRET'));
        $this->kodeLoket = config('services.swanqris.kode_loket', env('SWANQRIS_KODE_LOKET'));
        $this->partnerId = config('services.swanqris.partner_id', env('SWANQRIS_PARTNER_ID'));
        $this->mockMode = config('services.swanqris.mock_mode', false);
    }

    /**
     * Get B2B Access Token with caching
     */
    protected function getAccessToken()
    {
        if ($this->mockMode) {
            Log::info('SwanQRIS: Mock Mode Enabled - Returning Dummy Token');
            return 'mock-access-token-' . time();
        }

        $cacheKey = 'swanqris_access_token';

        // Check cache first
        $cachedToken = Cache::get($cacheKey);
        if ($cachedToken) {
            return $cachedToken;
        }

        // Generate new token based on SwanQRIS documentation
        $timestamp = Carbon::now()->toIso8601String();

        // Signature for B2B Token: HMACSHA256(X-KODE-LOKET + X-TIMESTAMP, CLIENT_SECRET)
        $stringToSign = $this->kodeLoket . $timestamp;
        $signature = hash_hmac('sha256', $stringToSign, $this->clientSecret, false);
        $base64Signature = base64_encode($signature);

        $payload = [
            'grantType' => 'client_credentials'
        ];

        Log::info('SwanQRIS Token Request:', [
            'timestamp' => $timestamp,
            'kodeLoket' => $this->kodeLoket,
            'apiKey' => $this->apiKey,
        ]);

        try {
            $response = Http::withHeaders([
                'X-TIMESTAMP' => $timestamp,
                'X-API-KEY' => $this->apiKey,
                'X-KODE-LOKET' => $this->kodeLoket,
                'X-DEVICE-ID' => 'TUKUTIX-SERVER-001',
                'X-EXTERNAL-ID' => 'TOKEN-' . time(),
                'X-AUTHORIZATION' => 'Bearer ' . $base64Signature,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . 'qris/token/b2b', $payload);

            Log::info('SwanQRIS Token Response:', [
                'status' => $response->status(),
                'headers' => $response->headers(),
                'body' => $response->json(),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $accessToken = $data['accessToken'] ?? null;

                if (!$accessToken) {
                    throw new Exception('No access token in response');
                }

                // Cache token based on expiresIn (default 1 hour, cache for 55 minutes for safety)
                $expiresInSeconds = $data['expiresIn'] ?? 3600;
                $cacheMinutes = floor($expiresInSeconds / 60) - 5; // 5 min safety margin
                Cache::put($cacheKey, $accessToken, now()->addMinutes($cacheMinutes));

                return $accessToken;
            }

            throw new Exception('Failed to get access token: ' . $response->body());
        } catch (Exception $e) {
            Log::error('SwanQRIS Token Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate transaction signature
     *
     * @param string $accessToken
     * @param string $httpMethod
     * @param string $endpointUrl
     * @param string $requestBody
     * @param string $timestamp
     * @return string
     */
    protected function generateSignature($accessToken, $httpMethod, $endpointUrl, $requestBody, $timestamp)
    {
        // SwanQRIS signature format (typical for Indonesian payment gateways):
        // HMACSHA256(HTTP_METHOD + ":" + RELATIVE_URL + ":" + ACCESS_TOKEN + ":" + SHA256(REQUEST_BODY) + ":" + TIMESTAMP, CLIENT_SECRET)

        $minifiedBody = json_encode(json_decode($requestBody)); // Minify JSON
        $hashedBody = hash('sha256', $minifiedBody);

        $stringToSign = $httpMethod . ":" . $endpointUrl . ":" . $accessToken . ":" . strtolower($hashedBody) . ":" . $timestamp;

        return hash_hmac('sha256', $stringToSign, $this->clientSecret ?? $this->password, false);
    }

    /**
     * Generate QR Code
     *
     * @param string $partnerReferenceNo Unique transaction number
     * @param float $amount Net amount (e.g., 10000.00)
     * @param int $validTime Validity in seconds (max 2,678,400)
     * @return array
     * @throws Exception
     */
    public function generateQr(string $partnerReferenceNo, float $amount, int $validTime = 900)
    {
        if ($this->mockMode) {
            Log::info('SwanQRIS: Mock Mode Enabled - Generating Dummy QR');
            return [
                'responseCode' => '2005200',
                'responseMessage' => 'Success (Mock)',
                // Return a dummy QR string compatible with standard QR parsers
                'qrContent' => '00020101021226660014ID.LINKAJA.WWW01189360091100210001880215202601151930000303UME51440014ID.CO.QRIS.WWW0215ID20254146030060303UME5204581253033605802ID5913TUKUTIX MOCK6007JAKARTA61051219062070703A0163046D32',
                'partnerReferenceNo' => $partnerReferenceNo,
                'amount' => [
                    'value' => number_format($amount, 2, '.', ''),
                    'currency' => 'IDR'
                ]
            ];
        }

        $accessToken = $this->getAccessToken();
        $timestamp = Carbon::now()->toIso8601String();
        $endpointUrl = '/qris/v1.0/generate';

        $payload = [
            'amount' => number_format($amount, 2, '.', ''), // Ensure 2 decimal digits
            'partnerReferenceNo' => $partnerReferenceNo,
            'validTime' => (string) $validTime,
            'merchantId' => $this->merchantId,
            'subMerchantId' => $this->subMerchantId,
            'storeId' => $this->storeId,
        ];

        $requestBody = json_encode($payload);
        $signature = $this->generateSignature($accessToken, 'POST', $endpointUrl, $requestBody, $timestamp);

        Log::info('SwanQRIS Generate Request:', [
            'payload' => $payload,
            'timestamp' => $timestamp,
        ]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'X-TIMESTAMP' => $timestamp,
                'X-SIGNATURE' => $signature,
                'X-PARTNER-ID' => $this->subMerchantId,
                'X-EXTERNAL-ID' => $partnerReferenceNo,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . 'qris/v1.0/generate', $payload);

            Log::info('SwanQRIS Generate Response:', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            throw new Exception('Failed to generate QR: ' . $response->body());
        } catch (Exception $e) {
            Log::error('SwanQRIS Generate Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Query Transaction Status
     *
     * @param string $originalPartnerReferenceNo
     * @return array
     * @throws Exception
     */
    public function queryTransaction(string $originalPartnerReferenceNo)
    {
        if ($this->mockMode) {
            Log::info('SwanQRIS: Mock Mode Enabled - Querying Dummy Transaction');
            return [
                'responseCode' => '2005200',
                'responseMessage' => 'Success (Mock)',
                'latestTransactionStatus' => '00', // Success
                'transactionStatusDesc' => 'Success',
                'originalPartnerReferenceNo' => $originalPartnerReferenceNo
            ];
        }

        $accessToken = $this->getAccessToken();
        $timestamp = Carbon::now()->toIso8601String();
        $endpointUrl = '/qris/v1.0/query';

        $payload = [
            'originalPartnerReferenceNo' => $originalPartnerReferenceNo,
            'merchantId' => $this->merchantId,
            'subMerchantId' => $this->subMerchantId,
            'storeId' => $this->storeId,
        ];

        $requestBody = json_encode($payload);
        $signature = $this->generateSignature($accessToken, 'POST', $endpointUrl, $requestBody, $timestamp);

        Log::info('SwanQRIS Query Request:', [
            'payload' => $payload,
            'timestamp' => $timestamp,
        ]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'X-TIMESTAMP' => $timestamp,
                'X-SIGNATURE' => $signature,
                'X-PARTNER-ID' => $this->subMerchantId,
                'X-EXTERNAL-ID' => $originalPartnerReferenceNo,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . 'qris/v1.0/query', $payload);

            Log::info('SwanQRIS Query Response:', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            throw new Exception('Failed to query transaction: ' . $response->body());
        } catch (Exception $e) {
            Log::error('SwanQRIS Query Error: ' . $e->getMessage());
            throw $e;
        }
    }
}
