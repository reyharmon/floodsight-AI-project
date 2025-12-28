# ✅ FloodSight Jakarta - Setup Checklist

Gunakan checklist ini untuk memastikan semua langkah setup sudah benar.

## 📋 Pre-Installation Checklist

- [ ] Node.js 18 atau lebih tinggi terinstall
- [ ] npm atau yarn terinstall
- [ ] Text editor (VS Code recommended) siap
- [ ] Browser modern (Chrome/Edge/Firefox) tersedia

## 🔑 Google Maps API Setup

### Step 1: Create Google Cloud Project
- [ ] Buka https://console.cloud.google.com/
- [ ] Klik "Select a project" → "New Project"
- [ ] Beri nama project (contoh: "FloodSight Jakarta")
- [ ] Klik "Create"

### Step 2: Enable Required APIs
- [ ] Di dashboard, klik "APIs & Services" → "Enable APIs and Services"
- [ ] Cari dan enable "Maps JavaScript API"
  - [ ] Klik "ENABLE"
  - [ ] Tunggu hingga aktif (warna hijau)
- [ ] Cari dan enable "Elevation API"
  - [ ] Klik "ENABLE"
  - [ ] Tunggu hingga aktif (warna hijau)

### Step 3: Create API Key
- [ ] Klik "Credentials" di sidebar
- [ ] Klik "Create Credentials" → "API Key"
- [ ] Copy API key yang muncul
- [ ] (Optional) Klik "Restrict Key" untuk security:
  - [ ] Application restrictions: HTTP referrers
  - [ ] Website restrictions: http://localhost:3000/*
  - [ ] API restrictions: Maps JavaScript API, Elevation API
  - [ ] Klik "Save"

### Step 4: Enable Billing (Optional tapi Recommended)
- [ ] Klik "Billing" di sidebar
- [ ] Tambahkan payment method
- [ ] Note: Google memberikan $200/bulan gratis credit

## 💻 Project Installation

### Step 1: Install Dependencies
```bash
cd path/to/project
npm install
```
- [ ] Command berhasil (no errors)
- [ ] Folder `node_modules` terbuat
- [ ] File `package-lock.json` terbuat

### Step 2: Setup Environment Variable
```bash
# Copy template
copy .env.local.example .env.local  # Windows
cp .env.local.example .env.local    # macOS/Linux
```
- [ ] File `.env.local` terbuat
- [ ] Edit file dan paste API key:
  ```
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...xxxxx
  ```
- [ ] Save file
- [ ] Pastikan tidak ada spasi di awal/akhir API key

### Step 3: Verify Project Structure
Pastikan struktur folder seperti ini:
```
project/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Dashboard.tsx
├── lib/
│   └── utils.ts
├── .env.local          ← PENTING! (jangan di-commit ke Git)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
- [ ] Semua folder ada
- [ ] File `.env.local` ada dan berisi API key

## 🚀 Running the App

### Step 1: Start Development Server
```bash
npm run dev
```
- [ ] Server starts successfully
- [ ] Terminal menampilkan: "Local: http://localhost:3000"
- [ ] No error messages di terminal

### Step 2: Open Browser
- [ ] Buka http://localhost:3000
- [ ] Tunggu 3-5 detik untuk loading

### Step 3: Check UI
- [ ] Google Maps muncul sebagai background
- [ ] Map terpusat di Jakarta
- [ ] Sidebar kiri muncul (glassmorphism effect)
- [ ] Ada 5 location cards
- [ ] Setiap card menampilkan:
  - [ ] Nama lokasi
  - [ ] Status risk level (colored badge)
  - [ ] Elevation (ketinggian tanah)
  - [ ] Rainfall (curah hujan)
- [ ] Legend di bawah menampilkan 4 risk levels

### Step 4: Check Functionality
- [ ] Markers muncul di peta (5 titik)
- [ ] Markers berwarna sesuai risk level:
  - [ ] 🟢 Green untuk SAFE
  - [ ] 🟡 Yellow untuk MEDIUM RISK
  - [ ] 🟠 Orange untuk HIGH RISK
  - [ ] 🔴 Red untuk EXTREME DANGER
- [ ] Hover marker menampilkan tooltip
- [ ] Map bisa di-zoom dan di-drag

### Step 5: Check Evacuation Modal (if applicable)
Jika ada lokasi dengan EXTREME DANGER:
- [ ] Modal merah muncul otomatis
- [ ] Menampilkan peringatan evakuasi
- [ ] Ada tombol "Lihat Rute Evakuasi"
- [ ] Ada tombol "Tutup Peringatan"
- [ ] Klik "Tutup" → Modal tertutup

## 🐛 Troubleshooting

### Problem: Map tidak muncul, stuck di "Loading Maps..."
**Diagnosa**:
- [ ] Buka browser console (F12)
- [ ] Lihat error messages

**Solusi**:
- [ ] Cek API key di `.env.local` benar
- [ ] Pastikan Maps JavaScript API enabled
- [ ] Restart dev server (Ctrl+C → npm run dev)
- [ ] Hard refresh browser (Ctrl+Shift+R)

### Problem: "Google Maps JavaScript API error: RefererNotAllowedMapError"
**Solusi**:
- [ ] Buka Google Cloud Console
- [ ] Edit API key restrictions
- [ ] Tambahkan `http://localhost:3000/*` ke HTTP referrers
- [ ] Save dan tunggu 5 menit

