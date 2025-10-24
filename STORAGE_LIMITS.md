# Storage Limits - Quick Reference

## Current Configuration

### Avatars Bucket
- **Size Limit**: 5MB
- **Allowed Types**: 
  - image/jpeg
  - image/png
  - image/webp
- **Use**: User profile pictures

### Post-Media Bucket
- **Size Limit**: 50MB ⬆️ (increased from 10MB)
- **Allowed Types**:
  - image/jpeg
  - image/png
  - image/webp
  - video/mp4
  - video/quicktime
- **Use**: Post images and videos

## File Size Guidelines

### Images
- **Recommended**: 1-5MB
- **Maximum**: 50MB
- **Typical sizes**:
  - Phone photo: 2-4MB
  - Compressed photo: 500KB-1MB
  - High-res photo: 5-10MB

### Videos
- **Recommended**: 10-30MB
- **Maximum**: 50MB
- **Duration**: 60 seconds max (configurable)
- **Typical sizes**:
  - 720p 30fps: ~15MB/minute
  - 1080p 30fps: ~30MB/minute
  - 4K 30fps: ~100MB/minute (exceeds limit)

## What Fits in 50MB?

### Videos
- ✅ 60 seconds @ 1080p 30fps (~30MB)
- ✅ 90 seconds @ 720p 30fps (~22MB)
- ✅ 2 minutes @ 480p 30fps (~20MB)
- ❌ 60 seconds @ 4K 30fps (~100MB) - Too large!

### Images
- ✅ ~10-25 high-quality photos
- ✅ ~50-100 compressed photos
- ✅ Single RAW photo (most cameras)

## Compression Recommendations

### For Production
Consider adding compression to reduce costs and improve performance:

#### Images
```typescript
// Use expo-image-manipulator
import * as ImageManipulator from 'expo-image-manipulator';

const compressed = await ImageManipulator.manipulateAsync(
  uri,
  [{ resize: { width: 1920 } }],
  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
);
```

#### Videos
```typescript
// Use expo-video-thumbnails for compression
// Or implement server-side compression
```

## Monitoring Storage Usage

### Supabase Dashboard
1. Go to Storage → post-media
2. Check total storage used
3. Monitor growth over time

### Cost Estimates
- **Free tier**: 1GB storage included
- **Pro tier**: $0.021/GB/month
- **Example**: 100 users × 10 posts × 5MB = 5GB = ~$0.10/month

## Increasing Limits

### To Increase Further
```sql
-- Example: Increase to 100MB
UPDATE storage.buckets
SET file_size_limit = 104857600  -- 100MB in bytes
WHERE id = 'post-media';
```

### Considerations
- ⚠️ Larger files = slower uploads
- ⚠️ More storage costs
- ⚠️ Longer processing times
- ⚠️ Higher bandwidth usage

## Error Messages

### "Object exceeded maximum allowed size"
- **Cause**: File is larger than 50MB
- **Solution**: 
  - Compress the file
  - Use shorter video duration
  - Reduce video quality

### "Invalid MIME type"
- **Cause**: File type not in allowed list
- **Solution**: Convert to supported format

### "Upload failed"
- **Cause**: Network issue or permissions
- **Solution**: Check internet, verify bucket permissions

## Best Practices

### For Users
1. ✅ Keep videos under 60 seconds
2. ✅ Use 720p or 1080p quality
3. ✅ Compress large images before upload
4. ✅ Avoid 4K videos (too large)

### For Developers
1. ✅ Show file size before upload
2. ✅ Add upload progress indicator
3. ✅ Implement client-side compression
4. ✅ Set appropriate quality settings
5. ✅ Monitor storage usage
6. ✅ Add file size validation

## Future Optimizations

### Short-term
- [ ] Add file size preview
- [ ] Show upload progress
- [ ] Client-side compression
- [ ] File size warnings

### Long-term
- [ ] Server-side video transcoding
- [ ] CDN integration
- [ ] Adaptive streaming
- [ ] Automatic quality adjustment

---

**Last Updated**: 2025-10-22  
**Current Limits**: 5MB (avatars), 50MB (post-media)  
**Status**: ✅ Optimized for video support
