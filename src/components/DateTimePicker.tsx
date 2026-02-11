import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import default styles

interface DateTimePickerProps {
  label: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  placeholderText?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  selected,
  onChange,
  required = false,
  placeholderText = '',
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-brown mb-2">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect
        timeIntervals={15}
        dateFormat="Pp" // This uses locale-aware date and time formatting
        timeFormat="HH:mm" // 24-hour format
        className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown text-sm"
        wrapperClassName="w-full" // Ensure the wrapper takes full width
        calendarClassName="!border-2 !border-cream !rounded-[20px] !shadow-soft" // Styling for the calendar popup
        dayClassName={() => "react-datepicker__day--custom"} // Custom class for days for specific styling if needed
        popperClassName="!z-[1000]" // To ensure it appears above other elements if z-index issues
        placeholderText={placeholderText}
      />
    </div>
  );
};

export default DateTimePicker;
