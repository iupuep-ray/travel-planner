import { useState, useMemo, useEffect } from 'react';
import DatePicker from '@/components/DatePicker';
import ScheduleCard from '@/components/ScheduleCard';
import BottomSheet from '@/components/BottomSheet';
import ScheduleDetail from '@/components/ScheduleDetail';
import ScheduleCardSkeleton from '@/components/skeletons/ScheduleCardSkeleton';
import { useSchedules } from '@/hooks/useSchedules';
import { formatDate, parseDate, getDaysBetween, isSameDay } from '@/utils/date';
import { ICON_NAMES } from '@/utils/fontawesome';
import { LOCAL_IMAGES } from '@/config/images';
import type { Schedule } from '@/types';
import {
  fetchWeatherForDate,
  getConfiguredTripDates,
  getTripLocationByDate,
  isWithinForecastRange,
  type HomeWeatherInfo,
} from '@/services/weatherService';

const Home = () => {
  const BASE_URL = import.meta.env.BASE_URL;
  const getImagePath = (path: string) => `${BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;
  const WEATHER_IMAGE_MAP: Record<string, string> = {
    [ICON_NAMES.SUN]: getImagePath('/newpic/weather_hare.png'),
    [ICON_NAMES.CLOUD_SUN]: getImagePath('/newpic/weather_cloudy.png'),
    [ICON_NAMES.CLOUD_RAIN]: getImagePath('/newpic/weather_rain.png'),
  };

  const { schedules, loading } = useSchedules();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [weather, setWeather] = useState<HomeWeatherInfo>({
    icon: ICON_NAMES.CLOUD_SUN,
    temp: '--°C',
    condition: '天氣載入中...',
    location: '大阪',
  });
  const [weatherLoading, setWeatherLoading] = useState(false);
  const weatherImage = WEATHER_IMAGE_MAP[weather.icon] || WEATHER_IMAGE_MAP[ICON_NAMES.CLOUD_SUN];

  // 計算旅遊日期範圍
  const travelDates = useMemo(() => {
    const configuredDates = getConfiguredTripDates(new Date().getFullYear());
    if (schedules.length === 0) return configuredDates;

    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    schedules.forEach((schedule) => {
      let scheduleDate: Date;

      if (schedule.type === 'flight') {
        scheduleDate = parseDate(schedule.departure.dateTime);
      } else if (schedule.type === 'lodging') {
        const checkIn = parseDate(schedule.checkIn);
        const checkOut = parseDate(schedule.checkOut);
        if (!minDate || checkIn < minDate) {
          minDate = checkIn;
        }
        if (!maxDate || checkOut > maxDate) {
          maxDate = checkOut;
        }
        return;
      } else {
        scheduleDate = parseDate(schedule.startDateTime);
      }

      if (!minDate || scheduleDate < minDate) {
        minDate = scheduleDate;
      }
      if (!maxDate || scheduleDate > maxDate) {
        maxDate = scheduleDate;
      }
    });

    const scheduleDates = minDate && maxDate ? getDaysBetween(minDate, maxDate) : [];
    const mergedDates = [...scheduleDates, ...configuredDates];
    const uniqueDateMap = new Map<string, Date>();

    mergedDates.forEach((date) => {
      uniqueDateMap.set(formatDate(date), date);
    });

    return [...uniqueDateMap.values()].sort((a, b) => a.getTime() - b.getTime());
  }, [schedules]);

  const [selectedDate, setSelectedDate] = useState<Date>(
    travelDates.length > 0 ? travelDates[0] : new Date()
  );
  // 預覽用：若目前判斷為多雲，依日期輪替不同天氣圖，方便視覺確認
  const previewWeatherImage = weather.icon === ICON_NAMES.CLOUD_SUN
    ? [WEATHER_IMAGE_MAP[ICON_NAMES.SUN], WEATHER_IMAGE_MAP[ICON_NAMES.CLOUD_SUN], WEATHER_IMAGE_MAP[ICON_NAMES.CLOUD_RAIN]][selectedDate.getDate() % 3]
    : weatherImage;

  // 為特定日期篩選和排序行程
  const schedulesForDate = useMemo(() => {
    const filtered: Schedule[] = [];

    schedules.forEach((schedule) => {
      if (schedule.type === 'flight') {
        const departureDate = parseDate(schedule.departure.dateTime);
        if (isSameDay(departureDate, selectedDate)) {
          filtered.push(schedule);
        }
      } else if (schedule.type === 'lodging') {
        // 跨日顯示：在入住到退房期間的每一天都顯示
        const checkIn = parseDate(schedule.checkIn);
        const checkOut = parseDate(schedule.checkOut);
        const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
        const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
        const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

        if (currentDate >= checkInDate && currentDate < checkOutDate) {
          filtered.push(schedule);
        }
      } else {
        const startDate = parseDate(schedule.startDateTime);
        if (isSameDay(startDate, selectedDate)) {
          filtered.push(schedule);
        }
      }
    });

    // 排序：優先根據 startDateTime，時間相同時依建立時間
    return filtered.sort((a, b) => {
      let timeA: string;
      let timeB: string;

      if (a.type === 'flight') {
        timeA = a.departure.dateTime;
      } else if (a.type === 'lodging') {
        timeA = a.checkIn;
      } else {
        timeA = a.startDateTime;
      }

      if (b.type === 'flight') {
        timeB = b.departure.dateTime;
      } else if (b.type === 'lodging') {
        timeB = b.checkIn;
      } else {
        timeB = b.startDateTime;
      }

      const timeCompare = new Date(timeA).getTime() - new Date(timeB).getTime();
      if (timeCompare !== 0) return timeCompare;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [schedules, selectedDate]);

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      const location = getTripLocationByDate(selectedDate);
      if (!location) {
        setWeather({
          icon: ICON_NAMES.CLOUD_SUN,
          temp: '--°C',
          condition: '此日期未設定天氣查詢地點',
          location: '未指定',
        });
        return;
      }

      if (!isWithinForecastRange(selectedDate)) {
        setWeather({
          icon: ICON_NAMES.CLOUD_SUN,
          temp: '--°C',
          condition: '需於16天內才可取得天氣預報資訊',
          location: location.name,
        });
        return;
      }

      setWeatherLoading(true);
      try {
        const result = await fetchWeatherForDate(selectedDate);
        if (!cancelled && result) {
          setWeather(result);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('取得天氣預報失敗:', error);
          setWeather({
            icon: ICON_NAMES.CLOUD_SUN,
            temp: '--°C',
            condition: '天氣預報暫時無法取得',
            location: location.name,
          });
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    };

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  if (loading) {
    return (
      <>
        {/* Weather Header Skeleton */}
        <div
          className="sticky top-0 pb-6 pt-[calc(var(--app-safe-top)+1rem)] px-4 mb-4 rounded-b-[40px] relative z-30"
          style={{ backgroundColor: '#78A153' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 animate-pulse" />
              <div>
                <div className="w-24 h-6 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="w-32 h-4 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-20 h-8 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="pb-20 relative z-10">
          {/* Date Picker Skeleton */}
          <div className="px-4 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-16 h-20 bg-cream rounded-[20px] animate-pulse" />
              ))}
            </div>
          </div>

          {/* Schedule Cards Skeleton */}
          <div className="px-4">
            {[...Array(3)].map((_, i) => (
              <ScheduleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Weather Header */}
      <div
        className="sticky top-0 text-white pb-6 pt-[calc(var(--app-safe-top)+1rem)] px-4 mb-4 rounded-b-[40px] relative z-30"
        style={{ backgroundColor: '#78A153' }}
      >
        {/* Weather Content */}
        <div className="flex items-center justify-center gap-3">
          <img
            src={previewWeatherImage}
            alt={weather.condition}
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
          <div>
            <p className="text-3xl font-bold drop-shadow-md">{weather.temp}</p>
            <p className="text-sm opacity-90">{weather.condition}</p>
            <p className="text-xs opacity-80 mt-1">
              {weather.location}
              {weatherLoading ? ' ・ 更新中...' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="pb-20 relative z-10">
        {/* Date Picker */}
        {travelDates.length > 0 && (
          <DatePicker
            dates={travelDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {/* Timeline */}
        <div className="px-4 relative z-10">
          {schedulesForDate.length === 0 ? (
            <div className="card text-center py-16 relative overflow-hidden">
              {/* Empty State with Image */}
              <div className="flex justify-center mb-4">
                <img
                  src={LOCAL_IMAGES.emptyStates.noSchedule}
                  alt=""
                  className="w-24 h-24 opacity-40"
                />
              </div>
              <div className="relative z-10">
                <p className="text-brown opacity-60 text-base font-medium">這天沒有安排行程</p>
                <p className="text-brown opacity-40 text-sm mt-2">享受自由的一天吧！</p>
              </div>
            </div>
          ) : (
            <div>
              {schedulesForDate.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onClick={() => setSelectedSchedule(schedule)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Bottom Sheet */}
        <BottomSheet
          isOpen={selectedSchedule !== null}
          onClose={() => setSelectedSchedule(null)}
        >
          {selectedSchedule && <ScheduleDetail schedule={selectedSchedule} />}
        </BottomSheet>
      </div>
    </>
  );
};

export default Home;
