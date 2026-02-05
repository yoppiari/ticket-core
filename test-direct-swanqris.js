const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. Read .env manual parsing
const envPath = path.join(__dirname, 'apps/backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        env[key] = val;
    }
});

console.log('🔧 CONFIG LOADED FROM LOCAL .ENV:');
console.log(`   Base URL: ${env.SWANQRIS_BASE_URL}`);
console.log(`   Merchant: ${env.SWANQRIS_MERCHANT_ID}`);
console.log(`   API Key:  ${env.SWANQRIS_API_KEY ? '******' : 'MISSING'}`);

// 2. Helper Request
function request(endpoint, method, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlStr = (env.SWANQRIS_BASE_URL.endsWith('/')
            ? env.SWANQRIS_BASE_URL
            : env.SWANQRIS_BASE_URL + '/') + endpoint;

        console.log(`\n📡 Requesting: ${method} ${urlStr}`);

        const url = new URL(urlStr);
        const req = https.request(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data }); // HTML likely
                }
            });
        });

        req.on('error', (e) => {
            console.error('Network Error:', e.message);
            resolve({ status: 0, body: e.message });
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// 3. Security Signature
function generateSignature(timestamp, method, path, body) {
    // Note: SwanQRIS direct API might use different signature for Merchant -> SwanQRIS
    // Based on docs, Authentication is for B2B Token?
    // Let's try Basic Auth first as commonly used in docs for Token

    // DOCS SAY: https://simulator-madera.loketbayar.id/documentation/qris/tokenb2b
    // We need to implement Client Credentials flow
    return "";
}

async function run() {
    // TEST 1: DIRECT GENERATE (Assuming we have creds)
    // Actually, usually we need a Token first.
    // Based on documentation provided earlier:
    // "Authentication details ... link: /documentation/qris/tokenb2b"
    // "5.1 Generate QR ... Request ... qris/v1.0/generate"

    // Let's try to hit Generate directly (some implementations allow Basic Auth)
    // Or check if URL is reachable (Health Check)

    const payload = {
        amount: "10000.00",
        partnerReferenceNo: "TEST-" + Date.now(),
        validTime: "900",
        merchantId: env.SWANQRIS_MERCHANT_ID,
        subMerchantId: env.SWANQRIS_SUB_MERCHANT_ID,
        storeId: env.SWANQRIS_STORE_ID
    };

    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    // Try Basic Auth with Email:Password (from docs)
    const auth = 'Basic ' + Buffer.from(`${env.SWANQRIS_EMAIL}:${env.SWANQRIS_PASSWORD}`).toString('base64');

    const res = await request('qris/v1.0/generate', 'POST', payload, {
        'Authorization': auth
    });

    console.log('⬇️ RESPONSE:');
    console.log(`   Status: ${res.status}`);
    console.log(`   Body:`, typeof res.body === 'object' ? JSON.stringify(res.body, null, 2) : res.body.substring(0, 500));
}

run();
