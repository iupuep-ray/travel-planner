import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { getDefaultAvatar } from '@/utils/avatar';
import { formatDateTimeShort } from '@/utils/date';
import { convertToNTD } from '@/utils/settlement';
import type { Expense, Member } from '@/types';

interface ExpenseDetailProps {
  expense: Expense;
  members: Member[];
  exchangeRate: number;
  onEdit: () => void;
  onDelete: () => void;
}

const ExpenseDetail = ({ expense, members, exchangeRate, onEdit, onDelete }: ExpenseDetailProps) => {
  const getMemberName = (memberId: string): string => {
    const member = members.find((m) => m.id === memberId);
    return member?.name || '未知';
  };

  const getMemberAvatar = (memberId: string): string => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return getDefaultAvatar(memberId || 'member');
    return member.avatar || getDefaultAvatar(member.id || member.email || member.name);
  };

  const getMemberSplitAmount = (memberId: string): number => {
    const customAmount = expense.splitAmounts?.[memberId];
    if (Number.isFinite(customAmount)) return customAmount as number;
    return Math.round(expense.amount / expense.splitIds.length);
  };

  const totalNTD = convertToNTD(expense.amount, expense.currency, exchangeRate);
  const totalJPY = Math.round(totalNTD / exchangeRate);
  const hasCustomSplit = !!expense.splitAmounts && Object.keys(expense.splitAmounts).length > 0;

  const handleDelete = () => {
    if (confirm(`確定要刪除「${expense.description}」這筆費用嗎？`)) {
      onDelete();
    }
  };

  return (
    <div className="bg-cream-light pt-6 pb-8 rounded-t-[40px]">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-3">
          <FontAwesomeIcon icon={['fas', ICON_NAMES.WALLET]} className="text-3xl text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-brown mb-1">{expense.description}</h2>
        <p className="text-sm text-brown opacity-60">
          {formatDateTimeShort(expense.date)}
        </p>
      </div>

      {/* Status Badge */}
      {expense.isSettled && (
        <div className="mb-4 text-center">
          <span
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: '#7AC5AD' }}
          >
            <FontAwesomeIcon icon={['fas', ICON_NAMES.CHECK]} className="mr-2" />
            已還款
          </span>
        </div>
      )}

      {/* Edit & Delete Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={onEdit}
          className="flex-1 py-3 px-4 rounded-[24px] bg-accent text-white font-bold transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.EDIT]} />
          編輯
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 py-3 px-4 rounded-[24px] bg-red-500 text-white font-bold transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.DELETE]} />
          刪除
        </button>
      </div>

      {/* Amount Card */}
      <div
        className="rounded-[24px] shadow-soft p-5 mb-4"
        style={{ backgroundColor: '#F5EFE1' }}
      >
        <div className="text-center mb-4">
          <p className="text-sm text-brown opacity-60 mb-2">總金額</p>
          <p className="text-3xl font-bold text-accent mb-1">
            {expense.currency === 'JPY' ? '¥' : 'NT$'}{expense.amount.toLocaleString()}
          </p>
          <p className="text-sm text-brown opacity-60">
            = {expense.currency === 'JPY' ? `NT$${totalNTD.toLocaleString()}` : `¥${totalJPY.toLocaleString()}`}
          </p>
        </div>

        <div className="border-t border-brown/10 pt-4 text-center">
          <p className="text-sm text-brown opacity-60 mb-2">
            分攤人數 ({expense.splitIds.length}人)
          </p>
          <p className="text-2xl font-bold text-primary">
            {hasCustomSplit ? '已自訂分攤金額' : '平均分攤'}
          </p>
        </div>
      </div>

      {/* Payer Info */}
      <div
        className="rounded-[24px] shadow-soft p-4 mb-4"
        style={{ backgroundColor: '#F5EFE1' }}
      >
        <p className="text-sm font-bold text-brown mb-2">代墊者</p>
        <div className="flex items-center gap-3">
          <img
            src={getMemberAvatar(expense.payerId)}
            alt={`${getMemberName(expense.payerId)} 頭像`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="font-bold text-brown">{getMemberName(expense.payerId)}</p>
        </div>
      </div>

      {/* Split Members */}
      <div
        className="rounded-[24px] shadow-soft p-4 mb-6"
        style={{ backgroundColor: '#F5EFE1' }}
      >
        <p className="text-sm font-bold text-brown mb-3">分攤對象</p>
        <div className="flex flex-wrap gap-2">
          {expense.splitIds.map((memberId) => (
            <div
              key={memberId}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white"
            >
              <img
                src={getMemberAvatar(memberId)}
                alt={`${getMemberName(memberId)} 頭像`}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm text-brown">{getMemberName(memberId)}</span>
              <span className="text-xs text-brown opacity-70">
                {expense.currency === 'JPY' ? '¥' : 'NT$'}{getMemberSplitAmount(memberId).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
