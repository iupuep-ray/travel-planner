import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import type { FlightSchedule } from '@/types';
import { formatTime } from '@/utils/date';

interface FlightCardProps {
  flight: FlightSchedule;
  onClick: () => void;
}

const parseAirportDisplay = (airport: string): { code: string; name: string } => {
  const trimmed = (airport || '').trim();
  if (!trimmed) return { code: '-', name: '' };

  const parts = trimmed.split(/\s+/);
  if (parts.length > 1 && /^[A-Za-z]{3,4}$/.test(parts[0])) {
    return { code: parts[0].toUpperCase(), name: parts.slice(1).join(' ') };
  }

  const compactMatch = trimmed.match(/^([A-Za-z]{3,4})(.+)$/);
  if (compactMatch) {
    return { code: compactMatch[1].toUpperCase(), name: compactMatch[2].trim() };
  }

  return { code: trimmed, name: '' };
};

const FlightCard = ({ flight, onClick }: FlightCardProps) => {
  const departure = new Date(flight.departure.dateTime);
  const arrival = new Date(flight.arrival.dateTime);
  const departureAirport = parseAirportDisplay(flight.departure.airport);
  const arrivalAirport = parseAirportDisplay(flight.arrival.airport);
  const durationMinutes = Math.max(0, Math.round((arrival.getTime() - departure.getTime()) / 60000));
  const durationHours = Math.floor(durationMinutes / 60);
  const remainingMinutes = durationMinutes % 60;
  const durationLabel = `${durationHours}h ${remainingMinutes}m`;
  const depDateLabel = departure.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', weekday: 'short' });

  return (
    <div
      onClick={onClick}
      className="mb-4 rounded-[28px] overflow-hidden shadow-soft-lg transition-transform active:scale-[0.98] cursor-pointer border border-brown/10 relative"
      style={{ backgroundColor: '#FFFDF8' }}
    >
      <div
        className="px-5 py-4 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(130deg, #3D6D8D 0%, #5FA594 55%, #85C8B2 100%)' }}
      >
        <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-white/15" />
        <div className="absolute -left-10 -bottom-12 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.24em] font-bold opacity-90">BOARDING PASS</p>
            <p className="text-sm font-bold mt-1">{flight.flightNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] opacity-85">DEP</p>
            <p className="text-xs font-semibold">{depDateLabel}</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[32px] leading-none font-black text-brown">{departureAirport.code}</p>
            {departureAirport.name && (
              <p className="text-xs text-brown/70 mt-1">{departureAirport.name}</p>
            )}
            <p className="text-sm text-brown/80">{formatTime(flight.departure.dateTime)}</p>
          </div>
          <div className="text-center pt-1">
            <p className="text-[10px] tracking-[0.12em] text-brown/55">FLIGHT TIME</p>
            <p className="text-xs font-extrabold text-brown mt-0.5">
              <FontAwesomeIcon icon={['fas', ICON_NAMES.PLANE]} className="text-[10px] mr-1 text-brown/60" />
              {durationLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[32px] leading-none font-black text-brown">{arrivalAirport.code}</p>
            {arrivalAirport.name && (
              <p className="text-xs text-brown/70 mt-1">{arrivalAirport.name}</p>
            )}
            <p className="text-sm text-brown/80">{formatTime(flight.arrival.dateTime)}</p>
          </div>
        </div>

        <div className="relative mb-4 px-1">
          <div className="h-px border-t-2 border-dashed border-brown/30" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFFDF8] px-2 py-[1px] rounded-full">
            <FontAwesomeIcon icon={['fas', ICON_NAMES.PLANE]} className="text-[10px] text-brown/60" />
          </div>
        </div>

        <div className="h-px bg-brown/10 mb-3" />

        <div className="flex items-center justify-between text-sm text-brown">
          <span className="font-semibold">Seat {flight.seat || '-'}</span>
          <span className="text-brown/40">|</span>
          <span className="font-semibold">Gate {flight.departure.gate || '-'}</span>
          <span className="text-brown/40">|</span>
          <span className="font-semibold">Terminal {flight.departure.terminal || '-'}</span>
        </div>
      </div>

      <div className="relative px-5 pb-4 pt-1">
        <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#E8DCC8] -translate-x-1/2" />
        <div className="absolute right-0 top-1 w-4 h-4 rounded-full bg-[#E8DCC8] translate-x-1/2" />
        <div className="h-px border-t-2 border-dashed border-brown/20 mb-2" />
        <div className="flex items-center justify-between text-[10px] text-brown/60 tracking-[0.12em]">
          <span>E-TICKET</span>
          <span>BOARDING GROUP A</span>
          <span>ZONE 1</span>
        </div>
      </div>
    </div>
  );
};

export default FlightCard;
