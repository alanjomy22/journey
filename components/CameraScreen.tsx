import { useImagePicker } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ImageEditorScreen } from './ImageEditorScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CameraScreenProps {
  onClose?: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ onClose }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editorImages, setEditorImages] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const { selectedImages, pickImageFromGallery, addCapturedImage, clearImages, isPicking } = useImagePicker();

  // Auto-navigate to image editor when images are selected
  useEffect(() => {
    if (selectedImages.length > 0) {
      const imageUris = selectedImages.map(img => img.uri);
      setEditorImages(imageUris);
      setShowImageEditor(true);
    }
  }, [selectedImages]);

  const handleCloseImageEditor = () => {
    setShowImageEditor(false);
    setEditorImages([]);
  };

  const handleRemoveImageFromEditor = (index: number) => {
    // Update the editor images array
    setEditorImages(prev => prev.filter((_, i) => i !== index));

    // If no images left, close the editor
    if (editorImages.length <= 1) {
      setShowImageEditor(false);
      setEditorImages([]);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        // Add the captured photo to the image picker
        const newImage = {
          uri: photo.uri,
          width: photo.width,
          height: photo.height,
          type: 'image' as const,
          fileName: `camera_${Date.now()}.jpg`,
          fileSize: 0,
        };

        // Add to image picker and trigger editor
        addCapturedImage(newImage);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleWritePress = () => {
    Alert.alert('Write', 'Write functionality coming soon!');
  };

  const handleYapPress = () => {
    Alert.alert('Yap', 'Yap functionality coming soon!');
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera" size={64} color="#FFFFFF" />
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Ionicons name="camera" size={24} color="#000000" />
          <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show Image Editor if active
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

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="picture"
      >
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.topButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls - Three Button Layout */}
        <View style={styles.bottomControls}>
          {/* Left Side - Write Button */}
          <View style={styles.sideButtonContainer}>
            <TouchableOpacity
              style={styles.sideButton}
              onPress={handleWritePress}
            >
              <Ionicons name="create" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.sideButtonLabel}>write</Text>
          </View>

          {/* Center - Capture Button */}
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner}>
              {isCapturing ? (
                <Ionicons name="hourglass" size={32} color="#FFFFFF" />
              ) : (
                <View style={styles.captureButtonIcon} />
              )}
            </View>
          </TouchableOpacity>

          {/* Right Side - Yap Button */}
          <View style={styles.sideButtonContainer}>
            <TouchableOpacity
              style={styles.sideButton}
              onPress={handleYapPress}
            >
              <Ionicons name="mic" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.sideButtonLabel}>yap</Text>
          </View>
        </View>
      </CameraView>
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
  camera: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 50, // Adjusted for status bar
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
  bottomControls: {
    position: 'absolute',
    bottom: 80, // Increased to account for tab bar and labels
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  sideButtonContainer: {
    alignItems: 'center',
    marginHorizontal: 30,
  },
  sideButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 69, 19, 0.7)', // Semi-transparent dark brown
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sideButtonLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
  },
  actionBar: {
    position: 'absolute',
    bottom: 80, // Increased to account for tab bar
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    minWidth: 80,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
