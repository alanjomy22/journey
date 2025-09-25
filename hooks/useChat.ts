import { useState, useCallback } from 'react';
import { apiService, ChatRequest, ChatResponse } from '@/services/api';

interface UseChatReturn {
  sendMessage: (message: string, description: string, sessionId?: string) => Promise<string>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for chat API interactions
 */
export function useChat(): UseChatReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string, description: string, sessionId: string = 'default-session'): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // Prepare API request
      const request: ChatRequest = {
        description,
        session_id: sessionId,
        input_message: message,
      };

      // Call API
      const response: ChatResponse = await apiService.getChatResponse(request);

      return response.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error getting chat response:', err);
      
      // Return a fallback response
      return 'I\'d love to hear more about your thoughts on this. What stands out to you most about this experience?';
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendMessage,
    loading,
    error,
  };
}
