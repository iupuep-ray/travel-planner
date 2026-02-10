import { useState, useEffect } from 'react';
import { Schedule } from '@/types';
import {
  addSchedule,
  updateSchedule,
  deleteSchedule,
  subscribeToSchedules,
  ScheduleInput,
} from '@/services/scheduleService';

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 訂閱 Firestore 即時更新
    const unsubscribe = subscribeToSchedules(
      (updatedSchedules) => {
        setSchedules(updatedSchedules);
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

  const createSchedule = async (data: ScheduleInput): Promise<string> => {
    try {
      const scheduleId = await addSchedule(data);
      return scheduleId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const editSchedule = async (id: string, data: Partial<ScheduleInput>): Promise<void> => {
    try {
      await updateSchedule(id, data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeSchedule = async (id: string): Promise<void> => {
    try {
      await deleteSchedule(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    schedules,
    loading,
    error,
    createSchedule,
    editSchedule,
    removeSchedule,
  };
};
