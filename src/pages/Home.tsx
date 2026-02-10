import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

const Home = () => {
  const { schedules, loading } = useSchedules();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // 計算旅遊日期範圍
  const travelDates = useMemo(() => {
    if (schedules.length === 0) return [];

    let minDate = new Date();
    let maxDate = new Date();

    schedules.forEach((schedule) => {
      let scheduleDate: Date;

      if (schedule.type === 'flight') {
        scheduleDate = parseDate(schedule.departure.dateTime);
      } else if (schedule.type === 'lodging') {
        const checkIn = parseDate(schedule.checkIn);
        const checkOut = parseDate(schedule.checkOut);
        if (checkIn < minDate || minDate.toISOString() === new Date().toISOString()) {
          minDate = checkIn;
        }
        if (checkOut > maxDate) {
          maxDate = checkOut;
        }
        return;
      } else {
        scheduleDate = parseDate(schedule.startDateTime);
      }

      if (minDate.toISOString() === new Date().toISOString() || scheduleDate < minDate) {
        minDate = scheduleDate;
      }
      if (scheduleDate > maxDate) {
        maxDate = scheduleDate;
      }
    });

    return getDaysBetween(minDate, maxDate);
  }, [schedules]);

  const [selectedDate, setSelectedDate] = useState<Date>(
    travelDates.length > 0 ? travelDates[0] : new Date()
  );

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
        const checkInDate = new Date(formatDate(checkIn));
        const checkOutDate = new Date(formatDate(checkOut));
        const currentDate = new Date(formatDate(selectedDate));

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

  // 模擬天氣資訊
  const weather = useMemo(() => {
    const random = selectedDate.getDate() % 3;
    const weathers = [
      { icon: ICON_NAMES.SUN, temp: '18°C', condition: '晴天' },
      { icon: ICON_NAMES.CLOUD_SUN, temp: '16°C', condition: '多雲' },
      { icon: ICON_NAMES.CLOUD_RAIN, temp: '14°C', condition: '雨天' },
    ];
    return weathers[random];
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="pb-20 relative z-10">
        {/* Weather Header Skeleton */}
        <div
          className="py-8 px-4 mb-4 rounded-b-[40px] relative z-10"
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
    );
  }

  return (
    <div className="pb-20 relative z-10">
      {/* Weather Header */}
      <div
        className="text-white py-8 px-4 mb-4 rounded-b-[40px] relative z-10"
        style={{ backgroundColor: '#78A153' }}
      >
        {/* Weather Content */}
        <div className="flex items-center justify-center gap-3">
          <FontAwesomeIcon
            icon={['fas', weather.icon]}
            className="text-5xl drop-shadow-lg"
          />
          <div>
            <p className="text-3xl font-bold drop-shadow-md">{weather.temp}</p>
            <p className="text-sm opacity-90">{weather.condition}</p>
          </div>
        </div>
      </div>

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
  );
};

export default Home;
