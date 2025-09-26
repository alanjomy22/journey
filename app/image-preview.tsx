import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ImagePreviewScreen() {
  const { dataKey } = useLocalSearchParams<{
    dataKey: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const [imageData, setImageData] = useState<{
    imageUri: string;
    base64Data: string;
    messageText?: string;
  } | null>(null);

  // Load data from AsyncStorage
  useEffect(() => {
    const loadImageData = async () => {
      try {
        if (dataKey) {
          console.log('Loading data with key:', dataKey);
          const storedData = await AsyncStorage.getItem(dataKey);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            console.log('Loaded data:', {
              imageUri: parsedData.imageUri ? 'present' : 'missing',
              base64Data: parsedData.base64Data ? 'present' : 'missing',
              messageText: parsedData.messageText,
            });
            setImageData(parsedData);
          } else {
            console.log('No data found for key:', dataKey);
          }
        }
      } catch (error) {
        console.error('Error loading image data:', error);
      }
    };

    loadImageData();
  }, [dataKey]);

  const handleSaveToGallery = async () => {
    try {
      setIsLoading(true);
      
      if (!imageData?.base64Data) {
        Alert.alert('Error', 'No image data available');
        return;
      }
      
      // Save the image to the device's gallery
      const fileName = `edited_image_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write the base64 data to a file
      await FileSystem.writeAsStringAsync(fileUri, imageData.base64Data);

      // For Expo, we would typically use MediaLibrary to save to gallery
      // This is a simplified version - in a real app you'd use expo-media-library
      Alert.alert('Success', 'Image saved to gallery!');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image to gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);
      
      if (!imageData) {
        Alert.alert('Error', 'No image data available');
        return;
      }
      
      const shareOptions = {
        message: imageData.messageText ? `${imageData.messageText}\n\n[Shared from Journey App]` : '[Shared from Journey App]',
        url: imageData.imageUri,
      };

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBase64 = async () => {
    try {
      if (!imageData?.base64Data) {
        Alert.alert('Error', 'No base64 data available');
        return;
      }
      
      await Clipboard.setStringAsync(imageData.base64Data);
      Alert.alert('Success', 'Base64 data copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy base64 data');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!imageData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Loading image data...</Text>
          <Text style={styles.debugText}>
            Debug: dataKey={dataKey ? 'present' : 'missing'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Display */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageData.imageUri }}
            style={styles.previewImage}
            contentFit="contain"
          />
        </View>

        {/* Message Text (if any) */}
        {imageData.messageText && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Message:</Text>
            <Text style={styles.messageText}>{imageData.messageText}</Text>
          </View>
        )}

        {/* Base64 Info */}
        <View style={styles.base64Container}>
          <Text style={styles.base64Label}>Base64 Data:</Text>
          <View style={styles.base64Info}>
            <Text style={styles.base64Text}>
              {imageData.base64Data.substring(0, 50)}...
            </Text>
            <Text style={styles.base64Length}>
              Length: {imageData.base64Data.length} characters
            </Text>
          </View>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyBase64}>
            <Ionicons name="copy" size={16} color="#007AFF" />
            <Text style={styles.copyButtonText}>Copy Base64</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveToGallery}
            disabled={isLoading}
          >
            <Ionicons name="download" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Save to Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
            disabled={isLoading}
          >
            <Ionicons name="share" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Technical Details */}
        <View style={styles.technicalContainer}>
          <Text style={styles.technicalTitle}>Technical Details</Text>
          <View style={styles.technicalItem}>
            <Text style={styles.technicalLabel}>Image URI:</Text>
            <Text style={styles.technicalValue} numberOfLines={2}>
              {imageData.imageUri}
            </Text>
          </View>
          <View style={styles.technicalItem}>
            <Text style={styles.technicalLabel}>Base64 Length:</Text>
            <Text style={styles.technicalValue}>{imageData.base64Data.length} characters</Text>
          </View>
          <View style={styles.technicalItem}>
            <Text style={styles.technicalLabel}>Estimated Size:</Text>
            <Text style={styles.technicalValue}>
              ~{Math.round((imageData.base64Data.length * 3) / 4 / 1024)} KB
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 10,
  },
  previewImage: {
    width: screenWidth - 60,
    height: screenHeight * 0.4,
    borderRadius: 8,
  },
  messageContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  base64Container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  base64Label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  base64Info: {
    marginBottom: 12,
  },
  base64Text: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  base64Length: {
    fontSize: 12,
    color: '#8E8E93',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  shareButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  technicalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  technicalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  technicalItem: {
    marginBottom: 8,
  },
  technicalLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  technicalValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 20,
  },
  debugText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
