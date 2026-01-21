# 🚨 LAPORAN BUG KRITIS & HASIL PENETRATION TESS - SISTEM QRIS TUKUTIX

**Tanggal:** 21 Januari 2026  
**Status Audit:** 🔴 HIGH RISK (Critical Security Flaws Found)  
**Tester:** Antigravity AI

---

## 📊 RINGKASAN EKSEKUTIF

Hasil pengujian otomatis dan manual terhadap integrasi SwanQRIS di `tukutix.com` menemukan **3 Isu Kritis** yang membuat sistem pembayaran ini **TIDAK AMAN** dan **TIDAK BERFUNGSI** di Production.

1.  🔓 **Security Vulnerability:** Endpoint token terbuka bebas (Public Access).
2.  ⚙️ **Misconfiguration:** Server masih menggunakan Mock Gateway, bukan Real QRIS.
3.  🚧 **Infrastructure Block:** Request valid dengan header auth malah diblokir (401).

---

## 🔍 DETAIL TEMUAN BUG

### 1. 🔓 [CRITICAL] B2B Token Endpoint No Authentication (Zero Auth)

**Deskripsi:**
Endpoint `/api/b2b/token` yang seharusnya dilindungi dengan Signature Validation (HMAC-SHA256) ternyata **BISA DIAKSES TANPA HEADER APAPUN**.

**Bukti (Proof of Concept):**
Request sederhana tanpa credential berhasil mendapatkan Access Token valid:

```bash
# Request (Tanpa Header Auth)
curl -X POST https://tukutix.com/api/b2b/token \
  -H "Content-Type: application/json" \
  -d '{"grantType":"client_credentials"}'

# Response (200 OK) 😱
{
  "accessToken": "Ku94ZCCG7oMIWQH27csp3aXtq4gbmzLfHT...",
  "expiredAt": "2026-01-21T10:20:00+07:00"
}
```

**Dampak Bisnis:**
- Attacker bisa men-generate ribuan token.
- Attacker bisa menggunakan token ini untuk mengirim **FAKE NOTIFICATION** ke endpoint callback (`/qris/notify`).
- **Fraud Risk:** Attacker bisa membuat transaksi "PAID" palsu dan mendapatkan tiket gratis tanpa membayar sepeserpun.

**Rekomendasi Perbaikan:**
- Implementasi validasi header `X-SIGNATURE` dan `X-API-KEY` di `SwanQrisCallbackController`.
- Tolak semua request yang tidak memiliki signature valid.

---

### 2. ⚙️ [MAJOR] Server Production Menggunakan Mock Gateway

**Deskripsi:**
Saat user mencoba melakukan pembayaran, server tidak menghubungi SwanQRIS, melainkan mengembalikan response dari **Mock/Dummy Gateway**.

**Bukti (Response Payment API):**
```json
{
  "redirect_url": "/mock-payment-gateway?order_id=...",
  "transaction_id": "mock_OB7KXgZOj0NM",
  "status": "pending"
}
```
*Note: Prefix "mock_" dan URL "/mock-payment-gateway" menunjukkan driver yang salah.*

**Akar Masalah:**
Variabel Environment di server production salah konfigurasi:
- **Tertulis:** `PAYMENT_DRIVER` (kosong atau default)
- **Seharusnya:** `PAYMENT_DRIVER=swanqris`

**Dampak Bisnis:**
- Integrasi QRIS tidak akan jalan sama sekali.
- User tidak akan melihat QR Code.
- Uang tidak akan masuk ke rekening SwanQRIS.

**Rekomendasi Perbaikan:**
- Edit file `.env` di server.
- Set `PAYMENT_DRIVER=swanqris`.
- Run `php artisan config:clear`.

---

### 3. 🚧 [HIGH] Valid Headers Ditolak (False Positive Block)

**Deskripsi:**
Anehnya, ketika kita mencoba mengirim request "Sopan" (sesuai dokumentasi) dengan Header lengkap, server malah menolak dengan **401 Unauthorized**.

**Bukti:**
```bash
# Request dengan Header Lengkap (Valid Signature)
curl -X POST https://tukutix.com/api/b2b/token \
  -H "X-API-KEY: a4f9..." \
  -H "X-AUTHORIZATION: Bearer [ValidSig]" \
  ...

# Response (401 Unauthorized) ❌
{ "message": "Unauthorized" }
```

**Analisa:**
- Kemungkinan ada Firewall (WAF) atau Middleware Server yang memblokir header `X-AUTHORIZATION` atau menganggap payload tersebut mencurigakan.
- Atau, code validasi signature di controller "setengah jadi" (ada validasi tapi salah logic), sehingga request valid malah ditolak.

**Dampak Bisnis:**
- Jika SwanQRIS nanti mencoba connect dari server mereka (yang pasti pakai header lengkap), mereka akan ditolak.
- Integrasi gagal (Time Out).

---

## 📋 DAFTAR BUG LOGIC (CODE REVIEW)

Selain temuan faktual di atas, berikut bug logika di dalam kode (hasil code review sebelumnya):

| ID | Bug | Severity | File | Status |
|----|-----|----------|------|--------|
| **BUG-C3** | **Race Condition:** Transaksi database tidak mencakup generate ticket. Jika server crash, tiket hilang. | 🔥 CRITICAL | `SwanQrisCallbackController` | Open |
| **BUG-C2** | **No Response Validation:** Tidak mengecek `responseCode` '00' dari SwanQRIS. Error dianggap sukses. | 🔥 CRITICAL | `SwanQrisService` | Open |
| **BUG-H1** | **Overwrite Status:** Notifikasi 'Failed' bisa menimpa status 'Paid' jika ada retry network. | 🔴 HIGH | `SwanQrisCallbackController` | Open |
| **BUG-C4** | **Session Hijacking:** Orang lain bisa intip order unpaid dengan menebak Session ID. | 🔴 HIGH | `CheckoutController` | Open |

---

## 🛠️ ACTION PLAN (LANGKAH PERBAIKAN)

Berikut urutan perbaikan yang disarankan untuk tim developer:

1.  **Environment Config Fix (Priority 1):**
    - Ubah `.env` server: `PAYMENT_DRIVER=swanqris`
    - Pastikan PHP Extension `curl` dan `json` aktif.

2.  **Security Hotfix (Priority 1):**
    - Implementasi validasi HMAC Signature di `SwanQrisCallbackController::getToken`.
    - Tambahkan unit test untuk memastikan request valid DITERIMA (fix isu 401).

3.  **Critical Logic Fix (Priority 2):**
    - Wrap `notify` logic dalam satu Database Transaction utuh.
    - Tambahkan validasi `responseCode` di `SwanQrisService`.

4.  **Testing Ulang:**
    - Deployment ulang.
    - Jalankan `test-qris-integration.js` lagi.

---

**Lampiran:** Script testing `test-qris-security.js` tersedia di repositori untuk verifikasi ulang setelah perbaikan.
