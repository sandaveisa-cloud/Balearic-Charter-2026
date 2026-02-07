# Troubleshooting: Milestone Save Errors

## Quick Debugging Steps

### 1. Check Browser Console
Open Browser DevTools (F12) → Console tab and look for:
- `[JourneyEditModal] 📤 Sending payload:` - Shows what's being sent
- `[JourneyEditModal] 📥 Response status:` - Shows API response
- `[JourneyEditModal] ❌ API Error:` - Shows error details

### 2. Check Network Tab
1. Open Browser DevTools (F12) → Network tab
2. Try saving the milestone
3. Find the request to `/api/admin/journey`
4. Check:
   - **Request Payload**: Verify all fields are present
   - **Response**: Check error message
   - **Status Code**: 400 = validation error, 500 = server error

### 3. Common Issues & Fixes

#### Issue: "Failed to update milestone"
**Possible Causes:**
1. **Year validation**: Year must be 2000-2030 (inclusive)
2. **Missing required fields**: All title_* and description_* fields required
3. **RLS Policy**: Check Supabase RLS policies (though service_role should bypass)
4. **Database constraint**: Check for CHECK constraints on year column

**Fix:**
- Verify year is between 2000-2030
- Ensure all required fields are filled
- Run RLS migration: `supabase/migrations/add_journey_milestones_rls.sql`
- Run year constraint migration: `supabase/migrations/add_year_constraint_journey_milestones.sql`

#### Issue: "Invalid year"
**Cause**: Year is outside 2000-2030 range

**Fix:**
- Ensure year input is between 2000 and 2030
- Check that year is being sent as integer, not string

#### Issue: "Permission denied" or "RLS policy violation"
**Cause**: RLS policies blocking update

**Fix:**
1. Run RLS migration in Supabase SQL Editor:
   ```sql
   -- File: supabase/migrations/add_journey_milestones_rls.sql
   ```
2. Verify service_role key is set in `.env.local`
3. Restart dev server after adding env variable

#### Issue: "Check constraint violation"
**Cause**: Database CHECK constraint on year column

**Fix:**
1. Run year constraint migration:
   ```sql
   -- File: supabase/migrations/add_year_constraint_journey_milestones.sql
   ```
2. Or remove constraint if needed:
   ```sql
   ALTER TABLE journey_milestones DROP CONSTRAINT IF EXISTS journey_milestones_year_check;
   ```

### 4. Verify Database Schema

Run this in Supabase SQL Editor to check table structure:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'journey_milestones'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (uuid)
- `year` (integer)
- `title_en`, `title_es`, `title_de` (text, NOT NULL)
- `description_en`, `description_es`, `description_de` (text, NOT NULL)
- `image_url` (text, nullable)
- `order_index` (integer)
- `is_active` (boolean)
- `created_at`, `updated_at` (timestamptz)

### 5. Test Payload Structure

The payload should match this structure:

```json
{
  "id": "uuid-here",  // Only for updates
  "year": 2012,
  "title_en": "Title in English",
  "title_es": "Título en español",
  "title_de": "Titel auf Deutsch",
  "description_en": "Description in English",
  "description_es": "Descripción en español",
  "description_de": "Beschreibung auf Deutsch",
  "image_url": "https://...",  // or null
  "order_index": 0,
  "is_active": true
}
```

### 6. Verify RLS Policies

Check if RLS is enabled and policies exist:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'journey_milestones';

-- Check existing policies
SELECT * FROM pg_policies 
WHERE tablename = 'journey_milestones';
```

Expected policies:
- `Allow authenticated select on journey_milestones`
- `Allow authenticated insert on journey_milestones`
- `Allow authenticated update on journey_milestones`
- `Allow authenticated delete on journey_milestones`
- `Allow public select on journey_milestones`

### 7. Test Direct Database Update

Test if update works directly in Supabase:

```sql
-- Test update (replace with actual ID)
UPDATE journey_milestones
SET 
  year = 2012,
  title_en = 'Test',
  title_es = 'Prueba',
  title_de = 'Test',
  description_en = 'Test description',
  description_es = 'Descripción de prueba',
  description_de = 'Testbeschreibung',
  image_url = NULL,
  order_index = 0,
  is_active = true,
  updated_at = NOW()
WHERE id = 'your-milestone-id-here'
RETURNING *;
```

If this works, the issue is in the API route or frontend.
If this fails, check database constraints or RLS policies.

### 8. Environment Variables

Verify `.env.local` has:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Restart dev server after adding/updating env variables.

## Still Having Issues?

1. **Check Supabase Logs**: Dashboard → Logs → API Logs
2. **Check Vercel Logs**: If deployed, check function logs
3. **Share Error Details**: Copy full error from console and network tab
