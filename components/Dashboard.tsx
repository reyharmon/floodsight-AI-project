'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import {
  AlertTriangle,
  Droplets,
  MapPin,
  Navigation,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Megaphone,
  Send,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

// ==================== TYPES ====================
interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface LocationData extends Location {
  elevation: number;
  rainfall: number;
  riskLevel: 'SAFE' | 'MEDIUM RISK' | 'HIGH RISK' | 'EXTREME DANGER';
  riskColor: string;
}

type RiskLevel = 'SAFE' | 'MEDIUM RISK' | 'HIGH RISK' | 'EXTREME DANGER';

// ✨ FITUR BARU: Interface untuk Posko Evakuasi
interface EvacuationPost {
  id: number;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  facilities: string[];
}

// ✨ FITUR BARU: Interface untuk Laporan Warga (Crowd-Sourced Data)
interface CitizenReport {
  id: string;
  lat: number;
  lng: number;
  waterLevel: string;
  description: string;
  timestamp: Date;
}

// ==================== CONSTANTS ====================
const JAKARTA_LOCATIONS: Location[] = [
  { name: 'Monas (Pusat Jakarta)', lat: -6.1754, lng: 106.8272 },
  { name: 'Kelapa Gading', lat: -6.1582, lng: 106.9008 },
  { name: 'Pluit', lat: -6.1165, lng: 106.7892 },
  { name: 'Kemang', lat: -6.2661, lng: 106.8169 },
  { name: 'Manggarai', lat: -6.2088, lng: 106.8503 },
];

// ✨ FITUR BARU: Data Posko Evakuasi Strategis di Jakarta
// Lokasi-lokasi ini dipilih karena berada di dataran tinggi dan memiliki fasilitas memadai
const EVACUATION_POSTS: EvacuationPost[] = [
  {
    id: 1,
    name: 'GOR Rawamangun',
    lat: -6.1894,
    lng: 106.8942,
    capacity: 500,
    facilities: ['Tempat Tidur Darurat', 'Dapur Umum', 'Posko Medis', 'Toilet'],
  },
  {
    id: 2,
    name: 'Gelora Bung Karno (GBK)',
    lat: -6.2182,
    lng: 106.8024,
    capacity: 1000,
    facilities: ['Tempat Tidur Darurat', 'Dapur Umum', 'Posko Medis', 'Ambulans'],
  },
  {
    id: 3,
    name: 'Balai Kota DKI Jakarta',
    lat: -6.1951,
    lng: 106.8229,
    capacity: 300,
    facilities: ['Ruang Tunggu', 'Dapur Umum', 'Posko Medis'],
  },
  {
    id: 4,
    name: 'Universitas Indonesia - Depok',
    lat: -6.3614,
    lng: 106.8245,
    capacity: 800,
    facilities: ['Asrama', 'Kantin', 'Rumah Sakit', 'Aula Besar'],
  },
];

const JAKARTA_CENTER: [number, number] = [-6.2088, 106.8456];

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100vh',
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * The Brain: Advanced Flood Risk Calculation
 */
function calculateRiskLevel(elevation: number, rainfall: number): {
  level: RiskLevel;
  color: string;
} {
  // EXTREME DANGER: Very low elevation + Heavy rainfall
  if (elevation < 3 && rainfall > 80) {
    return { level: 'EXTREME DANGER', color: '#dc2626' }; // Red 600
  }
  
  // HIGH RISK: Low elevation + Significant rainfall
  if (elevation < 5 && rainfall > 50) {
    return { level: 'HIGH RISK', color: '#f97316' }; // Orange 500
  }
  
  // MEDIUM RISK: Moderate rainfall
  if (rainfall > 20) {
    return { level: 'MEDIUM RISK', color: '#eab308' }; // Yellow 500
  }
  
  // SAFE: Normal conditions
  return { level: 'SAFE', color: '#22c55e' }; // Green 500
}

