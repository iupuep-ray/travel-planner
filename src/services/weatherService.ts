import { ICON_NAMES } from '@/utils/fontawesome';

type WeatherIconName = typeof ICON_NAMES[keyof typeof ICON_NAMES];

interface OpenMeteoDailyResponse {
  daily?: {
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

interface TripLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface HomeWeatherInfo {
  icon: WeatherIconName;
  temp: string;
  condition: string;
  location: string;
}

export const FORECAST_AVAILABLE_DAYS = 16;

const TRIP_LOCATIONS: Record<string, TripLocation> = {
  '05-12': { name: '大阪', latitude: 34.6937, longitude: 135.5023 },
  '05-13': { name: '大阪', latitude: 34.6937, longitude: 135.5023 },
  '05-14': { name: '大阪', latitude: 34.6937, longitude: 135.5023 },
  '05-15': { name: '大阪', latitude: 34.6937, longitude: 135.5023 },
  '05-16': { name: '京都宇治', latitude: 34.8844, longitude: 135.7997 },
  '05-17': { name: '京都天橋立', latitude: 35.5763, longitude: 135.1967 },
  '05-18': { name: '大阪', latitude: 34.6937, longitude: 135.5023 },
};
const TRIP_DATE_KEYS = ['05-12', '05-13', '05-14', '05-15', '05-16', '05-17', '05-18'] as const;

const formatMonthDay = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

const formatIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mapWeatherCodeToCondition = (code: number): { icon: WeatherIconName; condition: string } => {
  if (code === 0) {
    return { icon: ICON_NAMES.SUN, condition: '晴朗' };
  }

  if ([1, 2, 3, 45, 48].includes(code)) {
    return { icon: ICON_NAMES.CLOUD_SUN, condition: '多雲' };
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
    return { icon: ICON_NAMES.CLOUD_RAIN, condition: '降雨' };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { icon: ICON_NAMES.CLOUD_RAIN, condition: '降雪' };
  }

  return { icon: ICON_NAMES.CLOUD_SUN, condition: '陰天' };
};

export const getTripLocationByDate = (date: Date): TripLocation | null => {
  const key = formatMonthDay(date);
  return TRIP_LOCATIONS[key] || null;
};

export const getConfiguredTripDates = (year: number): Date[] => {
  return TRIP_DATE_KEYS.map((key) => {
    const [month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
  });
};

export const isWithinForecastRange = (date: Date, baseDate: Date = new Date()): boolean => {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const base = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()).getTime();
  const diffDays = Math.floor((target - base) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= FORECAST_AVAILABLE_DAYS;
};

export const fetchWeatherForDate = async (date: Date): Promise<HomeWeatherInfo | null> => {
  const location = getTripLocationByDate(date);
  if (!location) return null;

  const isoDate = formatIsoDate(date);
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'Asia/Tokyo',
    start_date: isoDate,
    end_date: isoDate,
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: HTTP ${response.status}`);
  }

  const data: OpenMeteoDailyResponse = await response.json();
  const weatherCode = data.daily?.weather_code?.[0];
  const tempMax = data.daily?.temperature_2m_max?.[0];
  const tempMin = data.daily?.temperature_2m_min?.[0];

  if (
    weatherCode === undefined ||
    tempMax === undefined ||
    tempMin === undefined
  ) {
    throw new Error('Open-Meteo API response missing required fields');
  }

  const { icon, condition } = mapWeatherCodeToCondition(weatherCode);
  const avgTemp = Math.round((tempMax + tempMin) / 2);

  return {
    icon,
    temp: `${avgTemp}°C`,
    condition: `${condition}（${Math.round(tempMin)}° ~ ${Math.round(tempMax)}°）`,
    location: location.name,
  };
};
