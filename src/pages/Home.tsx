import { useState, useMemo, useEffect, useRef } from 'react';
import DatePicker from '@/components/DatePicker';
import ScheduleCard from '@/components/ScheduleCard';
import BottomSheet from '@/components/BottomSheet';
import ScheduleDetail from '@/components/ScheduleDetail';
import ScheduleForm, { ScheduleFormSubmitData } from '@/components/ScheduleForm';
import TransportPlanSheet from '@/components/TransportPlanSheet';
import ScheduleCardSkeleton from '@/components/skeletons/ScheduleCardSkeleton';
import { useSchedules } from '@/hooks/useSchedules';
import { updateShoppingItemsFromSchedule } from '@/services/planningService';
import { formatDate, parseDate, getDaysBetween, isSameDay } from '@/utils/date';
import { ICON_NAMES } from '@/utils/fontawesome';
import { LOCAL_IMAGES } from '@/config/images';
import type { Schedule, TransportPlan, TransportStep } from '@/types';
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

  const { schedules, loading, editSchedule } = useSchedules();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [transportEditingContext, setTransportEditingContext] = useState<{
    fromSchedule: Schedule | null;
    ownerSchedule: Schedule;
  } | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [weather, setWeather] = useState<HomeWeatherInfo>({
    icon: ICON_NAMES.CLOUD_SUN,
    temp: '--°C',
    condition: '天氣載入中...',
    location: '大阪',
  });
  const [weatherLoading, setWeatherLoading] = useState(false);
  const hasInitializedSelectedDate = useRef(false);
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
      const aIsLodging = a.type === 'lodging';
      const bIsLodging = b.type === 'lodging';

      // 住宿一律放在當天列表最後
      if (aIsLodging !== bIsLodging) {
        return aIsLodging ? 1 : -1;
      }

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

  const firstTripScheduleId = useMemo(() => {
    if (travelDates.length === 0 || schedules.length === 0) return null;

    const firstTripDate = travelDates[0];
    const firstDaySchedules: Schedule[] = [];

    schedules.forEach((schedule) => {
      if (schedule.type === 'flight') {
        const departureDate = parseDate(schedule.departure.dateTime);
        if (isSameDay(departureDate, firstTripDate)) {
          firstDaySchedules.push(schedule);
        }
      } else if (schedule.type === 'lodging') {
        const checkIn = parseDate(schedule.checkIn);
        const checkOut = parseDate(schedule.checkOut);
        const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
        const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
        const currentDate = new Date(
          firstTripDate.getFullYear(),
          firstTripDate.getMonth(),
          firstTripDate.getDate()
        );

        if (currentDate >= checkInDate && currentDate < checkOutDate) {
          firstDaySchedules.push(schedule);
        }
      } else {
        const startDate = parseDate(schedule.startDateTime);
        if (isSameDay(startDate, firstTripDate)) {
          firstDaySchedules.push(schedule);
        }
      }
    });

    const sortedFirstDaySchedules = firstDaySchedules.sort((a, b) => {
      const aIsLodging = a.type === 'lodging';
      const bIsLodging = b.type === 'lodging';

      if (aIsLodging !== bIsLodging) {
        return aIsLodging ? 1 : -1;
      }

      const getTime = (item: Schedule) => {
        if (item.type === 'flight') return item.departure.dateTime;
        if (item.type === 'lodging') return item.checkIn;
        return item.startDateTime;
      };

      const timeCompare = new Date(getTime(a)).getTime() - new Date(getTime(b)).getTime();
      if (timeCompare !== 0) return timeCompare;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return sortedFirstDaySchedules[0]?.id || null;
  }, [travelDates, schedules]);

  useEffect(() => {
    if (hasInitializedSelectedDate.current || travelDates.length === 0) {
      return;
    }

    const today = new Date();
    const matchedDate = travelDates.find((date) => isSameDay(date, today));

    setSelectedDate(matchedDate || travelDates[0]);
    hasInitializedSelectedDate.current = true;
  }, [travelDates]);

  const getSelectedTransportPlan = (schedule: Schedule): TransportPlan | undefined => {
    const plans = schedule.transportPlans || [];
    return plans.find((plan) => plan.id === schedule.selectedTransportPlanId) || plans[0];
  };

  const parseDurationToMinutes = (raw: string): number | null => {
    const text = raw.trim();
    if (!text) return null;

    let total = 0;
    let found = false;
    const hourRegex = /(\d+(?:\.\d+)?)(?=\s*(?:h|hr|hrs|hour|hours|小時|時))/gi;
    const minuteRegex = /(\d+(?:\.\d+)?)(?=\s*(?:m|min|mins|minute|minutes|分鐘|分))/gi;

    let match: RegExpExecArray | null;
    while ((match = hourRegex.exec(text)) !== null) {
      total += Number(match[1]) * 60;
      found = true;
    }
    while ((match = minuteRegex.exec(text)) !== null) {
      total += Number(match[1]);
      found = true;
    }

    if (!found) {
      const compact = text.replace(/\s+/g, '');
      if (/^\d+(?:\.\d+)?$/.test(compact)) {
        total = Number(compact);
        found = true;
      }
    }

    if (!found || Number.isNaN(total)) return null;
    return Math.round(total);
  };

  const formatTotalMinutes = (totalMinutes: number): string => {
    if (totalMinutes < 60) return `${totalMinutes} 分鐘`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) return `${hours} 小時`;
    return `${hours} 小時 ${minutes} 分鐘`;
  };

  const getTotalMinutes = (steps: TransportStep[]): number | null => {
    let total = 0;
    for (const step of steps) {
      const minutes = parseDurationToMinutes(step.duration || '');
      if (minutes === null) return null;
      total += minutes;
    }
    return total;
  };

  const buildTransportSummary = (schedule: Schedule): {
    lines: string[];
    totalLabel: string | null;
    hasPlan: boolean;
  } => {
    const selectedPlan = getSelectedTransportPlan(schedule);
    if (!selectedPlan || selectedPlan.steps.length === 0) {
      return { lines: ['設定交通方式'], totalLabel: null, hasPlan: false };
    }

    const rawLines = selectedPlan.steps
      .map((step) => [step.mode, step.duration].filter(Boolean).join(' ').trim())
      .filter(Boolean);

    if (rawLines.length === 0) {
      return { lines: ['設定交通方式'], totalLabel: null, hasPlan: false };
    }

    const lines = rawLines.map((line, index) => (index === 0 ? line : `→ ${line}`));
    const totalMinutes = getTotalMinutes(selectedPlan.steps);
    const totalLabel = totalMinutes === null ? null : formatTotalMinutes(totalMinutes);

    return { lines, totalLabel, hasPlan: true };
  };

  const handleOpenScheduleEdit = () => {
    if (!selectedSchedule || selectedSchedule.type === 'flight') return;
    setEditingSchedule(selectedSchedule);
    setSelectedSchedule(null);
  };

  const handleEditSchedule = async (data: ScheduleFormSubmitData) => {
    if (!editingSchedule) return;

    try {
      await editSchedule(editingSchedule.id, data as any);

      if (editingSchedule.type === 'shopping') {
        try {
          await updateShoppingItemsFromSchedule(editingSchedule.id, data.shoppingItems || []);
        } catch (error) {
          console.error('更新購物清單項目失敗:', error);
          alert('購物清單項目更新失敗，但行程已更新成功');
        }
      }

      setEditingSchedule(null);
    } catch (error) {
      console.error('編輯行程失敗:', error);
      alert('編輯行程失敗，請稍後再試');
    }
  };

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
              {schedulesForDate.map((schedule, index) => {
                const previousSchedule = index > 0 ? schedulesForDate[index - 1] : null;
                const transportOwner = schedule;
                const transportSummary = buildTransportSummary(transportOwner);
                const hasTransportPlan = transportSummary.hasPlan;
                const shouldShowTransportCard = schedule.id !== firstTripScheduleId;

                return (
                  <div key={schedule.id}>
                    {shouldShowTransportCard && (
                      <div className="relative pl-4 pb-2">
                        <div className="flex items-stretch gap-3">
                          <div className="w-10 flex justify-center">
                            <div className="flex h-full items-center justify-center py-1">
                              <div className="h-full w-[3px] rounded-full bg-[repeating-linear-gradient(to_bottom,#B8A18B,#B8A18B_6px,transparent_6px,transparent_12px)]" />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setTransportEditingContext({
                                fromSchedule: previousSchedule,
                                ownerSchedule: transportOwner,
                              })
                            }
                            className="flex-1 rounded-[20px] border border-[#E5D8C7] px-4 py-2.5 text-left transition-transform active:scale-[0.99]"
                          >
                            <p className="text-sm font-bold text-[#6A503B]">
                              {transportSummary.lines.map((line, lineIndex) => (
                                <span
                                  key={`${transportOwner.id}-line-${lineIndex}`}
                                  className="block leading-relaxed"
                                >
                                  {line}
                                </span>
                              ))}
                            </p>
                            {hasTransportPlan && (
                              <div className="mt-2 rounded-[14px] bg-[#F1E6D8] px-3 py-2 text-xs font-bold text-[#6A503B]">
                                總時間 {transportSummary.totalLabel ?? '無法計算'}
                              </div>
                            )}
                            {!hasTransportPlan && (
                              <p className="text-xs text-[#7A614C] mt-1">點擊新增交通方案</p>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <ScheduleCard
                      schedule={schedule}
                      onClick={() => setSelectedSchedule(schedule)}
                      displayDate={selectedDate}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Bottom Sheet */}
        <BottomSheet
          isOpen={selectedSchedule !== null}
          onClose={() => setSelectedSchedule(null)}
        >
          {selectedSchedule && (
            <ScheduleDetail
              schedule={selectedSchedule}
              onEdit={selectedSchedule.type !== 'flight' ? handleOpenScheduleEdit : undefined}
            />
          )}
        </BottomSheet>

        <BottomSheet
          isOpen={editingSchedule !== null}
          onClose={() => setEditingSchedule(null)}
        >
          {editingSchedule && editingSchedule.type !== 'flight' && (
            <ScheduleForm
              type={editingSchedule.type}
              editingSchedule={editingSchedule}
              onSubmit={handleEditSchedule}
              onCancel={() => setEditingSchedule(null)}
            />
          )}
        </BottomSheet>

        <BottomSheet
          isOpen={transportEditingContext !== null}
          onClose={() => setTransportEditingContext(null)}
        >
          {transportEditingContext && (
            <TransportPlanSheet
              fromSchedule={transportEditingContext.fromSchedule}
              toSchedule={transportEditingContext.ownerSchedule}
              initialPlans={transportEditingContext.ownerSchedule.transportPlans}
              initialSelectedPlanId={transportEditingContext.ownerSchedule.selectedTransportPlanId}
              onCancel={() => setTransportEditingContext(null)}
              onSave={async ({ transportPlans, selectedTransportPlanId }) => {
                await editSchedule(transportEditingContext.ownerSchedule.id, {
                  transportPlans,
                  selectedTransportPlanId: selectedTransportPlanId ?? null,
                });
                setTransportEditingContext(null);
              }}
            />
          )}
        </BottomSheet>
      </div>
    </>
  );
};

export default Home;
