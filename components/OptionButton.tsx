import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import RemixIcon, { IconName } from 'react-native-remix-icon';

interface OptionButtonProps {
  iconName: string;
  title: string;
  onPress?: () => void;
  iconColor?: string;
  iconSize?: number;
  disabled?: boolean;
}

export function OptionButton({ 
  iconName, 
  title, 
  onPress, 
  iconColor = '#007AFF',
  iconSize = 40,
  disabled = false
}: OptionButtonProps) {
  const buttonStyle = [
    styles.optionButton,
    disabled && styles.disabledButton
  ];

  const textStyle = [
    styles.optionText,
    disabled && styles.disabledText
  ];

  const finalIconColor = disabled ? '#999' : iconColor;

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={disabled}
    >
      <RemixIcon name={iconName as IconName} size={iconSize} color={finalIconColor} />
      <ThemedText style={textStyle}>{title}</ThemedText>
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
  disabledButton: {
    backgroundColor: '#e9ecef',
    opacity: 0.6,
  },
  optionText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  disabledText: {
    color: '#999',
  },
});