/**
 * ✨ ALGORITMA HAVERSINE FORMULA ✨
 * Menghitung jarak lengkung bumi (great-circle distance) antara dua titik koordinat.
 * 
 * CARA KERJA:
 * 1. Konversi derajat latitude/longitude menjadi radian
 * 2. Hitung perbedaan latitude dan longitude
 * 3. Gunakan formula Haversine untuk menghitung sudut pusat lingkaran bumi
 * 4. Kalikan dengan radius bumi (6371 km) untuk mendapat jarak dalam kilometer
 * 
 * KELEBIHAN vs Euclidean Distance:
 * - Haversine memperhitungkan kelengkungan bumi (akurat untuk jarak jauh)
 * - Euclidean hanya cocok untuk jarak sangat pendek atau permukaan datar
 * 
 * @param lat1 - Latitude titik awal (derajat)
 * @param lon1 - Longitude titik awal (derajat)
 * @param lat2 - Latitude titik tujuan (derajat)
 * @param lon2 - Longitude titik tujuan (derajat)
 * @returns Jarak dalam kilometer (km)
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Radius bumi dalam kilometer
  const R = 6371;

  // Konversi derajat ke radian
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Jarak dalam km
  return R * c;
}

/**
 * ✨ ALGORITMA NEAREST NEIGHBOR ✨
 * Mencari posko evakuasi terdekat dari lokasi banjir menggunakan pendekatan Greedy.
 * 
 * CARA KERJA:
 * 1. Iterasi semua posko evakuasi yang tersedia
 * 2. Hitung jarak dari lokasi banjir ke setiap posko menggunakan Haversine
 * 3. Bandingkan dan simpan posko dengan jarak minimum
 * 4. Kembalikan posko terdekat beserta jaraknya
 * 
 * KOMPLEKSITAS: O(n) - Linear time, dimana n = jumlah posko evakuasi
 * 
 * @param floodLat - Latitude lokasi banjir
 * @param floodLng - Longitude lokasi banjir
 * @returns Objek berisi posko terdekat dan jaraknya dalam km
 */
function findNearestEvacuationPost(
  floodLat: number,
  floodLng: number
): { post: EvacuationPost; distance: number } {
  let nearestPost = EVACUATION_POSTS[0];
  let minDistance = haversineDistance(
    floodLat,
    floodLng,
    nearestPost.lat,
    nearestPost.lng
  );

  // Iterasi untuk mencari jarak minimum (Algoritma Nearest Neighbor)
  for (let i = 1; i < EVACUATION_POSTS.length; i++) {
    const post = EVACUATION_POSTS[i];
    const distance = haversineDistance(floodLat, floodLng, post.lat, post.lng);

    if (distance < minDistance) {
      minDistance = distance;
      nearestPost = post;
    }
  }

  return { post: nearestPost, distance: minDistance };
}

/**
 * Fetch rainfall data from Open-Meteo API
 * Returns 24-hour accumulated precipitation for flood risk assessment
 */
async function fetchRainfallData(lat: number, lng: number): Promise<number> {
  try {
    // Fetch hourly data for the past 24 hours
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        hourly: 'precipitation',
        past_days: 1,
        forecast_days: 1,
        timezone: 'Asia/Jakarta',
      },
    });
    
    if (response.data.hourly && response.data.hourly.precipitation) {
      // Calculate 24-hour accumulated rainfall (sum of last 24 hours)
      const precipitationData = response.data.hourly.precipitation;
      const last24Hours = precipitationData.slice(-24);
      const totalRainfall = last24Hours.reduce((sum: number, val: number) => sum + (val || 0), 0);
      
      return totalRainfall;
    }
    
    return 0;
  } catch (error) {
    console.error('Error fetching rainfall data:', error);
    // Fallback: Return 0 to indicate no data (SAFE status)
    return 0;
  }
}

/**
 * Get elevation using FREE Open-Elevation API (no API key needed!)
 */
