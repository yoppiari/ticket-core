# 🎫 TUKUTIX - Platform Tiket Event

## 📋 OVERVIEW PROJECT

**Tukutix** adalah platform ticketing untuk event/acara dengan fitur:
- Multi-tenant (banyak organizer bisa bikin event masing-masing)
- Sistem pembayaran QRIS (menggunakan SwanQRIS gateway)
- Generate & kirim tiket otomatis setelah pembayaran
- Waiting room untuk event high-demand
- Sistem affiliate marketing
- Dashboard admin untuk organizer

---

## 🏗️ ARSITEKTUR PROJECT

### **Technology Stack:**
```
Frontend: Next.js (TypeScript, React)
Backend: Laravel (PHP) 
Database: PostgreSQL
Payment Gateway: SwanQRIS (QRIS)
```

### **Struktur Folder:**
```
ticket-core/
├── apps/
│   ├── backend/          # Laravel API
│   │   ├── app/
│   │   │   ├── Http/Controllers/
│   │   │   ├── Models/
│   │   │   └── Services/
│   │   ├── config/
│   │   ├── database/
│   │   └── routes/
│   └── frontend/         # Next.js UI
│       └── src/
│           └── app/
└── test-*.js            # Test scripts
```

---

## 🔄 COMPLETE USER FLOW

### **1. PUBLIC USER - BELI TIKET**

