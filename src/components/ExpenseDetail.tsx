import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { formatDateTimeShort } from '@/utils/date';
import type { Expense, Member } from '@/types';

interface ExpenseDetailProps {
  expense: Expense;
  members: Member[];
  onDelete: () => void;
}

// 固定匯率 NTD:JPY = 1:5
const EXCHANGE_RATE = 5;

const ExpenseDetail = ({ expense, members, onDelete }: ExpenseDetailProps) => {
  const getMemberName = (memberId: string): string => {
    const member = members.find((m) => m.id === memberId);
    return member?.name || '未知';
  };

  const convertToNTD = (amount: number, currency: 'JPY' | 'NTD'): number => {
    if (currency === 'NTD') return amount;
    return Math.round(amount / EXCHANGE_RATE);
  };

  const totalNTD = convertToNTD(expense.amount, expense.currency);
  const perPersonAmount = Math.round(totalNTD / expense.splitIds.length);

  const handleDelete = () => {
    if (confirm(`確定要刪除「${expense.description}」這筆費用嗎？`)) {
      onDelete();
    }
  };

  return (
    <div className="bg-cream-light p-6 rounded-t-[32px] max-h-[85vh] overflow-y-auto">
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
            = {expense.currency === 'JPY' ? `NT$${totalNTD.toLocaleString()}` : `¥${(totalNTD * EXCHANGE_RATE).toLocaleString()}`}
          </p>
        </div>

        <div className="border-t border-brown/10 pt-4 text-center">
          <p className="text-sm text-brown opacity-60 mb-2">
            每人應付 ({expense.splitIds.length}人)
          </p>
          <p className="text-2xl font-bold text-primary">
            NT${perPersonAmount.toLocaleString()}
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
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: '#7AC5AD' }}
          >
            {getMemberName(expense.payerId).charAt(0)}
          </div>
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
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: '#E89EA3' }}
              >
                {getMemberName(memberId).charAt(0)}
              </div>
              <span className="text-sm text-brown">{getMemberName(memberId)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="w-full py-4 rounded-[24px] bg-red-500 text-white font-bold transition-transform active:scale-95 flex items-center justify-center gap-2"
      >
        <FontAwesomeIcon icon={['fas', ICON_NAMES.DELETE]} />
        刪除此筆費用
      </button>
    </div>
  );
};

export default ExpenseDetail;
