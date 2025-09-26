import { useImagePicker } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    PanResponder,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ImageEditorScreen } from './ImageEditorScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Mode = 'write' | 'camera' | 'audio';

interface SwipeableCameraScreenProps {
  onClose?: () => void;
}

export const SwipeableCameraScreen: React.FC<SwipeableCameraScreenProps> = ({ onClose }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [activeMode, setActiveMode] = useState<Mode>('camera'); // Start on camera
  const [currentIndex, setCurrentIndex] = useState(0); // Track current position in circular array
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editorImages, setEditorImages] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const { selectedImages, pickImageFromGallery, addCapturedImage, clearImages, isPicking } = useImagePicker();

  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const minSwipeDistance = 50;
  const recordingAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Mode order: camera, audio, write (camera first as default)
  const modes: Mode[] = ['camera', 'audio', 'write'];
  const getCurrentModeIndex = () => currentIndex;

  // Circular swipe handler with modulo-based logic
  const handleIconSwipe = (direction: 'left' | 'right') => {
    let newIndex = currentIndex;
    
    if (direction === 'left') {
      // Swipe left - forward: Camera → Audio → Write → Camera...
      newIndex = (currentIndex + 1) % modes.length;
    } else if (direction === 'right') {
      // Swipe right - backward: Camera → Write → Audio → Camera...
      newIndex = (currentIndex - 1 + modes.length) % modes.length;
    }
    
    // Animate icon scale for feedback
    Animated.sequence([
      Animated.timing(iconScale, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCurrentIndex(newIndex);
    const newMode = modes[newIndex];
    setActiveMode(newMode);
    
    Animated.timing(translateX, {
      toValue: -newIndex * screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // PanResponder for icon swiping
  const iconPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderRelease: (evt, gestureState) => {
      const distance = gestureState.dx;
      const velocity = gestureState.vx;
      
      if (Math.abs(distance) > minSwipeDistance || Math.abs(velocity) > 0.5) {
        if (distance > 0 && velocity > 0) {
          // Swipe right - go to previous mode
          handleIconSwipe('right');
        } else if (distance < 0 && velocity < 0) {
          // Swipe left - go to next mode
          handleIconSwipe('left');
        }
      }
    },
  });

  // Auto-navigate to image editor when images are selected
  useEffect(() => {
    if (selectedImages.length > 0) {
      const imageUris = selectedImages.map(img => img.uri);
      setEditorImages(imageUris);
      setShowImageEditor(true);
    }
  }, [selectedImages]);

  // Cleanup recording when switching modes
  useEffect(() => {
    if (activeMode !== 'audio' && isRecording) {
      stopRecording();
    }
  }, [activeMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  const handleCloseImageEditor = () => {
    setShowImageEditor(false);
    clearImages();
  };

  const handleRemoveImageFromEditor = (index: number) => {
    setEditorImages(prev => prev.filter((_, i) => i !== index));
    if (selectedImages.length <= 1) {
      setShowImageEditor(false);
      clearImages();
    }
  };


  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    // Check camera permissions first
    if (!permission?.granted) {
      Alert.alert('Camera Permission Required', 'Please grant camera permission to take photos.');
      return;
    }

    if (!cameraRef.current || !isCameraReady) {
      Alert.alert('Camera Error', 'Camera is not ready. Please wait a moment and try again.');
      return;
    }

    if (isCapturing) {
      return; // Prevent multiple captures
    }

    try {
      setIsCapturing(true);
      
      // Small delay to ensure camera is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo && photo.uri) {
        const newImage = {
          uri: photo.uri,
          width: photo.width,
          height: photo.height,
          type: 'image' as const,
          fileName: `camera_${Date.now()}.jpg`,
          fileSize: 0,
        };

        addCapturedImage(newImage);
        console.log('Picture taken successfully:', photo.uri);
      } else {
        throw new Error('No photo data received');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Camera Error', `Failed to take picture: ${error.message || 'Unknown error'}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleGalleryPress = () => {
    pickImageFromGallery();
  };

  const handleWritePress = () => {
    Alert.alert('Write', 'Write functionality coming soon!');
  };

  const requestAudioPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setAudioPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      setAudioPermission(false);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      if (audioPermission === null) {
        const hasPermission = await requestAudioPermission();
        if (!hasPermission) {
          Alert.alert('Permission Required', 'Please grant microphone permission to record audio.');
          return;
        }
      }

      if (audioPermission === false) {
        Alert.alert('Permission Denied', 'Microphone permission is required to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Start recording animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start duration counter
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;
        
        setIsRecording(false);
        setRecordingDuration(0);

        // Stop animations
        recordingAnimation.stopAnimation();
        pulseAnimation.stopAnimation();
        recordingAnimation.setValue(0);
        pulseAnimation.setValue(1);

        // Clear interval
        if (recordingInterval.current) {
          clearInterval(recordingInterval.current);
          recordingInterval.current = null;
        }

        Alert.alert('Recording Complete', `Audio saved: ${uri}`);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleYapPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const switchToMode = (mode: Mode) => {
    const modeIndex = modes.indexOf(mode);
    
    // Animate icon scale for feedback
    Animated.sequence([
      Animated.timing(iconScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCurrentIndex(modeIndex);
    setActiveMode(mode);
    Animated.timing(translateX, {
      toValue: -modeIndex * screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      const currentTranslate = -currentIndex * screenWidth;
      // Add some resistance to make the gesture feel more natural
      const resistance = 0.3;
      translateX.setValue(currentTranslate + (gestureState.dx * resistance));
    },
    onPanResponderRelease: (evt, gestureState) => {
      const distance = gestureState.dx;
      const velocity = gestureState.vx;
      
      let newIndex = currentIndex;
      
      if (Math.abs(distance) > minSwipeDistance || Math.abs(velocity) > 0.5) {
        if (distance > 0 && velocity > 0) {
          // Swipe right - backward: Camera → Write → Audio → Camera...
          newIndex = (currentIndex - 1 + modes.length) % modes.length;
        } else if (distance < 0 && velocity < 0) {
          // Swipe left - forward: Camera → Audio → Write → Camera...
          newIndex = (currentIndex + 1) % modes.length;
        }
      }
      
      setCurrentIndex(newIndex);
      const newMode = modes[newIndex];
      setActiveMode(newMode);
      
      Animated.timing(translateX, {
        toValue: -newIndex * screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    },
  });

  const getCenterButtonIcon = () => {
    switch (activeMode) {
      case 'write':
        return 'create'; // Show write icon when write is active
      case 'camera':
        return 'camera'; // Show camera icon when camera is active
      case 'audio':
        return isRecording ? 'stop' : 'mic'; // Show stop icon when recording, mic when not
      default:
        return 'camera';
    }
  };

  const getCenterButtonAction = () => {
    switch (activeMode) {
      case 'write':
        return handleWritePress; // Write action when write is active
      case 'camera':
        return takePicture; // Take picture when camera is active
      case 'audio':
        return handleYapPress; // Audio action when audio is active
      default:
        return takePicture;
    }
  };

  const getSideIcons = () => {
    switch (activeMode) {
      case 'write':
        return [
          { mode: 'camera', icon: 'camera', action: () => switchToMode('camera') },
          { mode: 'audio', icon: 'mic', action: () => switchToMode('audio') }
        ];
      case 'camera':
        return [
          { mode: 'write', icon: 'create', action: () => switchToMode('write') },
          { mode: 'audio', icon: 'mic', action: () => switchToMode('audio') }
        ];
      case 'audio':
        return [
          { mode: 'write', icon: 'create', action: () => switchToMode('write') },
          { mode: 'camera', icon: 'camera', action: () => switchToMode('camera') }
        ];
      default:
        return [
          { mode: 'write', icon: 'create', action: () => switchToMode('write') },
          { mode: 'audio', icon: 'mic', action: () => switchToMode('audio') }
        ];
    }
  };

  const getModeIndicator = () => {
    return modes.map((mode, index) => (
      <View
        key={mode}
        style={[
          styles.modeIndicator,
          activeMode === mode && styles.activeModeIndicator,
        ]}
      />
    ));
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 16 }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Ionicons name="camera" size={24} color="#000000" />
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show specific screens if active
  if (showImageEditor) {
    return (
      <ImageEditorScreen
        images={editorImages}
        onClose={handleCloseImageEditor}
        onRemoveImage={handleRemoveImageFromEditor}
      />
    );
  }


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.topButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {/* Main Content Area */}
      <View style={styles.mainContent} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.screensContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {/* Camera Screen */}
          <View style={styles.screen}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              mode="picture"
              onCameraReady={() => {
                console.log('Camera is ready');
                setIsCameraReady(true);
              }}
            />
          </View>

          {/* Audio Screen */}
          <View style={styles.screen}>
            <View style={styles.audioScreen}>
              {/* Gradient Background */}
              <View style={styles.gradientBackground} />
              
              {/* Main Content */}
              <View style={styles.audioContent}>
                {/* Recording Status */}
                {isRecording && (
                  <View style={styles.recordingStatus}>
                    <Text style={styles.recordingText}>Recording...</Text>
                    <Text style={styles.recordingDuration}>
                      {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                )}

                {/* Microphone Icon */}
                <Animated.View 
                  style={[
                    styles.micContainer,
                    {
                      transform: [{ scale: pulseAnimation }],
                    }
                  ]}
                >
                  <Ionicons 
                    name={isRecording ? "mic" : "mic-outline"} 
                    size={120} 
                    color={isRecording ? "#FF3B30" : "#FFFFFF"} 
                  />
                </Animated.View>

                {/* Title */}
                <Text style={styles.screenTitle}>
                  {isRecording ? "Recording..." : "Yap"}
                </Text>
                
                {/* Subtitle */}
                <Text style={styles.screenSubtitle}>
                  {isRecording 
                    ? "Tap the stop button to finish recording" 
                    : "Tap the microphone to start recording audio"
                  }
                </Text>

                {/* Recording Animation Bar */}
                {isRecording && (
                  <View style={styles.recordingBarContainer}>
                    <Animated.View 
                      style={[
                        styles.recordingBar,
                        {
                          opacity: recordingAnimation,
                          transform: [
                            {
                              scaleY: recordingAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <Animated.View 
                      style={[
                        styles.recordingBar,
                        {
                          opacity: recordingAnimation.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.3, 1, 0.3],
                          }),
                          transform: [
                            {
                              scaleY: recordingAnimation.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.3, 1, 0.3],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <Animated.View 
                      style={[
                        styles.recordingBar,
                        {
                          opacity: recordingAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1],
                          }),
                          transform: [
                            {
                              scaleY: recordingAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <Animated.View 
                      style={[
                        styles.recordingBar,
                        {
                          opacity: recordingAnimation.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.3, 1, 0.3],
                          }),
                          transform: [
                            {
                              scaleY: recordingAnimation.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.3, 1, 0.3],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <Animated.View 
                      style={[
                        styles.recordingBar,
                        {
                          opacity: recordingAnimation,
                          transform: [
                            {
                              scaleY: recordingAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Write Screen */}
          <View style={styles.screen}>
            <View style={styles.writeScreen}>
              <Ionicons name="create" size={64} color="#007AFF" />

            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Navigation Footer */}
      <View style={styles.bottomNavigation}>
        <View style={styles.navContainer} {...iconPanResponder.panHandlers}>
          {/* Left Side Icon */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={getSideIcons()[0].action}
          >
            <Animated.View style={[styles.navIconContainer, { transform: [{ scale: iconScale }] }]}>
              <Ionicons
                name={getSideIcons()[0].icon}
                size={24}
                color="#FFFFFF"
              />
            </Animated.View>
            <Text style={[styles.navLabel, { opacity: 0 }]}>
              {getSideIcons()[0].mode === 'write' ? 'Write' : getSideIcons()[0].mode === 'camera' ? 'Camera' : 'Yap'}
            </Text>
          </TouchableOpacity>

          {/* Spacer */}
          <View style={styles.navSpacer} />

          {/* Center Button - Active Mode */}
          <TouchableOpacity
            style={styles.cameraButtonContainer}
            onPress={getCenterButtonAction()}
          >
            <Animated.View style={[
              styles.cameraButton,
              { 
                transform: [{ scale: iconScale }],
                borderColor: isRecording ? '#FF3B30' : '#FFFFFF',
              },
            ]}>
              <View style={[
                styles.cameraButtonInner,
                { 
                  backgroundColor: isRecording ? '#FF3B30' : '#FFFFFF', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                },
              ]}>
                <Ionicons
                  name={getCenterButtonIcon()}
                  size={32}
                  color={isRecording ? '#FFFFFF' : '#000000'}
                />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Spacer */}
          <View style={styles.navSpacer} />

          {/* Right Side Icon */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={getSideIcons()[1].action}
          >
            <Animated.View style={[styles.navIconContainer, { transform: [{ scale: iconScale }] }]}>
              <Ionicons
                name={getSideIcons()[1].icon}
                size={24}
                color="#FFFFFF"
              />
            </Animated.View>
            <Text style={[styles.navLabel, { opacity: 0 }]}>
              {getSideIcons()[1].mode === 'write' ? 'Write' : getSideIcons()[1].mode === 'camera' ? 'Camera' : 'Yap'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  permissionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeIndicatorsContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeModeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    marginTop: 160,
    marginBottom: 120,
  },
  screensContainer: {
    flex: 1,
    flexDirection: 'row',
    width: screenWidth * 3,
  },
  screen: {
    width: screenWidth,
    height: '100%',
  },
  writeScreen: {
    flex: 1,
    backgroundColor: '#2C1810',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  camera: {
    flex: 1,
  },
  audioScreen: {
    flex: 1,
    backgroundColor: '#2C1810',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF8DC', // Light cream
    background: 'linear-gradient(180deg, #FFF8DC 0%, #FFE4B5 25%, #FFD700 50%, #FFA500 75%, #FF8C00 100%)',
  },
  audioContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  recordingStatus: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  recordingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  recordingDuration: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  micContainer: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 60,
    marginTop: 40,
    gap: 4,
  },
  recordingBar: {
    width: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 3,
    height: 40,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  textInput: {
    width: '100%',
    maxWidth: 300,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    color: '#FFFFFF',
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 320,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  navSpacer: {
    flex: 1,
    maxWidth: 40,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  navIconContainer: {
    padding: 16,
    borderRadius: 50,
    boxShadow: '0px 0px 64px 0px rgba(255, 255, 255, 0.32) inset',
    color: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'center',
  },
  cameraButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  cameraButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cameraButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
