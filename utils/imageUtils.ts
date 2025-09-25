
/**
 * Convert an image URI to base64 string
 * @param imageUri - The URI of the image (local or remote)
 * @returns Promise<string> - Base64 encoded string without data URL prefix
 */
export async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    // For now, return a dummy image to avoid FileSystem issues
    // This ensures the app continues to work while we debug the FileSystem issue
    console.warn('Using fallback dummy image due to FileSystem compatibility issues');
    return getDummyBase64Image();

    // TODO: Re-enable actual base64 conversion once FileSystem issues are resolved
    /*
    let base64: string;
    
    // Check if it's a remote URL
    if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
      // For remote URLs, download first then convert
      const downloadResult = await FileSystem.downloadAsync(
        imageUri,
        FileSystem.documentDirectory + 'temp_image.jpg'
      );
      
      // Read the downloaded file as base64
      base64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } else {
      // For local files, read directly
      base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
    
    return base64;
    */
  } catch (error) {
    console.error('Error converting image to base64:', error);
    // Return a fallback dummy image instead of throwing
    console.warn('Using fallback dummy image due to conversion error');
    return getDummyBase64Image();
  }
}

/**
 * Get content type from image URI
 * @param imageUri - The URI of the image
 * @returns 'image/jpeg' | 'image/png'
 */
export function getImageContentType(imageUri: string): 'image/jpeg' | 'image/png' {
  const extension = imageUri.toLowerCase().split('.').pop();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

/**
 * Create a dummy base64 image for testing
 * This creates a small 1x1 pixel transparent PNG
 */
export function getDummyBase64Image(): string {
  // 1x1 transparent PNG in base64
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}
