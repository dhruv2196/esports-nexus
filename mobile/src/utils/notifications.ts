import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const setupNotifications = async () => {
  // Configure how notifications should be presented when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Configure notification categories for interactive notifications
  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('TOURNAMENT_REMINDER', [
      {
        identifier: 'VIEW_TOURNAMENT',
        buttonTitle: 'View Tournament',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'DISMISS',
        buttonTitle: 'Dismiss',
        options: {
          isDestructive: true,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('TEAM_INVITE', [
      {
        identifier: 'ACCEPT',
        buttonTitle: 'Accept',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'DECLINE',
        buttonTitle: 'Decline',
        options: {
          isDestructive: true,
        },
      },
    ]);
  }
};

export const scheduleTournamentReminder = async (
  tournamentName: string,
  tournamentId: string,
  startTime: Date
) => {
  // Schedule 1 hour before
  const oneHourBefore = new Date(startTime.getTime() - 60 * 60 * 1000);
  
  if (oneHourBefore > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tournament Starting Soon! 🏆',
        body: `${tournamentName} starts in 1 hour. Get ready!`,
        data: {
          type: 'TOURNAMENT_REMINDER',
          tournamentId,
        },
        categoryIdentifier: 'TOURNAMENT_REMINDER',
      },
      trigger: oneHourBefore,
    });
  }

  // Schedule 15 minutes before
  const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60 * 1000);
  
  if (fifteenMinutesBefore > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tournament Alert! ⚡',
        body: `${tournamentName} starts in 15 minutes!`,
        data: {
          type: 'TOURNAMENT_REMINDER',
          tournamentId,
        },
        categoryIdentifier: 'TOURNAMENT_REMINDER',
      },
      trigger: fifteenMinutesBefore,
    });
  }
};

export const sendTeamInviteNotification = async (
  teamName: string,
  inviterName: string,
  teamId: string
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Team Invite! 👥',
      body: `${inviterName} invited you to join ${teamName}`,
      data: {
        type: 'TEAM_INVITE',
        teamId,
      },
      categoryIdentifier: 'TEAM_INVITE',
    },
    trigger: null, // Send immediately
  });
};

export const sendMatchStartedNotification = async (
  matchId: string,
  opponentName: string
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Match Started! 🎮',
      body: `Your match against ${opponentName} has begun!`,
      data: {
        type: 'MATCH_STARTED',
        matchId,
      },
    },
    trigger: null,
  });
};

export const sendAchievementNotification = async (
  achievementName: string,
  description: string
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Achievement Unlocked! 🏅',
      body: `${achievementName}: ${description}`,
      data: {
        type: 'ACHIEVEMENT_UNLOCKED',
      },
    },
    trigger: null,
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const getBadgeCount = async (): Promise<number> => {
  return await Notifications.getBadgeCountAsync();
};

export const setBadgeCount = async (count: number) => {
  await Notifications.setBadgeCountAsync(count);
};