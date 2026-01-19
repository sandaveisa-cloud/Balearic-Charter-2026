import imageCompression from 'browser-image-compression'

/**
 * Compresses an image file on the client side before upload
 * 
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed file as Blob
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    maxSizeMB?: number
    useWebWorker?: boolean
  } = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    maxSizeMB = 1,
    useWebWorker = true,
  } = options

  const compressionOptions = {
    maxSizeMB,
    maxWidthOrHeight: Math.max(maxWidth, maxHeight),
    useWebWorker,
    fileType: file.type,
  }

  try {
    console.log('[ImageCompression] Compressing image:', {
      originalName: file.name,
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      options: compressionOptions,
    })

    const compressedFile = await imageCompression(file, compressionOptions)

    console.log('[ImageCompression] Compression complete:', {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
      reduction: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`,
    })

    return compressedFile
  } catch (error) {
    console.error('[ImageCompression] Error compressing image:', error)
    // Return original file if compression fails
    return file
  }
}

/**
 * Compresses an image for thumbnail use (smaller dimensions)
 */
export async function compressThumbnail(file: File): Promise<File> {
  return compressImage(file, {
    maxWidth: 800,
    maxHeight: 800,
    maxSizeMB: 0.5,
  })
}
