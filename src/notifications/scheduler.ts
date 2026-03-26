import * as Notifications from 'expo-notifications';

export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleWateringNotification(
  plantId: number,
  plantName: string,
  intervalDays: number,
  lastWateredAt: number | null
): Promise<string> {
  const baseTime = lastWateredAt ?? Date.now();
  const nextWateringMs = baseTime + intervalDays * 24 * 60 * 60 * 1000;
  const nextWateringDate = new Date(nextWateringMs);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to water ${plantName}!`,
      body: `Your ${plantName} is due for watering today.`,
      data: { plantId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextWateringDate,
    },
  });

  return identifier;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
