# 🚀 FAREL PAYMENT - QRIS Auto Payment System

FAREL PAYMENT adalah platform pembayaran digital modern yang dirancang untuk otomatisasi top-up saldo dan transaksi menggunakan QRIS. Terintegrasi langsung dengan gateway **FR3 NEWERA** untuk proses realtime dan instan.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rayyzneverlus/farelpayment)

## ✨ Fitur Utama

-   **QRIS Dinamis**: Generate QRIS unik untuk setiap transaksi untuk verifikasi otomatis.
-   **Admin Control Center**: Dashboard eksklusif untuk monitoring saldo dan riwayat transaksi.
-   **Realtime Polling**: Sistem pengecekan status otomatis yang akurat.
-   **Secure Login**: Sistem autentikasi admin yang aman melalui server-side verification.
-   **Modern UI**: Desain minimalis dan elegan menggunakan Tailwind CSS & Framer Motion.

## 🛠️ Teknologi yang Digunakan

-   **Frontend**: React.js, Vite, TypeScript
-   **Styling**: Tailwind CSS, Framer Motion
-   **Icons**: Lucide React
-   **Backend Proxy**: Express.js
-   **Integration**: FR3 NEWERA Digital Services API

## 🚀 Cara Setup (Self-Host)

1.  **Clone Repository**
    ```bash
    git clone https://github.com/rayyzneverlus/farelpayment.git
    cd farelpayment
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Buat file `.env` di root folder dan masukkan data berikut:
    ```env
    FR3_API_KEY=your_fr3_api_key_here
    ADMIN_USERNAME=Farel
    ADMIN_PASSWORD=MuhFarel05
    ```

4.  **Jalankan Aplikasi**
    ```bash
    npm run dev
    ```

## 🔒 Keamanan

-   **API Proxying**: Semua request ke FR3 NEWERA dilewatkan melalui server backend untuk menyembunyikan API Key dari client-side (browser).
-   **Hidden Credentials**: Username dan Password admin disimpan di environment variable, aman dari kebocoran saat source code dipublikasikan.

## 🌐 Deploy ke Vercel

Klik tombol di bawah ini untuk langsung melakukan clone dan deploy ke akun Vercel Anda secara otomatis:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rayyzneverlus/farelpayment)

---

Developed with ❤️ by **Muhammad Farel Alamsyah**
Powered by **FR3 NEWERA Digital Services**
