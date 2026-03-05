import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { runTodoReminderJob } from './todoReminderJob.js';

const getServiceAccountFromEnv = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('Missing env FIREBASE_SERVICE_ACCOUNT');
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON');
  }
};

const ensureAdminApp = () => {
  if (getApps().length > 0) {
    return;
  }

  const serviceAccount = getServiceAccountFromEnv();
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
  });
};

const cliLogger = {
  info: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.log(message, data);
      return;
    }
    console.log(message);
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.warn(message, data);
      return;
    }
    console.warn(message);
  },
  error: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.error(message, data);
      return;
    }
    console.error(message);
  },
};

const run = async () => {
  console.log('Todo reminder cron bootstrap', {
    nowIso: new Date().toISOString(),
    hasServiceAccount: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT),
    projectId: process.env.FIREBASE_PROJECT_ID || '',
  });
  ensureAdminApp();
  await runTodoReminderJob(getFirestore(), getMessaging(), cliLogger);
  console.log('Todo reminder cron finished');
};

run().catch((error) => {
  console.error('Todo reminder cron failed:', error);
  process.exitCode = 1;
});
