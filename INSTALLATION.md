# 🚀 Quick Start Guide - FloodSight Jakarta

## Langkah-Langkah Instalasi

### 1️⃣ Install Dependencies

Buka terminal di folder project ini dan jalankan:

```bash
npm install
```

Ini akan menginstall semua package yang dibutuhkan:
- next (14.0.4)
- react & react-dom (18.2.0)
- @react-google-maps/api (2.19.3)
- axios (1.6.2)
- lucide-react (0.294.0)
- tailwind-merge & clsx
- TypeScript & Tailwind CSS

### 2️⃣ Setup Google Maps API Key

**a. Dapatkan API Key:**

1. Kunjungi [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih yang sudah ada
3. Aktifkan API berikut:
   - **Maps JavaScript API** ✅
   - **Elevation API** ✅
4. Buat API Key di menu "Credentials"

**b. Buat File Environment:**

Copy file `.env.local.example` menjadi `.env.local`:

```bash
# Windows PowerShell
copy .env.local.example .env.local

# Windows CMD
copy .env.local.example .env.local

# macOS/Linux
cp .env.local.example .env.local
```

**c. Edit File `.env.local`:**

Buka file `.env.local` dan ganti dengan API key kamu:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...xxxxx
```

### 3️⃣ Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

## ✅ Checklist Persiapan

- [ ] Node.js 18+ terinstall
- [ ] Google Maps API Key sudah dibuat
- [ ] Maps JavaScript API aktif
- [ ] Elevation API aktif
- [ ] File `.env.local` sudah dibuat
- [ ] Dependencies sudah terinstall
- [ ] Development server berjalan

## 🎯 Cara Kerja Aplikasi

1. **Auto-Load Data**: Saat web dibuka, sistem otomatis mengambil:
   - Data ketinggian tanah (Google Elevation API)
   - Data curah hujan (Open-Meteo API)
   - Untuk 5 lokasi di Jakarta

2. **Kalkulasi Risiko**: Sistem menghitung tingkat bahaya berdasarkan:
   - Ketinggian tanah (elevation)
   - Intensitas hujan (rainfall)

3. **Visual Warning**: Marker berwarna di peta menunjukkan status:
   - 🟢 Hijau = SAFE (Aman)
   - 🟡 Kuning = MEDIUM RISK (Waspada)
   - 🟠 Orange = HIGH RISK (Siaga)
   - 🔴 Merah = EXTREME DANGER (Evakuasi)

4. **Evacuation Alert**: Jika ada status EXTREME DANGER, modal merah otomatis muncul.

## 🐛 Troubleshooting

### Problem: "Loading Maps..." stuck

**Solusi:**
- Cek API key di `.env.local` sudah benar
- Pastikan tidak ada spasi di awal/akhir API key
- Restart development server (`Ctrl+C` lalu `npm run dev` lagi)

### Problem: Map tidak muncul

**Solusi:**
- Buka browser console (F12)
- Lihat error message
- Pastikan Maps JavaScript API sudah enabled
- Cek billing account aktif di Google Cloud

### Problem: Elevation data error

**Solusi:**
- Pastikan Elevation API sudah enabled
- Cek quota usage di Google Cloud Console
- Untuk testing, aplikasi akan gunakan data random jika API gagal

### Problem: "npm install" error

**Solusi:**
```bash
# Hapus node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Install ulang
npm install
```

## 📦 Struktur File Penting

```
project/
├── .env.local              ← API KEY KAMU (JANGAN COMMIT!)
├── package.json            ← Daftar dependencies
├── app/
│   ├── page.tsx            ← Homepage (render Dashboard)
│   └── layout.tsx          ← Root layout
├── components/
│   └── Dashboard.tsx       ← KOMPONEN UTAMA (semua logic ada disini)
└── lib/
    └── utils.ts            ← Helper functions
```

## 🎨 Customize Lokasi

Edit file `components/Dashboard.tsx`, cari array `JAKARTA_LOCATIONS`:

```typescript
const JAKARTA_LOCATIONS: Location[] = [
  { name: 'Lokasi Kamu', lat: -6.xxxx, lng: 106.xxxx },
  // Tambah lokasi lain...
];
```

## 📊 Data Sources

- **Peta**: Google Maps Platform
- **Ketinggian**: Google Elevation API
- **Cuaca**: Open-Meteo API (gratis, tidak perlu API key)

## 🚀 Deploy ke Production

Untuk deploy ke Vercel/Netlify:

1. Push code ke GitHub
2. Connect repository di Vercel
3. Tambahkan Environment Variable:
   - Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: [Your API Key]
4. Deploy!

## 💡 Tips

- API Key sebaiknya pakai **Application Restrictions** di Google Cloud
- Set **API Restrictions** hanya untuk Maps & Elevation API
- Monitor usage di Google Cloud Console
- Free tier Google Maps: $200/month credit (cukup untuk development)

---

**Selamat Mencoba! 🎉**

Jika ada pertanyaan, cek error di browser console (F12) untuk detail error message.

