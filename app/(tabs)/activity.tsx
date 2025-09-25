import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockJournalEntries } from '@/constants/mockData';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import RemixIcon from 'react-native-remix-icon';

interface JournalEntry {
  id: string;
  day: string;
  date: string;
  month: string;
  image: string;
  preview: string;
}

export default function InsightsScreen() {
  const router = useRouter();

  const handleEntryPress = (entry: JournalEntry) => {
    router.push(`/insights/${entry.id}`);
  };

  const renderJournalEntry = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => handleEntryPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.entryImage}
        contentFit="cover"
      />
      <View style={styles.entryContent}>
        <ThemedText type="defaultSemiBold" style={styles.dayText}>
          {item.day}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">January</ThemedText>
        <TouchableOpacity style={styles.calendarButton}>
          <RemixIcon name="calendar-line" size={24} color="#007AFF" />
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={mockJournalEntries}
        renderItem={renderJournalEntry}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  calendarButton: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  entryImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  entryContent: {
    flex: 1,
  },
  dayText: {
    fontSize: 18,
    color: '#333',
  },
});
