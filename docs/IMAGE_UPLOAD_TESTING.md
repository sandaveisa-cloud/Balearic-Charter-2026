# Image Upload System - Testing Guide

## Quick Test Checklist

### ✅ Prerequisites Verified
- [x] `website-assets` bucket created in Supabase
- [x] Bucket set to **Public**
- [x] RLS policies configured
- [x] `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### 🧪 Test Scenarios

#### 1. Journey Timeline Image Upload
**Location**: Admin Panel → Journey Timeline → Add/Edit Milestone

**Steps**:
1. Click "Add Milestone" or edit an existing milestone
2. Scroll to "Milestone Image" section
3. **Test Drag & Drop**:
   - Drag an image file onto the upload area
   - Verify drag state (border turns gold)
   - Drop the image
   - Wait for compression and upload
   - Verify preview appears
4. **Test Click Upload**:
   - Click the upload area
   - Select an image from file picker
   - Verify upload completes
5. **Test Manual URL**:
   - Paste an image URL in the "Or paste image URL" field
   - Verify preview updates
6. **Test Remove**:
   - Click the X button on preview
   - Verify image is cleared

**Expected Results**:
- ✅ Image compresses to <500KB
- ✅ Preview shows immediately after upload
- ✅ Image URL appears in form
- ✅ Image saves correctly when milestone is saved

---

#### 2. Signature Experience Icon Upload
**Location**: Admin Panel → Signature Experience → Add/Edit Promise

**Steps**:
1. Click "Add Promise" or edit existing promise
2. Scroll to "Custom Icon Image" section
3. Upload a square icon image (1:1 aspect ratio)
4. Verify the square preview
5. Save the promise

**Expected Results**:
- ✅ Icon uploads successfully
- ✅ Square aspect ratio maintained
- ✅ Icon displays correctly on frontend

---

#### 3. Fleet Main Image Upload
**Location**: Admin Panel → Fleet → Add/Edit Yacht → Basic Info tab

**Steps**:
1. Open Fleet editor (new or existing yacht)
2. Navigate to "Basic Info" tab
3. Scroll to "Main Image" section
4. Upload a yacht image (16:9 aspect ratio recommended)
5. Verify preview
6. Save yacht

**Expected Results**:
- ✅ Main image uploads to `fleet/` folder
- ✅ Image compresses automatically
- ✅ Preview shows correct aspect ratio
- ✅ Image appears on yacht detail page

---

#### 4. Fleet Gallery Images
**Location**: Admin Panel → Fleet → Add/Edit Yacht → Gallery tab

**Steps**:
1. Open Fleet editor → Gallery tab
2. **Test Multiple Upload**:
   - Click upload area or drag multiple images
   - Verify all images upload and compress
   - Check progress messages
3. **Test Drag to Reorder**:
   - Drag gallery images to reorder
   - Verify first image becomes main image
4. **Test Manual URL**:
   - Paste image URL in manual input
   - Click "Pievienot" (Add)
   - Verify image added to gallery
5. **Test Delete**:
   - Hover over gallery image
   - Click trash icon
   - Confirm deletion
   - Verify image removed

**Expected Results**:
- ✅ Multiple images upload successfully
- ✅ All images compressed to <500KB
- ✅ Drag & drop reordering works
- ✅ First image treated as main
- ✅ Images delete correctly

---

## 🐛 Troubleshooting

### Issue: "Bucket not found" Error
**Solution**:
- Verify bucket name is exactly `website-assets` (case-sensitive)
- Check bucket exists in Supabase Storage dashboard
- Ensure bucket is set to Public

### Issue: "Storage permission denied"
**Solution**:
- Verify RLS policies are configured correctly
- Check `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Restart development server after adding env variable

### Issue: Images Not Compressing
**Solution**:
- Check browser console for compression errors
- Verify `browser-image-compression` package is installed
- Very large images (>10MB) may take longer

### Issue: Preview Not Showing
**Solution**:
- Check browser console for errors
- Verify image URL is accessible (try opening in new tab)
- Check network tab for failed requests

### Issue: Upload Hangs/Timeout
**Solution**:
- Check file size (should be <5MB before compression)
- Verify network connection
- Check Supabase dashboard for storage errors
- Try smaller image file

---

## 📊 Performance Checks

### Compression Metrics
After uploading, check browser console for:
```
[ImageUploader] Original size: X.XX MB
[ImageUploader] Compressed size: Y.YY MB
```

**Expected**: Compressed size should be <500KB (0.5MB)

### Upload Speed
- Small images (<1MB): Should upload in <2 seconds
- Medium images (1-3MB): Should upload in <5 seconds
- Large images (3-5MB): Should upload in <10 seconds

---

## ✅ Success Criteria

The system is working correctly if:
1. ✅ All upload methods work (drag & drop, click, manual URL)
2. ✅ Images compress to <500KB automatically
3. ✅ Preview appears immediately after upload
4. ✅ Images save correctly to database
5. ✅ Images display on frontend correctly
6. ✅ Gallery reordering works
7. ✅ Image deletion works
8. ✅ No console errors during upload

---

## 🎯 Next Steps After Testing

Once all tests pass:
1. Document any custom folder structures needed
2. Set up image CDN (if needed for production)
3. Configure image optimization cache
4. Add image deletion cleanup (optional)

---

## 📝 Notes

- **Folder Structure**: Images are organized by folder in `website-assets` bucket:
  - `milestones/` - Journey timeline images
  - `promises/` - Signature Experience icons
  - `fleet/` - Yacht main images and gallery
  - `general/` - Default folder

- **File Naming**: Files are automatically renamed with timestamp and random string to prevent conflicts

- **Format**: All images are converted to WebP format for optimal compression