```
┌─────────────────────────────────────────────────────────────────┐
│  langkah 1: Browse Event                                         │
│  URL: https://tukutix.com/{slug}/e/{eventSlug}                  │
│  Contoh: https://tukutix.com/demo/e/demo-event                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Langkah 2: Pilih Tiket & Isi Data Pembeli                      │
│  Component: TicketSelection.tsx                                  │
│  - Pilih jenis tiket (VIP, Regular, dll)                        │
│  - Pilih jumlah tiket                                            │
│  - Isi form: Nama, WhatsApp, Email                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Langkah 3: Submit & Create Order                               │
│  POST /api/public/events/{eventSlug}/checkout                   │
│  Controller: CheckoutController@store                            │
│  - Buat Order dengan status "pending"                            │
│  - Generate order_number                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Langkah 4: Inisiasi Pembayaran QRIS                            │
│  POST /api/public/events/{eventSlug}/checkout/{orderId}/pay     │
│  Controller: PaymentController@pay                               │
│  Service: PaymentService->initiatePayment()                      │
│                                                                   │
│  BACKEND PROCESS:                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. PaymentService->initiatePayment($order)               │  │
│  │    ↓                                                      │  │
│  │ 2. SwanQrisGateway->createInvoice($order)                │  │
│  │    ↓                                                      │  │
│  │ 3. SwanQrisService->getAccessToken()                     │  │
│  │    - Generate B2B token dengan signature                 │  │
│  │    - Cache token 55 menit                                 │  │
│  │    ↓                                                      │  │
│  │ 4. SwanQrisService->generateQr(...)                      │  │
│  │    - POST ke SwanQRIS API                                 │  │
│  │    - Dapat QR Code string                                 │  │
│  │    ↓                                                      │  │
│  │ 5. Return data ke Frontend:                              │  │
│  │    {                                                      │  │
│  │      qr_string: "00020101021...",                        │  │
│  │      redirect_url: null,                                  │  │
│  │      amount: 2500000                                      │  │
│  │    }                                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Langkah 5: Tampilkan QR Code                                   │
│  Frontend menampilkan QR Code dari qr_string                    │
│  Customer scan QR pakai apps bank/e-wallet                     │
└───────────────────────────────────────────────────────────────── ┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Langkah 6: Customer Bayar via Mobile Banking / E-Wallet        │
│  Customer scan QR dan confirm pembayaran di apps mereka         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Langkah 7: SwanQRIS Kirim Callback/Webhook                     │
│  SwanQRIS server otomatis kirim notifikasi ke:                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ STEP 1: Get Token dari Tukutix                            ││
│  │ POST https://tukutix.com/api/b2b/token                     ││
│  │ Controller: SwanQrisCallbackController@getToken            ││
│  │ Response: { accessToken: "...", expiredAt: "..." }        ││
│  └────────────────────────────────────────────────────────────┘│
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ STEP 2: Kirim Notify dengan Token                         ││
│  │ POST https://tukutix.com/api/qris/notify                   ││
│  │ Headers: Authorization: Bearer {accessToken}               ││
│  │ Controller: SwanQrisCallbackController@notify              ││
│  │                                                             ││
│  │ Body:                                                       ││
│  │ {                                                           ││
│  │   "originalPartnerReferenceNo": "ORD-123...",            ││
│  │   "latestTransactionStatus": "00",  // 00 = Success       ││
│  │   "amount": { "value": "2500000.00", "currency": "IDR" } ││
│  │ }                                                           ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Langkah 8: Process Pembayaran Success                          │
│  SwanQrisCallbackController@notify:                             │
│                                                                   │
│  1. Find order by order_number                                  │
│  2. Update order status = 'paid'                                │
│  3. RevenueService->processRevenueShare($order)                 │
│     - Hitung profit untuk tenant, affiliate, platform          │
│  4. TicketService->generateTickets($order)                      │
│     - Generate QR code untuk tiket                              │
│     - Simpan ke database                                         │
│  5. NotificationService->sendTickets($order)                    │
│     - Kirim email dengan attachment tiket PDF                   │
│     - (atau kirim via WhatsApp)                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Langkah 9: Customer Terima Tiket                               │
│  - Email diterima dengan PDF tiket                              │
│  - QR code di tiket untuk scan saat masuk event                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 SWANQRIS INTEGRATION - DETAIL TEKNIS

### **Authentication Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Get B2B Access Token (Cache 55 menit)                  │
├─────────────────────────────────────────────────────────────────┤
│  Endpoint: POST /qris/token/b2b                                  │
│  Base URL: https://simulator-madera.loketbayar.id/             │
│                                                                   │
│  Headers:                                                         │
│  - X-TIMESTAMP: 2026-01-15T10:30:00+07:00                       │
│  - X-API-KEY: a4f9c2e1q7m2x9p4bc8t34e7m2c9p5a1f                │
│  - X-KODE-LOKET: IDM2026011312544233P11                         │
│  - X-DEVICE-ID: TUKUTIX-SERVER-001                              │
│  - X-EXTERNAL-ID: TOKEN-{timestamp}                             │
│  - X-AUTHORIZATION: Bearer {base64_signature}                   │
│                                                                   │
│  Signature Algorithm:                                            │
│  stringToSign = KODE_LOKET + TIMESTAMP                          │
│  signature = HMACSHA256(stringToSign, CLIENT_SECRET)            │
│  base64Signature = base64_encode(signature)                     │
│                                                                   │
│  Body:                                                            │
│  {                                                                │
│    "grantType": "client_credentials",                           │
│    "partnerId": "???"  // ⚠️ MASIH ERROR - perlu dicari        │
│  }                                                                │
│                                                                   │
│  Response:                                                        │
│  {                                                                │
│    "accessToken": "mboLhoCwtGxjFdp...",                         │
│    "expiresIn": 3600,                                            │
│    "tokenType": "Bearer"                                         │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Generate QR Code (Pakai Access Token)                  │
├─────────────────────────────────────────────────────────────────┤
│  Endpoint: POST /qris/v1.0/generate                              │
│                                                                   │
│  Headers:                                                         │
│  - Authorization: Bearer {accessToken}                           │
│  - X-TIMESTAMP: 2026-01-15T10:35:00+07:00                       │
│  - X-SIGNATURE: {transaction_signature}                         │
│  - X-PARTNER-ID: 25062500000002                                  │
│  - X-EXTERNAL-ID: ORD-{order_number}                            │
│                                                                   │
│  Transaction Signature:                                          │
│  stringToSign = POST:|/qris/v1.0/generate|{accessToken}|        │
│                 {SHA256(requestBody)}|{timestamp}               │
│  signature = HMACSHA256(stringToSign, CLIENT_SECRET)            │
│                                                                   │
│  Body:                                                            │
│  {                                                                │
│    "amount": "2500000.00",                                       │
│    "partnerReferenceNo": "ORD-123456",                          │
│    "validTime": "900",  // 15 menit                              │
│    "merchantId": "936005032250000138",                           │
│    "subMerchantId": "25062500000002",                           │
│    "storeId": "ID2025414603006"                                  │
│  }                                                                │
│                                                                   │
│  Response:                                                        │
│  {                                                                │
│    "qrContent": "00020101021...",  // QR string                 │
│    "responseCode": "00"                                          │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ PROGRESS SAAT INI

### ✅ **SUDAH SELESAI:**
1. ✅ Backend structure (Laravel)
2. ✅ Database models & migrations
3. ✅ Payment gateway interface
4. ✅ SwanQRIS service basic structure
5. ✅ Callback controller
6. ✅ API routes
7. ✅ Credentials dari simulator (.env updated)

### ⚠️ **SEDANG DIKERJAKAN:**
1. ⚠️ B2B Token Authentication
   - Issue: "partnerId tidak valid"
   - Perlu cari tahu Partner ID yang benar

### ❌ **BELUM DIKERJAKAN:**
1. ❌ Fix Partner ID untuk B2B token
2. ❌ Test full flow Generate QR
3. ❌ Update SwanQrisService dengan headers yang benar
4. ❌ Test webhook/callback
5. ❌ Frontend integration (tampilkan QR di UI)
6. ❌ Test end-to-end flow

---

## 📁 FILE-FILE PENTING

### **Backend (Laravel):**
```
apps/backend/
├── .env                                    # ✅ Credentials SwanQRIS
├── config/services.php                     # ✅ Config SwanQRIS
├── app/Services/Gateways/
│   ├── SwanQrisService.php                # ⚠️ Core API integration
│   └── SwanQrisGateway.php                # ✅ Gateway adapter
├── app/Http/Controllers/
│   ├── SwanQrisCallbackController.php     # ✅ Handle webhook
│   ├── PaymentController.php              # ✅ Initiate payment
│   └── CheckoutController.php             # ✅ Create order
└── routes/api.php                          # ✅ API routes
```

### **Frontend (Next.js):**
```
apps/frontend/src/app/
└── [slug]/e/[eventSlug]/
    └── TicketSelection.tsx                 # ❌ Perlu update
