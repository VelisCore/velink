# Velink Test Script - Create Random Short Links
# This script sends requests to velink.me to create short links with random URLs

param(
    [int]$Count = 10,
    [string]$BaseUrl = "https://velink.me",
    [int]$DelaySeconds = 1,
    [switch]$Verbose
)

# Array of random URLs to use for testing
$RandomUrls = @(
    "https://github.com",
    "https://stackoverflow.com",
    "https://docs.microsoft.com",
    "https://www.youtube.com",
    "https://www.wikipedia.org",
    "https://news.ycombinator.com",
    "https://reddit.com",
    "https://www.google.com",
    "https://developer.mozilla.org",
    "https://www.npmjs.com",
    "https://nodejs.org",
    "https://reactjs.org",
    "https://tailwindcss.com",
    "https://www.typescriptlang.org",
    "https://vitejs.dev",
    "https://expressjs.com",
    "https://www.sqlite.org",
    "https://jwt.io",
    "https://postman.com",
    "https://code.visualstudio.com",
    "https://www.cloudflare.com",
    "https://www.digitalocean.com",
    "https://www.nginx.com",
    "https://ubuntu.com",
    "https://www.docker.com",
    "https://kubernetes.io",
    "https://www.terraform.io",
    "https://aws.amazon.com",
    "https://azure.microsoft.com",
    "https://cloud.google.com"
)

# Array of expiration options
$ExpirationOptions = @("1d", "7d", "30d", "365d", "never")

# Function to generate random string for custom aliases
function Get-RandomString {
    param([int]$Length = 6)
    $chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    $result = ""
    for ($i = 0; $i -lt $Length; $i++) {
        $result += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $result
}

# Function to create a short link
function New-ShortLink {
    param(
        [string]$Url,
        [string]$ExpiresIn = "never",
        [string]$CustomAlias = $null,
        [string]$Description = $null
    )
    
    $body = @{
        url = $Url
        expiresIn = $ExpiresIn
    }
    
    if ($CustomAlias) {
        $body.customAlias = $CustomAlias
    }
    
    if ($Description) {
        $body.description = $Description
    }
    
    $jsonBody = $body | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/shorten" -Method POST -Body $jsonBody -ContentType "application/json" -TimeoutSec 10
        return $response
    }
    catch {
        Write-Warning "Failed to create link for $Url - $($_.Exception.Message)"
        return $null
    }
}

# Main script
Write-Host "🔗 Velink Test Script - Creating $Count random short links" -ForegroundColor Cyan
Write-Host "📍 Target: $BaseUrl" -ForegroundColor Green
Write-Host "⏱️  Delay between requests: $DelaySeconds seconds" -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0
$createdLinks = @()

for ($i = 1; $i -le $Count; $i++) {
    # Get random URL
    $randomUrl = $RandomUrls | Get-Random
    
    # Get random expiration (80% chance of never expiring)
    $expiration = if ((Get-Random -Maximum 10) -lt 8) { "never" } else { $ExpirationOptions | Get-Random }
    
    # 30% chance of custom alias
    $customAlias = if ((Get-Random -Maximum 10) -lt 3) { "test-$(Get-RandomString -Length 5)" } else { $null }
    
    # 50% chance of description
    $description = if ((Get-Random -Maximum 10) -lt 5) { 
        $descriptions = @(
            "Test link created by PowerShell script",
            "Random URL for testing purposes",
            "Generated link #$i",
            "Sample short link",
            "Automated test data"
        )
        $descriptions | Get-Random
    } else { $null }
    
    Write-Host "[$i/$Count] Creating link for: $randomUrl" -NoNewline
    
    if ($customAlias) {
        Write-Host " (alias: $customAlias)" -NoNewline -ForegroundColor Magenta
    }
    
    if ($expiration -ne "never") {
        Write-Host " (expires: $expiration)" -NoNewline -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    $result = New-ShortLink -Url $randomUrl -ExpiresIn $expiration -CustomAlias $customAlias -Description $description
    
    if ($result) {
        $successCount++
        $createdLinks += $result
        Write-Host "   ✅ Success: $($result.shortUrl)" -ForegroundColor Green
        
        if ($Verbose) {
            Write-Host "      Short Code: $($result.shortCode)" -ForegroundColor Gray
            Write-Host "      Original URL: $($result.originalUrl)" -ForegroundColor Gray
            if ($result.expiresAt) {
                Write-Host "      Expires: $($result.expiresAt)" -ForegroundColor Gray
            }
            if ($description) {
                Write-Host "      Description: $description" -ForegroundColor Gray
            }
        }
    }
    else {
        $failCount++
        Write-Host "   ❌ Failed" -ForegroundColor Red
    }
    
    # Add delay between requests to respect rate limiting
    if ($i -lt $Count) {
        Start-Sleep -Seconds $DelaySeconds
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Successful: $successCount" -ForegroundColor Green
Write-Host "   ❌ Failed: $failCount" -ForegroundColor Red
Write-Host "   📈 Success Rate: $([math]::Round(($successCount / $Count) * 100, 1))%" -ForegroundColor Yellow

if ($createdLinks.Count -gt 0) {
    Write-Host ""
    Write-Host "🔗 Created Links:" -ForegroundColor Cyan
    foreach ($link in $createdLinks) {
        Write-Host "   $($link.shortUrl) → $($link.originalUrl)" -ForegroundColor White
    }
    
    # Export to CSV if we have links
    $csvPath = "velink-test-links-$(Get-Date -Format 'yyyyMMdd-HHmmss').csv"
    $createdLinks | Export-Csv -Path $csvPath -NoTypeInformation
    Write-Host ""
    Write-Host "💾 Links exported to: $csvPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 You can now test these links at: $BaseUrl" -ForegroundColor Cyan
Write-Host "🔧 Admin panel: $BaseUrl/admin" -ForegroundColor Cyan
