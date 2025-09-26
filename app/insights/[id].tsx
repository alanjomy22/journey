import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAudioRecording, useChat, useImageDescription } from '@/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
  base64Data?: string;
  responseAudioUrl?: string; // For bot response audio files
  shouldAutoPlay?: boolean; // Flag to auto-play audio responses
  showInput?: boolean; // Flag to show input after this message
  inputText?: string; // Text in the input for this message
}

interface JournalEntry {
  id: string;
  image: string;
  base64Data: string;
  preview: string;
}

export default function InsightDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [imageDescription, setImageDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentResponseAudio, setCurrentResponseAudio] = useState<Audio.Sound | null>(null);
  const [isAutoRecording, setIsAutoRecording] = useState(false);
  const [autoRecordingCancelled, setAutoRecordingCancelled] = useState(false);
  const [bottomInputText, setBottomInputText] = useState('');
  const [showTranscribing, setShowTranscribing] = useState(false);
  const autoRecordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoRecordingRef = useRef(false);
  const autoRecordingCancelledRef = useRef(false);

  // Animation for listening gradient
  const gradientAnimation = useRef(new Animated.Value(0)).current;

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

  // Find the journal entry from mock data or AsyncStorage
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    const loadJournalEntry = async () => {
      // First try mock data

      // If not found in mock data, try AsyncStorage (for captured images)
      if (id) {
        try {
          const storedData = await AsyncStorage.getItem(`journal_${id}`);

          console.log('Stored data:', storedData);
          if (storedData) {
            const journalEntry = JSON.parse(storedData);
            setEntry(journalEntry);

          }
        } catch (error) {
          console.error('Error loading journal entry:', error);
        }
      }

    };

    loadJournalEntry();
  }, [id]);

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

  const addStreamingBotMessage = useCallback((fullText: string, audioUrl?: string, shouldAutoPlay: boolean = false, isFirstMessage: boolean = false) => {
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
      shouldAutoPlay
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

        // Start auto-recording after first bot message completes
        if (isLastWord && isFirstMessage) {
          setTimeout(() => {
            startAutoRecording();
          }, 1000); // Start recording 1 second after message completes
        }

        // Scroll to bottom after each word
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
      }, index * 100 + Math.random() * 100); // Random delay for more natural effect
    });
  }, [playResponseAudio]);

  // Function to start automatic 10-second recording
  const startAutoRecording = async () => {
    try {
      console.log('🎤 Starting auto-recording for 10 seconds...');
      setIsAutoRecording(true);
      isAutoRecordingRef.current = true;
      setAutoRecordingCancelled(false);
      autoRecordingCancelledRef.current = false;

      // Start gradient animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();

      await startRecording();

      // Stop recording after 10 seconds and process transcription
      autoRecordingTimerRef.current = setTimeout(async () => {
        console.log('⏰ 10 seconds elapsed, stopping auto-recording...');
        console.log('⏰ Current state - isAutoRecording:', isAutoRecordingRef.current, 'autoRecordingCancelled:', autoRecordingCancelledRef.current);

        // Check if recording was cancelled
        if (autoRecordingCancelledRef.current) {
          console.log('⏭️ Auto-recording was cancelled, skipping stop');
          return;
        }

        try {
          // Always try to stop recording after 10 seconds
          await stopRecording();
          console.log('✅ Auto-recording completed, will process transcription');

          // Stop gradient animation
          gradientAnimation.stopAnimation();
          gradientAnimation.setValue(0);

          setIsAutoRecording(false);
          isAutoRecordingRef.current = false;
          autoRecordingTimerRef.current = null;
        } catch (error) {
          console.error('Error stopping auto-recording:', error);
          setIsAutoRecording(false);
          isAutoRecordingRef.current = false;
          autoRecordingTimerRef.current = null;
        }
      }, 10000);
    } catch (error) {
      console.error('Failed to start auto recording:', error);
      setIsAutoRecording(false);
      isAutoRecordingRef.current = false;
      setAutoRecordingCancelled(false);
      autoRecordingCancelledRef.current = false;
    }
  };

  // Function to cancel auto-recording when user starts typing (without transcription)
  const cancelAutoRecording = async () => {
    console.log('✋ cancelAutoRecording called. isAutoRecording:', isAutoRecordingRef.current, 'isRecording:', isRecording, 'hasTimer:', !!autoRecordingTimerRef.current);

    if (isAutoRecordingRef.current || autoRecordingTimerRef.current || isRecording) {
      console.log('✋ Cancelling auto-recording due to user typing...');
      setAutoRecordingCancelled(true);
      autoRecordingCancelledRef.current = true;

      // Clear the timer first
      if (autoRecordingTimerRef.current) {
        clearTimeout(autoRecordingTimerRef.current);
        autoRecordingTimerRef.current = null;
        console.log('✅ Timer cleared');
      }

      // Stop recording if it's active
      if (isRecording) {
        try {
          await stopRecording();
          console.log('✅ Recording stopped due to user input');
        } catch (error) {
          console.error('Error stopping recording:', error);
        }
      }

      // Stop gradient animation
      gradientAnimation.stopAnimation();
      gradientAnimation.setValue(0);

      // Clear recording without processing to prevent transcription
      setTimeout(() => {
        clearRecording();
        setAutoRecordingCancelled(false);
        autoRecordingCancelledRef.current = false;
        console.log('✅ Recording cleared');
      }, 300);

      setIsAutoRecording(false);
      isAutoRecordingRef.current = false;
    } else {
      console.log('ℹ️ No auto-recording to cancel');
    }
  };

  useEffect(() => {
    const handleInitialImageAnalysis = async (base64Data: string) => {
      setIsAnalyzing(true);

      // Generate a unique session ID for this conversation
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);

      // Store the session ID for access from other pages
      const { sessionStorage } = await import('@/utils/sessionStorage');
      await sessionStorage.setSessionId(newSessionId);

      try {
        // Get image description from API
        const description = await getDescription(base64Data);
        setImageDescription(description);

        // Generate chat response based on the description
        const chatResponse = await sendMessage('I want to write a journal about this image', description, newSessionId);

        // Add bot's streaming response
        setTimeout(() => {
          addStreamingBotMessage(chatResponse.content, chatResponse.audio_file, false, true); // Mark as first message
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
          base64Data: entry.base64Data,
        }
      ];
      setMessages(initialMessages);

      // Get image description from API and then generate chat response
      handleInitialImageAnalysis(entry.base64Data);
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

  const generateBotResponse = useCallback(async (userInput: string, isAudioInput: boolean = false): Promise<{ text: string, audioUrl?: string }> => {
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
  }, [sendMessage, imageDescription, sessionId]);


  // Handle transcription when recording stops and URI is available
  useEffect(() => {
    const handleRecordingComplete = async () => {
      if (!isRecording && recordingUri && !isTranscribing) {
        console.log('🎤 Recording completed, starting transcription...', recordingUri);

        // Skip transcription if this was auto-recording that was cancelled by typing
        if (autoRecordingCancelledRef.current) {
          console.log('⏭️ Skipping transcription for cancelled auto-recording');
          clearRecording();
          setAutoRecordingCancelled(false);
          autoRecordingCancelledRef.current = false;
          return;
        }

        // Show transcribing status
        setShowTranscribing(true);

        // Skip adding audio message, go directly to transcription
        // Start transcription
        const transcribedText = await transcribeAudio(recordingUri);

        // Hide transcribing status
        setShowTranscribing(false);

        if (transcribedText) {
          console.log('✅ Transcription completed:', transcribedText);

          // Add transcribed text as a user message
          const transcribedMessage: ChatMessage = {
            id: Date.now().toString(),
            text: transcribedText,
            type: 'text',
            isUser: true,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, transcribedMessage]);

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
        }

        // Clear the recording after processing
        clearRecording();
      }
    };

    handleRecordingComplete();
  }, [isRecording, recordingUri, isTranscribing, duration, transcribeAudio, clearRecording, autoRecordingCancelled, generateBotResponse, addStreamingBotMessage]);

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


  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => (
    <View style={styles.simpleMessageContainer}>
      {/* Audio controls at the top of the message if it's an audio message */}
      {item.type === 'audio' && item.audioUri && (
        <View style={styles.audioControlsContainer}>
          <TouchableOpacity
            style={styles.audioPlayButton}
            onPress={async () => {
              if (item.isPlaying) {
                await stopAudioMessage(item.id);
              } else {
                await playAudioMessage(item.audioUri!, item.id);
              }
            }}
          >
            <RemixIcon
              name={item.isPlaying ? "pause-circle-fill" : "play-circle-fill"}
              size={28}
              color="#007AFF"
            />
          </TouchableOpacity>
          <View style={styles.audioInfo}>
            <ThemedText style={styles.audioDurationText}>
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
                      backgroundColor: '#007AFF'
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Simple message content without card or timestamp */}
      {item.type === 'image' && item.imageUri ? (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.fullWidthMessageImage}
          contentFit="cover"
        />
      ) : item.type === 'file' ? (
        <TouchableOpacity style={styles.fileMessage}>
          <View style={styles.fileIcon}>
            <RemixIcon name="file-text-line" size={24} color="#007AFF" />
          </View>
          <View style={styles.fileContent}>
            <ThemedText style={styles.fileName}>
              {item.fileName || 'Document'}
            </ThemedText>
            <ThemedText style={styles.fileSize}>
              {item.fileSize || '1.2 MB'}
            </ThemedText>
          </View>
          <RemixIcon name="download-line" size={20} color="#007AFF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.simpleTextContainer}>
          <ThemedText style={[
            styles.simpleMessageText,
            item.isUser ? styles.userTextColor : styles.botTextColor
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
    </View>
  );

  // Handle sending message from bottom input
  const handleBottomMessageSend = async (text: string) => {
    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text,
      type: 'text',
      isUser: true,
      timestamp: new Date(),
    };

    // Add message and clear input
    setMessages(prev => [...prev, userMessage]);
    setBottomInputText('');

    // Scroll to bottom after adding message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Generate bot response
    setTimeout(async () => {
      try {
        const botResponse = await generateBotResponse(text, false);
        addStreamingBotMessage(botResponse.text, botResponse.audioUrl, false);
      } catch (error) {
        console.error('Error generating response:', error);
        addStreamingBotMessage('I\'m having trouble processing that right now. Could you try rephrasing your message?', undefined, false);
      }
    }, 500 + Math.random() * 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Top Navigation */}
      <View style={styles.topNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.back()}
        >
          <RemixIcon name="arrow-left-line" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => handleImagePicker('gallery')}
        >
          <RemixIcon name="add-line" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Messages Container - Limited to top half */}
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            // Auto-scroll to bottom when content changes
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          onLayout={() => {
            // Auto-scroll to bottom when layout changes
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          ListFooterComponent={() => (
            messages.length > 0 ? (
              <View style={styles.inputFooterContainer}>
                {/* Show transcribing message in place of input */}
                {(isTranscribing || showTranscribing) ? (
                  <View style={styles.inlineInputContainer}>
                    <ThemedText style={styles.transcribingPlaceholderText}>
                      Transcribing...
                    </ThemedText>
                  </View>
                ) : (chatLoading || descriptionLoading) ? (
                  <View style={styles.inlineInputContainer}>
                    <ThemedText style={styles.transcribingPlaceholderText}>
                      Thinking...
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.inlineInputContainer}>
                    <TextInput
                      key="chat-input" // Add key to prevent re-mounting
                      style={styles.inlineTextInput}
                      placeholder="Type your response..."
                      placeholderTextColor="#8E8E93"
                      value={bottomInputText}
                      onFocus={async () => {
                        await cancelAutoRecording();
                      }}
                      onChangeText={async (text) => {
                        if (text.length > 0) {
                          await cancelAutoRecording();
                        }
                        setBottomInputText(text);
                      }}
                      onSubmitEditing={() => {
                        if (bottomInputText.trim()) {
                          handleBottomMessageSend(bottomInputText.trim());
                        }
                      }}
                      multiline
                      maxLength={500}
                      blurOnSubmit={false}
                      returnKeyType="send"
                    />
                    {bottomInputText.trim() && (
                      <TouchableOpacity
                        style={styles.inlineSendButton}
                        onPress={() => handleBottomMessageSend(bottomInputText.trim())}
                      >
                        <RemixIcon name="send-plane-fill" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ) : null
          )}
        />
      </View>

      {/* Transcription Status - Removed from here, now shown inline */}

      {/* Animated Yellow Gradient Background when listening */}
      {(isRecording || isAutoRecording) && (
        <View style={styles.listeningOverlay}>
          <Animated.View
            style={[
              styles.animatedGradient,
              {
                opacity: gradientAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 0.9],
                }),
              },
            ]}
          />
          <View style={styles.listeningContent}>
            <ThemedText style={styles.listeningText}>
              Listening...
            </ThemedText>
          </View>
        </View>
      )}

      {/* Tick Button at Bottom Right */}
      <TouchableOpacity style={styles.tickButton}>
        <RemixIcon name="check-line" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6E3', // Cream background
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
    paddingBottom: 8, // Reduced bottom padding
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
  // New linear message styles
  linearMessageContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  audioControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  audioPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  audioInfo: {
    flex: 1,
  },
  audioDurationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  linearMessageBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userTextColor: {
    color: '#007AFF',
    fontWeight: '500',
  },
  botTextColor: {
    color: '#333',
  },
  linearTimestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FDF6E3', // Match cream background
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    minHeight: 44,
  },
  inlineTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 80,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  inlineSendButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Direct image display styles
  directImageContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  directImage: {
    width: '100%',
    height: 200,
  },
  // Simple message styles (no cards)
  simpleMessageContainer: {
    marginBottom: 4, // Further reduced gap between messages
    paddingHorizontal: 16,
  },
  simpleTextContainer: {
    paddingVertical: 8,
  },
  simpleMessageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600', // Bolder text
    color: '#2C1810', // Darker text for better contrast on cream
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  // Bottom input styles
  bottomInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    minHeight: 44,
  },
  bottomTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 80,
  },
  bottomSendButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Animated listening overlay styles
  listeningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
  },
  animatedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFD60A',
    opacity: 0.85,
  },
  listeningContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  listeningText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  // Top navigation styles
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FDF6E3',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Full width image style
  fullWidthMessageImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 8,
  },
  // Messages container - more than half but not full screen
  messagesContainer: {
    flex: 0.7, // Take up 70% of the screen
    marginTop: 16,
  },
  // Input section - remaining space
  inputSection: {
    flex: 0.3, // Take up the remaining 30%
    justifyContent: 'flex-start',
    paddingTop: 8, // Reduced padding between messages and input
  },
  // Input footer container
  inputFooterContainer: {
    marginTop: 4, // Small gap between last message and input
    paddingHorizontal: 0, // Remove horizontal padding since it's in the parent
  },
  // Transcribing placeholder text (styled like input placeholder)
  transcribingPlaceholderText: {
    flex: 1,
    fontSize: 16,
    color: '#8E8E93', // Same color as placeholder
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontStyle: 'italic', // Make it look like placeholder
  },
  // Tick button style
  tickButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});