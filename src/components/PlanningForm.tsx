import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { getDefaultAvatar } from '@/utils/avatar';
import { requestBrowserNotificationPermission } from '@/services/browserNotificationService';
import type { PlanningType, Member } from '@/types';

interface PlanningFormProps {
  type: PlanningType;
  members: Member[];
  initialData?: PlanningFormData; // 編輯模式的初始資料
  onSubmit: (data: PlanningFormData) => void;
  onCancel: () => void;
}

export interface PlanningFormData {
  content: string;
  assigneeIds?: string[]; // 改為多選陣列
  notificationEnabled?: boolean;
  notificationAt?: string;
  relatedScheduleId?: string; // 關聯的購物行程 ID
}

const toLocalDateTimeInput = (iso?: string): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const roundUpToQuarterHour = (date: Date): Date => {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const remainder = minutes % 15;
  if (remainder !== 0) {
    rounded.setMinutes(minutes + (15 - remainder));
  }
  rounded.setSeconds(0, 0);
  return rounded;
};

const normalizeNotificationDateTime = (localDateTime: string): string => {
  const parsed = new Date(localDateTime);
  if (Number.isNaN(parsed.getTime())) return '';
  return roundUpToQuarterHour(parsed).toISOString();
};

const PlanningForm = ({ type, members, initialData, onSubmit, onCancel }: PlanningFormProps) => {
  const [formData, setFormData] = useState<PlanningFormData>(
    initialData || {
      content: '',
      assigneeIds: [],
      notificationEnabled: false,
      notificationAt: '',
    }
  );

  const isEditMode = !!initialData;

  const getTitle = () => {
    const titles = {
      todo: isEditMode ? '編輯 Todo' : '新增 Todo',
      luggage: isEditMode ? '編輯行李' : '新增行李',
      shopping: isEditMode ? '編輯購物' : '新增購物',
    };
    return titles[type];
  };

  const getPlaceholder = () => {
    const placeholders = {
      todo: '例如：兌換日幣、預訂餐廳',
      luggage: '例如：護照、轉接頭、常備藥',
      shopping: '例如：藥妝、零食、紀念品',
    };
    return placeholders[type];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedData = { ...formData };

    if (type === 'todo' && normalizedData.notificationEnabled) {
      if (!normalizedData.notificationAt) {
        alert('請設定推播通知時間');
        return;
      }
      const normalizedNotificationAt = normalizeNotificationDateTime(normalizedData.notificationAt);
      if (!normalizedNotificationAt) {
        alert('推播通知時間格式不正確');
        return;
      }
      normalizedData.notificationAt = normalizedNotificationAt;
    } else {
      normalizedData.notificationEnabled = false;
      normalizedData.notificationAt = undefined;
    }

    onSubmit(normalizedData);
  };

  return (
    <div className="bg-cream-light pt-6 px-6 pb-8 rounded-t-[32px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-brown">{getTitle()}</h2>
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-cream flex items-center justify-center transition-transform active:scale-95"
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.CLOSE]} className="text-brown text-xl" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Content */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-brown mb-2">
            項目內容
            <span className="text-accent ml-1">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
            placeholder={getPlaceholder()}
          />
        </div>

        {/* Assignee - Multiple Selection */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-brown mb-2">指派給（選填，可多選）</label>
          <div className="space-y-2">
            {members.map((member) => {
              const isSelected = formData.assigneeIds?.includes(member.id) || false;
              return (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-[20px] bg-white border-2 border-cream cursor-pointer transition-colors hover:border-primary"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const currentIds = formData.assigneeIds || [];
                      const newIds = e.target.checked
                        ? [...currentIds, member.id]
                        : currentIds.filter((id) => id !== member.id);
                      setFormData({ ...formData, assigneeIds: newIds });
                    }}
                    className="w-5 h-5 rounded border-2 border-brown/30 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: '#7AC5AD' }}
                    >
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <img
                          src={getDefaultAvatar(member.id || member.email || member.name)}
                          alt={`${member.name} 預設頭像`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-brown font-medium">{member.name}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {type === 'todo' && (
          <div className="mb-6">
            <label className="block text-sm font-bold text-brown mb-2">推播通知</label>
            <div className="rounded-[20px] bg-white border-2 border-cream p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notificationEnabled || false}
                  onChange={async (e) => {
                    const enabled = e.target.checked;
                    if (enabled) {
                      const permission = await requestBrowserNotificationPermission();
                      if (permission !== 'granted') {
                        alert('未取得通知權限，無法啟用推播提醒');
                        return;
                      }
                    }
                    setFormData((prev) => ({
                      ...prev,
                      notificationEnabled: enabled,
                    }));
                  }}
                  className="w-5 h-5 rounded border-2 border-brown/30 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-brown font-medium">此 Todo 需要推播提醒</span>
              </label>

              {formData.notificationEnabled && (
                <div className="space-y-2">
                  <label className="block text-sm text-brown/80 font-medium">
                    推播時間點（可設定到月/日/時/分，分以 15 分鐘級距）
                  </label>
                  <input
                    type="datetime-local"
                    step={900}
                    value={toLocalDateTimeInput(formData.notificationAt)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notificationAt: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 rounded-[24px] bg-cream text-brown font-bold transition-transform active:scale-95"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 py-4 rounded-[24px] bg-primary text-white font-bold shadow-soft transition-transform active:scale-95"
          >
            {isEditMode ? '儲存變更' : '新增項目'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanningForm;
