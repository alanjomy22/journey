import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageData {
  base64: string;
  uri: string;
  message?: string;
}

export default function ImageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImageData = async () => {
      try {
        if (id) {
          // Try to get data from AsyncStorage first
          const storedData = await AsyncStorage.getItem(`journal_${id}`);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            // Convert journal entry format to image data format
            const imageData: ImageData = {
              base64: parsedData.base64Data || '',
              uri: parsedData.image || '',
              message: parsedData.preview || '',
            };
            setImageData(imageData);
            setLoading(false);
            return;
          }
        }
        
        // If no stored data, show error
        Alert.alert('Error', 'No image data found');
        router.back();
      } catch (error) {
        console.error('Error loading image data:', error);
        Alert.alert('Error', 'Failed to load image data');
        router.back();
      }
    };

    loadImageData();
  }, [id, router]);

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality would be implemented here');
  };

  const handleSave = () => {
    Alert.alert('Save', 'Save functionality would be implemented here');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!imageData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No image data found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Text style={styles.headerButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Image Details</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Text style={styles.headerButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Display */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageData.uri }}
            style={styles.image}
            contentFit="contain"
          />
        </View>

        {/* Base64 Data Section */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Base64 Data</Text>
          <View style={styles.base64Container}>
            <Text style={styles.base64Text} numberOfLines={10}>
              {imageData.base64.substring(0, 500)}...
            </Text>
          </View>
          <Text style={styles.dataInfo}>
            Length: {imageData.base64.length} characters
          </Text>
        </View>

        {/* Image URI Section */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Image URI</Text>
          <View style={styles.uriContainer}>
            <Text style={styles.uriText} numberOfLines={3}>
              {imageData.uri}
            </Text>
          </View>
        </View>

        {/* Message Section (if available) */}
        {imageData.message && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Message</Text>
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{imageData.message}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.actionButtonText}>Save to Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionButtonText}>Share Image</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight * 0.4,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth - 40,
    height: screenHeight * 0.4 - 40,
  },
  dataSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  base64Container: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  base64Text: {
    color: '#CCCCCC',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  dataInfo: {
    color: '#888888',
    fontSize: 14,
  },
  uriContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
  },
  uriText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  messageContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
