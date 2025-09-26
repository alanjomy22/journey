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
        tabBarShowLabel: false,
        tabBarStyle: {
          display: 'flex',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <RemixIcon name="home-line" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => <RemixIcon name="search-line" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="newpost"
        options={{
          tabBarIcon: ({ color }) => <RemixIcon name="camera-line" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          tabBarIcon: ({ color }) => <RemixIcon name="lightbulb-line" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <RemixIcon name="user-line" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
