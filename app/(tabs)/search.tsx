import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, TextInput, View } from 'react-native';
import RemixIcon from 'react-native-remix-icon';

export default function SearchScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Search</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <RemixIcon name="search-line" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
          />
        </View>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">Recent Searches</ThemedText>
        <ThemedView style={styles.recentItem}>
          <ThemedText>#photography</ThemedText>
        </ThemedView>
        <ThemedView style={styles.recentItem}>
          <ThemedText>#travel</ThemedText>
        </ThemedView>
        <ThemedView style={styles.recentItem}>
          <ThemedText>#food</ThemedText>
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
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 30,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  recentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});
