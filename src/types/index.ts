// 行程類型定義
export type ScheduleType = 'flight' | 'lodging' | 'restaurant' | 'spot' | 'shopping';

// 機票資訊
export interface FlightSchedule {
  type: 'flight';
  id: string;
  flightNumber: string;
  departure: {
    airport: string;
    terminal: string;
    gate: string;
    dateTime: string;
  };
  arrival: {
    airport: string;
    terminal: string;
    gate: string;
    dateTime: string;
  };
  seat: string;
  notes?: string;
  images?: string[];
  createdAt: string;
}

// 住宿資訊
export interface LodgingSchedule {
  type: 'lodging';
  id: string;
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  url?: string;
  notes?: string;
  images?: string[];
  createdAt: string;
}

// 餐廳資訊
export interface RestaurantSchedule {
  type: 'restaurant';
  id: string;
  name: string;
  address: string;
  startDateTime: string;
  endDateTime?: string;
  url?: string;
  notes?: string;
  images?: string[];
  createdAt: string;
}

// 景點資訊
export interface SpotSchedule {
  type: 'spot';
  id: string;
  name: string;
  address: string;
  startDateTime: string;
  endDateTime?: string;
  url?: string;
  notes?: string;
  images?: string[];
  createdAt: string;
}

// 購物資訊
export interface ShoppingSchedule {
  type: 'shopping';
  id: string;
  name: string;
  address: string;
  startDateTime: string;
  endDateTime?: string;
  url?: string;
  notes?: string;
  images?: string[];
  shoppingItems?: string[]; // 購物物品清單
  createdAt: string;
}

export type Schedule = FlightSchedule | LodgingSchedule | RestaurantSchedule | SpotSchedule | ShoppingSchedule;

// 準備清單類型
export type PlanningType = 'todo' | 'luggage' | 'shopping';

export interface PlanningItem {
  id: string;
  type: PlanningType;
  content: string;
  isDone: boolean;
  assigneeIds?: string[]; // 改為多選陣列
  relatedScheduleId?: string; // 關聯的購物行程 ID
  createdAt: string;
}

// 費用記錄
export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: 'JPY' | 'NTD';
  payerId: string;
  splitIds: string[]; // 分攤對象
  isSettled: boolean;
  date: string;
  createdAt: string;
}

// 成員資訊
export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  authUid?: string; // Firebase Auth UID（關聯帳號）
  createdAt: string;
}

// 清算結果
export interface SettlementResult {
  from: string; // 成員 ID
  to: string; // 成員 ID
  amount: number; // NTD
  isSettled: boolean;
}
