import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import {
  addExpense,
  updateExpense,
  deleteExpense,
  subscribeToExpenses,
  ExpenseInput,
} from '@/services/expenseService';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 訂閱 Firestore 即時更新
    const unsubscribe = subscribeToExpenses(
      (updatedExpenses) => {
        setExpenses(updatedExpenses);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    // 清理訂閱
    return () => unsubscribe();
  }, []);

  const createExpense = async (data: ExpenseInput): Promise<void> => {
    try {
      await addExpense(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const editExpense = async (id: string, data: Partial<ExpenseInput>): Promise<void> => {
    try {
      await updateExpense(id, data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeExpense = async (id: string): Promise<void> => {
    try {
      await deleteExpense(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    expenses,
    loading,
    error,
    createExpense,
    editExpense,
    removeExpense,
  };
};
