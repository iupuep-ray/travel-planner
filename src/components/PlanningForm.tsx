import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
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
  relatedScheduleId?: string; // 關聯的購物行程 ID
}

const PlanningForm = ({ type, members, initialData, onSubmit, onCancel }: PlanningFormProps) => {
  const [formData, setFormData] = useState<PlanningFormData>(
    initialData || {
      content: '',
      assigneeIds: [],
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
    onSubmit(formData);
  };

  return (
    <div className="bg-cream-light pt-6 px-6 pb-32 rounded-t-[32px] max-h-[85vh] overflow-y-auto">
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
                        member.name.charAt(0)
                      )}
                    </div>
                    <span className="text-brown font-medium">{member.name}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

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
