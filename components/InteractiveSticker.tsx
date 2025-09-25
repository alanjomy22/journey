import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

interface StickerElement {
  id: string;
  uri: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface InteractiveStickerProps {
  sticker: StickerElement;
  onUpdate: (id: string, updates: Partial<StickerElement>) => void;
  onRemove: (id: string) => void;
}

export const InteractiveSticker: React.FC<InteractiveStickerProps> = ({
  sticker,
  onUpdate,
  onRemove,
}) => {
  const translateX = useSharedValue(sticker.position.x);
  const translateY = useSharedValue(sticker.position.y);
  const scale = useSharedValue(sticker.scale);
  const rotation = useSharedValue(sticker.rotation);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Store initial values
    })
    .onUpdate((event) => {
      translateX.value = sticker.position.x + event.translationX;
      translateY.value = sticker.position.y + event.translationY;
    })
    .onEnd(() => {
      runOnJS(onUpdate)(sticker.id, {
        position: { x: translateX.value, y: translateY.value },
      });
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(0.3, Math.min(3, sticker.scale * event.scale));
    })
    .onEnd(() => {
      runOnJS(onUpdate)(sticker.id, {
        scale: scale.value,
      });
    });

  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = sticker.rotation + event.rotation;
    })
    .onEnd(() => {
      runOnJS(onUpdate)(sticker.id, {
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

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.stickerContainer, animatedStyle]}>
        <View style={styles.stickerWrapper}>
          <Image
            source={{ uri: sticker.uri }}
            style={styles.stickerImage}
            contentFit="contain"
          />
          
          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onRemove(sticker.id)}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  stickerContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  stickerWrapper: {
    position: 'relative',
  },
  stickerImage: {
    width: 80,
    height: 80,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
});
