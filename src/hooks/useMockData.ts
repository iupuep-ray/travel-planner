import { useState } from 'react';
import type { Schedule } from '@/types';

// Mock data for development (before Firebase is configured)
const mockSchedules: Schedule[] = [
  {
    type: 'flight',
    id: '1',
    flightNumber: 'BR189',
    departure: {
      airport: 'TPE',
      terminal: '2',
      gate: 'D5',
      dateTime: '2024-03-15T08:30:00',
    },
    arrival: {
      airport: 'NRT',
      terminal: '1',
      gate: 'A12',
      dateTime: '2024-03-15T12:45:00',
    },
    seat: '23A',
    notes: '記得提早 3 小時到機場',
    createdAt: '2024-03-01T10:00:00',
  },
  {
    type: 'flight',
    id: '7',
    flightNumber: 'BR190',
    departure: {
      airport: 'NRT',
      terminal: '1',
      gate: 'B7',
      dateTime: '2024-03-18T14:30:00',
    },
    arrival: {
      airport: 'TPE',
      terminal: '2',
      gate: 'C3',
      dateTime: '2024-03-18T17:15:00',
    },
    seat: '18C',
    notes: '回程班機，記得提早 2 小時到機場',
    createdAt: '2024-03-01T10:30:00',
  },
  {
    type: 'lodging',
    id: '2',
    name: 'Hotel Gracery Shinjuku',
    address: '東京都新宿區歌舞伎町1-19-1',
    checkIn: '2024-03-15T15:00:00',
    checkOut: '2024-03-18T11:00:00',
    url: 'https://example.com',
    notes: '哥吉拉飯店，房間在20樓',
    createdAt: '2024-03-01T10:05:00',
  },
  {
    type: 'restaurant',
    id: '3',
    name: '一蘭拉麵 新宿店',
    address: '東京都新宿區新宿3-34-11',
    startDateTime: '2024-03-15T18:00:00',
    endDateTime: '2024-03-15T19:30:00',
    notes: '要點加辣！',
    createdAt: '2024-03-01T10:10:00',
  },
  {
    type: 'spot',
    id: '4',
    name: '淺草寺',
    address: '東京都台東區淺草2-3-1',
    startDateTime: '2024-03-16T09:00:00',
    endDateTime: '2024-03-16T11:30:00',
    notes: '記得抽籤求御守',
    createdAt: '2024-03-01T10:15:00',
  },
  {
    type: 'shopping',
    id: '5',
    name: 'Uniqlo 銀座旗艦店',
    address: '東京都中央區銀座6-9-5',
    startDateTime: '2024-03-16T14:00:00',
    endDateTime: '2024-03-16T16:00:00',
    shoppingItems: ['發熱衣', 'AIRism', '牛仔褲'],
    notes: '記得帶護照辦理免稅',
    createdAt: '2024-03-01T10:20:00',
  },
  {
    type: 'shopping',
    id: '8',
    name: '唐吉訶德 新宿店',
    address: '東京都新宿區歌舞伎町1-16-5',
    startDateTime: '2024-03-17T19:00:00',
    endDateTime: '2024-03-17T21:00:00',
    shoppingItems: ['藥妝', '零食', '泡麵'],
    notes: '記得使用優惠券',
    createdAt: '2024-03-01T10:35:00',
  },
  {
    type: 'spot',
    id: '6',
    name: '晴空塔',
    address: '東京都墨田區押上1-1-2',
    startDateTime: '2024-03-17T10:00:00',
    endDateTime: '2024-03-17T12:00:00',
    notes: '已預約 10:00 入場',
    createdAt: '2024-03-01T10:25:00',
  },
];

export const useMockData = () => {
  const [schedules] = useState<Schedule[]>(mockSchedules);

  return {
    schedules,
  };
};
