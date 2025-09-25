import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

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
      
      // Create new recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
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

      // Stop any existing playback
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Load and play the recording
      const { sound } = await Audio.Sound.createAsync(
        { uri: state.recordingUri },
        { shouldPlay: true }
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

      // Read the file as binary data
      const audioBase64 = await FileSystem.readAsStringAsync(uriToTranscribe, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('📄 Audio base64 length:', audioBase64.length);

      // Upload audio to AssemblyAI using FormData
      console.log('📤 Uploading audio to AssemblyAI...');
      
      // Create a blob from base64
      const response = await fetch(`data:audio/m4a;base64,${audioBase64}`);
      const audioBlob = await response.blob();

      const uploadResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY,
        },
        body: audioBlob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      const audioUrl = uploadData.upload_url;

      console.log('✅ Audio uploaded successfully. URL:', audioUrl);

      // Request transcription
      console.log('📝 Requesting transcription...');
      const transcriptResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
        method: 'POST',
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          language_detection: true,
        }),
      });

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
        
        const statusResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`, {
          headers: {
            'Authorization': ASSEMBLYAI_API_KEY,
          },
        });

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
          throw new Error(`Transcription failed: ${statusData.error}`);
        }
        
        attempts++;
        console.log(`🔄 Transcription in progress... (${attempts}/${maxAttempts})`);
      }

      throw new Error('Transcription timed out');
    } catch (error) {
      console.error('❌ Transcription failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isTranscribing: false 
      }));
      return null;
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
