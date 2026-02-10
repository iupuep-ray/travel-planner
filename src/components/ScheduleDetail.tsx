import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Schedule } from '@/types';
import { formatTime, formatDisplayDate, parseDate } from '@/utils/date';
import { ICON_NAMES } from '@/utils/fontawesome';

interface ScheduleDetailProps {
  schedule: Schedule;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ScheduleDetail = ({ schedule, onEdit, onDelete }: ScheduleDetailProps) => {

  const handleDelete = () => {
    const scheduleName = schedule.type === 'flight'
      ? `${schedule.flightNumber}`
      : (schedule as any).name;

    if (confirm(`確定要刪除「${scheduleName}」這個行程嗎？`)) {
      onDelete?.();
    }
  };
  const getGoogleMapsUrl = (address: string): string => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  if (schedule.type === 'flight') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-text mb-2 flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={['fas', ICON_NAMES.PLANE]} className="text-primary-light" />
            {schedule.flightNumber}
          </h2>
          <p className="text-sm text-primary-text opacity-70">航班資訊</p>
        </div>

        <div className="card">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-primary mb-2">出發</h3>
            <p className="font-medium text-primary-text">{schedule.departure.airport}</p>
            <p className="text-sm text-primary-text opacity-70">
              {formatDisplayDate(parseDate(schedule.departure.dateTime))} {formatTime(schedule.departure.dateTime)}
            </p>
            <p className="text-sm text-primary-text opacity-70">
              {schedule.departure.terminal} · 登機門 {schedule.departure.gate}
            </p>
          </div>

          <div className="border-t border-card-shadow pt-4">
            <h3 className="text-sm font-medium text-primary mb-2">抵達</h3>
            <p className="font-medium text-primary-text">{schedule.arrival.airport}</p>
            <p className="text-sm text-primary-text opacity-70">
              {formatDisplayDate(parseDate(schedule.arrival.dateTime))} {formatTime(schedule.arrival.dateTime)}
            </p>
            <p className="text-sm text-primary-text opacity-70">
              {schedule.arrival.terminal} · 登機門 {schedule.arrival.gate}
            </p>
          </div>

          <div className="border-t border-card-shadow pt-4 mt-4">
            <p className="text-sm text-primary-text">
              <span className="font-medium">座位：</span>{schedule.seat}
            </p>
          </div>
        </div>

        {schedule.notes && (
          <div className="card">
            <h3 className="text-sm font-medium text-primary mb-2">備註</h3>
            <p className="text-sm text-primary-text whitespace-pre-wrap">{schedule.notes}</p>
          </div>
        )}
      </div>
    );
  }

  if (schedule.type === 'lodging') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-text mb-2 flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={['fas', ICON_NAMES.HOTEL]} className="text-primary-light" />
            {schedule.name}
          </h2>
        </div>

        {/* Edit & Delete Buttons - 非機票類型才顯示 */}
        {(onEdit || onDelete) && (
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 py-3 px-4 rounded-[24px] bg-accent text-white font-bold transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={['fas', ICON_NAMES.EDIT]} />
                編輯
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex-1 py-3 px-4 rounded-[24px] bg-red-500 text-white font-bold transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={['fas', ICON_NAMES.DELETE]} />
                刪除
              </button>
            )}
          </div>
        )}

        <div className="card">
          <p className="text-sm text-primary-text mb-3">{schedule.address}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Check-in</p>
              <p className="text-sm text-primary-text">
                {formatDisplayDate(parseDate(schedule.checkIn))}
              </p>
              <p className="text-sm text-primary-text">
                {formatTime(schedule.checkIn)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary mb-1">Check-out</p>
              <p className="text-sm text-primary-text">
                {formatDisplayDate(parseDate(schedule.checkOut))}
              </p>
              <p className="text-sm text-primary-text">
                {formatTime(schedule.checkOut)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={getGoogleMapsUrl(schedule.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-[24px] transition-all active:scale-95"
            style={{ backgroundColor: '#7AC5AD', boxShadow: '0 2px 8px rgba(107, 86, 58, 0.08)' }}
          >
            <FontAwesomeIcon icon={['fas', ICON_NAMES.MAP_MARKER]} />
            Google Maps
          </a>
          {schedule.url && (
            <a
              href={schedule.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-[24px] border-2 transition-all active:scale-95"
              style={{ borderColor: '#8B6F47', color: '#8B6F47', backgroundColor: '#F5EFE1' }}
            >
              <FontAwesomeIcon icon={['fas', ICON_NAMES.EXTERNAL_LINK]} />
              官網
            </a>
          )}
        </div>

        {schedule.notes && (
          <div className="card">
            <h3 className="text-sm font-medium text-primary mb-2">備註</h3>
            <p className="text-sm text-primary-text whitespace-pre-wrap">{schedule.notes}</p>
          </div>
        )}

        {/* Image Gallery */}
        {schedule.images && schedule.images.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-medium text-primary mb-3">照片 ({schedule.images.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {schedule.images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-[16px] overflow-hidden bg-cream cursor-pointer transition-transform active:scale-95"
                  onClick={() => window.open(imageUrl, '_blank')}
                >
                  <img
                    src={imageUrl}
                    alt={`${schedule.name} - 圖片 ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Restaurant, Spot, Shopping
  const displaySchedule = schedule as Extract<Schedule, { address: string; startDateTime: string }>;

  const getIcon = () => {
    if (schedule.type === 'restaurant') return ICON_NAMES.UTENSILS;
    if (schedule.type === 'spot') return ICON_NAMES.MAP_LOCATION;
    if (schedule.type === 'shopping') return ICON_NAMES.SHOPPING;
    return ICON_NAMES.MAP_LOCATION;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-text mb-2 flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={['fas', getIcon()]} className="text-primary-light" />
          {displaySchedule.name}
        </h2>
      </div>

      {/* Edit & Delete Buttons - 非機票類型才顯示 */}
      {(onEdit || onDelete) && (
        <div className="flex gap-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-3 px-4 rounded-[24px] bg-accent text-white font-bold transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={['fas', ICON_NAMES.EDIT]} />
              編輯
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="flex-1 py-3 px-4 rounded-[24px] bg-red-500 text-white font-bold transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={['fas', ICON_NAMES.DELETE]} />
              刪除
            </button>
          )}
        </div>
      )}

      <div className="card">
        <p className="text-sm text-primary-text mb-3">{displaySchedule.address}</p>
        <p className="text-sm text-primary-text">
          <span className="font-medium text-primary">時間：</span>
          {formatTime(displaySchedule.startDateTime)}
          {displaySchedule.endDateTime && ` - ${formatTime(displaySchedule.endDateTime)}`}
        </p>
      </div>

      {schedule.type === 'shopping' && schedule.shoppingItems && schedule.shoppingItems.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-primary mb-2">購物清單</h3>
          <ul className="space-y-1">
            {schedule.shoppingItems.map((item, index) => (
              <li key={index} className="text-sm text-primary-text">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <a
          href={getGoogleMapsUrl(displaySchedule.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-[24px] transition-all active:scale-95"
          style={{ backgroundColor: '#7AC5AD', boxShadow: '0 2px 8px rgba(107, 86, 58, 0.08)' }}
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.MAP_MARKER]} />
          Google Maps
        </a>
        {displaySchedule.url && (
          <a
            href={displaySchedule.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-[24px] border-2 transition-all active:scale-95"
            style={{ borderColor: '#8B6F47', color: '#8B6F47', backgroundColor: '#F5EFE1' }}
          >
            <FontAwesomeIcon icon={['fas', ICON_NAMES.EXTERNAL_LINK]} />
            官網
          </a>
        )}
      </div>

      {displaySchedule.notes && (
        <div className="card">
          <h3 className="text-sm font-medium text-primary mb-2">備註</h3>
          <p className="text-sm text-primary-text whitespace-pre-wrap">{displaySchedule.notes}</p>
        </div>
      )}

      {/* Image Gallery */}
      {displaySchedule.images && displaySchedule.images.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-primary mb-3">照片 ({displaySchedule.images.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {displaySchedule.images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-[16px] overflow-hidden bg-cream cursor-pointer transition-transform active:scale-95"
                onClick={() => window.open(imageUrl, '_blank')}
              >
                <img
                  src={imageUrl}
                  alt={`${displaySchedule.name} - 圖片 ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleDetail;
