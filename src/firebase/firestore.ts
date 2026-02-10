import { db } from './config';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  CollectionReference,
  DocumentData,
  Firestore
} from 'firebase/firestore';
import type { Schedule, PlanningItem, Expense, Member } from '@/types';

// Collection references (使用非空斷言，因為在使用前會檢查 Firebase 是否已配置)
export const schedulesRef = collection(db as Firestore, 'schedules') as CollectionReference<Schedule>;
export const planningRef = collection(db as Firestore, 'planning') as CollectionReference<PlanningItem>;
export const expensesRef = collection(db as Firestore, 'expenses') as CollectionReference<Expense>;
export const membersRef = collection(db as Firestore, 'members') as CollectionReference<Member>;

// Helper function to convert dates to Firestore Timestamp
export const toTimestamp = (dateString: string): Timestamp => {
  return Timestamp.fromDate(new Date(dateString));
};

// Helper function to convert Firestore Timestamp to ISO string
export const fromTimestamp = (timestamp: Timestamp): string => {
  return timestamp.toDate().toISOString();
};

// Schedule CRUD operations
export const scheduleService = {
  async getAll() {
    const q = query(schedulesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  },

  async add(schedule: Omit<Schedule, 'id'>) {
    const docRef = await addDoc(schedulesRef, {
      ...schedule,
      createdAt: new Date().toISOString(),
    } as DocumentData);
    return docRef.id;
  },

  async update(id: string, data: Partial<Schedule>) {
    const docRef = doc(db as Firestore, 'schedules', id);
    await updateDoc(docRef, data as DocumentData);
  },

  async delete(id: string) {
    const docRef = doc(db as Firestore, 'schedules', id);
    await deleteDoc(docRef);
  },
};

// Planning CRUD operations
export const planningService = {
  async getAll() {
    const q = query(planningRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  },

  async add(item: Omit<PlanningItem, 'id'>) {
    const docRef = await addDoc(planningRef, {
      ...item,
      createdAt: new Date().toISOString(),
    } as DocumentData);
    return docRef.id;
  },

  async update(id: string, data: Partial<PlanningItem>) {
    const docRef = doc(db as Firestore, 'planning', id);
    await updateDoc(docRef, data as DocumentData);
  },

  async delete(id: string) {
    const docRef = doc(db as Firestore, 'planning', id);
    await deleteDoc(docRef);
  },

  async deleteByScheduleId(scheduleId: string) {
    const q = query(planningRef, where('relatedScheduleId', '==', scheduleId));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },
};

// Expense CRUD operations
export const expenseService = {
  async getAll() {
    const q = query(expensesRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  },

  async add(expense: Omit<Expense, 'id'>) {
    const docRef = await addDoc(expensesRef, {
      ...expense,
      createdAt: new Date().toISOString(),
    } as DocumentData);
    return docRef.id;
  },

  async update(id: string, data: Partial<Expense>) {
    const docRef = doc(db as Firestore, 'expenses', id);
    await updateDoc(docRef, data as DocumentData);
  },

  async delete(id: string) {
    const docRef = doc(db as Firestore, 'expenses', id);
    await deleteDoc(docRef);
  },
};

// Member CRUD operations
export const memberService = {
  async getAll() {
    const q = query(membersRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  },

  async add(member: Omit<Member, 'id'>) {
    const docRef = await addDoc(membersRef, {
      ...member,
      createdAt: new Date().toISOString(),
    } as DocumentData);
    return docRef.id;
  },

  async update(id: string, data: Partial<Member>) {
    const docRef = doc(db as Firestore, 'members', id);
    await updateDoc(docRef, data as DocumentData);
  },

  async delete(id: string) {
    const docRef = doc(db as Firestore, 'members', id);
    await deleteDoc(docRef);
  },
};
