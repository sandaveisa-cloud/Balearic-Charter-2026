# Clear Next.js build cache
Write-Host "Clearing Next.js build cache..." -ForegroundColor Yellow

if (Test-Path ".next") {
    try {
        Remove-Item -Recurse -Force ".next"
        Write-Host "✓ Cache cleared successfully!" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error clearing cache. Please stop the dev server first (Ctrl+C)" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ No cache to clear" -ForegroundColor Green
}

Write-Host "`nYou can now restart the dev server with: npm run dev" -ForegroundColor Cyan
