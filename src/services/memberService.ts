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
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Member } from '@/types';

const COLLECTION_NAME = 'members';

export interface MemberInput {
  name: string;
  email: string;
  avatar?: string;
  authUid?: string; // Firebase Auth UID
}

// 新增成員
export const addMember = async (data: MemberInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

// 更新成員
export const updateMember = async (id: string, data: Partial<MemberInput>): Promise<void> => {
  try {
    const memberRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(memberRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};

// 刪除成員（同時刪除關聯的帳號）
export const deleteMember = async (id: string): Promise<void> => {
  try {
    // 先取得成員資料以獲取 authUid
    const memberRef = doc(db, COLLECTION_NAME, id);
    const memberDoc = await getDocs(query(collection(db, COLLECTION_NAME), where('__name__', '==', id)));

    if (!memberDoc.empty) {
      const memberData = memberDoc.docs[0].data();
      const authUid = memberData.authUid;

      // 刪除 Firestore 成員資料
      await deleteDoc(memberRef);

      // 如果有關聯的帳號，提醒使用者需要刪除帳號
      // 注意：客戶端無法直接刪除其他使用者的帳號，需要後端支援或該使用者本人操作
      if (authUid) {
        console.warn(`成員關聯的帳號 UID: ${authUid}，需要後端服務刪除帳號`);
        // 如果是當前登入的使用者自己，可以刪除
        if (auth?.currentUser && auth.currentUser.uid === authUid) {
          // 這裡可以刪除當前使用者的帳號
          // 但通常刪除成員不應該刪除自己的帳號
          console.warn('無法刪除當前登入使用者的帳號');
        }
      }
    }
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

// 監聽成員列表（即時更新）
export const subscribeToMembers = (
  callback: (members: Member[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const members: Member[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          authUid: data.authUid,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        };
      });
      callback(members);
    },
    (error) => {
      console.error('Error subscribing to members:', error);
      if (onError) onError(error);
    }
  );
};
