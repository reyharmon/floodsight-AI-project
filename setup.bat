@echo off
REM FloodSight Jakarta - Windows Batch Setup Script
REM Jalankan script ini di Command Prompt untuk setup cepat

echo ============================================
echo    FloodSight Jakarta - Setup Script
echo ============================================
echo.

REM Step 1: Check if Node.js is installed
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Node.js not found! Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)
echo √ Node.js installed
echo.

REM Step 2: Install dependencies
echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo X Failed to install dependencies!
    exit /b 1
)
echo √ Dependencies installed successfully!
echo.

REM Step 3: Setup environment file
echo [3/4] Setting up environment file...
if not exist ".env.local" (
    copy ".env.local.example" ".env.local" >nul
    echo √ Created .env.local file
    echo.
    echo ! IMPORTANT: Edit .env.local and add your Google Maps API Key!
    echo   File location: .env.local
) else (
    echo √ .env.local already exists
)
echo.

REM Step 4: Final instructions
echo [4/4] Setup complete!
echo.
echo ============================================
echo    Next Steps:
echo ============================================
echo.
echo 1. Edit .env.local and add your Google Maps API Key
echo    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
echo.
echo 2. Get your API key at:
echo    https://console.cloud.google.com/
echo.
echo 3. Enable these APIs:
echo    - Maps JavaScript API
echo    - Elevation API
echo.
echo 4. Run the development server:
echo    npm run dev
echo.
echo 5. Open your browser:
echo    http://localhost:3000
echo.
echo ============================================
echo.
pause

