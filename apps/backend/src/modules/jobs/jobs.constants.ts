export const QUEUE_NAMES = {
  NOTIFICATION: 'notification',
  REPORTS: 'reports',
  GPS: 'gps',
  CLEANUP: 'cleanup',
  SYNC: 'sync',
  ATTENDANCE: 'attendance',
} as const;

export const JOB_NAMES = {
  SEND_PUSH: 'send-push',
  ATTENDANCE_REMINDER: 'attendance-reminder',
  DAILY_SUMMARY: 'daily-summary',
  GENERATE_REPORT: 'generate-report',
  AGGREGATE_DAILY: 'aggregate-daily',
  RETENTION_CLEANUP: 'retention-cleanup',
  ORPHAN_IMAGES: 'orphan-images',
  BROADCAST_UPDATE: 'broadcast-update',
  MIDNIGHT_AUTO_PUNCH_OUT: 'midnight-auto-punch-out',
} as const;
