import { Firestore } from 'firebase-admin/firestore';
import { Messaging } from 'firebase-admin/messaging';

const TODO_NOTIFICATION_TITLE = '待辦事項提醒';
const TODO_NOTIFICATION_TEMPLATE = '您設定的待辦事項 $待辦事項項目內容 尚未完成，請你快點完成！！！';
const DELIVERY_LOG_COLLECTION = 'todoReminderDeliveries';

interface PlanningTodoDoc {
  content?: string;
  isDone?: boolean;
  type?: string;
  assigneeIds?: string[];
  createdByAuthUid?: string;
  notificationEnabled?: boolean;
  notificationAt?: string;
}

interface LoggerLike {
  info: (message: string, data?: Record<string, unknown>) => void;
  warn?: (message: string, data?: Record<string, unknown>) => void;
  error?: (message: string, data?: Record<string, unknown>) => void;
}

const toSlotId = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
};

const shouldTriggerNow = (notificationAt: Date, now: Date): boolean => {
  if (now.getTime() < notificationAt.getTime()) return false;
  return now.getHours() === notificationAt.getHours() && now.getMinutes() === notificationAt.getMinutes();
};

const buildTodoMessage = (content: string): string => {
  return TODO_NOTIFICATION_TEMPLATE.replace('$待辦事項項目內容', content);
};

const fetchAssigneeAuthUids = async (db: Firestore, assigneeIds: string[]): Promise<string[]> => {
  if (assigneeIds.length === 0) return [];

  const refs = assigneeIds.map((memberId) => db.collection('members').doc(memberId));
  const docs = await db.getAll(...refs);
  return docs
    .map((doc) => doc.data()?.authUid)
    .filter((authUid): authUid is string => typeof authUid === 'string' && authUid.length > 0);
};

const fetchTokensByAuthUids = async (db: Firestore, authUids: string[]): Promise<string[]> => {
  if (authUids.length === 0) return [];

  const tokenSet = new Set<string>();
  await Promise.all(
    authUids.map(async (authUid) => {
      const snapshot = await db.collection('pushTokens').where('authUid', '==', authUid).get();
      snapshot.docs.forEach((doc) => {
        const token = doc.data().token;
        if (typeof token === 'string' && token.length > 0) {
          tokenSet.add(token);
        }
      });
    })
  );

  return [...tokenSet];
};

const markDeliverySlot = async (db: Firestore, todoId: string, slotId: string): Promise<boolean> => {
  const docId = `${todoId}_${slotId}`;
  try {
    await db.collection(DELIVERY_LOG_COLLECTION).doc(docId).create({
      todoId,
      slotId,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
};

const cleanupInvalidTokens = async (
  db: Firestore,
  tokens: string[],
  responses: Array<{ success: boolean; error?: { code?: string } }>
) => {
  const deletePromises: Promise<unknown>[] = [];

  responses.forEach((response, index) => {
    if (response.success) return;
    const errorCode = response.error?.code;
    if (
      errorCode === 'messaging/registration-token-not-registered' ||
      errorCode === 'messaging/invalid-registration-token'
    ) {
      const token = tokens[index];
      if (token) {
        deletePromises.push(db.collection('pushTokens').doc(token).delete());
      }
    }
  });

  if (deletePromises.length > 0) {
    await Promise.all(deletePromises);
  }
};

export const runTodoReminderJob = async (db: Firestore, messaging: Messaging, logger: LoggerLike, now: Date = new Date()) => {
  if (now.getMinutes() % 15 !== 0) {
    logger.info('Skip: current minute is not on a 15-minute slot.', { minute: now.getMinutes() });
    return;
  }

  const todoSnapshot = await db
    .collection('planning')
    .where('type', '==', 'todo')
    .where('isDone', '==', false)
    .where('notificationEnabled', '==', true)
    .get();

  if (todoSnapshot.empty) {
    logger.info('No pending todo reminders.');
    return;
  }

  for (const todoDoc of todoSnapshot.docs) {
    const todo = todoDoc.data() as PlanningTodoDoc;
    if (!todo.notificationAt || !todo.content) continue;

    const notificationAt = new Date(todo.notificationAt);
    if (Number.isNaN(notificationAt.getTime())) continue;
    if (!shouldTriggerNow(notificationAt, now)) continue;

    const slotId = toSlotId(now);
    const acquired = await markDeliverySlot(db, todoDoc.id, slotId);
    if (!acquired) continue;

    const recipientUids = new Set<string>();
    if (todo.createdByAuthUid) {
      recipientUids.add(todo.createdByAuthUid);
    }

    const assigneeIds = todo.assigneeIds ?? [];
    const assigneeAuthUids = await fetchAssigneeAuthUids(db, assigneeIds);
    assigneeAuthUids.forEach((uid) => recipientUids.add(uid));

    const tokens = await fetchTokensByAuthUids(db, [...recipientUids]);
    if (tokens.length === 0) {
      logger.info(`No tokens found for todo ${todoDoc.id}.`);
      continue;
    }

    const body = buildTodoMessage(todo.content);
    const result = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: TODO_NOTIFICATION_TITLE,
        body,
      },
      data: {
        todoId: todoDoc.id,
        todoContent: todo.content,
      },
    });

    await cleanupInvalidTokens(db, tokens, result.responses);

    logger.info('Todo reminder sent', {
      todoId: todoDoc.id,
      slotId,
      successCount: result.successCount,
      failureCount: result.failureCount,
    });
  }
};
