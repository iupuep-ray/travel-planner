// FontAwesome 配置與常用圖示

import { library } from '@fortawesome/fontawesome-svg-core';

// Solid Icons
import {
  faHouse,
  faCalendarDays,
  faWallet,
  faListCheck,
  faUsers,
  faPlane,
  faHotel,
  faUtensils,
  faMapLocationDot,
  faBagShopping,
  faCirclePlus,
  faCircleCheck,
  faCircleXmark,
  faChevronLeft,
  faChevronRight,
  faEllipsisVertical,
  faTrashCan,
  faPenToSquare,
  faMapMarkerAlt,
  faExternalLinkAlt,
  faImage,
  faCloudSun,
  faSun,
  faCloudRain,
  faCalculator,
  faList,
  faMoneyBill,
  faEnvelope,
  faCamera,
} from '@fortawesome/free-solid-svg-icons';

// Regular Icons
import {
  faCircleCheck as faCircleCheckRegular,
  faSquareCheck as faSquareCheckRegular,
} from '@fortawesome/free-regular-svg-icons';

// 將常用圖示加入 library
library.add(
  // Navigation
  faHouse,
  faCalendarDays,
  faWallet,
  faListCheck,
  faUsers,

  // Schedule Types
  faPlane,
  faHotel,
  faUtensils,
  faMapLocationDot,
  faBagShopping,

  // Actions
  faCirclePlus,
  faCircleCheck,
  faCircleXmark,
  faChevronLeft,
  faChevronRight,
  faEllipsisVertical,
  faTrashCan,
  faPenToSquare,

  // External
  faMapMarkerAlt,
  faExternalLinkAlt,
  faImage,

  // Weather
  faCloudSun,
  faSun,
  faCloudRain,

  // Expense
  faCalculator,
  faList,
  faMoneyBill,

  // Members
  faEnvelope,
  faCamera,

  // Regular
  faCircleCheckRegular,
  faSquareCheckRegular,
);

// 導出常用圖示名稱（供參考）
export const ICON_NAMES = {
  // Navigation
  HOME: 'house',
  CALENDAR: 'calendar-days',
  WALLET: 'wallet',
  LIST_CHECK: 'list-check',
  USERS: 'users',

  // Schedule Types
  PLANE: 'plane',
  HOTEL: 'hotel',
  UTENSILS: 'utensils',
  MAP_LOCATION: 'map-location-dot',
  SHOPPING: 'bag-shopping',

  // Actions
  ADD: 'circle-plus',
  CHECK: 'circle-check',
  CLOSE: 'circle-xmark',
  CHEVRON_LEFT: 'chevron-left',
  CHEVRON_RIGHT: 'chevron-right',
  MORE: 'ellipsis-vertical',
  DELETE: 'trash-can',
  EDIT: 'pen-to-square',

  // External
  MAP_MARKER: 'map-marker-alt',
  EXTERNAL_LINK: 'external-link-alt',
  IMAGE: 'image',

  // Weather
  CLOUD_SUN: 'cloud-sun',
  SUN: 'sun',
  CLOUD_RAIN: 'cloud-rain',

  // Expense
  CALCULATOR: 'calculator',
  LIST: 'list',
  MONEY: 'money-bill',

  // Members
  EMAIL: 'envelope',
  CAMERA: 'camera',
} as const;
