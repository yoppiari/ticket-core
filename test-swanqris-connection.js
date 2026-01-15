const https = require('https');

// Configuration from your request
const config = {
    hostname: 'simulator-madera.loketbayar.id',
    path: '/qris/v1.0/generate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Try Basic Auth
        'Authorization': 'Basic ' + Buffer.from('h2hqristukutix@swantech.id:HJKw87M@01').toString('base64')
    }
};

// Payload matching the structure in SwanQrisService.php
const payload = JSON.stringify({
    amount: "10000.00",
    partnerReferenceNo: "TEST-" + Date.now(),
    validTime: "900",
    merchantId: "936005032250000138",
    subMerchantId: "25062500000002",
    storeId: "ID2025414603006"
});

console.log("Testing SwanQRIS Connection (With Basic Auth)...");
console.log("Target: https://" + config.hostname + config.path);
console.log("Payload:", payload);

const req = https.request(config, (res) => {
    let data = '';

    console.log('Status Code:', res.statusCode);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Body:', data);

        try {
            const json = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log("\n✅ SUCCESS: Connection & Credentials are VALID!");
            } else {
                console.log("\n❌ FAILED: API rejected the request.");
            }
        } catch (e) {
            // 500 errors might be HTML
            console.log("\n❌ FAILED: Invalid JSON response.");
        }
    });
});

req.on('error', (e) => {
    console.error(`\n❌ ERROR: Connection failed: ${e.message}`);
});

req.write(payload);
req.end();
