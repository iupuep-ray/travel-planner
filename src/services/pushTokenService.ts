import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_NAME = 'pushTokens';

export const savePushToken = async (authUid: string, token: string): Promise<void> => {
  const tokenDocRef = doc(db, COLLECTION_NAME, token);
  await setDoc(
    tokenDocRef,
    {
      authUid,
      token,
      updatedAt: Timestamp.now(),
      userAgent: navigator.userAgent,
    },
    { merge: true }
  );
};

