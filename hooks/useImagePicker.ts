import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

export interface ImagePickerResult {
    uri: string;
    width: number;
    height: number;
    type?: string;
    fileName?: string;
    fileSize?: number;
}

export interface UseImagePickerReturn {
    selectedImages: ImagePickerResult[];
    pickImageFromGallery: () => Promise<void>;
    pickImageFromCamera: () => Promise<void>;
    clearImages: () => void;
    removeImage: (index: number) => void;
    isPicking: boolean;
}

export const useImagePicker = (): UseImagePickerReturn => {
    const [selectedImages, setSelectedImages] = useState<ImagePickerResult[]>([]);
    const [isPicking, setIsPicking] = useState(false);

    const requestPermissions = async (type: 'camera' | 'mediaLibrary') => {
        if (type === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Sorry, we need camera permissions to take photos.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Sorry, we need media library permissions to select photos.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        }
        return true;
    };

    const pickImageFromGallery = async () => {
        try {
            setIsPicking(true);

            const hasPermission = await requestPermissions('mediaLibrary');
            if (!hasPermission) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: 10, // Allow up to 10 images
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const newImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    type: asset.type,
                    fileName: asset.fileName,
                    fileSize: asset.fileSize,
                }));

                setSelectedImages(prev => [...prev, ...newImages]);
            }
        } catch (error) {
            console.error('Error picking images from gallery:', error);
            Alert.alert('Error', 'Failed to pick images from gallery');
        } finally {
            setIsPicking(false);
        }
    };

    const pickImageFromCamera = async () => {
        try {
            setIsPicking(true);

            const hasPermission = await requestPermissions('camera');
            if (!hasPermission) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const newImage = {
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    type: asset.type,
                    fileName: asset.fileName,
                    fileSize: asset.fileSize,
                };

                setSelectedImages(prev => [...prev, newImage]);
            }
        } catch (error) {
            console.error('Error taking photo with camera:', error);
            Alert.alert('Error', 'Failed to take photo with camera');
        } finally {
            setIsPicking(false);
        }
    };

    const clearImages = () => {
        setSelectedImages([]);
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    return {
        selectedImages,
        pickImageFromGallery,
        pickImageFromCamera,
        clearImages,
        removeImage,
        isPicking,
    };
};
