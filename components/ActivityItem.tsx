import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import RemixIcon from 'react-native-remix-icon';

interface ActivityItemProps {
  type: 'like' | 'follow' | 'comment';
  username: string;
  action: string;
  timeAgo: string;
  onPress?: () => void;
}

const getActivityIcon = (type: ActivityItemProps['type']) => {
  switch (type) {
    case 'like':
      return { name: 'heart-fill', color: '#FF3B30' };
    case 'follow':
      return { name: 'user-add-line', color: '#007AFF' };
    case 'comment':
      return { name: 'chat-3-line', color: '#34C759' };
    default:
      return { name: 'heart-fill', color: '#FF3B30' };
  }
};

export function ActivityItem({ type, username, action, timeAgo, onPress }: ActivityItemProps) {
  const icon = getActivityIcon(type);

  return (
    <ThemedView style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <RemixIcon name={icon.name} size={20} color={icon.color} />
      </View>
      <View style={styles.activityContent}>
        <ThemedText>
          <ThemedText type="defaultSemiBold">{username}</ThemedText> {action}
        </ThemedText>
        <ThemedText style={styles.timeText}>{timeAgo}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