async function getElevation(lat: number, lng: number): Promise<number> {
  try {
    const response = await axios.get(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
    );
    if (response.data.results && response.data.results[0]) {
      return response.data.results[0].elevation;
    }
    throw new Error('No elevation data available');
  } catch (error) {
    console.error('Error fetching elevation:', error);
    // Fallback: Use Open-Meteo API which also has elevation data
    try {
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lng,
          elevation: true,
        },
      });
      return response.data.elevation || 8; // Default: Average Jakarta elevation
    } catch {
      // Final fallback: Average elevation for Jakarta area (8 meters above sea level)
      return 8;
    }
  }
}

// ==================== MAIN COMPONENT ====================
export default function Dashboard() {
  const [locationsData, setLocationsData] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEvacuationModal, setShowEvacuationModal] = useState(false);
  const [dangerLocation, setDangerLocation] = useState<LocationData | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // ✨ FITUR BARU: State untuk Evacuation Routing
  const [selectedLocationForRoute, setSelectedLocationForRoute] = useState<LocationData | null>(null);
  const [nearestPost, setNearestPost] = useState<{post: EvacuationPost; distance: number} | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  // ✨ FITUR BARU: State untuk Citizen Reports
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    waterLevel: '10-30cm',
    description: '',
    useCurrentLocation: true,
    customLat: JAKARTA_CENTER[0],
    customLng: JAKARTA_CENTER[1],
  });

  /**
   * Load all location data (elevation + rainfall)
   */
  const loadLocationData = useCallback(async () => {
    setLoading(true);
    const dataPromises = JAKARTA_LOCATIONS.map(async (location) => {
      try {
        // Fetch elevation and rainfall in parallel
        const [elevation, rainfall] = await Promise.all([
          getElevation(location.lat, location.lng),
          fetchRainfallData(location.lat, location.lng),
        ]);

        const { level, color } = calculateRiskLevel(elevation, rainfall);

        return {
          ...location,
          elevation,
          rainfall,
          riskLevel: level,
          riskColor: color,
        };
      } catch (error) {
        console.error(`Error loading data for ${location.name}:`, error);
        // Fallback: Use safe default values (assume no flood risk if API fails)
        const elevation = 8; // Average Jakarta elevation
        const rainfall = 0;  // No rainfall data = SAFE
        const { level, color } = calculateRiskLevel(elevation, rainfall);
        
        return {
          ...location,
          elevation,
          rainfall,
          riskLevel: level,
          riskColor: color,
        };
      }
    });

    const data = await Promise.all(dataPromises);
    
    // ✅ REAL-TIME DATA: Langsung gunakan data dari API
    setLocationsData(data);
    setLoading(false);

    // Check for extreme danger
    const extremeDangerLocation = data.find(
      (loc) => loc.riskLevel === 'EXTREME DANGER'
    );
    if (extremeDangerLocation) {
      setDangerLocation(extremeDangerLocation);
      setShowEvacuationModal(true);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    if (!mapLoaded) {
      setMapLoaded(true);
      loadLocationData();
    }
  }, [mapLoaded, loadLocationData]);

  /**
   * ✨ HANDLER: Menampilkan Rute Evakuasi ke Posko Terdekat
   * Menggunakan algoritma Nearest Neighbor untuk mencari posko optimal
   * + OSRM API untuk mendapatkan rute yang mengikuti jalan
   */
  const handleShowEvacuationRoute = async (location: LocationData) => {
    // Panggil algoritma Nearest Neighbor
    const result = findNearestEvacuationPost(location.lat, location.lng);
    
    setSelectedLocationForRoute(location);
    setNearestPost(result);
    
    // Loading toast
    const loadingToast = toast.loading('Menghitung rute terbaik...');
    
    try {
      // 🗺️ Fetch rute dari OSRM API (Open Source Routing Machine - GRATIS!)
      // OSRM menggunakan data OpenStreetMap untuk routing
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${result.post.lng},${result.post.lat}?overview=full&geometries=geojson`;
      
      const response = await axios.get(osrmUrl);
      
      if (response.data.routes && response.data.routes.length > 0) {
        // Ambil koordinat rute dari response (format: [lng, lat])
        const routeGeometry = response.data.routes[0].geometry.coordinates;
        
        // Convert dari [lng, lat] ke [lat, lng] untuk Leaflet
        const leafletCoords: [number, number][] = routeGeometry.map(
          (coord: number[]) => [coord[1], coord[0]]
        );
        
        setRouteCoordinates(leafletCoords);
        setShowRoute(true);
        
        // Hitung jarak dari OSRM (lebih akurat karena mengikuti jalan)
        const routeDistanceKm = response.data.routes[0].distance / 1000;
        const routeDuration = response.data.routes[0].duration / 60; // dalam menit
        
        // Dismiss loading & show success
        toast.dismiss(loadingToast);
        toast.success(
          `Rute ke ${result.post.name} ditemukan!`,
          {
            description: `Jarak: ${routeDistanceKm.toFixed(2)} km | Estimasi: ${Math.ceil(routeDuration)} menit`,
            duration: 5000,
          }
        );
      } else {
        // Fallback ke garis lurus jika OSRM gagal
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Error fetching route from OSRM:', error);
      
      // Fallback: Gunakan garis lurus
      setRouteCoordinates([
        [location.lat, location.lng],
        [result.post.lat, result.post.lng],
      ]);
      setShowRoute(true);
      
      toast.dismiss(loadingToast);
      toast.success(
        `Rute ke ${result.post.name} (jarak lurus: ${result.distance.toFixed(2)} km)`,
        {
          description: 'Menggunakan rute garis lurus. Ikuti jalan terdekat.',
          duration: 5000,
        }
      );
    }
  };

  /**
   * ✨ HANDLER: Submit Laporan Warga (Crowd-Sourced Data)
   * Menambahkan marker baru di peta dari data laporan masyarakat
   */
  const handleSubmitReport = () => {
    // Validasi form
    if (!reportForm.description.trim()) {
      toast.error('Mohon isi keterangan laporan!');
      return;
    }

    // Dapatkan koordinat
    let reportLat = reportForm.customLat;
    let reportLng = reportForm.customLng;

    if (reportForm.useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          reportLat = position.coords.latitude;
          reportLng = position.coords.longitude;
          
          submitReportData(reportLat, reportLng);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Tidak bisa mendapat lokasi. Menggunakan lokasi default.');
          submitReportData(reportLat, reportLng);
        }
      );
    } else {
      submitReportData(reportLat, reportLng);
    }
  };

  /**
   * Helper function untuk submit report data
   */
  const submitReportData = (lat: number, lng: number) => {
    const newReport: CitizenReport = {
      id: `report-${Date.now()}`,
      lat,
      lng,
      waterLevel: reportForm.waterLevel,
      description: reportForm.description,
      timestamp: new Date(),
    };

    // Tambahkan ke state
    setCitizenReports((prev) => [...prev, newReport]);

    // Notifikasi sukses dengan gaya yang menarik
    toast.success('✅ Laporan Terkirim!', {
      description: 'Data Anda membantu validasi prediksi AI kami. Terima kasih atas partisipasinya! 🙏',
      duration: 5000,
    });

    // Reset form dan tutup modal
    setReportForm({
      waterLevel: '10-30cm',
      description: '',
      useCurrentLocation: true,
      customLat: JAKARTA_CENTER[0],
      customLng: JAKARTA_CENTER[1],
    });
    setShowReportModal(false);
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'EXTREME DANGER':
        return <XCircle className="w-5 h-5" />;
      case 'HIGH RISK':
        return <AlertCircle className="w-5 h-5" />;
      case 'MEDIUM RISK':
        return <AlertTriangle className="w-5 h-5" />;
      case 'SAFE':
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* OpenStreetMap Background - 100% FREE! No API key needed! */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={JAKARTA_CENTER}
          zoom={11}
          style={MAP_CONTAINER_STYLE}
          zoomControl={false}
        >
        {/* Light theme tile layer from OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Zoom controls on the RIGHT side */}
        <ZoomControl position="topright" />
        
        {/* Markers for each location */}
        {locationsData.map((location, index) => (
          <CircleMarker
            key={index}
            center={[location.lat, location.lng]}
            radius={12}
            pathOptions={{
              fillColor: location.riskColor,
              fillOpacity: 0.9,
              color: '#ffffff',
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-slate-900">{location.name}</div>
                <div className="text-slate-700">{location.riskLevel}</div>
                <div className="text-xs text-slate-600 mt-1">
                  Elevation: {location.elevation.toFixed(1)}m<br/>
                  Rainfall: {location.rainfall.toFixed(1)}mm
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* ✨ FITUR BARU: Markers untuk Posko Evakuasi (Hijau) */}
        {EVACUATION_POSTS.map((post) => (
          <CircleMarker
            key={`evac-${post.id}`}
            center={[post.lat, post.lng]}
            radius={10}
            pathOptions={{
              fillColor: '#10b981', // Green 500
              fillOpacity: 0.8,
              color: '#ffffff',
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-slate-900">🏥 {post.name}</div>
                <div className="text-xs text-slate-600 mt-2">
                  <strong>Kapasitas:</strong> {post.capacity} orang<br/>
                  <strong>Fasilitas:</strong><br/>
                  {post.facilities.map((f, i) => (
                    <span key={i}>• {f}<br/></span>
                  ))}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* ✨ FITUR BARU: Markers untuk Laporan Warga (Ungu) */}
        {citizenReports.map((report) => (
          <CircleMarker
            key={report.id}
            center={[report.lat, report.lng]}
            radius={8}
            pathOptions={{
              fillColor: '#a855f7', // Purple 500
              fillOpacity: 0.9,
              color: '#ffffff',
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-slate-900">📢 Laporan Warga</div>
                <div className="text-xs text-slate-600 mt-2">
                  <strong>Tinggi Air:</strong> {report.waterLevel}<br/>
                  <strong>Keterangan:</strong> {report.description}<br/>
                  <strong>Waktu:</strong> {report.timestamp.toLocaleTimeString('id-ID')}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* ✨ FITUR BARU: Rute Evakuasi (Polyline Biru yang Mengikuti Jalan) */}
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#3b82f6', // Blue 500
              weight: 5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
      </MapContainer>
      </div>

      {/* Floating Sidebar - Glassmorphism */}
      <div className="absolute top-6 left-6 w-96 max-h-[90vh] overflow-y-auto z-[1000]">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">FloodSight</h1>
            </div>
            <p className="text-slate-300 text-sm">
              Jakarta Flood Early Warning System
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
                <span className="text-slate-300">Loading data...</span>
              </div>
            </div>
          )}

          {/* Location Status Cards */}
          {!loading && (
            <div className="space-y-3">
              {locationsData.map((location, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <h3 className="font-semibold text-white text-sm">
                        {location.name}
                      </h3>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: location.riskColor + '20', color: location.riskColor }}
                    >
                      {getRiskIcon(location.riskLevel)}
                      <span>{location.riskLevel}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-slate-400 text-xs mb-1">Elevation</div>
                      <div className="text-white font-semibold">
                        {location.elevation.toFixed(1)}m
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-slate-400 text-xs mb-1">Rainfall</div>
                      <div className="text-white font-semibold">
                        {location.rainfall.toFixed(1)}mm
                      </div>
                    </div>
                  </div>

                  {/* ✨ FITUR BARU: Tombol Rute Evakuasi (Hanya muncul jika HIGH RISK atau EXTREME DANGER) */}
                  {(location.riskLevel === 'HIGH RISK' || location.riskLevel === 'EXTREME DANGER') && (
                    <button
                      onClick={() => handleShowEvacuationRoute(location)}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Dapatkan Rute Evakuasi
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              Risk Level Legend
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { level: 'SAFE', color: '#22c55e', icon: CheckCircle },
                { level: 'MEDIUM RISK', color: '#eab308', icon: AlertTriangle },
                { level: 'HIGH RISK', color: '#f97316', icon: AlertCircle },
                { level: 'EXTREME DANGER', color: '#dc2626', icon: XCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.level} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="text-slate-300">{item.level}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Evacuation Modal - EXTREME DANGER */}
      {showEvacuationModal && dangerLocation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border-4 border-red-400 animate-pulse">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-white rounded-full p-4">
                  <AlertTriangle className="w-16 h-16 text-red-600" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                ⚠️ PERINGATAN EVAKUASI!
              </h2>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <p className="text-white text-lg font-semibold mb-2">
                  {dangerLocation.name}
                </p>
                <p className="text-white/90 text-sm">
                  Area Anda dalam bahaya banjir tinggi. Segera menuju titik kumpul terdekat.
                </p>
              </div>

              <div className="bg-white/10 rounded-lg p-3 mb-6 text-left">
                <div className="grid grid-cols-2 gap-2 text-sm text-white">
                  <div>
                    <span className="opacity-80">Ketinggian:</span>
                    <span className="font-bold ml-2">
                      {dangerLocation.elevation.toFixed(1)}m
                    </span>
                  </div>
                  <div>
                    <span className="opacity-80">Curah Hujan:</span>
                    <span className="font-bold ml-2">
                      {dangerLocation.rainfall.toFixed(1)}mm
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    handleShowEvacuationRoute(dangerLocation);
                    setShowEvacuationModal(false);
                  }}
                  className="w-full bg-white text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Lihat Rute Evakuasi
                </button>
                
                <button
                  onClick={() => setShowEvacuationModal(false)}
                  className="w-full bg-white/20 text-white font-semibold py-2 px-6 rounded-xl hover:bg-white/30 transition-colors"
                >
                  Tutup Peringatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✨ FITUR BARU: Floating Action Button (FAB) untuk Laporan Warga */}
      <button
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-8 right-8 z-[1000] bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center gap-2 group"
      >
        <Megaphone className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
          Laporkan Banjir
        </span>
      </button>

      {/* ✨ FITUR BARU: Modal Laporan Warga - Glassmorphism */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Laporan Warga</h2>
                  <p className="text-sm text-slate-400">Bantu validasi prediksi AI kami</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Lokasi */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  📍 Lokasi
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="useCurrentLocation"
                    checked={reportForm.useCurrentLocation}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, useCurrentLocation: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="useCurrentLocation" className="text-sm text-slate-300">
                    Gunakan lokasi saya saat ini
                  </label>
                </div>
                {!reportForm.useCurrentLocation && (
                  <p className="text-xs text-slate-400 mt-1">
                    Lokasi default: Jakarta Pusat (atau klik di peta)
                  </p>
                )}
              </div>

              {/* Tinggi Air */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  💧 Tinggi Air
                </label>
                <select
                  value={reportForm.waterLevel}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, waterLevel: e.target.value })
                  }
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="10-30cm">10-30cm (Rendah)</option>
                  <option value="30-50cm">30-50cm (Sedang)</option>
                  <option value="50-100cm">50-100cm (Tinggi)</option>
                  <option value=">100cm">&gt;100cm (Sangat Tinggi)</option>
                </select>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  📝 Keterangan
                </label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, description: e.target.value })
                  }
                  placeholder="Contoh: Banjir merendam jalan utama, arus cukup deras..."
                  rows={4}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                  💡 <strong>Human-in-the-loop:</strong> Laporan Anda akan menjadi data ground truth
                  untuk memvalidasi akurasi prediksi AI berdasarkan curah hujan & elevasi.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Kirim Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✨ Toast Notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}

