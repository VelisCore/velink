# VeLink Test Script - Rate Limited Version
# This respects the 1 link per minute rate limit

param([int]$Count = 3)

$urls = @(
    "https://github.com",
    "https://stackoverflow.com", 
    "https://www.youtube.com",
    "https://docs.microsoft.com",
    "https://reddit.com",
    "https://www.npmjs.com",
    "https://nodejs.org",
    "https://tailwindcss.com"
)

Write-Host "🔗 Creating $Count test links with 61-second delays (rate limit compliance)" -ForegroundColor Green
Write-Host "📍 Target: https://velink.me" -ForegroundColor Cyan
Write-Host "⏱️  This will take approximately $($Count * 61) seconds" -ForegroundColor Yellow
Write-Host ""

$createdLinks = @()

for ($i = 1; $i -le $Count; $i++) {
    $url = $urls | Get-Random
    $body = @{ url = $url } | ConvertTo-Json
    
    Write-Host "[$i/$Count] Creating link for: $url" -NoNewline
    
    try {
        $result = Invoke-RestMethod -Uri "https://velink.me/api/shorten" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
        Write-Host ""
        Write-Host "   ✅ Success: $($result.shortUrl)" -ForegroundColor Green
        $createdLinks += $result
    }
    catch {
        Write-Host ""
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Wait 61 seconds between requests (rate limit is 1 per minute)
    if ($i -lt $Count) {
        Write-Host "   ⏳ Waiting 61 seconds for rate limit..." -ForegroundColor Yellow
        Start-Sleep 61
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Created: $($createdLinks.Count) links" -ForegroundColor Green

if ($createdLinks.Count -gt 0) {
    Write-Host ""
    Write-Host "🔗 Test your links:" -ForegroundColor Cyan
    foreach ($link in $createdLinks) {
        Write-Host "   $($link.shortUrl) → $($link.originalUrl)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🎯 Admin panel: https://velink.me/admin" -ForegroundColor Cyan
