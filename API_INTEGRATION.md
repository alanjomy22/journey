# API Integration Documentation

## Overview

This document describes the API integration implemented in the Journey app for image analysis and chat functionality.

## Features Implemented

### 1. Image Description API
- **Endpoint**: `POST /descriptions/base64`
- **Base URL**: `https://2a86add2dee8.ngrok-free.app`
- **Purpose**: Analyzes uploaded images and returns descriptions

### 2. Chat API
- **Endpoint**: `POST /journal/chat`
- **Base URL**: `https://2a86add2dee8.ngrok-free.app`
- **Purpose**: Generates AI responses based on user messages and image context

## File Structure

```
services/
├── api.ts                 # API service class and configuration
utils/
├── imageUtils.ts          # Image conversion utilities
hooks/
├── useImageDescription.ts # Hook for image description API
├── useChat.ts            # Hook for chat API
├── index.ts              # Hook exports
## How It Works

### 1. When User Enters Chatbot Screen

1. **When you enter a chatbot screen:**
   - A unique session ID is generated for the conversation
   - The dummy image is automatically converted to base64
   - Sent to your API at `https://2a86add2dee8.ngrok-free.app/descriptions/base64`
   - The description is used with the initial message "I want to write a journal about this image"
   - Sent to `/journal/chat` to generate the first AI question
   - Text appears with the same streaming animation as before

### 2. During Chat Conversation

1. **User Input**: User types a message
2. **Context**: The message is sent to the chat API along with the image description as context
4. **Display**: The response is shown with streaming text animation

## API Request/Response Examples

### Image Description API

**Request:**
```json
{
  "media_type": "image",
  "base64_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
  "content_type": "image/jpeg"
}
```

**Response:**
```json
{
  "description": "A beautiful sunset over mountains with a person sitting peacefully"
}
```

### Chat API

**Request:**
```json
{
  "description": "A beautiful sunset over mountains with a person sitting peacefully",
  "session_id": "session_1234567890_abc123",
  "input_message": "I felt really peaceful in that moment"
}
```

**Response:**
```json
{
  "type": "question",
  "content": "That sounds like a meaningful moment. What was it about the sunset that made you feel so peaceful?"
}
```

## Error Handling

- **Network Errors**: Graceful fallback to dummy responses
- **API Failures**: Console logging with user-friendly error messages
- **Image Processing Errors**: Fallback descriptions provided

## Configuration

The API configuration can be modified in `services/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://2a86add2dee8.ngrok-free.app',
  ENDPOINTS: {
    IMAGE_DESCRIPTION: '/descriptions/base64',
    CHAT: '/journal/chat',
  },
};
```

## Next Steps

1. **Add Loading States**: The loading states are already captured but not displayed in UI
2. **Enhanced Error Handling**: Add user-facing error messages and retry mechanisms
3. **Session Persistence**: Consider persisting session IDs across app restarts
4. **Caching**: Consider caching image descriptions to avoid repeated API calls

## Testing

To test the integration:

1. Navigate to any journal entry
2. Tap on the entry to open the insights/chat screen
3. The app will automatically analyze the image and generate an AI question
4. Type responses to continue the conversation

The integration includes comprehensive error handling, so it will work even if the API is unavailable by falling back to the original dummy responses.
