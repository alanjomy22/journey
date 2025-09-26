// API Configuration and Base Service
export const API_CONFIG = {
  BASE_URL: 'https://2a86add2dee8.ngrok-free.app',
  ENDPOINTS: {
    IMAGE_DESCRIPTION: '/descriptions/base64',
    CHAT: '/journal/chat',
    CHAT_SESSIONS: '/chats',
    SUMMARIZE_SESSIONS: '/journal/summarize/sessions',
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API Types
export interface ImageDescriptionRequest {
  media_type: 'image';
  base64_data: string;
  content_type: 'image/jpeg' | 'image/png';
}

export interface ImageDescriptionResponse {
  description: string;
}

export interface ChatRequest {
  description: string;
  session_id: string;
  input_message: string;
}

export interface ChatResponse {
  type: string;
  content: string;
  audio_file?: string;
}

// Chat Sessions API Types
export interface ChatSession {
  session_id: string;
  title: string;
  metadata: any;
}

export interface StoryAsset {
  id: string;
  title: string;
  imageUri: string;
  createdAt: string;
  type: 'image' | 'video' | 'text';
  isViewed?: boolean;
  journal_id?: string;
  session_id?: string;
}

export interface JournalEntry {
  journal_id: string;
  created_at: string;
  sessions: ChatSession[];
  story_assets?: StoryAsset[];
}

export interface ChatSessionsResponse {
  success: boolean;
  data: JournalEntry[];
  total: number;
  session_id?: string;
}

export interface SummarizeSessionsRequest {
  session_ids: string[];
}

export interface SummarizeSessionsResponse {
  success?: boolean;
  data?: {
    title: string;
    summary: string;
    image_url?: string;
  };
  summary?: string; // Direct summary response
}

// Base API service class
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getImageDescription(request: ImageDescriptionRequest): Promise<ImageDescriptionResponse> {
    const response = await this.makeRequest<ImageDescriptionResponse>(
      API_CONFIG.ENDPOINTS.IMAGE_DESCRIPTION,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response;
  }

  async getChatResponse(request: ChatRequest): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>(
      API_CONFIG.ENDPOINTS.CHAT,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async getChatSessions(sessionId: string): Promise<ChatSessionsResponse> {
    // For now, return mock data. In production, this would make the actual API call
    const { createCompleteApiResponse } = await import('@/constants/storyAssets');
    return createCompleteApiResponse(sessionId);

    // Uncomment below for actual API call:
    // return this.makeRequest<ChatSessionsResponse>(
    //   `${API_CONFIG.ENDPOINTS.CHAT_SESSIONS}/${sessionId}`,
    //   {
    //     method: 'GET',
    //   }
    // );
  }

  async summarizeSessions(sessionIds: string[]): Promise<SummarizeSessionsResponse> {
    try {
      return await this.makeRequest<SummarizeSessionsResponse>(
        API_CONFIG.ENDPOINTS.SUMMARIZE_SESSIONS,
        {
          method: 'POST',
          body: JSON.stringify({ session_ids: sessionIds }),
        }
      );
    } catch (error) {
      console.error('Error summarizing sessions:', error);
      // Return fallback data if API fails
      return {
        success: false,
        data: {
          title: 'Day out in Rome',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
          image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
        }
      };
    }
  }

  private generateFallbackResponse(userMessage: string): string {
    const responses = [
      'That\'s a beautiful reflection. What emotions did you feel during that moment?',
      'It sounds like that experience was meaningful to you. Can you tell me more about what made it special?',
      'I can sense the importance of this memory. How do you think it has influenced your perspective?',
      'That\'s wonderful insight. What would you like to remember most about this experience?',
      'Thank you for sharing that. What lessons or insights do you take from this day?',
      'I appreciate you opening up about this. How do you think this experience has shaped your understanding of yourself?',
      'That\'s really insightful. What would you tell someone else who might be going through a similar experience?',
      'I love how you described that. What other details about this moment stand out to you?',
      'Your words paint such a vivid picture. How do you think this experience will influence your future choices?',
      'That\'s a profound observation. What other thoughts or feelings came up for you during this time?',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Export singleton instance
export const apiService = new ApiService();
