import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import RemixIcon from 'react-native-remix-icon';

interface StoryProps {
  username: string;
  isAddStory?: boolean;
  onPress?: () => void;
}

export function Story({ username, isAddStory = false, onPress }: StoryProps) {
  return (
    <View style={styles.storyItem}>
      {isAddStory ? (
        <View style={styles.addStoryIcon}>
          <RemixIcon name="add-line" size={20} color="white" />
        </View>
      ) : (
        <View style={styles.storyAvatar} />
      )}
      <ThemedText style={styles.storyText}>{username}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 70,
  },
  addStoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
  },
  storyText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
