import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/ui/theme';
import { AppLogo } from '../../src/ui/AppLogo';

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
          title: '내 식물',
          headerTitle: () => <AppLogo size="sm" layout="horizontal" light />,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌿" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: '물주기 일정',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💧" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '식물 추가',
          tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
