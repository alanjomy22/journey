import { Post, Story } from '@/components';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockPosts, mockStories } from '@/constants/mockData';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import RemixIcon from 'react-native-remix-icon';

export default function HomeScreen() {  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Home</ThemedText>
        <TouchableOpacity>
          <RemixIcon name="send-plane-line" size={24} color="#007AFF" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stories Section */}
        <ThemedView style={styles.storiesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Story username="Your Story" isAddStory />
            {mockStories.map((story) => (
              <Story key={story.id} username={story.username} />
            ))}
          </ScrollView>
        </ThemedView>

        {/* Posts Section */}
        <ThemedView style={styles.postsSection}>
          {mockPosts.map((post) => (
            <Post
              key={post.id}
              username={post.username}
              location={post.location}
              caption={post.caption}
              likes={post.likes}
              timeAgo={post.timeAgo}
              isLiked={post.isLiked}
              onLike={() => console.log('Like pressed')}
              onComment={() => console.log('Comment pressed')}
              onShare={() => console.log('Share pressed')}
              onBookmark={() => console.log('Bookmark pressed')}
              onMore={() => console.log('More pressed')}
            />
          ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    flex: 1,
  },
  storiesSection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postsSection: {
    flex: 1,
  },
});
