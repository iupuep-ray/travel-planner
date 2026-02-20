import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PlanningItem, PlanningType } from '@/types';

const COLLECTION_NAME = 'planning';

export type PlanningInput = Omit<PlanningItem, 'id' | 'createdAt'>;

const removeUndefinedFields = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
};

// 新增準備事項
export const addPlanningItem = async (data: PlanningInput): Promise<string> => {
  try {
    const payload = removeUndefinedFields(data);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding planning item:', error);
    throw error;
  }
};

// 更新準備事項
export const updatePlanningItem = async (id: string, data: Partial<PlanningInput>): Promise<void> => {
  try {
    const planningRef = doc(db, COLLECTION_NAME, id);
    const payload = removeUndefinedFields(data as Record<string, unknown>);
    await updateDoc(planningRef, {
      ...payload,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating planning item:', error);
    throw error;
  }
};

// 刪除準備事項
export const deletePlanningItem = async (id: string): Promise<void> => {
  try {
    const planningRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(planningRef);
  } catch (error) {
    console.error('Error deleting planning item:', error);
    throw error;
  }
};

// 監聽準備事項列表（依類型篩選，即時更新）
export const subscribeToPlanningItems = (
  type: PlanningType,
  callback: (items: PlanningItem[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('type', '==', type),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: PlanningItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          content: data.content,
          isDone: data.isDone,
          assigneeIds: data.assigneeIds,
          relatedScheduleId: data.relatedScheduleId,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        };
      });
      callback(items);
    },
    (error) => {
      console.error('Error subscribing to planning items:', error);
      if (onError) onError(error);
    }
  );
};

// 監聽所有準備事項（不限類型）
export const subscribeToAllPlanningItems = (
  callback: (items: PlanningItem[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: PlanningItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          content: data.content,
          isDone: data.isDone,
          assigneeIds: data.assigneeIds,
          relatedScheduleId: data.relatedScheduleId,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        };
      });
      callback(items);
    },
    (error) => {
      console.error('Error subscribing to all planning items:', error);
      if (onError) onError(error);
    }
  );
};

// 批次新增購物清單項目（從購物行程）
export const addShoppingItemsFromSchedule = async (
  scheduleId: string,
  items: string[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    items.forEach((item) => {
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      batch.set(newDocRef, {
        type: 'shopping',
        content: item,
        isDone: false,
        relatedScheduleId: scheduleId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error adding shopping items from schedule:', error);
    throw error;
  }
};

// 刪除與購物行程關聯的所有清單項目
export const deletePlanningItemsByScheduleId = async (scheduleId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('relatedScheduleId', '==', scheduleId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return; // 沒有關聯項目，直接返回
    }

    const batch = writeBatch(db);
    querySnapshot.docs.forEach((document) => {
      batch.delete(doc(db, COLLECTION_NAME, document.id));
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting planning items by schedule ID:', error);
    throw error;
  }
};

// 更新購物行程的購物清單（先刪除舊的，再新增新的）
export const updateShoppingItemsFromSchedule = async (
  scheduleId: string,
  newItems: string[]
): Promise<void> => {
  try {
    // 先刪除所有舊的關聯項目
    await deletePlanningItemsByScheduleId(scheduleId);

    // 如果有新項目，則新增
    if (newItems.length > 0) {
      await addShoppingItemsFromSchedule(scheduleId, newItems);
    }
  } catch (error) {
    console.error('Error updating shopping items from schedule:', error);
    throw error;
  }
};
