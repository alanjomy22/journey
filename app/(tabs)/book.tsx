import { useChatSessions } from '@/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RemixIcon from 'react-native-remix-icon';

const { width } = Dimensions.get('window');

export default function BookScreen() {
  // For now, using a placeholder session ID - in a real app, this would come from user context or navigation params
  const sessionId = 'eeed484c-cd1f-45e6-abf1-f7ced8fc33a1';
  const { journalEntries, loading, error, refetch } = useChatSessions(sessionId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderJournalEntry = (entry: any, index: number) => (
    <View key={entry.journal_id || index} style={styles.gratitudeCard}>
      <Text style={styles.gratitudeTitle}>Journal Entry</Text>
      <View style={styles.gratitudeContent}>
        <Text style={styles.gratitudeText}>
          Session: {entry.sessions?.[0]?.session_id?.slice(0, 8)}...
        </Text>
        <Text style={styles.gratitudeTime}>{formatDate(entry.created_at)}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#FFF8DC', '#F5F5DC']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.todayText}>Today</Text>
        <TouchableOpacity style={styles.dropdownButton}>
          <RemixIcon name="arrow-down-s-line" size={32} color="#666" />
        </TouchableOpacity>

      </View>
      <View style={styles.dateTextContainer}>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stories Section */}
        <View style={styles.storiesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesContainer}>
            {/* Add Story Button */}
            <TouchableOpacity style={styles.addStoryButton}>
              <RemixIcon name="add-line" size={24} color="#666" />
            </TouchableOpacity>

            {/* Story Previews */}
            <View style={styles.storyPreview}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
                style={styles.storyImage}
              />
            </View>

            <View style={styles.storyPreview}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
                style={styles.storyImage}
              />
            </View>

            <View style={styles.storyPreview}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
                style={styles.storyImage}
              />
            </View>
          </ScrollView>
        </View>

        {/* Main Content Cards */}
        <View style={styles.cardsSection}>
          {/* Featured Card */}
          <View style={styles.featuredCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
              style={styles.featuredImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Day out in Rome</Text>
              <Text style={styles.cardDescription}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </Text>
            </View>
          </View>

          {/* Journal Entries from API */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#666" />
              <Text style={styles.loadingText}>Loading journal entries...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : journalEntries && journalEntries.length > 0 ? (
            journalEntries.map(renderJournalEntry)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No journal entries found</Text>
              <Text style={styles.emptySubtext}>Start creating some memories!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  todayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  dropdownButton: {
    padding: 8,
  },
  dateTextContainer: {
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
  storiesSection: {
    paddingVertical: 20,
  },
  storiesContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  addStoryButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#666',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  storyPreview: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFC107',
    padding: 2,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  cardsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  featuredCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  gratitudeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gratitudeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  gratitudeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gratitudeText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  gratitudeTime: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
