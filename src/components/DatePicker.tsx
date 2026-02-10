import { useEffect, useRef } from 'react';
import { formatDisplayDate } from '@/utils/date';

interface DatePickerProps {
  dates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DatePicker = ({ dates, selectedDate, onSelectDate }: DatePickerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 初次載入時自動捲動到選中的日期
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const selected = selectedRef.current;
      const scrollLeft = selected.offsetLeft - container.offsetWidth / 2 + selected.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, []);

  const handleDateClick = (date: Date) => {
    onSelectDate(date);
    // 不自動置中，保持在點擊位置
  };

  return (
    <div className="shadow-soft mb-4 rounded-[40px] px-2 py-4 relative overflow-hidden z-10" style={{ backgroundColor: '#FDFAF3' }}>
      {/* Subtle decorative gradient */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        background: 'linear-gradient(90deg, rgba(122, 197, 173, 0.3) 0%, rgba(233, 161, 90, 0.3) 100%)'
      }} />

      <div
        ref={scrollRef}
        className="flex gap-3 px-2 overflow-x-auto scrollbar-hide relative z-10"
      >
        {dates.map((date) => {
          const isSelected =
            date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
          const dateStr = formatDisplayDate(date);

          return (
            <button
              key={date.toISOString()}
              ref={isSelected ? selectedRef : null}
              onClick={() => handleDateClick(date)}
              className="flex-shrink-0 px-5 py-3 rounded-[24px] min-w-[85px] transition-all active:scale-95 font-bold text-sm whitespace-nowrap"
              style={{
                backgroundColor: isSelected ? '#7AC5AD' : '#EFE8D8',
                color: isSelected ? 'white' : '#8B6F47',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(122, 197, 173, 0.3)'
                  : '0 2px 8px rgba(107, 86, 58, 0.08)'
              }}
            >
              {dateStr}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;
