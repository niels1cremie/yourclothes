# Lossless Image Configuration Documentation

This document describes the lossless image pipeline configuration for the YourClothes Android application. All image operations preserve original quality with 0% compression.

## Pipeline Overview

```
Photo Picker (Raw URI) 
    ↓
File Reading (Raw ByteArray)
    ↓
Supabase Storage Upload (Raw bytes with MIME type)
    ↓
AI Analysis (URL reference only)
    ↓
Database Storage (URL reference only)
    ↓
Coil Image Loading (Original quality, ARGB_8888)
```

## Configuration Details

### 1. Photo Picker & File Input

**Location:** `WardrobeViewModel.kt`

**Configuration:**
- Uses Android Photo Picker via `ActivityResultContracts.PickVisualMedia`
- Reads files using `FileUtils.readUriToBytes()` for raw byte reading
- Preserves original file extension based on MIME type detection
- No bitmap conversion or compression operations

**Key features:**
- Supports PNG, JPEG, WebP, HEIC formats
- 8KB buffered reading for efficiency without data loss
- Original MIME type preserved for upload

### 2. Local Storage (if needed)

**Location:** `FileUtils.kt`

**Configuration:**
- Utility class for lossless file operations
- `copyStreamToStream()` - Direct byte-to-byte copying
- `copyUriToFile()` - URI to file without compression
- `readUriToBytes()` - Raw byte reading from URI
- All operations preserve original bit structure

**Usage:** Currently not used in main pipeline (direct upload to Supabase), but available if local caching is needed.

### 3. Network & Supabase Upload

**Location:** `SupabaseClient.kt`, `WardrobeRepository.kt`

**Configuration:**
- OkHttp client with 30-second timeouts for large files
- Supabase Storage upload with proper MIME type headers
- Raw ByteArray upload without any compression
- Ktor HTTP client configured for byte transfer

**Key features:**
- No automatic scaling or downsampling
- Original MIME type preserved in upload headers
- Direct byte transfer without encoding compression

### 4. Coil / Image Loading

**Location:** `CoilConfig.kt`, `MainActivity.kt`

**Configuration:**
- Custom ImageLoader with original quality settings
- `OriginalQualityInterceptor` - Forces Size.ORIGINAL loading
- ARGB_8888 color format for maximum color depth
- No automatic pre-scaling or downsampling
- BitmapFactoryDecoder for raw bitmap creation

**Key features:**
- Images loaded in original resolution
- No memory compression
- 25% memory cache allocation
- Scale.FIT to avoid cropping

## File Format Support

| Format | Extension | MIME Type | Support |
|--------|-----------|-----------|---------|
| JPEG   | .jpg      | image/jpeg | ✅ Full |
| PNG    | .png      | image/png  | ✅ Full |
| WebP   | .webp     | image/webp | ✅ Full |
| HEIC   | .heic     | image/heic | ✅ Full |

## Verification Checklist

- [x] Photo Picker reads raw bytes without bitmap conversion
- [x] File extension detection preserves original format
- [x] Supabase upload uses raw ByteArray with MIME type
- [x] OkHttp client configured for large file transfers
- [x] Coil ImageLoader forces original size loading
- [x] ARGB_8888 color format used throughout
- [x] No compression operations in entire pipeline
- [x] FileUtils available for local operations if needed

## Performance Considerations

- **Memory:** Large images loaded at full resolution may require significant memory
- **Network:** Raw file uploads preserve size, may be slower for large images
- **Storage:** Original quality images consume more storage space

## Usage Examples

### Upload with Original Quality
```kotlin
// Automatic - handled by WardrobeViewModel
photoPickerLauncher.launch(PickVisualMediaRequest(ImageOnly))
```

### Local File Operations (if needed)
```kotlin
// Copy file without compression
FileUtils.copyFile(sourceFile, destFile)

// Read URI as raw bytes
val bytes = FileUtils.readUriToBytes(context, uri)

// Write bytes to file without compression
FileUtils.writeBytesToFile(bytes, file)
```

## Testing Recommendations

1. Test with different image formats (PNG, JPEG, WebP, HEIC)
2. Verify file size before and after upload (should be identical)
3. Check image quality in app display vs original
4. Test with large files (>10MB) to ensure no timeout issues
5. Verify color accuracy with high-color images

## Maintenance Notes

- When adding new image operations, always use raw byte streams
- Avoid Bitmap.compress() operations
- Preserve MIME types throughout the pipeline
- Use FileUtils for any local file operations
- Keep Coil configuration for original quality loading
