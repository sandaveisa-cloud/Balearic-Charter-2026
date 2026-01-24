<#
.SYNOPSIS
    Balearic Charter Database Migration Tool

.DESCRIPTION
    Prints SQL migrations for manual execution in Supabase SQL Editor.
    When Supabase CLI is installed, can push migrations directly.

.PARAMETER File
    Run a specific migration file (partial match)

.PARAMETER Master
    Run only the master schema (000_master_schema.sql)

.PARAMETER All
    Run all migrations in order

.EXAMPLE
    .\db-migrate.ps1
    Lists and prints all migrations

.EXAMPLE
    .\db-migrate.ps1 -File "001"
    Prints only migration 001

.EXAMPLE
    .\db-migrate.ps1 -Master
    Prints only the master schema
#>

param(
    [string]$File = "",
    [switch]$Master,
    [switch]$All,
    [switch]$List
)

$migrationsPath = Join-Path $PSScriptRoot "..\supabase\migrations"

# Check if migrations folder exists
if (-not (Test-Path $migrationsPath)) {
    Write-Host "❌ Migrations folder not found: $migrationsPath" -ForegroundColor Red
    exit 1
}

# Get all migration files
$migrations = Get-ChildItem -Path $migrationsPath -Filter "*.sql" | Sort-Object Name

Write-Host ""
Write-Host "🚀 Balearic Charter Database Migration Tool" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

if ($migrations.Count -eq 0) {
    Write-Host "⚠️ No migration files found" -ForegroundColor Yellow
    exit 0
}

Write-Host "📋 Found $($migrations.Count) migration files:" -ForegroundColor Blue
foreach ($m in $migrations) {
    Write-Host "   - $($m.Name)"
}
Write-Host ""

# Filter migrations based on parameters
$toRun = $migrations

if ($File) {
    $toRun = $migrations | Where-Object { $_.Name -like "*$File*" }
    if ($toRun.Count -eq 0) {
        Write-Host "❌ No migration matching: $File" -ForegroundColor Red
        exit 1
    }
}

if ($Master) {
    $toRun = $migrations | Where-Object { $_.Name -like "*000_master*" }
}

if ($List) {
    Write-Host "✅ Migration list complete" -ForegroundColor Green
    exit 0
}

# Print migrations
Write-Host "📝 Printing migrations for Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host ""

foreach ($migration in $toRun) {
    Write-Host ("=" * 80) -ForegroundColor DarkGray
    Write-Host "📄 $($migration.Name)" -ForegroundColor Cyan
    Write-Host ("=" * 80) -ForegroundColor DarkGray
    Write-Host ""
    Get-Content $migration.FullName
    Write-Host ""
    Write-Host ("=" * 80) -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host "💡 How to apply these migrations:" -ForegroundColor Cyan
Write-Host "   1. Go to Supabase Dashboard → SQL Editor"
Write-Host "   2. Copy each migration SQL above"
Write-Host "   3. Paste and click 'Run'"
Write-Host "   4. Run migrations in order (000, 001, 002, ...)"
Write-Host ""

# Check for Supabase CLI
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
if ($supabaseCli) {
    Write-Host "✅ Supabase CLI detected!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 For automated migrations, run:" -ForegroundColor Cyan
    Write-Host "   supabase link --project-ref YOUR_PROJECT_REF"
    Write-Host "   supabase db push"
    Write-Host ""
} else {
    Write-Host "💡 Want automated migrations? Install Supabase CLI:" -ForegroundColor Yellow
    Write-Host "   npm install -g supabase"
    Write-Host "   # or"
    Write-Host "   scoop install supabase"
    Write-Host ""
}

Write-Host "✅ Migration preparation complete!" -ForegroundColor Green
