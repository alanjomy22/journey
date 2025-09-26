import { ImageEditorScreen } from '@/components';
import { useImagePicker } from '@/hooks';
import { useFocusEffect } from '@react-navigation/native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RemixIcon from 'react-native-remix-icon';


export default function NewPostScreen() {
  const { selectedImages, pickImageFromGallery, clearImages, removeImage } = useImagePicker();
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editorImages, setEditorImages] = useState<string[]>([]);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Hide tab bar when image editor is shown
  useFocusEffect(
    React.useCallback(() => {
      // This will be handled by the parent tab navigator
      return () => {
        // Cleanup if needed
      };
    }, [showImageEditor])
  );

  const handleCameraPress = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission required', 'Camera permission is needed to take photos');
        return;
      }
    }

    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo?.uri) {
          // Add the captured image to the selected images
          setEditorImages([...editorImages, photo.uri]);
          setShowImageEditor(true);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const handleGalleryPress = () => {
    pickImageFromGallery();
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Auto-navigate to image editor when images are selected
  React.useEffect(() => {
    if (selectedImages.length > 0) {
      const imageUris = selectedImages.map(img => img.uri);
      setEditorImages(imageUris);
      setShowImageEditor(true);
    }
  }, [selectedImages]);

  const handleCloseImageEditor = () => {
    setShowImageEditor(false);
    clearImages(); // Clear the selected images when closing editor
  };

  const handleRemoveImageFromEditor = (index: number) => {
    // Remove from the selected images array
    removeImage(index);

    // Update the editor images array
    setEditorImages(prev => prev.filter((_, i) => i !== index));

    // If no images left, close the editor
    if (selectedImages.length <= 1) {
      setShowImageEditor(false);
      clearImages();
    }
  };

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

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="picture"
      >
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.topButton} onPress={toggleCameraFacing}>
            <RemixIcon name="camera-switch-line" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.bottomRow}>
            {/* Gallery Button */}
            <TouchableOpacity style={styles.galleryButton} onPress={handleGalleryPress}>
              <RemixIcon name="pencil-line" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity style={styles.captureButton} onPress={handleCameraPress}>
              <View style={styles.captureInner}>
              </View>
            </TouchableOpacity>

            {/* Text Button */}
            <TouchableOpacity style={styles.textButton}>
              <RemixIcon name="mic-line" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 60,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
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
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    display: 'flex',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 40,
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
  },
  textButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
