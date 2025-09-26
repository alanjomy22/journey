import { checkStorageHealth, emergencyCleanup } from '@/utils/storageUtils';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  PanResponder,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';
import { captureRef, captureScreen } from 'react-native-view-shot';
import { InteractiveSticker } from './InteractiveSticker';
import { StickerBottomSheet } from './StickerBottomSheet';
import { TextPicker } from './TextPicker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Types
interface ImageEditorScreenProps {
  images: string[];
  onClose: () => void;
  onRemoveImage?: (index: number) => void;
}

interface DrawingPath {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
}

interface TextElement {
  id: string;
  content: string;
  position: { x: number; y: number };
  color: string;
  fontSize: number;
  rotation: number;
  scale: number;
  fontFamily: string;
}

interface StickerElement {
  id: string;
  uri: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface ImageEdits {
  paths: DrawingPath[];
  texts: TextElement[];
  stickers: StickerElement[];
}

type ToolMode = 'draw' | 'text' | 'crop' | 'sticker' | 'none';

export const ImageEditorScreen: React.FC<ImageEditorScreenProps> = ({
  images,
  onClose,
  onRemoveImage,
}) => {
  // State management
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [toolMode, setToolMode] = useState<ToolMode>('none');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#FFFFFF');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState(24);
  const [showCropModal, setShowCropModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showTextPicker, setShowTextPicker] = useState(false);

  // Edits state - stores edits per image
  const [edits, setEdits] = useState<Record<number, ImageEdits>>({});

  // Refs
  const svgRef = useRef<Svg>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const captureViewRef = useRef<View>(null);

  // Debug ref mounting
  useEffect(() => {
    console.log('captureViewRef mounted:', captureViewRef.current);
  }, []);
  const panResponderRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => toolMode === 'draw',
      onMoveShouldSetPanResponder: () => toolMode === 'draw',
      onPanResponderGrant: (evt) => {
        if (toolMode === 'draw') {
          const { locationX, locationY } = evt.nativeEvent;
          const newPath = `M${locationX},${locationY}`;
          setCurrentPath(newPath);
          setIsDrawing(true);
        }
      },
      onPanResponderMove: (evt) => {
        if (toolMode === 'draw' && isDrawing) {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
        }
      },
      onPanResponderRelease: () => {
        if (toolMode === 'draw' && isDrawing) {
          const newPath: DrawingPath = {
            id: Date.now().toString(),
            path: currentPath,
            color: strokeColor,
            strokeWidth,
          };

          setEdits((prev) => ({
            ...prev,
            [activeImageIndex]: {
              paths: [...(prev[activeImageIndex]?.paths || []), newPath],
              texts: prev[activeImageIndex]?.texts || [],
            },
          }));

          setCurrentPath('');
          setIsDrawing(false);
        }
      },
    })
  ).current;

  // Color options
  const colors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  ];

  // Get current image edits
  const getCurrentEdits = (): ImageEdits => {
    return edits[activeImageIndex] || { paths: [], texts: [], stickers: [] };
  };


  // Add text using TextPicker
  const addText = useCallback(() => {
    setShowTextPicker(true);
  }, []);

  // Handle text addition from TextPicker
  const handleTextAdd = useCallback((text: string, fontFamily: string, fontSize: number, color: string) => {
    const newText: TextElement = {
      id: Date.now().toString(),
      content: text,
      position: { x: screenWidth / 2 - 50, y: screenHeight / 2 - 20 },
      color: color,
      fontSize: fontSize,
      rotation: 0,
      scale: 1,
      fontFamily: fontFamily,
    };

    setEdits((prev) => ({
      ...prev,
      [activeImageIndex]: {
        paths: prev[activeImageIndex]?.paths || [],
        texts: [...(prev[activeImageIndex]?.texts || []), newText],
        stickers: prev[activeImageIndex]?.stickers || [],
      },
    }));
  }, [activeImageIndex]);

  // Update text element
  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setEdits((prev) => ({
      ...prev,
      [activeImageIndex]: {
        ...prev[activeImageIndex],
        texts: (prev[activeImageIndex]?.texts || []).map((text) =>
          text.id === id ? { ...text, ...updates } : text
        ),
      },
    }));
  }, [activeImageIndex]);

  // Remove text element
  const removeTextElement = useCallback((id: string) => {
    setEdits((prev) => ({
      ...prev,
      [activeImageIndex]: {
        ...prev[activeImageIndex],
        texts: (prev[activeImageIndex]?.texts || []).filter((text) => text.id !== id),
      },
    }));
  }, [activeImageIndex]);

  // Add sticker
  const addSticker = useCallback((stickerUri: string) => {
    const newSticker: StickerElement = {
      id: Date.now().toString(),
      uri: stickerUri,
      position: { x: screenWidth / 2 - 40, y: screenHeight / 2 - 40 },
      scale: 1,
      rotation: 0,
    };

    setEdits((prev) => ({
      ...prev,
      [activeImageIndex]: {
        paths: prev[activeImageIndex]?.paths || [],
        texts: prev[activeImageIndex]?.texts || [],
        stickers: [...(prev[activeImageIndex]?.stickers || []), newSticker],
      },
    }));
  }, [activeImageIndex]);

  // Update sticker element
  const updateStickerElement = useCallback((id: string, updates: Partial<StickerElement>) => {
    setEdits((prev) => ({
      ...prev,
      [activeImageIndex]: {
        ...prev[activeImageIndex],
        stickers: (prev[activeImageIndex]?.stickers || []).map((sticker) =>
          sticker.id === id ? { ...sticker, ...updates } : sticker
        ),
      },
    }));
  }, [activeImageIndex]);

  // Remove sticker element
  const removeStickerElement = useCallback((id: string) => {
    setEdits((prev) => ({
      ...prev,
      [activeImageIndex]: {
        ...prev[activeImageIndex],
        stickers: (prev[activeImageIndex]?.stickers || []).filter((sticker) => sticker.id !== id),
      },
    }));
  }, [activeImageIndex]);

  // Crop image
  const cropImage = useCallback(async () => {
    try {
      const currentImage = images[activeImageIndex];
      const result = await ImageManipulator.manipulateAsync(
        currentImage,
        [{ crop: { originX: 0, originY: 0, width: 0.8, height: 0.8 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Update the image in the array (in a real app, you'd update the parent state)
      Alert.alert('Success', 'Image cropped successfully!');
      setShowCropModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to crop image');
    }
  }, [activeImageIndex, images]);

  // Capture the edited image with all layers (optimized)
  const captureEditedImage = useCallback(async () => {
    if (isCapturing) return; // Prevent multiple captures

    try {
      setIsCapturing(true);

      // Check storage health before capturing
      const storageHealth = await checkStorageHealth();
      if (!storageHealth.isHealthy) {
        console.warn('Storage warning:', storageHealth.warning);
        // Try emergency cleanup if storage is full
        if (storageHealth.warning?.includes('full')) {
          const cleaned = await emergencyCleanup();
          if (!cleaned) {
            Alert.alert(
              'Storage Full',
              'Your device storage is full. Please free up space and try again.',
              [{ text: 'OK' }]
            );
            return;
          }
        }
      }

      console.log('Starting optimized capture process...');

      // Reduced delay for faster capture
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Attempting to capture view...');

      let uri: string;

      // Optimized capture settings for faster processing
      const captureOptions = {
        format: 'jpg' as const,
        quality: 0.6, // Reduced quality for faster processing and smaller files
        result: 'base64' as const,
        width: Math.min(screenWidth, 800), // Limit width for faster processing
        height: Math.min(screenHeight - 200, 600), // Limit height
      };

      // Try captureRef first
      if (captureViewRef.current) {
        try {
          uri = await captureRef(captureViewRef.current, captureOptions);
          console.log('Capture successful with captureRef, base64 length:', uri.length);
        } catch (refError) {
          console.log('captureRef failed, trying captureScreen:', refError);
          // Fallback to captureScreen with same optimized settings
          uri = await captureScreen(captureOptions);
          console.log('Capture successful with captureScreen, base64 length:', uri.length);
        }
      } else {
        console.log('No ref available, using captureScreen');
        uri = await captureScreen(captureOptions);
        console.log('Capture successful with captureScreen, base64 length:', uri.length);
      }

      // Compress base64 data further if it's still too large
      if (uri.length > 1000000) { // If larger than ~1MB
        console.log('Base64 data is large, applying additional compression...');
        // Re-capture with even lower quality
        const compressedOptions = { ...captureOptions, quality: 0.4 };
        if (captureViewRef.current) {
          uri = await captureRef(captureViewRef.current, compressedOptions);
        } else {
          uri = await captureScreen(compressedOptions);
        }
        console.log('Compressed base64 length:', uri.length);
      }

      const imageDataUri = `data:image/jpeg;base64,${uri}`;
      const message = messageText.trim() || undefined;

      console.log('Optimized capture complete:');
      console.log('Final base64 length:', uri.length);
      console.log('Estimated size:', Math.round(uri.length * 3 / 4 / 1024), 'KB');

      // Create a new journal entry with the captured image
      const newJournalEntryId = `captured_${Date.now()}`;

      // Store only the journal entry (avoid duplicate storage)
      await AsyncStorage.setItem(`journal_${newJournalEntryId}`, JSON.stringify({
        id: newJournalEntryId,
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        date: new Date().toISOString().split('T')[0],
        month: new Date().toLocaleDateString('en-US', { month: 'long' }),
        image: imageDataUri, // Use the captured image URI
        preview: message || 'Captured a moment worth remembering...',
        base64Data: uri, // Store base64 data for reference
        messageText: message, // Include message text in journal entry
      }));

      // Navigate to insights page with the new journal entry
      router.push({
        pathname: '/insights/[id]',
        params: {
          id: newJournalEntryId,
        },
      });
    } catch (error) {
      console.error('Error capturing image:', error);

      // Handle SQLite_FULL error specifically
      if (error instanceof Error && error.message.includes('SQLITE_FULL')) {
        console.log('Storage full error detected, attempting emergency cleanup...');
        const cleaned = await emergencyCleanup();
        if (cleaned) {
          Alert.alert(
            'Storage Cleaned',
            'Old entries have been removed to free up space. Please try capturing again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Storage Full',
            'Your device storage is full. Please free up space in your device settings and try again.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Error', `Failed to capture image: ${error.message}`);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [messageText, isCapturing]);

  // Draggable Text Component with inline editing
  const DraggableText: React.FC<{ textElement: TextElement }> = ({ textElement }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(textElement.content);
    const translateX = useSharedValue(textElement.position.x);
    const translateY = useSharedValue(textElement.position.y);
    const scale = useSharedValue(textElement.scale);
    const rotation = useSharedValue(textElement.rotation);

    const panGesture = Gesture.Pan()
      .onStart(() => {
        // Store initial values
      })
      .onUpdate((event) => {
        translateX.value = textElement.position.x + event.translationX;
        translateY.value = textElement.position.y + event.translationY;
      })
      .onEnd(() => {
        runOnJS(updateTextElement)(textElement.id, {
          position: { x: translateX.value, y: translateY.value },
        });
      });

    const pinchGesture = Gesture.Pinch()
      .onUpdate((event) => {
        scale.value = Math.max(0.5, Math.min(3, textElement.scale * event.scale));
      })
      .onEnd(() => {
        runOnJS(updateTextElement)(textElement.id, {
          scale: scale.value,
        });
      });

    const rotationGesture = Gesture.Rotation()
      .onUpdate((event) => {
        rotation.value = textElement.rotation + event.rotation;
      })
      .onEnd(() => {
        runOnJS(updateTextElement)(textElement.id, {
          rotation: rotation.value,
        });
      });

    const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` },
      ],
    }));

    const handleTextPress = () => {
      setIsEditing(true);
      setEditText(textElement.content);
    };

    const handleTextSubmit = () => {
      updateTextElement(textElement.id, { content: editText });
      setIsEditing(false);
    };

    const handleTextCancel = () => {
      setEditText(textElement.content);
      setIsEditing(false);
    };

    return (
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.draggableText, animatedStyle]}>
          {isEditing ? (
            <View style={styles.textEditContainer}>
              <TextInput
                style={[
                  styles.draggableTextInput,
                  {
                    color: textElement.color,
                    fontSize: textElement.fontSize,
                    fontFamily: textElement.fontFamily === 'System' ? undefined : textElement.fontFamily,
                  },
                ]}
                value={editText}
                onChangeText={setEditText}
                onSubmitEditing={handleTextSubmit}
                onBlur={handleTextSubmit}
                autoFocus
                multiline
                selectTextOnFocus
              />
              <View style={styles.textEditButtons}>
                <TouchableOpacity
                  style={styles.textEditButton}
                  onPress={handleTextSubmit}
                >
                  <Ionicons name="checkmark" size={16} color="#00FF00" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.textEditButton}
                  onPress={handleTextCancel}
                >
                  <Ionicons name="close" size={16} color="#FF0000" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={handleTextPress} style={styles.textContainer}>
              <Text
                style={[
                  styles.textElement,
                  {
                    color: textElement.color,
                    fontSize: textElement.fontSize,
                    fontFamily: textElement.fontFamily === 'System' ? undefined : textElement.fontFamily,
                  },
                ]}
              >
                {textElement.content}
              </Text>
              <TouchableOpacity
                style={styles.textDeleteButton}
                onPress={() => removeTextElement(textElement.id)}
              >
                <Ionicons name="close" size={16} color="#FF0000" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        </Animated.View>
      </GestureDetector>
    );
  };

  const currentEdits = getCurrentEdits();

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Top Header with Back Button and Tool Icons */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Horizontal Tool Icons */}
        <View style={styles.horizontalToolButtons}>
          <TouchableOpacity
            style={[styles.toolButton, toolMode === 'sticker' && styles.activeTool]}
            onPress={() => {
              setToolMode('sticker');
              bottomSheetRef.current?.expand();
            }}
          >
            <Ionicons name="happy" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, toolMode === 'sticker' && styles.activeTool]}
            onPress={() => {
              setToolMode('sticker');
              bottomSheetRef.current?.expand();
            }}
          >
            <Ionicons name="document-text" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, toolMode === 'text' && styles.activeTool]}
            onPress={() => {
              setToolMode('text');
              addText();
            }}
          >
            <Ionicons name="text" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton}>
            <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ImageBackground
        source={{ uri: images[activeImageIndex] }}
        style={styles.imageBackground}
        resizeMode="cover"
      >


        <View style={styles.canvas} {...panResponderRef.panHandlers}>
          <Svg
            ref={svgRef}
            style={StyleSheet.absoluteFillObject}
            width={screenWidth}
            height={screenHeight}
          >
            <G>
              {currentEdits.paths.map((path) => (
                <Path
                  key={path.id}
                  d={path.path}
                  stroke={path.color}
                  strokeWidth={path.strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Render current drawing path */}
              {isDrawing && currentPath && (
                <Path
                  d={currentPath}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </G>
          </Svg>

          {/* Render text elements */}
          {currentEdits.texts.map((textElement) => (
            <DraggableText key={textElement.id} textElement={textElement} />
          ))}

          {/* Render sticker elements */}
          {currentEdits.stickers.map((stickerElement) => (
            <InteractiveSticker
              key={stickerElement.id}
              sticker={stickerElement}
              onUpdate={updateStickerElement}
              onRemove={removeStickerElement}
            />
          ))}
        </View>

        {/* Color Picker for Drawing */}
        {toolMode === 'draw' && (
          <View style={styles.colorPicker}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    strokeColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setStrokeColor(color)}
                />
              ))}
            </ScrollView>

            {/* Stroke Width Picker */}
            <View style={styles.strokeWidthPicker}>
              <Text style={styles.pickerLabel}>Width:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2, 3, 5, 8, 12].map((width) => (
                  <TouchableOpacity
                    key={width}
                    style={[
                      styles.strokeWidthOption,
                      strokeWidth === width && styles.selectedStrokeWidth,
                    ]}
                    onPress={() => setStrokeWidth(width)}
                  >
                    <View
                      style={[
                        styles.strokeWidthIndicator,
                        {
                          width: width * 2,
                          height: width * 2,
                          backgroundColor: strokeColor,
                        }
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Color Picker for Text */}
        {toolMode === 'text' && (
          <View style={styles.colorPicker}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    textColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setTextColor(color)}
                />
              ))}
            </ScrollView>

            {/* Text Size Picker */}
            <View style={styles.textSizePicker}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[16, 20, 24, 28, 32, 36].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.textSizeOption,
                      textSize === size && styles.selectedTextSize,
                    ]}
                    onPress={() => setTextSize(size)}
                  >
                    <Text style={[styles.textSizeIndicator, { fontSize: size, color: textColor }]}>
                      Aa
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

      </ImageBackground>

      <View style={styles.inputContainer}>
        <View style={{
          height: 70,
          width: 70,
          borderRadius: 35,
          marginBottom: 40,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFD700',

        }}>
          <TouchableOpacity onPress={() => {
            captureEditedImage();
          }}>
            <Ionicons
              name="send"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>
        </View>
      </View>

      <StickerBottomSheet
        bottomSheetRef={bottomSheetRef}
        onStickerSelect={addSticker}
      />

      {/* Text Picker Modal */}
      <TextPicker
        visible={showTextPicker}
        onClose={() => setShowTextPicker(false)}
        onTextAdd={handleTextAdd}
        initialText="Your text here"
        initialFontSize={24}
        initialColor="#FFFFFF"
        initialFontFamily="System"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  hiddenCaptureView: {
    position: 'absolute',
    top: -1000, // Hide off-screen
    left: 0,
    width: Math.min(screenWidth, 800), // Optimized size
    height: Math.min(screenHeight - 200, 600), // Optimized size
    zIndex: -1,
  },
  captureImageBackground: {
    width: '100%',
    height: '100%',
  },
  captureTextElement: {
    position: 'absolute',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  captureStickerElement: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  imageBackground: {
    flex: 1,
    width: screenWidth,
    height: screenHeight - 120, // Leave space for top header
    position: 'absolute',
    top: 120, // Start below the header
    left: 0,
    right: 0,
    bottom: 0,
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120, // Fixed height for header area
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // Account for status bar
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
    zIndex: 10,
  },
  horizontalToolButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  toolButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTool: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    position: 'absolute',
    top: 120, // Start below the header
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight - 120, // Adjust height to account for header
  },
  colorPicker: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FFFFFF',
  },
  pickerLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginRight: 10,
  },
  strokeWidthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  strokeWidthOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStrokeWidth: {
    borderColor: '#FFFFFF',
  },
  strokeWidthIndicator: {
    borderRadius: 50,
  },
  textSizePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  textSizeOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTextSize: {
    borderColor: '#FFFFFF',
  },
  textSizeIndicator: {
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 80, // Above the input area
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 100,
  },
  scrollContent: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 15,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
  },
  activeThumbnail: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  trashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    padding: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  draggableText: {
    position: 'absolute',
    zIndex: 5,
  },
  textContainer: {
    position: 'relative',
  },
  textElement: {
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  textEditContainer: {
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
  },
  draggableTextInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 100,
    textAlign: 'center',
  },
  textEditButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 10,
  },
  textEditButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textDeleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
    shadowColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 24,
  },
  messageTextInput: {
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 0,
    maxHeight: 80,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonInactive: {
    backgroundColor: '#F2F2F7',
  },
  sendButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.6,
  },
});