```

### **Test Scripts:**
```
test-swanqris-connection.js                 # ❌ Old test (failed)
test-swanqris-b2b-token.js                  # ⚠️ Testing now (403 error)
```

---

## 🎯 NEXT STEPS - ROADMAP

### **Immediate (Hari Ini):**
1. 🔍 **Find correct Partner ID**
   - Check SwanQRIS simulator dashboard
   - Atau hubungi support SwanQRIS
   
2. ✅ **Get B2B token working**
   - Fix Partner ID issue
   - Verify token response
   
3. 🧪 **Test Generate QR**
   - Update Service dengan headers yang benar
   - Test create QR code
   
4. 🔗 **Test full payment flow**
   - Create test order
   - Generate QR
   - Scan & bayar (simulator)  
   - Verify callback

### **Short Term (Minggu Ini):**
5. 🎨 **Frontend integration**
   - Update TicketSelection component
   - Display QR code
   - Handle payment status

6. ✉️ **Email/Ticket delivery**
   - Generate ticket PDF
   - Send via email
   
7. 📱 **WhatsApp integration** (optional)
   - Send tiket via WA

### **Testing & Deployment:**
8. 🧪 **E2E Testing**
9. 🚀 **Deploy to production**
10. 🔄 **Switch to production SwanQRIS**

---

## 🆘 ISSUE SAAT INI

**Error:** `partnerId tidak valid` (403)

**Kemungkinan Solusi:**
1. Partner ID bukan `IDM2026011312544233P11`
2. Mungkin Partner ID sama dengan `subMerchantId` = `25062500000002`
3. Atau bisa jadi tidak perlu `partnerId` di request body

**Next Action:**
- Check dokumentasi SwanQRIS lagi
- Atau login ke simulator dan cari Partner ID yang benar

---

Apakah sudah jelas flow-nya? Mau saya lanjutkan debug Partner ID issue-nya?
