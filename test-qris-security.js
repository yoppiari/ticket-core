const https = require('https');
const crypto = require('crypto');

// Configuration
const config = {
    apiUrl: 'https://tukutix.com/api',
    apiKey: 'a4f9c2e1q7m2x9p4bc8t34e7m2c9p5a1f',
    clientSecret: 'a4f9c2e1-q7m2-x9p4-bc8t3-4e7m2c9p5a1f',
    kodeLoket: 'IDM2026011312544233P11'
};

function makeRequest(path, headers) {
    return new Promise((resolve, reject) => {
        const req = https.request(`${config.apiUrl}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve({ code: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.write(JSON.stringify({ grantType: 'client_credentials' }));
        req.end();
    });
}

function generateSignature(timestamp) {
    const stringToSign = timestamp + config.apiKey + config.kodeLoket;
    return crypto.createHmac('sha256', config.clientSecret)
        .update(stringToSign)
        .digest('base64');
}

async function runSecurityTests() {
    console.log('🔒 STARTING SECURITY TEST: B2B TOKEN ENDPOINT\n');

    // TEST 1: No Headers
    console.log('1️⃣ Test No Headers:');
    const res1 = await makeRequest('/b2b/token', {});
    console.log(`   Status: ${res1.code}, Body: ${res1.body.substring(0, 50)}`);

    // TEST 2: Invalid Signature
    console.log('\n2️⃣ Test Invalid Signature:');
    const ts = new Date().toISOString();
    const res2 = await makeRequest('/b2b/token', {
        'X-TIMESTAMP': ts,
        'X-API-KEY': config.apiKey,
        'X-KODE-LOKET': config.kodeLoket,
        'X-AUTHORIZATION': 'Bearer INVALID_SIGNATURE'
    });
    console.log(`   Status: ${res2.code}, Body: ${res2.body.substring(0, 50)}`);

    // TEST 3: Valid Signature
    console.log('\n3️⃣ Test Valid Signature:');
    const validSig = generateSignature(ts);
    const res3 = await makeRequest('/b2b/token', {
        'X-TIMESTAMP': ts,
        'X-API-KEY': config.apiKey,
        'X-KODE-LOKET': config.kodeLoket,
        'X-AUTHORIZATION': 'Bearer ' + validSig
    });
    console.log(`   Status: ${res3.code}, Body: ${res3.body.substring(0, 50)}`);

    console.log('\n🔒 SECURITY TEST FINISHED');
}

runSecurityTests();
