import '../src/i18n';
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DatabaseProvider } from '../src/db/provider';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { colors } from '../src/ui/theme';

export default function RootLayout() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    import('expo-notifications')
      .then((Notifications) => {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        const subscription = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const plantId = response.notification.request.content.data?.plantId;
            if (plantId) {
              router.push(`/plant/${plantId}`);
            }
          }
        );
        cleanup = () => subscription.remove();
      })
      .catch(() => {
        // expo-notifications unavailable in this environment (Expo Go)
      });

    return () => cleanup?.();
  }, [router]);

  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <LanguageProvider>
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
            options={{ title: t('plantDetail.title') }}
          />
        </Stack>
        </LanguageProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
