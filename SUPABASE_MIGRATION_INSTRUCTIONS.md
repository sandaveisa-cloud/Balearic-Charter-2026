# Supabase Migration Instructions

## Add media_urls column to culinary_experiences

The `media_urls` column is missing from your `culinary_experiences` table. Follow these steps to add it:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Add media_urls column to culinary_experiences table
ALTER TABLE culinary_experiences 
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_culinary_experiences_media_urls 
ON culinary_experiences USING GIN (media_urls);
```

6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

Or run the SQL file directly:

```bash
psql -h your-db-host -U postgres -d postgres -f supabase/add_media_urls_to_culinary.sql
```

### Verify the Migration

After running the migration, verify it worked:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'culinary_experiences' 
AND column_name = 'media_urls';
```

You should see `media_urls` with type `jsonb`.

### After Migration

Once the migration is complete:
1. Refresh your admin page
2. Try uploading an image to Culinary Experiences again
3. It should work now!

---

**Note:** If you see "schema cache" errors, Supabase may need a few seconds to refresh its schema cache. Wait 10-30 seconds and try again.
