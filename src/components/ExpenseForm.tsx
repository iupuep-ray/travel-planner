import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { getDefaultAvatar } from '@/utils/avatar';
import type { Member } from '@/types';

interface ExpenseFormProps {
  members: Member[];
  initialData?: ExpenseFormData;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  currency: 'JPY' | 'NTD';
  payerId: string;
  splitIds: string[];
  splitAmounts: Record<string, number>;
}

const buildEqualSplitAmounts = (memberIds: string[], totalAmount: number): Record<string, number> => {
  const splitAmounts: Record<string, number> = {};
  if (memberIds.length === 0) return splitAmounts;

  const base = Math.floor(totalAmount / memberIds.length);
  let remainder = totalAmount - base * memberIds.length;

  memberIds.forEach((memberId) => {
    splitAmounts[memberId] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  });

  return splitAmounts;
};

const ExpenseForm = ({ members, initialData, onSubmit, onCancel }: ExpenseFormProps) => {
  const isEditMode = !!initialData;
  const defaultSplitIds = members.map((m) => m.id);
  const [formData, setFormData] = useState<ExpenseFormData>(() => {
    if (initialData) {
      return {
        ...initialData,
        splitAmounts: {
          ...buildEqualSplitAmounts(initialData.splitIds, initialData.amount),
          ...initialData.splitAmounts,
        },
      };
    }

    const defaultAmount = 0;
    return {
      description: '',
      amount: defaultAmount,
      currency: 'JPY',
      payerId: members[0]?.id || '',
      splitIds: defaultSplitIds,
      splitAmounts: buildEqualSplitAmounts(defaultSplitIds, defaultAmount),
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      alert('金額需大於 0');
      return;
    }

    if (formData.splitIds.length === 0) {
      alert('請至少選擇一位分攤對象');
      return;
    }

    const splitTotal = formData.splitIds.reduce((sum, memberId) => {
      const amount = formData.splitAmounts[memberId];
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    if (Math.abs(splitTotal - formData.amount) > 0.000001) {
      alert('分攤金額加總需等於總金額');
      return;
    }

    onSubmit(formData);
  };

  const updateSplitAmount = (memberId: string, amount: number) => {
    setFormData((prev) => ({
      ...prev,
      splitAmounts: {
        ...prev.splitAmounts,
        [memberId]: Number.isFinite(amount) && amount >= 0 ? amount : 0,
      },
    }));
  };

  const rebalanceSplitAmounts = () => {
    setFormData((prev) => ({
      ...prev,
      splitAmounts: buildEqualSplitAmounts(prev.splitIds, prev.amount),
    }));
  };

  const toggleSplitMember = (memberId: string) => {
    setFormData((prev) => {
      const isSelected = prev.splitIds.includes(memberId);
      const nextSplitIds = isSelected
        ? prev.splitIds.filter((id) => id !== memberId)
        : [...prev.splitIds, memberId];
      const nextSplitAmounts = { ...prev.splitAmounts };

      if (isSelected) {
        delete nextSplitAmounts[memberId];
      } else if (!Number.isFinite(nextSplitAmounts[memberId])) {
        nextSplitAmounts[memberId] = 0;
      }

      return {
        ...prev,
        splitIds: nextSplitIds,
        splitAmounts: nextSplitAmounts,
      };
    });
  };

  const selectAllMembers = () => {
    const allMemberIds = members.map((m) => m.id);
    setFormData((prev) => ({
      ...prev,
      splitIds: allMemberIds,
      splitAmounts: buildEqualSplitAmounts(allMemberIds, prev.amount),
    }));
  };

  const selectedSplitTotal = formData.splitIds.reduce((sum, memberId) => {
    const amount = formData.splitAmounts[memberId];
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const splitDiff = formData.amount - selectedSplitTotal;
  const splitSumValid = Math.abs(splitDiff) < 0.000001;

  return (
    <div className="bg-cream-light pt-6 px-6 pb-32 rounded-t-[32px] max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-brown">{isEditMode ? '編輯費用' : '新增費用'}</h2>
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-cream flex items-center justify-center transition-transform active:scale-95"
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.CLOSE]} className="text-brown text-xl" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-brown mb-2">
            費用項目
            <span className="text-accent ml-1">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
            placeholder="例如：午餐、門票、交通費"
          />
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="col-span-2">
            <label className="block text-sm font-bold text-brown mb-2">
              金額
              <span className="text-accent ml-1">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.amount || ''}
              onChange={(e) => {
                const nextAmount = Number(e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  amount: Number.isFinite(nextAmount) && nextAmount >= 0 ? nextAmount : 0,
                }));
              }}
              className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-brown mb-2">幣別</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'JPY' | 'NTD' })}
              className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
            >
              <option value="JPY">¥ JPY</option>
              <option value="NTD">NT$ NTD</option>
            </select>
          </div>
        </div>

        {/* Payer */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-brown mb-2">
            誰先付款
            <span className="text-accent ml-1">*</span>
          </label>
          <select
            value={formData.payerId}
            onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
            className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        {/* Split Members */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-brown">
              分攤對象
              <span className="text-accent ml-1">*</span>
            </label>
            <button
              type="button"
              onClick={selectAllMembers}
              className="text-xs text-primary font-bold hover:underline"
            >
              全選
            </button>
          </div>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-[20px] cursor-pointer transition-colors ${
                  formData.splitIds.includes(member.id)
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-white border-2 border-cream'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.splitIds.includes(member.id)}
                  onChange={() => toggleSplitMember(member.id)}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
                {/* Avatar / Initial Display */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: '#7AC5AD' }} // Using a default accent color, consider dynamic color based on member ID
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
                <span className="flex-1 font-medium text-brown">{member.name}</span>
                {formData.splitIds.includes(member.id) && (
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.splitAmounts[member.id] ?? 0}
                    onChange={(e) => updateSplitAmount(member.id, Number(e.target.value))}
                    className="w-24 px-2 py-1 rounded-lg border border-cream text-right text-sm text-brown bg-white"
                    placeholder="0"
                    aria-label={`${member.name} 分攤金額`}
                  />
                )}
                {formData.splitIds.includes(member.id) && (
                  <FontAwesomeIcon icon={['fas', ICON_NAMES.CHECK]} className="text-primary" />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-brown opacity-60">
              已選擇 {formData.splitIds.length} 人
            </p>
            <button
              type="button"
              onClick={rebalanceSplitAmounts}
              className="text-xs text-primary font-bold hover:underline"
            >
              平均分配
            </button>
          </div>
          <p className={`text-xs mt-1 ${splitSumValid ? 'text-primary' : 'text-red-500'}`}>
            分攤加總：{selectedSplitTotal.toLocaleString()} / 總金額：{formData.amount.toLocaleString()}
            {!splitSumValid && `（差額 ${splitDiff.toLocaleString()}）`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 rounded-[24px] bg-cream text-brown font-bold transition-transform active:scale-95"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 py-4 rounded-[24px] bg-accent text-white font-bold shadow-soft transition-transform active:scale-95"
          >
            {isEditMode ? '儲存變更' : '新增費用'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
