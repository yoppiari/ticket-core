# Panduan Mode Simulasi SwanQRIS

Karena kendala **Partner ID** yang belum valid, saya telah mengimplementasikan **Mode Simulasi (Mock Mode)** pada sistem. Ini memungkinkan Anda untuk melanjutkan pengembangan dan pengetesan fitur (seperti alur Checkout, Email Tiket, dll) tanpa terblokir oleh error otentikasi B2B.

## Fitur Mode Simulasi
1.  **Bypass Login:** Sistem tidak akan menghubungi server SwanQRIS asli untuk meminta token.
2.  **QR Code Dummy:** Sistem akan menghasilkan QR Code statis untuk keperluan testing tampilan frontend.
3.  **Simulasi Sukses:** Query status transaksi akan selalu mengembalikan "Sukses".

## Cara Mengaktifkan
Tambahkan variable berikut ke file `.env` Anda:

```env
SWANQRIS_MOCK_MODE=true
```

## Cara Kerja
Saat mode ini aktif:
- `SwanQrisService` akan melewati proses `Http::post` ke server luar.
- Log sistem akan mencatat `SwanQRIS: Mock Mode Enabled`.
- Anda bisa klik "Checkout" di frontend, dan alur akan berjalan mulus sampai halaman "Menunggu Pembayaran" dengan menampilkan QR dummy.

## Catatan Perbaikan Lainnya
Selain Mode Simulasi, saya juga telah memperbaiki bug teknis internal:
1.  **Keamanan Stok (Race Condition):** Memperbaiki celah dimana stok Addon tidak berkurang saat dibeli. Sekarang sudah aman dengan `lockForUpdate`.
2.  **Kinerja (N+1 Query):** Halaman detail pesanan sekarang meload data jauh lebih cepat karena query database disatukan.
3.  **Validasi Callback:** Endpoint notifikasi sekarang mematuhi standar respon `2005200`.

Silakan aktifkan Mock Mode di `.env` dan coba lakukan pembelian tiket.
