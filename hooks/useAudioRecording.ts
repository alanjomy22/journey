import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useRef, useState } from 'react';

// AssemblyAI Configuration
const ASSEMBLYAI_API_KEY = '218d0d095bf441b0bb44bb8688e518d5';
const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';

interface AudioRecordingState {
  isRecording: boolean;
  isPlaying: boolean;
  isTranscribing: boolean;
  recordingUri: string | null;
  transcription: string | null;
  duration: number;
  error: string | null;
}

interface UseAudioRecordingReturn extends AudioRecordingState {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  playRecording: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  transcribeAudio: (audioUri?: string) => Promise<string | null>;
  clearRecording: () => void;
  resetError: () => void;
}

/**
 * Custom hook for audio recording, playback, and transcription using AssemblyAI
 */
export function useAudioRecording(): UseAudioRecordingReturn {
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isPlaying: false,
    isTranscribing: false,
    recordingUri: null,
    transcription: null,
    duration: 0,
    error: null,
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize audio mode
  const initializeAudio = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('🎵 Failed to initialize audio:', error);
      setState(prev => ({ ...prev, error: 'Failed to initialize audio permissions' }));
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Starting audio recording...');

      await initializeAudio();

      // Create new recording with specific options for better compatibility
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      recordingRef.current = recording;

      setState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
        error: null,
        recordingUri: null,
        transcription: null
      }));

      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      console.log('✅ Recording started successfully');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to start recording. Please check microphone permissions.',
        isRecording: false
      }));
    }
  }, [initializeAudio]);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<void> => {
    try {
      console.log('🛑 Stopping audio recording...');

      if (!recordingRef.current) {
        throw new Error('No active recording found');
      }

      // Clear duration timer
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }

      // Stop and get URI
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      recordingRef.current = null;

      setState(prev => ({
        ...prev,
        isRecording: false,
        recordingUri: uri
      }));

      console.log('✅ Recording stopped. URI:', uri);
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to stop recording',
        isRecording: false
      }));
    }
  }, []);

  // Play recording
  const playRecording = useCallback(async () => {
    try {
      if (!state.recordingUri) {
        throw new Error('No recording available to play');
      }

      console.log('▶️ Playing audio recording...');

      // Configure audio session to use speaker
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Stop any existing playback
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Load and play the recording
      const { sound } = await Audio.Sound.createAsync(
        { uri: state.recordingUri },
        {
          shouldPlay: true,
          volume: 1.0,
        }
      );

      soundRef.current = sound;

      setState(prev => ({ ...prev, isPlaying: true }));

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          setState(prev => ({ ...prev, isPlaying: false }));
        }
      });

      console.log('✅ Playback started');
    } catch (error) {
      console.error('❌ Failed to play recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to play recording',
        isPlaying: false
      }));
    }
  }, [state.recordingUri]);

  // Stop playback
  const stopPlayback = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        setState(prev => ({ ...prev, isPlaying: false }));
        console.log('⏹️ Playback stopped');
      }
    } catch (error) {
      console.error('❌ Failed to stop playback:', error);
    }
  }, []);

  // Upload audio to AssemblyAI and get transcription
  const transcribeAudio = useCallback(async (audioUri?: string): Promise<string | null> => {
    const uriToTranscribe = audioUri || state.recordingUri;

    if (!uriToTranscribe) {
      setState(prev => ({ ...prev, error: 'No audio file available for transcription' }));
      return null;
    }

    setState(prev => ({ ...prev, isTranscribing: true, error: null }));

    try {
      console.log('🚀 Starting audio transcription with AssemblyAI...');

      // Read audio file info
      const audioInfo = await FileSystem.getInfoAsync(uriToTranscribe);
      console.log('📁 Audio file info:', audioInfo);

      // Check if file exists and has content
      if (!audioInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      if (audioInfo.size === 0) {
        throw new Error('Audio file is empty');
      }

      console.log('📊 Audio file size:', audioInfo.size, 'bytes');

      // Read the file as binary data
      const audioBase64 = await FileSystem.readAsStringAsync(uriToTranscribe, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('📄 Audio base64 length:', audioBase64.length);

      // Validate base64 data
      if (!audioBase64 || audioBase64.length === 0) {
        throw new Error('Failed to read audio file as base64');
      }

      // Upload audio to AssemblyAI using base64
      console.log('📤 Uploading audio to AssemblyAI...');

      // Convert base64 to binary data
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log('🔢 Binary data size:', bytes.length, 'bytes');
      console.log('📊 First few bytes:', Array.from(bytes.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Retry logic for network requests
      let uploadResponse;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          uploadResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': ASSEMBLYAI_API_KEY,
              'Content-Type': 'application/octet-stream',
            },
            body: bytes,
            signal: controller.signal,
          });
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw error; // Re-throw if max retries reached
          }
          console.log(`🔄 Upload retry ${retryCount}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
      }

      clearTimeout(timeoutId);

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      const audioUrl = uploadData.upload_url;

      console.log('✅ Audio uploaded successfully. URL:', audioUrl);

      // Request transcription
      console.log('📝 Requesting transcription...');
      const transcriptController = new AbortController();
      const transcriptTimeoutId = setTimeout(() => transcriptController.abort(), 15000); // 15 second timeout

      // Retry logic for transcription request
      let transcriptResponse;
      let transcriptRetryCount = 0;
      const maxTranscriptRetries = 3;

      while (transcriptRetryCount < maxTranscriptRetries) {
        try {
          transcriptResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
            method: 'POST',
            headers: {
              'Authorization': ASSEMBLYAI_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audio_url: audioUrl,
              language_detection: true,
            }),
            signal: transcriptController.signal,
          });
          break; // Success, exit retry loop
        } catch (error) {
          transcriptRetryCount++;
          if (transcriptRetryCount >= maxTranscriptRetries) {
            throw error; // Re-throw if max retries reached
          }
          console.log(`🔄 Transcription request retry ${transcriptRetryCount}/${maxTranscriptRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * transcriptRetryCount)); // Exponential backoff
        }
      }

      clearTimeout(transcriptTimeoutId);

      if (!transcriptResponse.ok) {
        throw new Error(`Transcription request failed: ${transcriptResponse.status}`);
      }

      const transcriptData = await transcriptResponse.json();
      const transcriptId = transcriptData.id;

      console.log('🔄 Polling for transcription completion...');

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        // Retry logic for status check
        let statusResponse;
        let statusRetryCount = 0;
        const maxStatusRetries = 3;

        while (statusRetryCount < maxStatusRetries) {
          try {
            statusResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`, {
              headers: {
                'Authorization': ASSEMBLYAI_API_KEY,
              },
            });
            break; // Success, exit retry loop
          } catch (error) {
            statusRetryCount++;
            if (statusRetryCount >= maxStatusRetries) {
              throw error; // Re-throw if max retries reached
            }
            console.log(`🔄 Status check retry ${statusRetryCount}/${maxStatusRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * statusRetryCount)); // Exponential backoff
          }
        }

        if (!statusResponse.ok) {
          throw new Error(`Status check failed: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          const transcriptionText = statusData.text || '';
          console.log('✅ Transcription completed:', transcriptionText);

          setState(prev => ({
            ...prev,
            transcription: transcriptionText,
            isTranscribing: false
          }));

          return transcriptionText;
        } else if (statusData.status === 'error') {
          console.error('❌ AssemblyAI transcription error:', statusData.error);

          // Handle specific error types
          if (statusData.error && statusData.error.includes('Transcoding failed')) {
            throw new Error('Audio file format not supported. Please try recording again with a different audio quality.');
          } else if (statusData.error && statusData.error.includes('File does not appear to contain audio')) {
            throw new Error('Invalid audio file. Please try recording again.');
          } else {
            throw new Error(`Transcription failed: ${statusData.error}`);
          }
        }

        attempts++;
        console.log(`🔄 Transcription in progress... (${attempts}/${maxAttempts})`);
      }

      throw new Error('Transcription timed out');
    } catch (error) {
      console.error('❌ Transcription failed:', error);

      // Provide more specific error messages based on error type
      let errorMessage = 'Transcription failed';
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error instanceof Error) {
        if (error.message.includes('Upload failed')) {
          errorMessage = 'Failed to upload audio. Please try recording again.';
        } else if (error.message.includes('Transcription request failed')) {
          errorMessage = 'Transcription service unavailable. Please try again later.';
        } else if (error.message.includes('timed out') || error.name === 'AbortError') {
          errorMessage = 'Transcription is taking longer than expected. Please try again.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error occurred. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isTranscribing: false
      }));

      // Return a fallback message instead of null to keep the conversation flowing
      return 'I heard your audio message but had trouble transcribing it. Could you please type your message instead?';
    }
  }, [state.recordingUri]);

  // Clear recording
  const clearRecording = useCallback(() => {
    setState(prev => ({
      ...prev,
      recordingUri: null,
      transcription: null,
      duration: 0,
      error: null
    }));
  }, []);

  // Reset error
  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    transcribeAudio,
    clearRecording,
    resetError,
  };
}
