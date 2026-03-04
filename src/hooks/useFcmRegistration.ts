import { useEffect } from 'react';
import { clearFcmRegistrationState, registerFcmForUser } from '@/services/fcmService';

export const useFcmRegistration = (authUid: string | null) => {
  useEffect(() => {
    if (!authUid) {
      clearFcmRegistrationState();
      return;
    }

    registerFcmForUser(authUid).catch((error) => {
      console.error('FCM 註冊失敗:', error);
    });
  }, [authUid]);
};
