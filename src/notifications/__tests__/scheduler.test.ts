import {
  requestPermissions,
  scheduleWateringNotification,
  cancelNotification,
} from '../scheduler';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
}));

import * as Notifications from 'expo-notifications';

const mockGetPermissions = Notifications.getPermissionsAsync as jest.Mock;
const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;
const mockCancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('requestPermissions', () => {
  it('returns true immediately when permission already granted', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'granted' });
    const result = await requestPermissions();
    expect(result).toBe(true);
    expect(mockRequestPermissions).not.toHaveBeenCalled();
  });

  it('requests permissions when not already granted and returns true on grant', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    const result = await requestPermissions();
    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('returns false when user denies permission', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });
    const result = await requestPermissions();
    expect(result).toBe(false);
  });
});

describe('scheduleWateringNotification', () => {
  const PLANT_ID = 5;
  const PLANT_NAME = 'Ficus';
  const INTERVAL_DAYS = 7;
  const LAST_WATERED_AT = 1700000000000;
  const NOTIF_ID = 'notif-123';

  beforeEach(() => {
    mockSchedule.mockResolvedValue(NOTIF_ID);
  });

  it('returns the notification identifier from scheduleNotificationAsync', async () => {
    const id = await scheduleWateringNotification(PLANT_ID, PLANT_NAME, INTERVAL_DAYS, LAST_WATERED_AT);
    expect(id).toBe(NOTIF_ID);
  });

  it('schedules with correct title and body', async () => {
    await scheduleWateringNotification(PLANT_ID, PLANT_NAME, INTERVAL_DAYS, LAST_WATERED_AT);
    const call = mockSchedule.mock.calls[0][0];
    expect(call.content.title).toBe(`Time to water ${PLANT_NAME}!`);
    expect(call.content.body).toBe(`Your ${PLANT_NAME} is due for watering today.`);
  });

  it('includes plantId in notification data', async () => {
    await scheduleWateringNotification(PLANT_ID, PLANT_NAME, INTERVAL_DAYS, LAST_WATERED_AT);
    const call = mockSchedule.mock.calls[0][0];
    expect(call.content.data).toEqual({ plantId: PLANT_ID });
  });

  it('triggers on correct date based on lastWateredAt + intervalDays', async () => {
    await scheduleWateringNotification(PLANT_ID, PLANT_NAME, INTERVAL_DAYS, LAST_WATERED_AT);
    const call = mockSchedule.mock.calls[0][0];
    const expectedDate = new Date(LAST_WATERED_AT + INTERVAL_DAYS * 24 * 60 * 60 * 1000);
    expect(call.trigger.date).toEqual(expectedDate);
  });

  it('uses Date.now() as base when lastWateredAt is null', async () => {
    const before = Date.now();
    await scheduleWateringNotification(PLANT_ID, PLANT_NAME, INTERVAL_DAYS, null);
    const after = Date.now();
    const call = mockSchedule.mock.calls[0][0];
    const triggerMs = call.trigger.date.getTime();
    const expectedMin = before + INTERVAL_DAYS * 24 * 60 * 60 * 1000;
    const expectedMax = after + INTERVAL_DAYS * 24 * 60 * 60 * 1000;
    expect(triggerMs).toBeGreaterThanOrEqual(expectedMin);
    expect(triggerMs).toBeLessThanOrEqual(expectedMax);
  });

  it('uses DATE trigger type', async () => {
    await scheduleWateringNotification(PLANT_ID, PLANT_NAME, INTERVAL_DAYS, LAST_WATERED_AT);
    const call = mockSchedule.mock.calls[0][0];
    expect(call.trigger.type).toBe('date');
  });
});

describe('cancelNotification', () => {
  it('calls cancelScheduledNotificationAsync with the given id', async () => {
    mockCancel.mockResolvedValue(undefined);
    await cancelNotification('notif-abc');
    expect(mockCancel).toHaveBeenCalledWith('notif-abc');
  });

  it('resolves without error', async () => {
    mockCancel.mockResolvedValue(undefined);
    await expect(cancelNotification('notif-xyz')).resolves.toBeUndefined();
  });
});
