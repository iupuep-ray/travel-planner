import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
} from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { addMember } from '@/services/memberService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  memberExists: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberExists, setMemberExists] = useState(true);

  useEffect(() => {
    // 如果 Firebase 未配置，直接設定 loading 為 false
    if (!auth) {
      console.warn('Firebase Auth 未配置');
      setLoading(false);
      return;
    }

    let unsubscribeMember: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // 清除之前的成員監聽
      if (unsubscribeMember) {
        unsubscribeMember();
        unsubscribeMember = null;
      }

      if (user) {
        // 使用即時監聽檢查成員記錄（避免每次切換頁面都查詢）
        try {
          const membersQuery = query(
            collection(db, 'members'),
            where('authUid', '==', user.uid)
          );

          // 即時監聽成員記錄
          unsubscribeMember = onSnapshot(
            membersQuery,
            async (snapshot) => {
              if (snapshot.empty) {
                // 成員已被刪除，自動登出
                console.warn('成員記錄已被刪除，自動登出');
                setMemberExists(false);
                await firebaseSignOut(auth);
                setUser(null);
              } else {
                setMemberExists(true);
                setUser(user);
              }
              setLoading(false);
            },
            (error) => {
              console.error('Error listening to member:', error);
              setLoading(false);
            }
          );
        } catch (error) {
          console.error('Error setting up member listener:', error);
          setUser(user);
          setLoading(false);
        }
      } else {
        setUser(null);
        setMemberExists(true);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeMember) {
        unsubscribeMember();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase 尚未配置，請參考 FIREBASE_SETUP.md');
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // 檢查該使用者是否存在於成員列表中
      const membersQuery = query(
        collection(db, 'members'),
        where('authUid', '==', userCredential.user.uid)
      );
      const memberSnapshot = await getDocs(membersQuery);

      if (memberSnapshot.empty) {
        // 如果找不到對應的成員記錄，登出並拋出錯誤
        await firebaseSignOut(auth);
        throw new Error('此帳號已被停用');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      throw new Error('Firebase 尚未配置，請參考 FIREBASE_SETUP.md');
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });

      // 在成員列表中新增該使用者，並關聯 Auth UID
      try {
        await addMember({
          name: displayName,
          email: email,
          authUid: userCredential.user.uid, // 儲存 Firebase Auth UID
        });
      } catch (memberError) {
        console.error('Failed to add member:', memberError);
        // 即使新增成員失敗，註冊仍然成功
      }
    } catch (error: any) {
      // 如果是 Email 已存在的錯誤，檢查是否為已刪除的成員
      if (error.code === 'auth/email-already-in-use') {
        try {
          // 嘗試登入以取得 UID
          const userCredential = await signInWithEmailAndPassword(auth, email, password);

          // 檢查該帳號是否有對應的成員記錄
          const membersQuery = query(
            collection(db, 'members'),
            where('authUid', '==', userCredential.user.uid)
          );
          const memberSnapshot = await getDocs(membersQuery);

          if (memberSnapshot.empty) {
            // 帳號存在但成員已被刪除，重新建立成員記錄
            await updateProfile(userCredential.user, { displayName });
            await addMember({
              name: displayName,
              email: email,
              authUid: userCredential.user.uid,
            });
            // 登出後讓使用者重新登入
            await firebaseSignOut(auth);
            return; // 成功重新註冊
          } else {
            // 帳號存在且成員記錄也存在
            await firebaseSignOut(auth);
            throw new Error('此 Email 已被註冊');
          }
        } catch (reactivateError: any) {
          if (reactivateError.message === '此 Email 已被註冊') {
            throw reactivateError;
          }
          // 如果密碼錯誤，表示帳號確實存在且屬於其他人
          console.error('Reactivation error:', reactivateError);
          throw new Error('此 Email 已被註冊');
        }
      }
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase 尚未配置');
    }
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth || !auth.currentUser) {
      throw new Error('No user logged in');
    }
    try {
      await updateProfile(auth.currentUser, {
        displayName,
        ...(photoURL && { photoURL }),
      });
      // 強制更新 user 狀態
      setUser({ ...auth.currentUser });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    memberExists,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
