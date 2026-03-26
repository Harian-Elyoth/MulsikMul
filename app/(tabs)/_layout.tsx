import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/ui/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textLight,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Plants',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌿" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💧" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add Plant',
          tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
