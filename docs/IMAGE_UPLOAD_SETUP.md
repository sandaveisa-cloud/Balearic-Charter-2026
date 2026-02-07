# Universal Image Upload System Setup Guide

This guide will help you set up the universal image upload system for the Admin Panel.

## Overview

The universal image upload system allows you to upload images directly from your device to Supabase Storage, eliminating the need to manually paste URLs. All images are automatically compressed and optimized for web use.

## Prerequisites

- Supabase project with Storage enabled
- Admin access to Supabase Dashboard
- `SUPABASE_SERVICE_ROLE_KEY` configured in your `.env.local` file

## Step 1: Create Storage Bucket

1. Log in to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New Bucket**
4. Configure the bucket:
   - **Name**: `website-assets`
   - **Public bucket**: ✅ Enabled (so images can be accessed via public URLs)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`
5. Click **Create bucket**

## Step 2: Configure RLS Policies

Run the SQL migration file to set up Row Level Security (RLS) policies:

1. In Supabase Dashboard, go to **SQL Editor**
2. Open the file: `supabase/migrations/create_website_assets_bucket.sql`
3. Copy and paste the SQL policies into the SQL Editor
4. Click **Run** to execute

**Note**: The bucket creation SQL is commented out because buckets must be created via the Dashboard. The RLS policies will ensure:
- Authenticated users (admin) can upload files
- Public users can read/view images
- Admin users can update and delete their uploads

## Step 3: Verify Environment Variables

Ensure your `.env.local` file contains:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

The service role key is required to bypass RLS for admin uploads.

## Step 4: Test the Upload System

1. Log in to the Admin Panel
2. Navigate to any section that uses images:
   - **Journey Timeline** → Add/Edit Milestone
   - **Signature Experience** → Add/Edit Promise
   - **Fleet** → Add/Edit Yacht
3. Try uploading an image using the drag & drop area
4. Verify the image appears in the preview and is saved correctly

## Features

### Image Compression
- All images are automatically compressed to **500KB** or less
- Images are converted to **WebP** format for optimal web performance
- Original aspect ratio is preserved
- Maximum dimensions: 1920px width or height

### Supported Sections
- ✅ **Journey Milestones** (`milestones/` folder)
- ✅ **Signature Experience Promises** (`promises/` folder)
- ✅ **Fleet Yachts** (`fleet/` folder)
  - Main image
  - Gallery images (via GalleryImageManager)

### Upload Methods
1. **Drag & Drop**: Drag images directly onto the upload area
2. **Click to Select**: Click the upload area to open file picker
3. **Manual URL**: Paste an image URL as a fallback option

## Troubleshooting

### "Bucket not found" Error
- Ensure the `website-assets` bucket exists in Supabase Storage
- Verify the bucket name matches exactly (case-sensitive)

### "Storage permission denied" Error
- Check that RLS policies are correctly configured
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Restart your development server after adding environment variables

### Images Not Appearing
- Check browser console for errors
- Verify the bucket is set to **Public**
- Ensure the image URL is accessible (try opening in a new tab)

### Compression Issues
- Very large images (>10MB) may take longer to compress
- If compression fails, the original file will be uploaded
- Check browser console for compression warnings

## Folder Structure

Images are organized in the `website-assets` bucket by folder:

```
website-assets/
├── milestones/     # Journey timeline images
├── promises/      # Signature Experience icon images
├── fleet/         # Yacht main images and gallery
└── general/       # Default folder for other uploads
```

## API Endpoint

The upload system uses the API route: `/api/admin/upload-image`

**Request Format:**
```typescript
FormData {
  file: File
  folder: string (e.g., 'milestones', 'fleet')
  bucket: string (default: 'website-assets')
}
```

**Response Format:**
```typescript
{
  url: string      // Public URL of uploaded image
  path: string     // Storage path
  message: string  // Success message
}
```

## Component Usage

### ImageUploader Component

```tsx
import ImageUploader from '@/components/admin/ImageUploader'

<ImageUploader
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  folder="milestones"
  bucket="website-assets"
  maxSizeMB={0.5}
  aspectRatio="16/9"
  label="Milestone Image"
/>
```

**Props:**
- `value`: Current image URL (string)
- `onChange`: Callback when URL changes (function)
- `folder`: Storage folder name (string, optional, default: 'general')
- `bucket`: Storage bucket name (string, optional, default: 'website-assets')
- `maxSizeMB`: Maximum file size in MB (number, optional, default: 0.5)
- `aspectRatio`: CSS aspect ratio (string, optional, e.g., '16/9', '1/1')
- `label`: Label text (string, optional)
- `className`: Additional CSS classes (string, optional)

## Next Steps

- Consider adding image cropping functionality
- Implement image deletion from storage when removed from admin forms
- Add image optimization cache for faster loading
- Set up CDN for image delivery (if needed)
