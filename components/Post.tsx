import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import RemixIcon from 'react-native-remix-icon';

interface PostProps {
  username: string;
  location?: string;
  caption: string;
  likes: string;
  timeAgo: string;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMore?: () => void;
}

export function Post({
  username,
  location,
  caption,
  likes,
  timeAgo,
  isLiked = false,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onMore,
}: PostProps) {
  return (
    <ThemedView style={styles.post}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar} />
        <View style={styles.postUserInfo}>
          <ThemedText type="defaultSemiBold">{username}</ThemedText>
          {location && <ThemedText style={styles.postLocation}>{location}</ThemedText>}
        </View>
        <TouchableOpacity onPress={onMore}>
          <RemixIcon name="more-line" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.postImage} />
      
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <RemixIcon 
              name={isLiked ? "heart-fill" : "heart-line"} 
              size={24} 
              color={isLiked ? "#FF3B30" : "#000"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onComment}>
            <RemixIcon name="chat-3-line" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <RemixIcon name="send-plane-line" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onBookmark}>
          <RemixIcon name="bookmark-line" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <ThemedView style={styles.postContent}>
        <ThemedText>
          <ThemedText type="defaultSemiBold">{username}</ThemedText> {caption}
        </ThemedText>
        <ThemedText style={styles.postLikes}>{likes}</ThemedText>
        <ThemedText style={styles.postTime}>{timeAgo}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  post: {
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  postUserInfo: {
    flex: 1,
  },
  postLocation: {
    fontSize: 12,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  postActionsLeft: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 15,
  },
  postContent: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  postLikes: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  postTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
