import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { DatabaseProvider } from '../src/db/provider';
import { colors } from '../src/ui/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const plantId = response.notification.request.content.data?.plantId;
        if (plantId) {
          router.push(`/plant/${plantId}`);
        }
      }
    );
    return () => subscription.remove();
  }, [router]);

  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.textLight,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="plant/[id]"
            options={{ title: 'Plant Details' }}
          />
        </Stack>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
