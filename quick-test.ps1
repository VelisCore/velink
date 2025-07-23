# Quick VeLink Test - Simple version
# Usage: .\quick-test.ps1 [number_of_links]

param([int]$Count = 5)

$urls = @(
    "https://github.com",
    "https://stackoverflow.com", 
    "https://www.youtube.com",
    "https://docs.microsoft.com",
    "https://reddit.com"
)

Write-Host "Creating $Count test links on velink.me..." -ForegroundColor Green

for ($i = 1; $i -le $Count; $i++) {
    $url = $urls | Get-Random
    $body = @{ url = $url } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "https://velink.me/api/shorten" -Method POST -Body $body -ContentType "application/json"
        Write-Host "[$i] ✅ $($result.shortUrl) → $url" -ForegroundColor White
    }
    catch {
        Write-Host "[$i] ❌ Failed: $url" -ForegroundColor Red
    }
    
    Start-Sleep 1
}

Write-Host "`n🎯 Check your links at: https://velink.me/admin" -ForegroundColor Cyan
