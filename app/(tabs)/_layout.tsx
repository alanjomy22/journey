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
          backgroundColor: '#000000',
          borderTopWidth: 0,
          height: 80,
          paddingTop: 10,
          paddingBottom: 10,
        },
      }}>

      <Tabs.Screen
        name="book"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <RemixIcon
              name="book-open-line"
              size={28}
              color={focused ? '#FFD700' : '#666666'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'New Post',
          tabBarIcon: ({ color, focused }) => (
            <RemixIcon
              name="add-line"
              size={32}
              color={focused ? '#FFD700' : '#666666'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ color }) => <RemixIcon name="bar-chart-line" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
