# 🚨 LAPORAN BUG FINAL & AUDIT KREDENSIAL - INTEGRASI QRIS

**Tanggal Laporan:** 21 Januari 2026  
**Status Audit:** 🔴 CRITICAL (Action Required)  
**Target System:** `tukutix.com` (Production) & SwanQRIS API

---

## 📊 1. RINGKASAN HASIL TESTING

Kami telah melakukan 3 jenis pengujian mendalam:
1.  **Integration Test:** Test flow User Checkout → Payment (via Server).
2.  **Security Test:** Penetration test pada endpoint callback.
3.  **Direct Credential Test:** Validasi kredensial API langsung ke SwanQRIS (bypass server).

### A. Tabel Status Endpoint

| Endpoint Feature | Status | Keterangan Error |
|------------------|--------|-------------------|
| **Checkout Flow** | ✅ PASS | Order berhasil dibuat, Data User tersimpan. |
| **Payment (QR Generation)** | ❌ FAIL | Server Production return **Mock Data** (bukan SwanQRIS). |
| **B2B Token (Auth)** | ❌ FAIL | Endpoint `tukutix.com` memblokir request valid (401), tapi meloloskan request kosong (No-Auth). |
| **SwanQRIS Live (Madera)** | ⚠️ PARTIAL | URL Live (`madera`) valid/aktif, tapi butuh header Timestamp/Signature yang presisi. |

---

## 🔐 2. AUDIT KREDENSIAL & CONFIG SERVER

### Isu Konfigurasi Server (`tukutix.com`)
Server production saat ini dalam kondisi **MISKONFIGURASI FATAL**:

1.  **Driver Salah:** Server aktif menggunakan `PAYMENT_DRIVER=mock` (atau default), sehingga transaksi tidak pernah sampai ke SwanQRIS.
2.  **Firewall/WAF Issue:** Server menolak request HTTP yang mengandung header `X-AUTHORIZATION` atau `X-API-KEY` dengan status **401 Unauthorized**. Ini memblokir traffic legitimate dari/ke SwanQRIS.
3.  **Zero-Auth Vulnerability:** Sebaliknya, request ke `/api/b2b/token` **TANPA HEADER** malah diterima sukses (200 OK). Ini celah keamanan besar.

### Validasi URL SwanQRIS (`.env` Local Test)
Kami membandingkan dua base URL:

1.  **Simulator:** `https://simulator-madera.loketbayar.id/`
    - Status: ❌ Down / Error 500 saat ditest.
2.  **Production(?):** `https://madera.loketbayar.id/`
    - Status: ✅ Aktif/Hidup. Merespon dengan "Timestamp is required" (400).
    - **Kesimpulan:** URL `madera` adalah endpoint yang benar untuk production, namun membutuhkan implementasi header auth yang lengkap.

---

## � 3. DETAIL KREDENSIAL (AUDITED)

Kredensial berikut ditemukan dalam konfigurasi `.env` lokal dan digunakan dalam pengujian:

| Parameter | Value | Status Test |
|-----------|-------|-------------|
| **Base URL** | `https://madera.loketbayar.id/` | ✅ Active (HTTP 400) |
| **Merchant ID** | `936005032250000138` | ❓ Unverified (Auth Block) |
| **Sub Merchant** | `25062500000002` | ❓ Unverified |
| **Store ID** | `ID2025414603006` | ❓ Unverified |
| **API Key** | `a4...5a1f` | ❓ Unverified |
| **Email Login** | `h2hqristukutix@swantech.id` | ✅ Valid Format |

*> Catatan: Password `HJKw87M@01` digunakan untuk akses dashboard simulator.*

---

## 🔑 4. AKSES LOGIN WEB SYSTEM (PROJECT)

Berikut adalah akun testing default (Seeded) untuk login ke dalam aplikasi Tukutix:

| Role | Email | Password | Akses URL |
|------|-------|----------|-----------|
| **Event Owner** | `owner@example.com` | `password` | `/login` (Dashboard) |
| **Super Admin** | `superadmin@tukutix.com` | `password` | `/system/tenants` |
| **Scanner Staff** | `staff@example.com` | `password` | `/scanner/login` |
| **Affiliate** | `affiliate@example.com` | `password` | `/login` (Affiliate Tab) |
| **Public User** | `user@example.com` | `password` | `/login` |

---

## 🐛 5. DAFTAR BUG LOGIKA (CODEBASE)

Bug yang ditemukan dalam struktur kode (harus diperbaiki oleh developer):

| ID | Nama Bug | Dampak | Prioritas |
|----|----------|--------|-----------|
| **BUG-C2** | **Silent Error on Success** | Kode menganggap HTTP 200 sebagai sukses, padahal JSON body bisa berisi error code ('03'). Akibat: QR Code kosong ditampilkan ke user. | 🔥 Critical |
| **BUG-C3** | **Race Condition** | Notifikasi pembayaran diproses tidak dalam satu transaksi database atomik. Risiko: User bayar tapi tiket tidak terbit jika server crash. | 🔥 Critical |
| **BUG-H3** | **No Auth Code** | Kode `SwanQrisCallbackController` belum memiliki logika validasi signature. "TODO" comment ditemukan. | 🔴 High |
| **BUG-C4** | **Session Hijacking** | Checkout bisa diintip orang lain hanya dengan menebak Session ID. | 🔴 High |

---

## 🛠️ 4. REKOMENDASI PERBAIKAN (ACTION ITEMS)

### Langkah 1: Perbaikan Server (Ops/Infra)
- [ ] **Ubah Environment Variable:**
  ```env
  PAYMENT_DRIVER=swanqris
  SWANQRIS_BASE_URL=https://madera.loketbayar.id/
  SWANQRIS_MOCK_MODE=false
  ```
- [ ] **Fix Firewall/WAF:** Whitelist header `X-API-KEY`, `X-TIMESTAMP`, `X-AUTHORIZATION`.

### Langkah 2: Perbaikan Kode (Developer)
- [ ] Implementasi validasi HMAC Signature di `SwanQrisCallbackController`.
- [ ] Tambahkan pengecekan `responseCode === '00'` di `SwanQrisService`.
- [ ] Wrap logic `notify` dalam `DB::transaction`.

### Langkah 3: Validasi Ulang
- Jalankan `test-direct-swanqris.js` dengan kredensial production untuk memastikan koneksi hulu (upstream) aman.
- Jalankan `test-qris-integration.js` setelah server di-update.

---

**Tester:** Antigravity AI  
**Lampiran:** Script testing tersedia di repository (`test-*.js`).
