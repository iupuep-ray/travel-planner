import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import type { Schedule } from '@/types';
import { formatDateTimeShort, formatTime } from '@/utils/date';
import { ICON_NAMES } from '@/utils/fontawesome';
import { getRandomDecoration } from '@/config/images';

interface ScheduleCardProps {
  schedule: Schedule;
  onClick: () => void;
  showDate?: boolean; // 是否顯示日期（月/日）
}

const getScheduleIcon = (type: Schedule['type']): IconName => {
  const icons = {
    flight: ICON_NAMES.PLANE,
    lodging: ICON_NAMES.HOTEL,
    restaurant: ICON_NAMES.UTENSILS,
    spot: ICON_NAMES.MAP_LOCATION,
    shopping: ICON_NAMES.SHOPPING,
  };
  return icons[type];
};

const getScheduleTime = (schedule: Schedule, showDate: boolean): string => {
  const formatFn = showDate ? formatDateTimeShort : formatTime;

  if (schedule.type === 'flight') {
    return formatFn(schedule.departure.dateTime);
  }
  if (schedule.type === 'lodging') {
    return formatFn(schedule.checkIn);
  }
  return formatFn(schedule.startDateTime);
};

const getScheduleTitle = (schedule: Schedule): string => {
  if (schedule.type === 'flight') {
    return `${schedule.flightNumber} ${schedule.departure.airport} → ${schedule.arrival.airport}`;
  }
  return schedule.name;
};

const ScheduleCard = ({ schedule, onClick, showDate = false }: ScheduleCardProps) => {
  const icon = getScheduleIcon(schedule.type);
  const time = getScheduleTime(schedule, showDate);
  const title = getScheduleTitle(schedule);
  const decorationImage = getRandomDecoration(schedule.type, schedule.id);

  return (
    <div
      onClick={onClick}
      className="rounded-[40px] shadow-soft p-4 mb-3 transition-transform active:scale-[0.98] cursor-pointer relative overflow-hidden animate-fadeIn"
      style={{ backgroundColor: '#F5EFE1' }}
    >
      {/* Decoration Image - 置右且上下置中 */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none">
        <img
          src={decorationImage}
          alt=""
          className="w-20 h-20 object-contain"
        />
      </div>

      {/* Content */}
      <div className="flex items-start gap-4 relative z-10">
        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: '#5FA594' }}>
          <FontAwesomeIcon
            icon={['fas', icon]}
            className="text-2xl text-white"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-bold text-brown">{time}</span>
            {schedule.type === 'lodging' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#E89EA3' }}>
                住宿
              </span>
            )}
            {schedule.type === 'restaurant' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#E9A15A' }}>
                餐廳
              </span>
            )}
            {schedule.type === 'spot' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#7AC5AD' }}>
                景點
              </span>
            )}
            {schedule.type === 'shopping' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#F4C542' }}>
                購物
              </span>
            )}
          </div>
          <h3 className="font-bold text-primary-text mb-1 line-clamp-2">
            {title}
          </h3>
          {schedule.type !== 'flight' && 'address' in schedule && (
            <p className="text-sm text-primary-text opacity-60 line-clamp-1">
              {schedule.address}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
