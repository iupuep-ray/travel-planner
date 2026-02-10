import { useState, useEffect } from 'react';
import { Member } from '@/types';
import {
  addMember,
  updateMember,
  deleteMember,
  subscribeToMembers,
  MemberInput,
} from '@/services/memberService';

export const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 訂閱 Firestore 即時更新
    const unsubscribe = subscribeToMembers(
      (updatedMembers) => {
        setMembers(updatedMembers);
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

  const createMember = async (data: MemberInput): Promise<void> => {
    try {
      await addMember(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const editMember = async (id: string, data: Partial<MemberInput>): Promise<void> => {
    try {
      await updateMember(id, data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeMember = async (id: string): Promise<void> => {
    try {
      await deleteMember(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    members,
    loading,
    error,
    createMember,
    editMember,
    removeMember,
  };
};
