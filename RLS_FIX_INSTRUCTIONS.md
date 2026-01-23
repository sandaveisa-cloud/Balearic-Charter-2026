# RLS Fix Instructions

## Problem
- RLS violation errors when uploading images to Supabase storage (`fleet-images` bucket)
- 500 errors on `/api/admin/destinations`

## Solution Overview
1. ✅ Created admin upload API route that uses `service_role` key to bypass RLS
2. ✅ Updated `ImageUpload` component to use the new admin API route
3. ✅ Improved error handling in both components
4. ⚠️ **ACTION REQUIRED**: Run SQL scripts in Supabase to fix storage bucket RLS policies

## Steps to Fix

### Step 1: Fix Storage Bucket RLS Policies

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Open the file `supabase/fix_storage_rls.sql` from this repository
5. Copy and paste the entire SQL script into the SQL Editor
6. Click **Run** to execute the script

This will:
- Enable RLS on `storage.objects` table
- Create policies allowing authenticated users to read, upload, update, and delete images in the `fleet-images` bucket
- Create a public read policy so images can be displayed on your website

### Step 2: Make Bucket Public (Optional but Recommended)

1. In Supabase Dashboard, go to **Storage**
2. Click on the `fleet-images` bucket
3. Go to **Settings** tab
4. Enable **Public bucket** toggle
5. Click **Save**

This allows images to be accessed directly via public URLs without authentication.

### Step 3: Fix Destinations Table RLS Policies

1. In Supabase Dashboard, go to **SQL Editor**
2. Open the file `supabase/fix_destinations_rls.sql` from this repository
3. Copy and paste the entire SQL script into the SQL Editor
4. Click **Run** to execute the script

This will:
- Ensure RLS is enabled on the `destinations` table
- Create policies allowing authenticated users full CRUD access
- Create a public read policy for active destinations (for website display)

### Step 4: Verify Fixes

After running the SQL scripts:

1. **Test Image Upload**:
   - Go to Admin Panel → Destinations
   - Try uploading an image
   - Should work without RLS errors

2. **Test Destinations API**:
   - Check browser console for errors
   - `/api/admin/destinations` should return 200 OK

3. **Check Storage Policies**:
   - In Supabase Dashboard → Storage → `fleet-images` → Policies
   - You should see the new policies listed

## Technical Details

### What Changed

1. **New Admin Upload API Route** (`/api/admin/upload-image`):
   - Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
   - Handles file uploads server-side
   - Returns public URL for uploaded images

2. **Updated ImageUpload Component**:
   - Now uses the admin API route instead of direct client-side upload
   - Better error handling with specific error messages
   - Validates file type and size before upload

3. **Updated DestinationEditModal**:
   - Improved error handling
   - Shows specific error messages for RLS/permission issues

4. **Updated Destinations API Route**:
   - Already uses `service_role` key correctly
   - Added `@ts-ignore` for TypeScript compatibility

### Why This Works

- **Admin API routes** use `SUPABASE_SERVICE_ROLE_KEY` which bypasses all RLS policies
- **Storage policies** allow authenticated users to upload images
- **Public read policies** allow images to be displayed on the website
- **Error handling** provides clear feedback when something goes wrong

## Troubleshooting

### If uploads still fail:

1. **Check Environment Variables**:
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

2. **Verify Bucket Exists**:
   - Go to Storage in Supabase Dashboard
   - Ensure `fleet-images` bucket exists
   - If not, create it and set it to public

3. **Check Policies**:
   - Run the verification queries at the end of each SQL script
   - Ensure policies are created successfully

4. **Check Logs**:
   - Supabase Dashboard → Logs → API Logs
   - Look for RLS policy violations
   - Check Vercel function logs for server-side errors

## Next Steps

After running the SQL scripts:
1. Test image upload in Admin Panel
2. Verify images appear correctly
3. Test destination creation/editing
4. Monitor for any remaining errors

If issues persist, check:
- Supabase Dashboard → Logs
- Vercel Dashboard → Function Logs
- Browser Console for client-side errors
