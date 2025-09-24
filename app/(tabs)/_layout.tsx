import { Tabs } from 'expo-router';
import React from 'react';
import RemixIcon from 'react-native-remix-icon';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <RemixIcon name="home-line" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <RemixIcon name="search-line" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="newpost"
        options={{
          title: 'New Post',
          tabBarIcon: ({ color }) => <RemixIcon name="add-box-line" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <RemixIcon name="heart-line" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <RemixIcon name="user-line" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
