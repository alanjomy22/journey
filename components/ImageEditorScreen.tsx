import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  PanResponder,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
import { InteractiveSticker } from './InteractiveSticker';
import { StickerBottomSheet } from './StickerBottomSheet';

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
  const [isRecording, setIsRecording] = useState(false);

  // Edits state - stores edits per image
  const [edits, setEdits] = useState<Record<number, ImageEdits>>({});

  // Refs
  const svgRef = useRef<Svg>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
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

  // Switch image
  const switchImage = useCallback((index: number) => {
    setActiveImageIndex(index);
    setToolMode('none');
  }, []);

  // Remove image
  const handleRemoveImage = useCallback((index: number) => {
    if (onRemoveImage) {
      onRemoveImage(index);
      
      // Adjust active index if needed
      if (index === activeImageIndex) {
        // If removing the currently active image
        if (images.length > 1) {
          // Move to previous image, or first image if removing the first one
          const newIndex = index > 0 ? index - 1 : 0;
          setActiveImageIndex(newIndex);
        }
      } else if (index < activeImageIndex) {
        // If removing an image before the active one, adjust the active index
        setActiveImageIndex(activeImageIndex - 1);
      }
    }
  }, [onRemoveImage, activeImageIndex, images.length]);

  // Add text (Instagram style - directly add with default text)
  const addText = useCallback(() => {
    const newText: TextElement = {
      id: Date.now().toString(),
      content: 'Tap to edit',
      position: { x: screenWidth / 2 - 50, y: screenHeight / 2 - 20 },
      color: textColor,
      fontSize: textSize,
      rotation: 0,
      scale: 1,
    };

    setEdits((prev) => ({
      ...prev,
      [activeImageIndex]: {
        paths: prev[activeImageIndex]?.paths || [],
        texts: [...(prev[activeImageIndex]?.texts || []), newText],
        stickers: prev[activeImageIndex]?.stickers || [],
      },
    }));
  }, [textColor, textSize, activeImageIndex]);

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
      
      {/* Image Background */}
      <ImageBackground
        source={{ uri: images[activeImageIndex] }}
        style={styles.imageBackground}
        resizeMode="contain"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.toolButtons}>
            <TouchableOpacity
              style={[styles.toolButton, toolMode === 'crop' && styles.activeTool]}
              onPress={() => setShowCropModal(true)}
            >
              <Ionicons name="crop" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toolButton, toolMode === 'sticker' && styles.activeTool]}
              onPress={() => {
                setToolMode('sticker');
                bottomSheetRef.current?.expand();
              }}
            >
              <Ionicons name="happy" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toolButton, toolMode === 'text' && styles.activeTool]}
              onPress={() => {
                setToolMode('text');
                addText();
              }}
            >
              <Ionicons name="text" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toolButton, toolMode === 'draw' && styles.activeTool]}
              onPress={() => setToolMode(toolMode === 'draw' ? 'none' : 'draw')}
            >
              <Ionicons name="pencil" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Drawing Canvas */}
        <View style={styles.canvas} {...panResponderRef.panHandlers}>
          <Svg
            ref={svgRef}
            style={StyleSheet.absoluteFillObject}
            width={screenWidth}
            height={screenHeight}
          >
            <G>
              {/* Render existing paths */}
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

      {/* Footer - Image Navigator (Outside ImageBackground) */}
      <View style={styles.footer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {images.map((image, index) => (
            <View key={index} style={styles.thumbnailContainer}>
              {/* Thumbnail */}
              <TouchableOpacity
                style={[
                  styles.thumbnail,
                  index === activeImageIndex && styles.activeThumbnail,
                ]}
                onPress={() => switchImage(index)}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
                {index === activeImageIndex && (
                  <View style={styles.activeIndicator} />
                )}
                
                {/* Trash Icon Overlay on Selected Item */}
                {onRemoveImage && images.length > 1 && index === activeImageIndex && (
                  <TouchableOpacity
                    style={styles.trashOverlay}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="trash" size={18} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity 
            style={styles.audioButton}
            onPress={() => setIsRecording(!isRecording)}
          >
            <Ionicons 
              name={isRecording ? "stop" : "mic"} 
              size={24} 
              color={isRecording ? "#FF3B30" : "#007AFF"} 
            />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.messageTextInput}
              placeholder="Type a message..."
              placeholderTextColor="#8E8E93"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.sendButton, messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
            onPress={() => {
              if (messageText.trim()) {
                // Handle send message
                setMessageText('');
              }
            }}
            disabled={!messageText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={messageText.trim() ? "#FFFFFF" : "#8E8E93"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Crop Modal */}
      <Modal
        visible={showCropModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCropModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crop Image</Text>
            <Text style={styles.modalDescription}>
              This will crop the image to a 4:3 aspect ratio
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCropModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={cropImage}
              >
                <Text style={styles.addButtonText}>Crop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sticker Bottom Sheet */}
      <StickerBottomSheet
        bottomSheetRef={bottomSheetRef}
        onStickerSelect={addSticker}
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
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    marginBottom: 100, // Account for footer height only
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  toolButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTool: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  canvas: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    bottom: 0, // At the very bottom
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16, // Account for safe area
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
});
