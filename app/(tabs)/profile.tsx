import { ProfileStats } from '@/components';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockProfileData } from '@/constants/mockData';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import RemixIcon from 'react-native-remix-icon';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
        <TouchableOpacity>
          <RemixIcon name="settings-3-line" size={24} color="#007AFF" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.profileSection}>
        <View style={styles.profileImage}>
          <RemixIcon name="user-3-fill" size={80} color="#007AFF" />
        </View>
        <ThemedText type="subtitle" style={styles.username}>{mockProfileData.username}</ThemedText>
        <ThemedText style={styles.displayName}>{mockProfileData.displayName}</ThemedText>
        <ThemedText style={styles.bio}>{mockProfileData.bio}</ThemedText>
      </ThemedView>

      <ProfileStats 
        posts={mockProfileData.posts}
        followers={1200}
        following={mockProfileData.following}
      />

      <ThemedView style={styles.actionsSection}>
        <TouchableOpacity style={styles.editButton}>
          <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <RemixIcon name="share-line" size={20} color="#007AFF" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">Recent Posts</ThemedText>
        <View style={styles.postsGrid}>
          <View style={styles.postThumbnail} />
          <View style={styles.postThumbnail} />
          <View style={styles.postThumbnail} />
          <View style={styles.postThumbnail} />
          <View style={styles.postThumbnail} />
          <View style={styles.postThumbnail} />
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    marginBottom: 10,
  },
  username: {
    marginBottom: 5,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  bio: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  shareButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  postThumbnail: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
  },
});
