import { useState } from 'react';
import type { PlanningItem, Member } from '@/types';

// Mock 準備清單資料
const mockPlanningItems: PlanningItem[] = [
  {
    id: 'todo-1',
    type: 'todo',
    content: '申請日本簽證',
    isDone: true,
    createdAt: '2024-03-01T10:00:00',
  },
  {
    id: 'todo-2',
    type: 'todo',
    content: '預訂機票',
    isDone: true,
    createdAt: '2024-03-01T10:05:00',
  },
  {
    id: 'todo-3',
    type: 'todo',
    content: '兌換日幣',
    isDone: false,
    assigneeIds: ['member-1'],
    createdAt: '2024-03-01T10:10:00',
  },
  {
    id: 'luggage-1',
    type: 'luggage',
    content: '護照',
    isDone: false,
    createdAt: '2024-03-01T11:00:00',
  },
  {
    id: 'luggage-2',
    type: 'luggage',
    content: '轉接頭',
    isDone: false,
    assigneeIds: ['member-2'],
    createdAt: '2024-03-01T11:05:00',
  },
  {
    id: 'luggage-3',
    type: 'luggage',
    content: '常備藥品',
    isDone: true,
    createdAt: '2024-03-01T11:10:00',
  },
  {
    id: 'shopping-1',
    type: 'shopping',
    content: '發熱衣',
    isDone: false,
    relatedScheduleId: '5',
    createdAt: '2024-03-01T12:00:00',
  },
  {
    id: 'shopping-2',
    type: 'shopping',
    content: 'AIRism',
    isDone: false,
    relatedScheduleId: '5',
    createdAt: '2024-03-01T12:05:00',
  },
  {
    id: 'shopping-3',
    type: 'shopping',
    content: '牛仔褲',
    isDone: true,
    relatedScheduleId: '5',
    createdAt: '2024-03-01T12:10:00',
  },
  {
    id: 'shopping-4',
    type: 'shopping',
    content: '藥妝',
    isDone: false,
    relatedScheduleId: '8',
    createdAt: '2024-03-01T12:15:00',
  },
  {
    id: 'shopping-5',
    type: 'shopping',
    content: '零食',
    isDone: false,
    relatedScheduleId: '8',
    createdAt: '2024-03-01T12:20:00',
  },
  {
    id: 'shopping-6',
    type: 'shopping',
    content: '泡麵',
    isDone: false,
    assigneeIds: ['member-1'],
    relatedScheduleId: '8',
    createdAt: '2024-03-01T12:25:00',
  },
  {
    id: 'shopping-7',
    type: 'shopping',
    content: '保溫瓶',
    isDone: true,
    createdAt: '2024-03-01T12:30:00',
  },
  {
    id: 'shopping-8',
    type: 'shopping',
    content: '明信片',
    isDone: false,
    assigneeIds: ['member-2', 'member-3'], // 多選範例
    createdAt: '2024-03-01T12:35:00',
  },
];

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

export const useMockPlanning = () => {
  const [planningItems] = useState<PlanningItem[]>(mockPlanningItems);
  const [members] = useState<Member[]>(mockMembers);

  return {
    planningItems,
    members,
  };
};
