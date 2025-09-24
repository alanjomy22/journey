import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import RemixIcon from 'react-native-remix-icon';

interface OptionButtonProps {
  iconName: string;
  title: string;
  onPress?: () => void;
  iconColor?: string;
  iconSize?: number;
}

export function OptionButton({ 
  iconName, 
  title, 
  onPress, 
  iconColor = '#007AFF',
  iconSize = 40 
}: OptionButtonProps) {
  return (
    <TouchableOpacity style={styles.optionButton} onPress={onPress}>
      <RemixIcon name={iconName} size={iconSize} color={iconColor} />
      <ThemedText style={styles.optionText}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  optionButton: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    minWidth: 120,
  },
  optionText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
});
