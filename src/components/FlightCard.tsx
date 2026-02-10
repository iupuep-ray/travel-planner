import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import type { FlightSchedule } from '@/types';
import { formatTime } from '@/utils/date';

interface FlightCardProps {
  flight: FlightSchedule;
  onClick: () => void;
}

const FlightCard = ({ flight, onClick }: FlightCardProps) => {
  return (
    <div
      onClick={onClick}
      className="mb-4 rounded-[24px] overflow-hidden shadow-soft-lg transition-transform active:scale-[0.98] cursor-pointer relative"
      style={{
        background: 'linear-gradient(135deg, #7AC5AD 0%, #5FA594 100%)',
      }}
    >
      {/* 背景裝飾 - 飛機圖示 */}
      <div className="absolute top-4 right-4 opacity-10">
        <FontAwesomeIcon
          icon={['fas', ICON_NAMES.PLANE]}
          className="text-white"
          style={{ fontSize: '80px', transform: 'rotate(-15deg)' }}
        />
      </div>

      {/* BOARDING PASS 標題 */}
      <div className="px-6 pt-5 pb-3 relative z-10">
        <div className="text-white text-center">
          <div className="text-sm font-bold tracking-widest opacity-90">BOARDING PASS</div>
        </div>
      </div>

      {/* 主要內容區域 - 白色卡片 */}
      <div className="mx-4 mb-4 rounded-[20px] bg-white shadow-lg relative z-10">
        <div className="px-5 py-4">
          {/* 航班資訊 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-brown opacity-60 mb-1">FLIGHT</div>
              <div className="text-xl font-bold text-primary">{flight.flightNumber}</div>
            </div>
            <div>
              <div className="text-xs text-brown opacity-60 mb-1">DEPARTS</div>
              <div className="text-sm font-bold text-brown">
                {new Date(flight.departure.dateTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: '2-digit'
                }).toUpperCase()}
              </div>
            </div>
          </div>

          {/* 出發抵達 */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {flight.departure.airport}
              </div>
              <div className="text-sm text-brown font-medium">
                {formatTime(flight.departure.dateTime)}
              </div>
            </div>

            <div className="px-3">
              <FontAwesomeIcon
                icon={['fas', ICON_NAMES.PLANE]}
                className="text-xl text-brown opacity-30"
                style={{ transform: 'rotate(0deg)' }}
              />
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {flight.arrival.airport}
              </div>
              <div className="text-sm text-brown font-medium">
                {formatTime(flight.arrival.dateTime)}
              </div>
            </div>
          </div>

          {/* 虛線分隔 */}
          <div className="relative my-4">
            <div className="absolute left-0 top-1/2 w-full h-px border-t-2 border-dashed border-brown/20"></div>
            {/* 左右半圓形缺口效果 */}
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary overflow-hidden">
              <div className="absolute left-0 top-0 w-3 h-6 bg-white"></div>
            </div>
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary overflow-hidden">
              <div className="absolute right-0 top-0 w-3 h-6 bg-white"></div>
            </div>
          </div>

          {/* 底部資訊 */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <div className="text-xs text-brown opacity-60 mb-1">SEAT</div>
              <div className="text-lg font-bold text-brown">{flight.seat || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-brown opacity-60 mb-1">BOARDING</div>
              <div className="text-sm font-bold text-brown">
                {flight.departure.gate ? `Gate ${flight.departure.gate}` : '-'}
              </div>
            </div>
            <div>
              <div className="text-xs text-brown opacity-60 mb-1">TERMINAL</div>
              <div className="text-lg font-bold text-brown">
                {flight.departure.terminal || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightCard;
