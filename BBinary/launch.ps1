# Liquid Glass Concierge - Launch Script

Write-Host "🚀 Launching Liquid Glass Concierge..." -ForegroundColor Cyan

# Check for .env file
if (-not (Test-Path "apps/web-app/.env")) {
    Write-Host "⚠️ Warning: .env file not found in apps/web-app/.env" -ForegroundColor Yellow
    Write-Host "Please ensure your VITE_GOOGLE_API_KEY is set." -ForegroundColor Yellow
}

# Run the dev server
Set-Location "apps/web-app"
npm run dev
