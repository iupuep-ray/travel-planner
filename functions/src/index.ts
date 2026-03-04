import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { runTodoReminderJob } from './todoReminderJob.js';

initializeApp();

const db = getFirestore();

export const sendTodoReminderNotifications = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'Asia/Taipei',
    region: 'asia-east1',
    retryCount: 1,
  },
  async () => {
    await runTodoReminderJob(db, getMessaging(), logger);
  }
);
