const https = require('https');
const crypto = require('crypto');

// SwanQRIS Configuration from .env
const config = {
    baseUrl: 'simulator-madera.loketbayar.id',
    apiKey: 'a4f9c2e1q7m2x9p4bc8t34e7m2c9p5a1f',
    clientSecret: 'a4f9c2e1-q7m2-x9p4-bc8t3-4e7m2c9p5a1f',
    kodeLoket: 'IDM2026011312544233P11',
    partnerId: 'IDM2026011312544233P11',
};

// Generate timestamp in ISO8601 format with timezone: Y-m-d\TH:i:sP
function getTimestamp() {
    const now = new Date();
    const offset = '+07:00';  // WIB timezone
    return now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + 'T' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0') + offset;
}

const timestamp = getTimestamp();
const externalId = 'TOKEN-' + Date.now();
const deviceId = 'TUKUTIX-SERVER-001';

// Generate signature: HMACSHA256(KODE_LOKET + TIMESTAMP, CLIENT_SECRET)
const stringToSign = config.kodeLoket + timestamp;
const signature = crypto.createHmac('sha256', config.clientSecret)
    .update(stringToSign)
    .digest('hex');
const base64Signature = Buffer.from(signature).toString('base64');

// B2B Token Request Payload
const payload = JSON.stringify({
    grantType: 'client_credentials'
});

// Request options
const options = {
    hostname: config.baseUrl,
    path: '/qris/token/b2b',
    method: 'POST',
    headers: {
        'X-TIMESTAMP': timestamp,
        'X-API-KEY': config.apiKey,
        'X-KODE-LOKET': config.kodeLoket,
        'X-DEVICE-ID': deviceId,
        'X-EXTERNAL-ID': externalId,
        'X-AUTHORIZATION': `Bearer ${base64Signature}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

console.log('===== SwanQRIS B2B Token Test =====');
console.log('Endpoint:', `https://${options.hostname}${options.path}`);
console.log('Timestamp:', timestamp);
console.log('Headers:', options.headers);
console.log('Payload:', payload);
console.log('=======================================\n');

const req = https.request(options, (res) => {
    let data = '';

    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\nResponse Body:', data);

        try {
            const json = JSON.parse(data);
            if (res.statusCode === 200 && json.accessToken) {
                console.log('\n✅ SUCCESS! B2B Token obtained:');
                console.log('   Access Token:', json.accessToken.substring(0, 30) + '...');
                console.log('   Expires In:', json.expiresIn, 'seconds');
                console.log('   Token Type:', json.tokenType);
            } else {
                console.log('\n❌ FAILED: No access token received');
            }
        } catch (e) {
            console.log('\n❌ FAILED: Invalid JSON response');
        }
    });
});

req.on('error', (e) => {
    console.error('\n❌ ERROR:', e.message);
});

req.write(payload);
req.end();
