export async function requestPermissions(): Promise<boolean> {
  try {
    const Notifications = await import('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') {
      return true;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleWateringNotification(
  plantId: number,
  plantName: string,
  intervalDays: number,
  lastWateredAt: number | null
): Promise<string> {
  const Notifications = await import('expo-notifications');
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
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // expo-notifications unavailable in this environment (Expo Go)
  }
}
