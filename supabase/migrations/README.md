# Database Migrations

This folder contains all SQL migrations for the Balearic Charter database.

## Quick Start

```bash
# List all migrations
npm run db:list

# Print all migrations for manual execution
npm run db:push

# Print only master schema
npm run db:push:master
```

## Migration Files

| File | Description |
|------|-------------|
| `000_master_schema.sql` | Complete database schema (use for new databases) |
| `001_add_highlights_to_destinations.sql` | Adds highlights/attractions to destinations |
| `002_fleet_complete_schema.sql` | Ensures all fleet columns exist |

## How to Apply Migrations

### Option 1: Manual (Recommended)

1. Run `npm run db:push`
2. Copy the SQL from the terminal
3. Go to **Supabase Dashboard → SQL Editor**
4. Paste and click **Run**
5. Run migrations in order (000, 001, 002...)

### Option 2: Supabase CLI (Automated)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## Creating New Migrations

When adding a feature that requires database changes:

1. Create a new file: `XXX_feature_name.sql` (e.g., `003_add_bookings.sql`)
2. Use this template:

```sql
-- ============================================================================
-- Migration XXX: Feature Name
-- ============================================================================
-- Created: YYYY-MM-DD
-- Description: What this migration does
-- ============================================================================

-- Add new columns
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name TYPE DEFAULT value;

-- Create indexes if needed
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column_name);

-- ============================================================================
-- MIGRATION XXX COMPLETE
-- ============================================================================
```

3. Test locally with `npm run db:push`
4. Apply to production via Supabase SQL Editor

## Migration Rules

- **Idempotent**: All migrations use `IF NOT EXISTS` / `IF EXISTS`
- **Ordered**: Run migrations in numerical order
- **Non-destructive**: Never drop tables without backup
- **Documented**: Add comments explaining changes

## Rollback

To rollback a migration, create a new migration that reverses the changes:

```sql
-- Migration 004: Rollback 003
ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;
```

## Troubleshooting

### Schema Cache Error (PGRST204)
After adding columns, refresh the schema cache:
1. Go to Supabase Dashboard → Settings → API
2. Click "Reload Schema Cache"

Or run:
```sql
NOTIFY pgrst, 'reload schema';
```

### Column Already Exists
Migrations use `IF NOT EXISTS`, so re-running is safe.

### Missing Permissions
Ensure you're using the `service_role` key, not the `anon` key.
