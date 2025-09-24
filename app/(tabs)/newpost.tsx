import { OptionButton } from '@/components';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockNewPostOptions } from '@/constants/mockData';
import { StyleSheet } from 'react-native';

export default function NewPostScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">New Post</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.mediaOptions}>
          {mockNewPostOptions.slice(0, 2).map((option) => (
            <OptionButton
              key={option.id}
              iconName={option.iconName}
              title={option.title}
              onPress={() => console.log(`${option.title} pressed`)}
            />
          ))}
        </ThemedView>

        <ThemedView style={styles.textOptions}>
          {mockNewPostOptions.slice(2, 4).map((option) => (
            <OptionButton
              key={option.id}
              iconName={option.iconName}
              title={option.title}
              onPress={() => console.log(`${option.title} pressed`)}
            />
          ))}
        </ThemedView>

        <ThemedView style={styles.recentDrafts}>
          <ThemedText type="subtitle">Recent Drafts</ThemedText>
          <ThemedView style={styles.draftItem}>
            <ThemedText>Draft post from yesterday...</ThemedText>
          </ThemedView>
        </ThemedView>
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
    marginBottom: 30,
  },
  content: {
    flex: 1,
  },
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  textOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  recentDrafts: {
    flex: 1,
  },
  draftItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginTop: 10,
  },
});
