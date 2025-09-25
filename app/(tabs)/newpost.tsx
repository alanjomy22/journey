import { ImageEditorScreen, OptionButton } from '@/components';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useImagePicker } from '@/hooks';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

export default function NewPostScreen() {
  const { selectedImages, pickImageFromGallery, pickImageFromCamera, clearImages, removeImage, isPicking } = useImagePicker();
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editorImages, setEditorImages] = useState<string[]>([]);

  // Hide tab bar when image editor is shown
  useFocusEffect(
    React.useCallback(() => {
      // This will be handled by the parent tab navigator
      return () => {
        // Cleanup if needed
      };
    }, [showImageEditor])
  );

  const handleCameraPress = () => {
    pickImageFromCamera();
  };

  const handleGalleryPress = () => {
    pickImageFromGallery();
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

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">New Post</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {/* Media Options */}
        <ThemedView style={styles.mediaOptions}>
          <OptionButton
            iconName="camera-line"
            title="Camera"
            onPress={handleCameraPress}
            disabled={isPicking}
          />
          <OptionButton
            iconName="image-line"
            title="Photo Library"
            onPress={handleGalleryPress}
            disabled={isPicking}
          />
        </ThemedView>
        <ThemedView style={styles.mediaOptions}>
          <OptionButton
            iconName="text"
            title="Text Post"
            onPress={() => console.log('Text Post pressed')}
          />
          <OptionButton
            iconName="video-line"
            title="Video"
            onPress={() => console.log('Video pressed')}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
  },
  content: {
    flex: 1,
  },
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  textOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  recentDrafts: {
    flex: 1,
  },
  draftItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginTop: 10,
  },
});
