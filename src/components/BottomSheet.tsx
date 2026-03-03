import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet = ({ isOpen, onClose, children }: BottomSheetProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sheetContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-[90] transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[100] animate-slide-up">
        <div className="bg-white rounded-t-[40px] shadow-soft max-h-[85vh] flex flex-col" style={{ boxShadow: '0 -4px 16px rgba(107, 86, 58, 0.15)' }}>
          {/* Handle */}
          <div className="flex justify-center py-3 flex-shrink-0">
            <div className="w-12 h-1 rounded-full" style={{ backgroundColor: '#D4C9B8' }} />
          </div>

          {/* Scrollable Content */}
          <div className="px-6 pb-24 flex-1 min-h-0 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(sheetContent, document.body);
};

export default BottomSheet;
