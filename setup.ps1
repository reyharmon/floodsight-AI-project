# FloodSight Jakarta - Windows PowerShell Setup Script
# Jalankan script ini di PowerShell untuk setup cepat

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   FloodSight Jakarta - Setup Script       " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Node.js is installed
Write-Host "[1/4] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host ""
Write-Host "[2/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green

# Step 3: Setup environment file
Write-Host ""
Write-Host "[3/4] Setting up environment file..." -ForegroundColor Yellow
if (-Not (Test-Path ".env.local")) {
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "✓ Created .env.local file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env.local and add your Google Maps API Key!" -ForegroundColor Yellow
    Write-Host "   File location: .env.local" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

# Step 4: Final instructions
Write-Host ""
Write-Host "[4/4] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Next Steps:                              " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit .env.local and add your Google Maps API Key" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Get your API key at:" -ForegroundColor White
Write-Host "   https://console.cloud.google.com/" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Enable these APIs:" -ForegroundColor White
Write-Host "   - Maps JavaScript API ✓" -ForegroundColor Gray
Write-Host "   - Elevation API ✓" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Run the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

