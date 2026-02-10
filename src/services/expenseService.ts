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
import { Expense } from '@/types';

const COLLECTION_NAME = 'expenses';

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>;

// 新增費用
export const addExpense = async (data: ExpenseInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

// 更新費用
export const updateExpense = async (id: string, data: Partial<ExpenseInput>): Promise<void> => {
  try {
    const expenseRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(expenseRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

// 刪除費用
export const deleteExpense = async (id: string): Promise<void> => {
  try {
    const expenseRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// 監聽費用列表（即時更新）
export const subscribeToExpenses = (
  callback: (expenses: Expense[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const expenses: Expense[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          description: data.description,
          amount: data.amount,
          currency: data.currency,
          payerId: data.payerId,
          splitIds: data.splitIds,
          isSettled: data.isSettled,
          date: data.date,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        };
      });
      callback(expenses);
    },
    (error) => {
      console.error('Error subscribing to expenses:', error);
      if (onError) onError(error);
    }
  );
};
