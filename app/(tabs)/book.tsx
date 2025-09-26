import { StoryAsset } from '@/constants/storyAssets';
import { useChatSessions } from '@/hooks';
import { apiService, SummarizeSessionsResponse } from '@/services/api';
import { sessionStorage } from '@/utils/sessionStorage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RemixIcon from 'react-native-remix-icon';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function BookScreen() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('entry_009_simple'); // Default fallback
  const { journalEntries, loading, error, refetch } = useChatSessions(sessionId);

  // Featured card data from summarize API
  const [featuredCardData, setFeaturedCardData] = useState<SummarizeSessionsResponse['data'] | null>(null);
  const [featuredCardLoading, setFeaturedCardLoading] = useState(false);

  // Full screen image viewer state
  const [selectedStory, setSelectedStory] = useState<StoryAsset | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [allStoryAssets, setAllStoryAssets] = useState<StoryAsset[]>([]);

  // Animation values
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // Load stored session ID on component mount
  useEffect(() => {
    const loadStoredSessionId = async () => {
      try {
        const storedSessionId = await sessionStorage.getSessionIdWithFallback('entry_009_simple');
        setSessionId(storedSessionId);
        console.log('📖 Book page loaded session ID:', storedSessionId);
      } catch (error) {
        console.error('❌ Failed to load session ID:', error);
      }
    };

    loadStoredSessionId();
  }, []);

  // Fetch featured card data from summarize API
  const fetchFeaturedCardData = useCallback(async () => {
    try {
      setFeaturedCardLoading(true);
      const sessionIds = await sessionStorage.getCurrentDaySessionIds();
      const response = await apiService.summarizeSessions(sessionIds);

      console.log('🔄 Featured card data loaded:', response);

      // Handle both structured response and direct summary response
      if (response.success && response.data) {
        setFeaturedCardData(response.data);
        console.log('✅ Featured card data loaded:', response.data);
      } else if (response.summary) {
        // Handle direct summary response
        setFeaturedCardData({
          title: 'Daily Summary',
          summary: response.summary,
          image_url: undefined
        });
        console.log('✅ Featured card data loaded from summary:', response.summary);
      } else {
        console.log('⚠️ Featured card API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Failed to fetch featured card data:', error);
    } finally {
      setFeaturedCardLoading(false);
    }
  }, []);

  // Fetch featured card data on component mount
  useEffect(() => {
    fetchFeaturedCardData();
  }, [fetchFeaturedCardData]);

  // Refresh session ID when user returns to this page
  useFocusEffect(
    useCallback(() => {
      const refreshSessionId = async () => {
        try {
          const storedSessionId = await sessionStorage.getSessionIdWithFallback('entry_009_simple');
          if (storedSessionId !== sessionId) {
            setSessionId(storedSessionId);
            console.log('🔄 Book page refreshed session ID:', storedSessionId);
          }
        } catch (error) {
          console.error('❌ Failed to refresh session ID:', error);
        }
      };

      refreshSessionId();
    }, [sessionId])
  );

  const handleAddStory = () => {
    router.push('/(tabs)/');
  };

  // Skeleton loader component for featured card
  const SkeletonLoader = () => {
    const pulseAnimation = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }, []);

    return (
      <View style={styles.skeletonContainer}>
        {/* Image skeleton */}
        <Animated.View
          style={[
            styles.skeletonImage,
            { opacity: pulseAnimation }
          ]}
        />
        <View style={styles.skeletonContent}>
          {/* Title skeleton */}
          <Animated.View
            style={[
              styles.skeletonTitle,
              { opacity: pulseAnimation }
            ]}
          />
          {/* Description skeleton lines */}
          <Animated.View
            style={[
              styles.skeletonLine,
              { opacity: pulseAnimation }
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonLine,
              { opacity: pulseAnimation }
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonLineShort,
              { opacity: pulseAnimation }
            ]}
          />
        </View>
      </View>
    );
  };

  const handleStoryPress = (story: StoryAsset) => {
    const storyIndex = allStoryAssets.findIndex(s => s.id === story.id);
    setCurrentStoryIndex(storyIndex);
    setSelectedStory(story);
    setShowFullScreen(true);
    setProgress(0);
    progressAnimation.setValue(0);
    fadeAnimation.setValue(0);

    // Start fade in animation
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeFullScreen = () => {
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowFullScreen(false);
      setSelectedStory(null);
      setCurrentStoryIndex(0);
      setProgress(0);
      progressAnimation.setValue(0);
    });
  };

  const goToNextStory = () => {
    if (currentStoryIndex < allStoryAssets.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setSelectedStory(allStoryAssets[nextIndex]);
    } else {
      closeFullScreen();
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      const prevIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(prevIndex);
      setSelectedStory(allStoryAssets[prevIndex]);
    }
  };

  const handleScreenPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const screenCenter = screenWidth / 2;

    if (locationX > screenCenter) {
      goToNextStory();
    } else {
      goToPreviousStory();
    }
  };

  // Extract story assets from journal entries
  useEffect(() => {
    if (journalEntries && journalEntries.length > 0) {
      const stories: StoryAsset[] = [];
      journalEntries.forEach(entry => {
        if (entry.story_assets && entry.story_assets.length > 0) {
          stories.push(...entry.story_assets);
        }
      });
      // Sort by creation date (newest first)
      stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllStoryAssets(stories);
    }
  }, [journalEntries]);

  // Auto-close after 5 seconds with progress animation
  useEffect(() => {
    if (showFullScreen && selectedStory) {
      // Reset and start progress animation
      progressAnimation.setValue(0);
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        goToNextStory();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showFullScreen, currentStoryIndex]);


  const renderJournalEntry = (entry: any, index: number) => (
    <View key={entry.journal_id || index} style={styles.journalCard}>
      {/* Sessions */}
      {entry.sessions?.map((session: any, sessionIndex: number) => (
        <View key={session.session_id || sessionIndex} style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <TouchableOpacity
              style={styles.featherButton}
              onPress={() => router.push(`/insights/${session.session_id}`)}
            >
              <RemixIcon name="quill-pen-line" size={18} color="#d97706" />
            </TouchableOpacity>
          </View>

          {/* Story Assets */}
          <View style={styles.storyAssetsContainer}>
            {entry.story_assets?.filter((story: any) => story.session_id === session.session_id).map((story: any) => (
              <View key={story.id} style={styles.storyAsset}>
                <Image source={{ uri: story.imageUri }} style={styles.assetThumbnail} />
                <View style={styles.assetInfo}>
                  <Text style={styles.assetSummary}>{story.summary}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <LinearGradient
      colors={['#fefce8', '#fef3c7', '#fde68a']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.todayText}>Today</Text>
        <TouchableOpacity style={styles.dropdownButton}>
          <RemixIcon name="arrow-down-s-line" size={32} color="#666" />
        </TouchableOpacity>

      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stories Section */}
        <View style={styles.storiesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesContainer}>
            {/* Add Story Button */}
            <TouchableOpacity style={styles.addStoryButton} onPress={handleAddStory}>
              <RemixIcon name="add-line" size={24} color="#666" />
            </TouchableOpacity>

            {/* Story Previews - Dynamic from API data */}
            {allStoryAssets.slice(0, 5).map((story) => (
              <TouchableOpacity
                key={story.id}
                style={styles.storyPreview}
                onPress={() => handleStoryPress(story)}
              >
                <Image
                  source={{ uri: story.imageUri }}
                  style={styles.storyImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content Cards */}
        <View style={styles.cardsSection}>
          {/* Featured Card */}
          <View style={styles.featuredCard}>
            {featuredCardLoading || !featuredCardData ? (
              <SkeletonLoader />
            ) : (
              <>
                <Image
                  source={{ uri: 'https://stg.trypncl.com/collage.jpeg' }}
                  style={styles.featuredImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{featuredCardData.title}</Text>
                  <Text style={styles.cardDescription}>
                    {featuredCardData.summary}
                  </Text>
                </View>
              </>
            )}
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

      {/* Full Screen Image Modal */}
      <Modal
        visible={showFullScreen}
        transparent={true}
        animationType="none"
        onRequestClose={closeFullScreen}
      >
        <Animated.View style={[styles.fullScreenContainer, { opacity: fadeAnimation }]}>
          <TouchableOpacity
            style={styles.fullScreenOverlay}
            activeOpacity={1}
            onPress={handleScreenPress}
          >
            {selectedStory && (
              <View style={styles.fullScreenContent}>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  {allStoryAssets.map((_, index) => (
                    <View key={index} style={styles.progressBar}>
                      <Animated.View
                        style={[
                          styles.progressFill,
                          {
                            width: index < currentStoryIndex
                              ? '100%' // Completed stories
                              : index === currentStoryIndex
                                ? progressAnimation.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0%', '100%'],
                                  extrapolate: 'clamp',
                                })
                                : '0%', // Future stories
                          },
                        ]}
                      />
                    </View>
                  ))}
                </View>

                {/* Header with close button */}
                <View style={styles.storyHeader}>
                  <TouchableOpacity style={styles.closeButton} onPress={closeFullScreen}>
                    <RemixIcon name="close-line" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Main Image */}
                <Image
                  source={{ uri: selectedStory.imageUri }}
                  style={styles.fullScreenImage}
                  resizeMode="cover"
                />

                {/* Story Info */}
                <View style={styles.fullScreenInfo}>
                  <Text style={styles.fullScreenTitle}>{selectedStory.title}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    position: 'relative',
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
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 16,
    color: '#a16207',
    marginTop: 4,
    fontWeight: '500',
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
  journalCard: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  dateHeader: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  dateLine: {
    height: 2,
    backgroundColor: '#d97706',
    borderRadius: 1,
    width: 40,
  },
  sessionCard: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    flex: 1,
  },
  featherButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  storyAssetsContainer: {
    gap: 12,
  },
  storyAsset: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefce8',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  assetThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetTime: {
    fontSize: 12,
    color: '#a16207',
    fontWeight: '500',
    marginBottom: 4,
  },
  assetSummary: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 18,
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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  fullScreenOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContent: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    zIndex: 10,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  storyHeader: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  storyCounter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fullScreenInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 15,
    backdropFilter: 'blur(10px)',
  },
  fullScreenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  fullScreenDate: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  navigationHints: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    zIndex: 10,
  },
  hintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginHorizontal: 5,
  },
  // Skeleton loader styles
  skeletonContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  skeletonImage: {
    width: 120,
    height: 120,
    backgroundColor: '#fefce8', // Very light yellow - almost white
    borderRadius: 12,
    marginRight: 16,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonTitle: {
    height: 24,
    backgroundColor: '#fefce8', // Very light yellow - almost white
    borderRadius: 6,
    marginBottom: 12,
    width: '70%',
  },
  skeletonLine: {
    height: 16,
    backgroundColor: '#fefce8', // Very light yellow - almost white
    borderRadius: 4,
    marginBottom: 8,
    width: '100%',
  },
  skeletonLineShort: {
    height: 16,
    backgroundColor: '#fefce8', // Very light yellow - almost white
    borderRadius: 4,
    width: '60%',
  },
});
