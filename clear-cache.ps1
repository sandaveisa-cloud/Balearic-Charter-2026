# Clear Next.js build cache
Write-Host "Clearing Next.js cache..."

# Stop any running Node processes (optional - uncomment if needed)
# Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove .next directory
if (Test-Path ".next") {
    Write-Host "Removing .next directory..."
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Removed .next directory"
} else {
    Write-Host "✓ .next directory not found"
}

# Remove node_modules cache
if (Test-Path "node_modules\.cache") {
    Write-Host "Removing node_modules\.cache directory..."
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✓ Removed node_modules\.cache directory"
} else {
    Write-Host "✓ node_modules\.cache directory not found"
}

Write-Host ""
Write-Host "Cache cleared successfully! Now restart your dev server with: npm run dev"
Write-Host ""
