import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProfileStatsProps {
  posts: number;
  followers: number;
  following: number;
}

export function ProfileStats({ posts, followers, following }: ProfileStatsProps) {
  return (
    <View style={styles.statsSection}>
      <View style={styles.statItem}>
        <ThemedText type="defaultSemiBold" style={styles.statNumber}>{posts}</ThemedText>
        <ThemedText style={styles.statLabel}>Posts</ThemedText>
      </View>
      <View style={styles.statItem}>
        <ThemedText type="defaultSemiBold" style={styles.statNumber}>{followers}</ThemedText>
        <ThemedText style={styles.statLabel}>Followers</ThemedText>
      </View>
      <View style={styles.statItem}>
        <ThemedText type="defaultSemiBold" style={styles.statNumber}>{following}</ThemedText>
        <ThemedText style={styles.statLabel}>Following</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});
