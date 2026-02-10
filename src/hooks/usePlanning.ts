import { useState, useEffect } from 'react';
import { PlanningItem, PlanningType } from '@/types';
import {
  addPlanningItem,
  updatePlanningItem,
  deletePlanningItem,
  subscribeToPlanningItems,
  PlanningInput,
} from '@/services/planningService';

export const usePlanning = (type: PlanningType) => {
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 訂閱 Firestore 即時更新（依類型篩選）
    const unsubscribe = subscribeToPlanningItems(
      type,
      (updatedItems) => {
        setItems(updatedItems);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    // 清理訂閱
    return () => unsubscribe();
  }, [type]);

  const createItem = async (data: PlanningInput): Promise<void> => {
    try {
      await addPlanningItem(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const editItem = async (id: string, data: Partial<PlanningInput>): Promise<void> => {
    try {
      await updatePlanningItem(id, data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeItem = async (id: string): Promise<void> => {
    try {
      await deletePlanningItem(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const toggleItem = async (id: string, isDone: boolean): Promise<void> => {
    try {
      await updatePlanningItem(id, { isDone });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    createItem,
    editItem,
    removeItem,
    toggleItem,
  };
};
