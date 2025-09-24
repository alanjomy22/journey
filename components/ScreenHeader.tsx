import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import RemixIcon from 'react-native-remix-icon';

interface ScreenHeaderProps {
  title: string;
  rightIcon?: {
    name: string;
    onPress?: () => void;
    color?: string;
  };
}

export function ScreenHeader({ title, rightIcon }: ScreenHeaderProps) {
  return (
    <ThemedView style={styles.header}>
      <ThemedText type="title">{title}</ThemedText>
      {rightIcon && (
        <TouchableOpacity onPress={rightIcon.onPress}>
          <RemixIcon 
            name={rightIcon.name} 
            size={24} 
            color={rightIcon.color || "#007AFF"} 
          />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});
