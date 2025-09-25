import { useState, useCallback } from 'react';
import { apiService, ImageDescriptionRequest, ImageDescriptionResponse } from '@/services/api';
import { convertImageToBase64, getImageContentType } from '@/utils/imageUtils';

interface UseImageDescriptionReturn {
  getDescription: (imageUri: string) => Promise<string>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for getting image descriptions from the API
 */
export function useImageDescription(): UseImageDescriptionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDescription = useCallback(async (imageUri: string): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // Convert image to base64
      const base64Data = await convertImageToBase64(imageUri);
      const contentType = getImageContentType(imageUri);

      // Prepare API request
      const request: ImageDescriptionRequest = {
        media_type: 'image',
        base64_data: base64Data,
        content_type: contentType,
      };

      // Call API
      const response: ImageDescriptionResponse = await apiService.getImageDescription(request);

      return response.description;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error getting image description:', err);
      
      // Return a fallback description
      return 'I can see this is a meaningful moment you\'ve captured. What was happening when you took this photo?';
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getDescription,
    loading,
    error,
  };
}
