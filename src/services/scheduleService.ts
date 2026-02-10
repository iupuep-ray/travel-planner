import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Schedule } from '@/types';

const COLLECTION_NAME = 'schedules';

// 移除 id 和 createdAt，因為這些由 Firestore 自動管理
export type ScheduleInput = Omit<Schedule, 'id' | 'createdAt'>;

// 新增行程
export const addSchedule = async (data: ScheduleInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding schedule:', error);
    throw error;
  }
};

// 更新行程
export const updateSchedule = async (id: string, data: Partial<ScheduleInput>): Promise<void> => {
  try {
    const scheduleRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(scheduleRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

// 刪除行程
export const deleteSchedule = async (id: string): Promise<void> => {
  try {
    const scheduleRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(scheduleRef);
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};

// 監聽行程列表（即時更新）
export const subscribeToSchedules = (
  callback: (schedules: Schedule[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const schedules: Schedule[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        } as Schedule;
      });
      callback(schedules);
    },
    (error) => {
      console.error('Error subscribing to schedules:', error);
      if (onError) onError(error);
    }
  );
};
