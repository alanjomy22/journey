import { mockJournalEntries, mockStoryAssets } from '@/constants/storyAssets';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RemixIcon from 'react-native-remix-icon';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  type: 'text' | 'image';
  imageUri?: string;
}

interface SessionData {
  session_id: string;
  title: string;
  messages: ChatMessage[];
  images: string[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function InsightDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessionData = () => {
      if (!id) return;

      // Find the session in mock data
      let foundSession = null;
      let sessionTitle = '';

      for (const entry of mockJournalEntries) {
        const session = entry.sessions.find(s => s.session_id === id);
        if (session) {
          foundSession = session;
          sessionTitle = session.title;
          break;
        }
      }

      if (foundSession) {
        // Get story assets for this session
        const sessionImages = mockStoryAssets
          .filter(story => story.session_id === id)
          .map(story => story.imageUri);

        // Mock conversation data
        const mockMessages: ChatMessage[] = [
          {
            id: '1',
            text: `Today I captured this beautiful moment during my ${sessionTitle.toLowerCase()}.`,
            isUser: true,
            timestamp: new Date().toISOString(),
            type: 'text'
          },
          {
            id: '2',
            text: "That sounds wonderful! Tell me more about what made this moment special for you. What emotions did you feel?",
            isUser: false,
            timestamp: new Date(Date.now() + 1000).toISOString(),
            type: 'text'
          },
          {
            id: '3',
            text: "I felt so peaceful and grateful. The light was perfect and everything just felt right in that moment.",
            isUser: true,
            timestamp: new Date(Date.now() + 2000).toISOString(),
            type: 'text'
          },
          {
            id: '4',
            text: "Gratitude is such a powerful emotion. It's beautiful how you're able to recognize and appreciate these peaceful moments. What do you think this experience taught you about yourself?",
            isUser: false,
            timestamp: new Date(Date.now() + 3000).toISOString(),
            type: 'text'
          }
        ];

        setSessionData({
          session_id: id,
          title: sessionTitle,
          messages: mockMessages,
          images: sessionImages
        });
      }

      setLoading(false);
    };

    loadSessionData();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userMessageText : styles.botMessageText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.messageTime}>
        {formatDate(item.timestamp)}
      </Text>
    </View>
  );

  const renderImage = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.imageContainer}>
      <Image source={{ uri: item }} style={styles.sessionImage} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#f7f3e9', '#f0ead6', '#e8dcc0']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!sessionData) {
    return (
      <LinearGradient
        colors={['#f7f3e9', '#f0ead6', '#e8dcc0']}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Session not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#f7f3e9', '#f0ead6', '#e8dcc0']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <RemixIcon name="arrow-left-line" size={24} color="#8B4513" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sessionData.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        {sessionData.images.length > 0 && (
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>Captured Moments</Text>
            <FlatList
              data={sessionData.images}
              renderItem={renderImage}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesList}
            />
          </View>
        )}

        {/* Conversation Section */}
        <View style={styles.conversationSection}>
          <Text style={styles.sectionTitle}>Conversation</Text>
          <FlatList
            data={sessionData.messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.messagesList}
          />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    fontFamily: 'serif',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imagesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    fontFamily: 'serif',
    fontStyle: 'italic',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  imagesList: {
    paddingRight: 20,
  },
  imageContainer: {
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sessionImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  conversationSection: {
    marginBottom: 30,
  },
  messagesList: {
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d4af37',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fefefe',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8d5b7',
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#fff',
    fontWeight: '500',
  },
  botMessageText: {
    color: '#8B4513',
    fontFamily: 'serif',
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(139, 69, 19, 0.6)',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8B4513',
    marginTop: 16,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#8B4513',
    marginBottom: 20,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
  },
});