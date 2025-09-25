import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockJournalEntries } from '@/constants/mockData';
import { useImageDescription, useChat, useAudioRecording } from '@/hooks';
import { Image } from 'expo-image';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RemixIcon from 'react-native-remix-icon';

interface ChatMessage {
  id: string;
  text?: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'image' | 'audio' | 'file';
  imageUri?: string;
  audioUri?: string;
  fileName?: string;
  fileSize?: string;
  audioDuration?: string;
  isStreaming?: boolean;
  isPlaying?: boolean;
  responseAudioUrl?: string; // For bot response audio files
  shouldAutoPlay?: boolean; // Flag to auto-play audio responses
}

export default function InsightDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [imageDescription, setImageDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentResponseAudio, setCurrentResponseAudio] = useState<Audio.Sound | null>(null);
  
  // API hooks
  const { getDescription, loading: descriptionLoading, error: descriptionError } = useImageDescription();
  const { sendMessage, loading: chatLoading, error: chatError } = useChat();
  const {
    isRecording,
    isPlaying,
    isTranscribing,
    recordingUri,
    duration,
    error: audioError,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    transcribeAudio,
    clearRecording,
    resetError: resetAudioError,
  } = useAudioRecording();

  // Find the journal entry
  const entry = mockJournalEntries.find(e => e.id === id);

  // Function to play response audio
  const playResponseAudio = async (audioUrl: string) => {
    try {
      console.log('🔊 Playing response audio:', audioUrl);
      
      // Configure audio session to use speaker
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Stop any currently playing response audio
      if (currentResponseAudio) {
        await currentResponseAudio.unloadAsync();
      }
      
      // Load and play the new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: true,
          // Force speaker output on iOS
          volume: 1.0,
        }
      );
      
      setCurrentResponseAudio(sound);
      
      // Set up completion listener
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('✅ Response audio finished playing');
          setCurrentResponseAudio(null);
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to play response audio:', error);
    }
  };

  // Function to play audio messages in chat
  const playAudioMessage = async (audioUri: string, messageId: string) => {
    try {
      console.log('🔊 Playing audio message:', audioUri);
      
      // Configure audio session to use speaker
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Stop any currently playing response audio
      if (currentResponseAudio) {
        await currentResponseAudio.unloadAsync();
      }
      
      // Update message state to show playing
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isPlaying: true }
            : { ...msg, isPlaying: false }
        )
      );
      
      // Load and play the audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { 
          shouldPlay: true,
          volume: 1.0,
        }
      );
      
      setCurrentResponseAudio(sound);
      
      // Set up completion listener
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('✅ Audio message finished playing');
          setCurrentResponseAudio(null);
          // Update message state to show not playing
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, isPlaying: false }
                : msg
            )
          );
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to play audio message:', error);
      // Reset playing state on error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isPlaying: false }
            : msg
        )
      );
    }
  };

  // Function to stop audio message playback
  const stopAudioMessage = async (messageId: string) => {
    try {
      if (currentResponseAudio) {
        await currentResponseAudio.unloadAsync();
        setCurrentResponseAudio(null);
      }
      
      // Update message state to show not playing
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isPlaying: false }
            : msg
        )
      );
    } catch (error) {
      console.error('❌ Failed to stop audio message:', error);
    }
  };

  const addStreamingBotMessage = (fullText: string, audioUrl?: string, shouldAutoPlay: boolean = false) => {
    const messageId = Date.now().toString();
    
    // Add empty streaming message
    const streamingMessage: ChatMessage = {
      id: messageId,
      text: '',
      type: 'text',
      isUser: false,
      timestamp: new Date(),
      isStreaming: true,
      responseAudioUrl: audioUrl,
      shouldAutoPlay,
    };
    
    setMessages(prev => [...prev, streamingMessage]);
    
    // Split text into words for streaming effect
    const words = fullText.split(' ');
    let currentText = '';
    
    words.forEach((word, index) => {
      setTimeout(() => {
        currentText += (index === 0 ? '' : ' ') + word;
        const isLastWord = index === words.length - 1;
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: currentText, isStreaming: !isLastWord }
              : msg
          )
        );
        
        // Auto-play audio when streaming is complete
        if (isLastWord && shouldAutoPlay && audioUrl) {
          setTimeout(() => {
            playResponseAudio(audioUrl);
          }, 500); // Small delay after text completion
        }
        
        // Scroll to bottom after each word
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
      }, index * 100 + Math.random() * 100); // Random delay for more natural effect
    });
  };

  useEffect(() => {
    const handleInitialImageAnalysis = async (imageUri: string) => {
      setIsAnalyzing(true);
      
      // Generate a unique session ID for this conversation
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      try {
        // Get image description from API
        const description = await getDescription(imageUri);
        setImageDescription(description);
        
        // Generate chat response based on the description
        const chatResponse = await sendMessage('I want to write a journal about this image', description, newSessionId);
        
        // Add bot's streaming response
        setTimeout(() => {
          addStreamingBotMessage(chatResponse.content, chatResponse.audio_file, false);
          setIsAnalyzing(false);
        }, 1000);
      } catch (error) {
        console.error('Error in initial image analysis:', error);
        setIsAnalyzing(false);
        // Fallback to original behavior
        setTimeout(() => {
          addStreamingBotMessage(generateImageResponse(), undefined, false);
        }, 1000);
      }
    };

    if (entry) {
      // Initialize with user's image
      const initialMessages: ChatMessage[] = [
        {
          id: '1',
          type: 'image',
          imageUri: entry.image,
          isUser: true,
          timestamp: new Date(Date.now() - 60000), // 1 minute ago
        }
      ];
      setMessages(initialMessages);
      
      // Get image description from API and then generate chat response
      handleInitialImageAnalysis(entry.image);
    }
  }, [entry, getDescription, sendMessage]);

  // Show API errors if any
  useEffect(() => {
    if (descriptionError) {
      console.warn('Image description error:', descriptionError);
    }
    if (chatError) {
      console.warn('Chat error:', chatError);
    }
    if (audioError) {
      console.warn('Audio error:', audioError);
      Alert.alert('Audio Error', audioError);
      resetAudioError();
    }
  }, [descriptionError, chatError, audioError, resetAudioError]);


  // Helper function to format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateImageResponse = (): string => {
    const responses = [
      'What a beautiful moment you captured! I can see there\'s something special about this scene. Can you tell me what you were feeling when you took this photo?',
      'This image speaks volumes about your experience. What drew you to capture this particular moment? What was going through your mind?',
      'I love how this photo captures the essence of your day. What made this moment worth preserving? What story does it tell about your journey?',
      'There\'s something magical about this scene you\'ve shared. What emotions were you experiencing in this moment? How did it make you feel?',
      'I notice the colors and lighting in this photo - they seem to reflect a particular mood. What was the atmosphere like when you captured this?',
      'This moment looks peaceful/exciting/meaningful. What led up to this moment? What happened just before you took this photo?',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateRandomQuestions = (): string[] => {
    const questionBank = [
      'What was the highlight of this day for you?',
      'If you could relive one moment from this day, which would it be and why?',
      'What emotions dominated your experience today?',
      'How did this day change your perspective on something?',
      'What would you tell your past self about this experience?',
      'What lessons did you learn from today?',
      'How did the people around you influence your day?',
      'What surprised you most about this experience?',
      'If you had to describe this day in three words, what would they be?',
      'What would you want to remember about this day in 10 years?',
      'How did this day align with or challenge your expectations?',
      'What feelings are you carrying forward from this experience?',
      'What made this moment worth capturing and preserving?',
      'How did your environment or surroundings affect your mood?',
      'What story does this day tell about who you are becoming?',
    ];
    
    // Return 3-5 random questions
    const shuffled = questionBank.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3 + Math.floor(Math.random() * 3));
  };

  const generateBotResponse = async (userInput: string, isAudioInput: boolean = false): Promise<{text: string, audioUrl?: string}> => {
    try {
      // Use the chat API with the image description and session ID
      const response = await sendMessage(userInput, imageDescription, sessionId);
      
      // Handle new response format with audio_file
      return {
        text: response.content,
        audioUrl: response.audio_file
      };
    } catch (error) {
      console.error('Error generating bot response:', error);
      // Fallback to original logic
      const contextualResponses = [
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
      
      // Sometimes ask random questions to deepen the conversation
      if (Math.random() < 0.3) {
        const randomQuestions = generateRandomQuestions();
        return { text: randomQuestions[0] };
      }
      
      return { text: contextualResponses[Math.floor(Math.random() * contextualResponses.length)] };
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: inputText.trim(),
        type: 'text',
        isUser: true,
        timestamp: new Date(),
      };

      const messageText = inputText.trim();
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      
      // Add bot response with streaming effect
      setTimeout(async () => {
        try {
          const botResponse = await generateBotResponse(messageText, false);
          addStreamingBotMessage(botResponse.text, botResponse.audioUrl, false);
        } catch (error) {
          console.error('Error generating response:', error);
          addStreamingBotMessage('I\'m having trouble processing that right now. Could you try rephrasing your message?', undefined, false);
        }
      }, 500 + Math.random() * 1000);
    }
  };

  const handleAudioPress = async () => {
    if (isRecording) {
      // Stop recording and get the URI directly
      await stopRecording();
    } else {
      // Start recording
      await startRecording();
    }
  };

  // Handle transcription when recording stops and URI is available
  useEffect(() => {
    const handleRecordingComplete = async () => {
      if (!isRecording && recordingUri && !isTranscribing) {
        console.log('🎤 Recording completed, starting transcription...', recordingUri);
        
        // First, add the audio message to chat
        const audioMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'audio',
          audioUri: recordingUri,
          audioDuration: formatDuration(duration),
          isUser: true,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, audioMessage]);
        
        // Start transcription
        const transcribedText = await transcribeAudio(recordingUri);
        
        if (transcribedText) {
          console.log('✅ Transcription completed:', transcribedText);
          
          // Update the audio message with transcribed text
          setMessages(prev => 
            prev.map(msg => 
              msg.id === audioMessage.id 
                ? { ...msg, text: transcribedText }
                : msg
            )
          );
          
          // Send transcribed text to chat API
          setTimeout(async () => {
            try {
              const botResponse = await generateBotResponse(transcribedText, true);
              // Auto-play audio for responses to audio input
              addStreamingBotMessage(botResponse.text, botResponse.audioUrl, true);
            } catch (error) {
              console.error('Error generating response:', error);
              addStreamingBotMessage('I heard your message but I\'m having trouble processing it right now. Could you try again?', undefined, false);
            }
          }, 500);
        } else {
          console.error('❌ Transcription failed');
          Alert.alert('Transcription Failed', 'Could not transcribe your audio. Please try recording again.');
          
          // Remove the failed audio message
          setMessages(prev => prev.filter(msg => msg.id !== audioMessage.id));
        }
        
        // Clear the recording after processing
        clearRecording();
      }
    };

    handleRecordingComplete();
  }, [isRecording, recordingUri, isTranscribing, duration, transcribeAudio, clearRecording]);

  if (!entry) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Entry not found</ThemedText>
      </ThemedView>
    );
  }

  const handleImagePicker = async (source: 'camera' | 'gallery') => {
    try {
      let result;
      
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Gallery permission is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const imageMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'image',
          imageUri: result.assets[0].uri,
          isUser: true,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, imageMessage]);
        
        // Bot responds to image
        setTimeout(() => {
          addStreamingBotMessage('What a wonderful image! This adds so much context to your story. What was happening when you took this photo? What emotions does it bring back?');
        }, 1000);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleFileUpload = () => {
    // Simulate file upload since expo-document-picker isn't available
    const fileTypes = ['Document.pdf', 'Notes.txt', 'Thoughts.docx', 'Reflection.md'];
    const randomFile = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    
    const fileMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'file',
      fileName: randomFile,
      fileSize: (Math.random() * 5 + 0.5).toFixed(1) + ' MB',
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, fileMessage]);
    
    // Bot responds to file
    setTimeout(() => {
      addStreamingBotMessage('Thanks for sharing that document! It looks like you\'ve put some thought into this. What inspired you to create this file? What key insights does it contain?');
    }, 1000);
  };

  const handleAttachmentPress = () => {
    Alert.alert(
      'Share Content',
      'What would you like to share?',
      [
        { text: 'Take Photo', onPress: () => handleImagePicker('camera') },
        { text: 'Choose Photo', onPress: () => handleImagePicker('gallery') },
        { text: 'Upload File', onPress: handleFileUpload },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.botMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.botBubble,
        item.type === 'image' && styles.imageBubble
      ]}>
        {item.type === 'image' && item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.messageImage}
            contentFit="cover"
          />
        ) : item.type === 'audio' ? (
          <View style={styles.audioMessageContainer}>
            <TouchableOpacity 
              style={styles.audioMessage}
              onPress={async () => {
                if (item.audioUri) {
                  if (item.isPlaying) {
                    await stopAudioMessage(item.id);
                  } else {
                    await playAudioMessage(item.audioUri, item.id);
                  }
                }
              }}
            >
              <RemixIcon 
                name={item.isPlaying ? "pause-circle-fill" : "play-circle-fill"} 
                size={24} 
                color={item.isUser ? "#FFFFFF" : "#007AFF"} 
              />
              <ThemedText style={[styles.audioText, item.isUser ? styles.userText : styles.botText]}>
                {item.audioDuration || '0:00'}
              </ThemedText>
              <View style={styles.waveform}>
                {Array.from({ length: 12 }, (_, i) => (
                  <View 
                    key={i}
                    style={[
                      styles.waveformBar,
                      { 
                        height: 4 + Math.random() * 16,
                        backgroundColor: item.isUser ? 'rgba(255,255,255,0.7)' : '#007AFF'
                      }
                    ]} 
                  />
                ))}
              </View>
            </TouchableOpacity>
            {/* Show transcribed text if available */}
            {item.text && (
              <View style={styles.transcriptionContainer}>
                <ThemedText style={[styles.transcriptionText, item.isUser ? styles.userText : styles.botText]}>
                  &ldquo;{item.text}&rdquo;
                </ThemedText>
              </View>
            )}
          </View>
        ) : item.type === 'file' ? (
          <TouchableOpacity style={styles.fileMessage}>
            <View style={styles.fileIcon}>
              <RemixIcon name="file-text-line" size={24} color={item.isUser ? "#FFFFFF" : "#007AFF"} />
            </View>
            <View style={styles.fileContent}>
              <ThemedText style={[styles.fileName, item.isUser ? styles.userText : styles.botText]}>
                {item.fileName || 'Document'}
              </ThemedText>
              <ThemedText style={[styles.fileSize, item.isUser ? styles.userText : styles.botText]}>
                {item.fileSize || '1.2 MB'}
              </ThemedText>
            </View>
            <RemixIcon name="download-line" size={20} color={item.isUser ? "#FFFFFF" : "#007AFF"} />
          </TouchableOpacity>
        ) : (
          <View style={styles.textMessageContainer}>
            <ThemedText style={[
              styles.messageText,
              item.isUser ? styles.userText : styles.botText
            ]}>
              {item.text}
            </ThemedText>
            {item.isStreaming && (
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            )}
          </View>
        )}
        
        {/* Timestamp */}
        <ThemedText style={[
          styles.timestamp,
          item.isUser ? styles.userTimestamp : styles.botTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <RemixIcon name="arrow-left-line" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
            {entry.day} Insights
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {entry.date}
          </ThemedText>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Journal Entry Preview */}
      <View style={styles.entryPreview}>
        <Image
          source={{ uri: entry.image }}
          style={styles.previewImage}
          contentFit="cover"
        />
        <View style={styles.previewContent}>
          <ThemedText style={styles.previewText}>
            {entry.preview}
          </ThemedText>
        </View>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Recording Status */}
      {isRecording && (
        <View style={styles.recordingStatus}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <ThemedText style={styles.recordingText}>
              Recording... {formatDuration(duration)}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Transcription Status */}
      {isTranscribing && (
        <View style={styles.transcriptionStatus}>
          <ThemedText style={styles.transcriptionStatusText}>
            🎤 Transcribing audio...
          </ThemedText>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={handleAttachmentPress}
          >
            <RemixIcon name="attachment-line" size={24} color="#8E8E93" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Share your thoughts..."
            placeholderTextColor="#8E8E93"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          
          {inputText.trim() ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <RemixIcon name="send-plane-fill" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : isTranscribing ? (
            <TouchableOpacity
              style={[styles.audioButton, { backgroundColor: '#FFF3CD' }]}
              disabled={true}
            >
              <RemixIcon 
                name="loader-4-line" 
                size={20} 
                color="#856404" 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.audioButton, isRecording && styles.audioButtonRecording]}
              onPress={handleAudioPress}
              disabled={isTranscribing}
            >
              <RemixIcon 
                name={isRecording ? "stop-circle-fill" : "mic-fill"} 
                size={20} 
                color={isRecording ? "#FF3B30" : "#8E8E93"} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  entryPreview: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  chatContainer: {
    flex: 1,
    marginTop: 16,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    position: 'relative',
  },
  imageBubble: {
    padding: 4,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minWidth: 200,
  },
  audioContent: {
    flex: 1,
    marginLeft: 12,
  },
  audioText: {
    fontSize: 14,
    fontWeight: '500',
  },
  audioDuration: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 2,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 2,
  },
  userAudioWaveform: {
    opacity: 0.8,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minWidth: 180,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileContent: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  textMessageContainer: {
    position: 'relative',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTimestamp: {
    color: '#999',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    marginHorizontal: 1,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 50,
    maxHeight: 100,
  },
  attachmentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 80,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#e9ecef',
  },
  audioButtonRecording: {
    backgroundColor: '#FFE5E5',
  },
  audioMessageContainer: {
    width: '100%',
  },
  transcriptionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  transcriptionText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  recordingStatus: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  transcriptionStatus: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  transcriptionStatusText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
