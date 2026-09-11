# 🌊 FloodSight Jakarta

**AI-Powered Flood Early Warning System for Jakarta**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Overview

FloodSight adalah sistem peringatan dini banjir berbasis AI untuk Jakarta yang menggunakan **Model-Based Reflex Agent** dengan data real-time dari cuaca dan topografi. Sistem ini dilengkapi Smart Routing menggunakan algoritma Nearest Neighbor dan Citizen Science untuk validasi data.

### ✨ Key Features

- 🌧️ **Real-time Flood Prediction** - Rule-based AI menggunakan data elevasi dan curah hujan
- 🗺️ **Interactive Map** - Visualisasi 5 lokasi monitoring Jakarta dengan OpenStreetMap
- 🚨 **Smart Evacuation Routing** - Algoritma Nearest Neighbor + OSRM untuk rute terdekat
- 👥 **Citizen Reporting** - Crowdsourced data untuk validasi prediksi AI
- 💰 **100% Free** - Semua API gratis, $0/month operational cost

---

## 🎯 Demo

![FloodSight Dashboard](screenshot.png)

**Live Demo:** *Coming Soon*

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **Mapping** | Leaflet, OpenStreetMap |
| **API Integration** | Axios, 4 Free APIs |
| **Notifications** | Sonner Toast |
| **Icons** | Lucide React |

---

## 🧠 AI & Algorithms

### 1. Model-Based Reflex Agent

```typescript
function calculateRiskLevel(elevation: number, rainfall: number) {
  if (elevation < 3 && rainfall > 80) return 'EXTREME DANGER';
  if (elevation < 5 && rainfall > 50) return 'HIGH RISK';
  if (rainfall > 20) return 'MEDIUM RISK';
  return 'SAFE';
}
```

- **Type:** Rule-Based Expert System
- **Complexity:** O(1) - Constant time
- **Input:** Elevation (meters) + Rainfall (mm/24h)
- **Output:** 4-level risk classification

### 2. Haversine Formula

```typescript
distance = 2R × arcsin(√[sin²((φ₂-φ₁)/2) + cos(φ₁)cos(φ₂)sin²((λ₂-λ₁)/2)])
```

- **Purpose:** Calculate great-circle distance
- **Accuracy:** ±0.5% for distances <500 km
- **Use Case:** Find nearest evacuation post

### 3. Nearest Neighbor Algorithm

```typescript
function findNearestEvacuationPost(lat, lng) {
  // O(n) linear search for minimum distance
  return nearestPost;
}
```

- **Complexity:** O(n) where n = 4 evacuation posts
- **Execution:** <1ms

---

## 🌐 API Integration

| API | Purpose | Cost | Update Frequency |
|-----|---------|------|------------------|
| [Open-Meteo](https://open-meteo.com/) | Rainfall data | FREE | Hourly |
| [Open-Elevation](https://open-elevation.com/) | Topography | FREE | Static (SRTM) |
| [OSRM](http://project-osrm.org/) | Road routing | FREE | Real-time |
| [OpenStreetMap](https://www.openstreetmap.org/) | Base map | FREE | Community-updated |

**Total Cost: $0/month** 💰

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn

### Installation

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/floodsight-jakarta.git
cd floodsight-jakarta

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open browser
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
floodsight-jakarta/
├── app/
│   ├── page.tsx          # Entry point
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   └── Dashboard.tsx     # Main component (1,009 lines)
├── lib/
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── package.json          # Dependencies
└── README.md            # This file
```

---

## 🎓 How It Works

### 1. Data Collection

```
Jakarta Locations (5 points)
    ↓
[API] Open-Elevation → Elevation data
    ↓
[API] Open-Meteo → 24h rainfall accumulation
    ↓
```

### 2. Risk Calculation

```
[AI] Rule-Based System
    ↓
IF elevation < 3m AND rainfall > 80mm → EXTREME DANGER
ELSE IF elevation < 5m AND rainfall > 50mm → HIGH RISK
ELSE IF rainfall > 20mm → MEDIUM RISK
ELSE → SAFE
```

### 3. Visualization

```
Display on map with color-coded markers:
🔴 Red = EXTREME DANGER
🟠 Orange = HIGH RISK
🟡 Yellow = MEDIUM RISK
🟢 Green = SAFE
```

### 4. Evacuation Routing

```
User clicks "Get Evacuation Route"
    ↓
[Algorithm] Nearest Neighbor → Find closest post
    ↓
[API] OSRM → Calculate road route
    ↓
Display blue line on map + travel time
```

---

## 📊 Performance

- **Initial Load:** <2 seconds
- **API Calls:** ~500ms (parallel)
- **Prediction:** <1ms (O(1))
- **Routing:** ~300ms
- **Total Time-to-Interactive:** <3.5 seconds

---

## 🎯 Key Features Detail

### 🌧️ Real-Time Flood Prediction

- 5 monitoring locations in Jakarta
- 24-hour rainfall accumulation
- SRTM elevation data from NASA
- Auto-update risk levels

### 🗺️ Interactive Map

- OpenStreetMap basemap (free!)
- Color-coded risk markers
- Popup info for each location
- Zoom & pan controls

### 🚨 Smart Evacuation Routing

- 4 strategic evacuation posts:
  - GOR Rawamangun (500 capacity)
  - Gelora Bung Karno (1,000 capacity)
  - Balai Kota DKI (300 capacity)
  - Universitas Indonesia (800 capacity)
- Nearest Neighbor algorithm
- Real road directions (not straight line!)
- Distance & time estimation

### 👥 Citizen Reporting

- Crowdsourced flood reports
- Photo upload capability
- Purple markers on map
- Human-in-the-loop validation
- Ground truth data for AI

---

## 🔮 Roadmap

### Phase 1 (Current) ✅
- [x] Real-time prediction
- [x] Interactive map
- [x] Evacuation routing
- [x] Citizen reporting

### Phase 2 (Q1 2025)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Historical data analysis
- [ ] Auto-refresh every hour

### Phase 3 (Q2 2025)
- [ ] Machine Learning integration (LSTM)
- [ ] Image recognition for reports
- [ ] Integration with BMKG data
- [ ] SMS alerts

### Phase 4 (Future)
- [ ] Expand to other cities
- [ ] Government partnership (BPBD)
- [ ] Real-time sensor integration
- [ ] Predictive analytics

---