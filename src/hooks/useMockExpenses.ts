import { useState } from 'react';
import type { Expense, Member } from '@/types';

// Mock 成員資料
const mockMembers: Member[] = [
  {
    id: 'member-1',
    name: '小明',
    email: 'ming@example.com',
    createdAt: '2024-03-01T10:00:00',
  },
  {
    id: 'member-2',
    name: '小華',
    email: 'hua@example.com',
    createdAt: '2024-03-01T10:00:00',
  },
  {
    id: 'member-3',
    name: '小美',
    email: 'mei@example.com',
    createdAt: '2024-03-01T10:00:00',
  },
];

// Mock 費用資料
const mockExpenses: Expense[] = [
  {
    id: 'expense-1',
    description: '東京地鐵一日券',
    amount: 800,
    currency: 'JPY',
    payerId: 'member-1',
    splitIds: ['member-1', 'member-2', 'member-3'],
    isSettled: false,
    date: '2024-03-15T10:00:00',
    createdAt: '2024-03-15T10:00:00',
  },
  {
    id: 'expense-2',
    description: '淺草寺門票',
    amount: 1500,
    currency: 'JPY',
    payerId: 'member-2',
    splitIds: ['member-1', 'member-2', 'member-3'],
    isSettled: false,
    date: '2024-03-16T11:30:00',
    createdAt: '2024-03-16T11:30:00',
  },
  {
    id: 'expense-3',
    description: '一蘭拉麵',
    amount: 2400,
    currency: 'JPY',
    payerId: 'member-3',
    splitIds: ['member-1', 'member-2', 'member-3'],
    isSettled: false,
    date: '2024-03-15T18:30:00',
    createdAt: '2024-03-15T18:30:00',
  },
  {
    id: 'expense-4',
    description: 'Uniqlo 購物',
    amount: 8000,
    currency: 'JPY',
    payerId: 'member-1',
    splitIds: ['member-1', 'member-2'],
    isSettled: true,
    date: '2024-03-16T14:00:00',
    createdAt: '2024-03-16T14:00:00',
  },
];

export const useMockExpenses = () => {
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [members] = useState<Member[]>(mockMembers);

  return {
    expenses,
    members,
  };
};
