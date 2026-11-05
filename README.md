# 📅 JadwalKu - Aplikasi Skedul Harian & Smart Sync

Aplikasi skedul kegiatan harian modern, responsif (*mobile-first*), dilengkapi notifikasi pintar, audio synthesizer offline, enkripsi *end-to-end* (E2EE), catatan cepat, dan sinkronisasi lintas perangkat serta integrasi Google Calendar.

---

## ✨ Fitur Unggulan

- **Timeline Kegiatan Harian 24 Jam**: Visualisasi kegiatan per jam dengan jarum penunjuk waktu *real-time*, deteksi jadwal bentrok (*conflict indicator*), dan penyesuaian status selesai.
- **Synthesizer Audio Offline (Web Audio API)**:
  - 3 variasi melodi nada dering: **Melodi Lembut**, **Alarm Dinamis**, dan **Genta Klasik**.
  - **Opsi Mode Alarm**: Pilihan **Bunyi Sekali** atau **Berulang (Looping)** hingga dihentikan.
  - **Kontrol Volume Dering**: Slider volume dari 0% hingga 100% dengan preset cepat (*Bisu, Lembut, Keras, Maksimal*).
- **Pengingat Jam Mulai & Batas Jam Selesai**: Notifikasi otomatis saat kegiatan akan dimulai dan saat mendekati atau mencapai batas jam kerja usai (*deadline*).
- **Integrasi Google Calendar & Ekspor Universal (.ICS)**:
  - Sinkronisasi dua arah dengan akun Google Calendar.
  - Ekspor universal file kalender `.ics` untuk diimpor ke Apple Calendar, Outlook, atau Google Calendar.
- **Catatan Cepat (Quick Notes)**: Papan catatan memo untuk keperluan mendadak, dapat disematkan (*pin*), diberi warna, serta diubah menjadi jadwal kegiatan hanya dengan 1 klik.
- **100% Offline-First & Auto Sync**: Tetap berfungsi penuh tanpa koneksi internet dengan antrean sinkronisasi otomatis ketika koneksi kembali terhubung.
- **Enkripsi End-to-End (E2EE)**: Perlindungan privasi penuh dengan algoritma kriptografi militer **AES-256-GCM** dan derivasi kunci **PBKDF2** langsung di sisi browser.
- **Desain Mobile-First & Bebas Scroll Samping**: Navigasi responsif terkunci hanya pada scroll vertikal (atas-bawah) yang nyaman digunakan pada semua ukuran layar *smartphone*.
- **Mode Gelap & Terang**: Dukungan tema gelap (*dark mode*) dan terang (*light mode*) otomatis.

---

## 💰 100% Gratis & Bebas Biaya (Rp 0 - Zero Cost Forever)

Arsitektur aplikasi **JadwalKu** dirancang khusus agar **dapat dibangun, dijalankan, dan dideploy secara 100% GRATIS selamanya tanpa perlu kartu kredit atau biaya langganan**:

| Layanan / Komponen | Biaya | Solusi Gratis yang Digunakan |
| :--- | :---: | :--- |
| **Hosting & Domain Web** | **Rp 0** | **Vercel Hobby Plan** (Gratis selamanya, bandwidth 100 GB/bulan, gratis sertifikat HTTPS SSL). |
| **Penyimpanan Kode (Git)** | **Rp 0** | **GitHub** (Gratis repositori tak terbatas, baik public maupun private). |
| **Database & Penyimpanan Data** | **Rp 0** | **Browser LocalStorage + JSON Export** (Data tersimpan di perangkat lokal pengguna, tidak memerlukan sewa server database cloud berbayar). |
| **Nada Dering & Audio Alarm** | **Rp 0** | **Web Audio API Synthesizer** (Suara dering disintesis murni lewat matematika gelombang audio di browser pengguna tanpa biaya server/CDN audio). |
| **Keamanan & Privasi** | **Rp 0** | **Web Crypto API (AES-256-GCM + PBKDF2)** (Enkripsi end-to-end berjalan langsung di CPU pengguna tanpa langganan security suite). |
| **Kalender & Jadwal** | **Rp 0** | **Universal .ICS Export** (Bebas kuota, 100% offline) + **Google Cloud Free Tier** (1.000.000 kuota request kalender/hari). |
| **Sinkronisasi Antar-Perangkat** | **Rp 0** | **Kode Pasang Enkripsi & Backup JSON** (Transfer jadwal antar-hp/laptop tanpa perantara server berbayar). |

---

## 🚀 Panduan Menjalankan di Lokal (Local Development)

### 1. Clone Repositori
```bash
git clone https://github.com/username/jadwalku.git
cd jadwalku
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (Opsional)
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
*(Aplikasi tetap dapat berjalan 100% offline menggunakan penyimpanan lokal browser meskipun tanpa konfigurasi Firebase)*

### 4. Jalankan Dev Server
```bash
npm run dev
```
Buka browser pada alamat `http://localhost:3000`.

---

## 🌐 Panduan Deploy ke Vercel

Aplikasi ini sudah dilengkapi file konfigurasi `vercel.json` untuk menangani routing Single Page Application (SPA) dan *caching* aset secara optimal.

### Langkah 1: Push Proyek ke GitHub
1. Buat repositori baru di akun [GitHub](https://github.com/new).
2. Jalankan perintah git di terminal lokal Anda:
```bash
git init
git add .
git commit -m "feat: inisialisasi aplikasi JadwalKu"
git branch -M main
git remote add origin https://github.com/username/jadwalku.git
git push -u origin main
```

### Langkah 2: Deploy di Vercel
1. Buka dashboard [Vercel](https://vercel.com/) dan login.
2. Klik **"Add New..."** lalu pilih **"Project"**.
3. Hubungkan akun GitHub Anda dan pilih repositori `jadwalku`.
4. Vercel akan otomatis mendeteksi pengaturan Vite:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Opsional)* Pada bagian **Environment Variables**, Anda dapat menambahkan variabel jika ingin menghubungkan Google Calendar langsung dari Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Klik **"Deploy"**.
7. Dalam beberapa detik, aplikasi JadwalKu Anda sudah live dan siap digunakan!

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Audio Synthesizer**: Web Audio API (Offline, Zero MP3 downloads)
- **Kriptografi**: Web Crypto API (AES-256-GCM + PBKDF2)
- **Deployment**: Vercel Ready (`vercel.json`)

---

## 📄 Lisensi
Apache-2.0 License.