### Problem: "This page can't load Google Maps correctly"
**Solusi**:
- [ ] Cek billing account aktif di Google Cloud
- [ ] Atau, remove API restrictions temporarily untuk testing

### Problem: Elevation data tidak muncul
**Solusi**:
- [ ] Pastikan Elevation API enabled
- [ ] Cek quota usage di Google Cloud Console
- [ ] Aplikasi akan gunakan random data sebagai fallback

### Problem: npm install error
**Solusi**:
```bash
# Hapus folder dan install ulang
rm -rf node_modules package-lock.json  # macOS/Linux
rmdir /s node_modules                  # Windows CMD
del package-lock.json                  # Windows CMD

npm install
```

## ✨ Optimization Checklist (Optional)

### Performance
- [ ] Data loads in parallel (automatic)
- [ ] No console errors in browser
- [ ] Smooth animations
- [ ] Fast map loading

### Security
- [ ] `.env.local` in `.gitignore` (✓ sudah default)
- [ ] API key restricted (optional tapi recommended)
- [ ] No sensitive data in code

### Code Quality
- [ ] No linter errors (check dengan `npm run lint`)
- [ ] TypeScript types correct
- [ ] Code properly formatted

## 🎯 Final Verification

- [ ] App berjalan tanpa error
- [ ] Semua 5 lokasi Jakarta tampil
- [ ] Data elevation dan rainfall real-time
- [ ] Risk calculation bekerja dengan benar
- [ ] UI terlihat profesional dan smooth
- [ ] Modal evakuasi muncul jika ada EXTREME DANGER

## 📝 Notes

**Jika semua checklist ✓ hijau**, aplikasi sudah siap digunakan!

**Next Steps**:
1. Customize lokasi di `components/Dashboard.tsx`
2. Adjust risk thresholds sesuai kebutuhan
3. Deploy ke Vercel/Netlify untuk production

---

## 🆘 Need Help?

**Common Issues**:
1. API Key errors → Cek Google Cloud Console
2. Build errors → Check Node.js version (need 18+)
3. Map not loading → Hard refresh browser

**Check Files**:
- Browser Console (F12) → Lihat error messages
- Terminal → Lihat server logs
- `.env.local` → Pastikan API key benar (no spaces!)

**Quick Fix Commands**:
```bash
# Restart everything
npm run dev

# Clean install
rm -rf node_modules .next
npm install
npm run dev
```

---

**Status**: ✅ Setup Complete - Ready to Code!

Selamat! Aplikasi FloodSight Jakarta Anda sudah siap digunakan! 🎉

