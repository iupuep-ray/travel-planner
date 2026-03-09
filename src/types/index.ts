// 行程類型定義
export type ScheduleType = 'flight' | 'lodging' | 'restaurant' | 'spot' | 'shopping';

export interface TransportStep {
  id: string;
  mode: string;
  duration: string;
}

export interface TransportPlan {
  id: string;
  steps: TransportStep[];
}

export interface ScheduleTransportMeta {
  transportPlans?: TransportPlan[];
  selectedTransportPlanId?: string;
}

// 機票資訊
export interface FlightSchedule extends ScheduleTransportMeta {
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
export interface LodgingSchedule extends ScheduleTransportMeta {
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
export interface RestaurantSchedule extends ScheduleTransportMeta {
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
export interface SpotSchedule extends ScheduleTransportMeta {
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
export interface ShoppingSchedule extends ScheduleTransportMeta {
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
  createdByAuthUid?: string; // 建立者帳號 UID（通知目標之一）
  notificationEnabled?: boolean; // 僅 Todo 使用
  notificationAt?: string; // 首次提醒時間（ISO 字串）
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
  splitAmounts?: Record<string, number>; // 各分攤對象金額（同幣別）
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
