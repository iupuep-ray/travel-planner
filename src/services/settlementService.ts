import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SettlementResult } from '@/types';

const COLLECTION_NAME = 'settlements';

export type SettlementInput = Omit<SettlementResult, 'id' | 'createdAt'>;

// 新增清算記錄
export const addSettlement = async (data: {
  from: string;
  to: string;
  amount: number;
}): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      from: data.from,
      to: data.to,
      amount: data.amount,
      isSettled: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding settlement:', error);
    throw error;
  }
};

// 更新清算狀態（標記為已還款）
export const updateSettlementStatus = async (
  from: string,
  to: string,
  isSettled: boolean
): Promise<void> => {
  try {
    // 查找對應的清算記錄
    const q = query(
      collection(db, COLLECTION_NAME),
      where('from', '==', from),
      where('to', '==', to)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const settlementDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, COLLECTION_NAME, settlementDoc.id), {
        isSettled,
        updatedAt: Timestamp.now(),
      });
    } else {
      // 如果不存在記錄，創建新的
      await addDoc(collection(db, COLLECTION_NAME), {
        from,
        to,
        amount: 0, // 這裡應該從計算中取得實際金額
        isSettled,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error updating settlement status:', error);
    throw error;
  }
};

// 監聽清算記錄（即時更新）
export const subscribeToSettlements = (
  callback: (settlements: Map<string, boolean>) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME));

  return onSnapshot(
    q,
    (snapshot) => {
      const settlementsMap = new Map<string, boolean>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const key = `${data.from}-${data.to}`;
        settlementsMap.set(key, data.isSettled);
      });
      callback(settlementsMap);
    },
    (error) => {
      console.error('Error subscribing to settlements:', error);
      if (onError) onError(error);
    }
  );
};

// 刪除清算記錄
export const deleteSettlement = async (from: string, to: string): Promise<void> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('from', '==', from),
      where('to', '==', to)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(db, COLLECTION_NAME, document.id));
    });
  } catch (error) {
    console.error('Error deleting settlement:', error);
    throw error;
  }
};
