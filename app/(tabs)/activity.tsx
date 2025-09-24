import { ActivityItem } from '@/components';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockActivities } from '@/constants/mockData';
import { StyleSheet } from 'react-native';

export default function ActivityScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Activity</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {mockActivities.map((activity) => (
          <ActivityItem
            key={activity.id}
            type={activity.type}
            username={activity.username}
            action={activity.action}
            timeAgo={activity.timeAgo}
            onPress={() => console.log('Activity pressed')}
          />
        ))}
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
  content: {
    flex: 1,
  },
});
