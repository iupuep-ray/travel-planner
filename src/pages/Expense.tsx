import { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { getDefaultAvatar } from '@/utils/avatar';
import { useExpenses } from '@/hooks/useExpenses';
import { useMembers } from '@/hooks/useMembers';
import BottomSheet from '@/components/BottomSheet';
import ExpenseForm, { ExpenseFormData } from '@/components/ExpenseForm';
import ExpenseDetail from '@/components/ExpenseDetail';
import ExpenseCardSkeleton from '@/components/skeletons/ExpenseCardSkeleton';
import { fetchJpyToTwdRate } from '@/services/exchangeRateService';
import { calculateSettlement, convertToNTD, DEFAULT_JPY_TO_NTD_RATE } from '@/utils/settlement';
import { subscribeToSettlements, updateSettlementStatus } from '@/services/settlementService';
import type { Expense as ExpenseType } from '@/types';

type ExpenseTab = 'records' | 'calculator' | 'total' | 'settlement';

interface TabConfig {
  key: ExpenseTab;
  label: string;
  icon: typeof ICON_NAMES[keyof typeof ICON_NAMES];
}

const tabs: TabConfig[] = [
  { key: 'records', label: '記帳', icon: ICON_NAMES.LIST },
  { key: 'calculator', label: '匯率\n計算機', icon: ICON_NAMES.CALCULATOR },
  { key: 'total', label: '總花費', icon: ICON_NAMES.MONEY },
  { key: 'settlement', label: '清算', icon: ICON_NAMES.CHECK },
];

const Expense = () => {
  const { expenses, loading: expensesLoading, createExpense, editExpense, removeExpense } = useExpenses();
  const { members, loading: membersLoading } = useMembers();
  const [activeTab, setActiveTab] = useState<ExpenseTab>('records');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseType | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseType | null>(null);
  const [settlementsMap, setSettlementsMap] = useState<Map<string, boolean>>(new Map());
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_JPY_TO_NTD_RATE);
  const [isExchangeRateFallback, setIsExchangeRateFallback] = useState(false);
  const [exchangeRateUpdatedAt, setExchangeRateUpdatedAt] = useState<string | null>(null);
  const [calculatorJpy, setCalculatorJpy] = useState('');

  const loading = expensesLoading || membersLoading;

  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        const rate = await fetchJpyToTwdRate();
        setExchangeRate(rate);
        setIsExchangeRateFallback(false);
        setExchangeRateUpdatedAt(new Date().toISOString());
      } catch (error) {
        console.error('取得匯率失敗，改用預設匯率:', error);
        setExchangeRate(DEFAULT_JPY_TO_NTD_RATE);
        setIsExchangeRateFallback(true);
        setExchangeRateUpdatedAt(null);
      }
    };

    loadExchangeRate();
  }, []);

  // 監聽清算狀態
  useEffect(() => {
    const unsubscribe = subscribeToSettlements(
      (map) => {
        setSettlementsMap(map);
      },
      (error) => {
        console.error('訂閱清算狀態失敗:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 計算清算結果
  const settlementResults = useMemo(() => {
    const results = calculateSettlement(expenses, members, exchangeRate);
    // 將儲存的狀態合併到計算結果中
    return results.map(result => {
      const key = `${result.from}-${result.to}`;
      return {
        ...result,
        isSettled: settlementsMap.get(key) || false,
      };
    });
  }, [expenses, members, settlementsMap, exchangeRate]);

  const unsettledExpenses = useMemo(
    () => expenses.filter((expense) => !expense.isSettled),
    [expenses]
  );

  const selectedUnsettledCount = useMemo(
    () => unsettledExpenses.reduce((count, expense) => count + (selectedExpenseIds.has(expense.id) ? 1 : 0), 0),
    [unsettledExpenses, selectedExpenseIds]
  );

  const memberSpendingSummary = useMemo(() => {
    const createEqualSplit = (memberIds: string[], total: number): Record<string, number> => {
      const result: Record<string, number> = {};
      if (memberIds.length === 0) return result;

      const base = Math.floor(total / memberIds.length);
      let remainder = total - base * memberIds.length;
      memberIds.forEach((memberId) => {
        result[memberId] = base + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder -= 1;
      });
      return result;
    };

    const summaryMap = new Map<string, number>();
    members.forEach((member) => summaryMap.set(member.id, 0));

    expenses.forEach((expense) => {
      const splitIds = expense.splitIds || [];
      if (splitIds.length === 0) return;

      const splitAmounts = expense.splitAmounts || {};
      const hasAllSplitAmounts = splitIds.every((memberId) => Number.isFinite(splitAmounts[memberId]));
      const splitTotal = splitIds.reduce((sum, memberId) => sum + (splitAmounts[memberId] || 0), 0);
      const isCustomSplitValid = hasAllSplitAmounts && Math.abs(splitTotal - expense.amount) < 0.000001;
      const rawSplitMap = isCustomSplitValid
        ? splitIds.reduce<Record<string, number>>((acc, memberId) => {
          acc[memberId] = splitAmounts[memberId] || 0;
          return acc;
        }, {})
        : createEqualSplit(splitIds, expense.amount);

      splitIds.forEach((memberId) => {
        const shareNTD = convertToNTD(rawSplitMap[memberId] || 0, expense.currency, exchangeRate);
        summaryMap.set(memberId, (summaryMap.get(memberId) || 0) + shareNTD);
      });
    });

    return members
      .map((member) => ({
        memberId: member.id,
        memberName: member.name,
        memberAvatar: member.avatar || getDefaultAvatar(member.id || member.email || member.name),
        totalNTD: summaryMap.get(member.id) || 0,
      }))
      .sort((a, b) => b.totalNTD - a.totalNTD);
  }, [expenses, members, exchangeRate]);

  const totalTripSpendingNTD = useMemo(
    () => memberSpendingSummary.reduce((sum, item) => sum + item.totalNTD, 0),
    [memberSpendingSummary]
  );

  // 取得成員名稱
  const getMemberName = (memberId: string): string => {
    const member = members.find((m) => m.id === memberId);
    return member?.name || '未知';
  };

  const getMemberAvatar = (memberId: string): string => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return getDefaultAvatar(memberId || 'member');
    return member.avatar || getDefaultAvatar(member.id || member.email || member.name);
  };

  const calculatorNtd = useMemo(() => {
    const jpy = Number(calculatorJpy || '0');
    if (Number.isNaN(jpy) || jpy < 0) return 0;
    return Math.round(jpy * exchangeRate);
  }, [calculatorJpy, exchangeRate]);
  const calculatorJpyValue = Number(calculatorJpy || '0');

  const appendCalculatorValue = (value: string) => {
    setCalculatorJpy((prev) => {
      if (prev.length >= 12) return prev;
      if (prev === '0') {
        return value === '0' || value === '00' ? '0' : value;
      }
      return `${prev}${value}`;
    });
  };

  const handleCalculatorClear = () => {
    setCalculatorJpy('');
  };

  const handleCalculatorBackspace = () => {
    setCalculatorJpy((prev) => prev.slice(0, -1));
  };

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      await createExpense({
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        payerId: data.payerId,
        splitIds: data.splitIds,
        splitAmounts: data.splitAmounts,
        isSettled: false,
        date: new Date().toISOString(),
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('新增費用失敗:', error);
      alert('新增費用失敗，請稍後再試');
    }
  };

  const handleEditExpense = async (data: ExpenseFormData) => {
    if (!editingExpense) return;
    try {
      await editExpense(editingExpense.id, {
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        payerId: data.payerId,
        splitIds: data.splitIds,
        splitAmounts: data.splitAmounts,
      });
      setEditingExpense(null);
      setSelectedExpense(null);
    } catch (error) {
      console.error('編輯費用失敗:', error);
      alert('編輯費用失敗，請稍後再試');
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    try {
      await removeExpense(selectedExpense.id);
      setSelectedExpense(null);
    } catch (error) {
      console.error('刪除費用失敗:', error);
      alert('刪除費用失敗，請稍後再試');
    }
  };

  const handleToggleSelectedExpenseSettled = async () => {
    if (!selectedExpense) return;
    try {
      const nextSettled = !selectedExpense.isSettled;
      await editExpense(selectedExpense.id, { isSettled: nextSettled });
      setSelectedExpense((prev) => (prev ? { ...prev, isSettled: nextSettled } : prev));
    } catch (error) {
      console.error('更新單筆還款狀態失敗:', error);
      alert('更新單筆還款狀態失敗，請稍後再試');
    }
  };

  const openEditExpense = () => {
    if (!selectedExpense) return;
    setEditingExpense(selectedExpense);
    setSelectedExpense(null);
  };

  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpenseIds((prev) => {
      const next = new Set(prev);
      if (next.has(expenseId)) {
        next.delete(expenseId);
      } else {
        next.add(expenseId);
      }
      return next;
    });
  };

  const selectAllUnsettledExpenses = () => {
    const unsettledExpenseIds = unsettledExpenses.map((expense) => expense.id);
    setSelectedExpenseIds(new Set(unsettledExpenseIds));
  };

  const clearExpenseSelection = () => {
    setSelectedExpenseIds(new Set());
  };

  const handleBatchSettleExpenses = async () => {
    if (selectedUnsettledCount === 0) {
      alert('請先選擇要還款的項目');
      return;
    }

    try {
      const targetExpenses = expenses.filter((expense) => selectedExpenseIds.has(expense.id) && !expense.isSettled);
      await Promise.all(targetExpenses.map((expense) => editExpense(expense.id, { isSettled: true })));
      setSelectedExpenseIds(new Set());
    } catch (error) {
      console.error('批次還款失敗:', error);
      alert('批次還款失敗，請稍後再試');
    }
  };

  const toggleSettlement = async (from: string, to: string, currentStatus: boolean) => {
    try {
      await updateSettlementStatus(from, to, !currentStatus);
    } catch (error) {
      console.error('更新還款狀態失敗:', error);
      alert('更新還款狀態失敗，請稍後再試');
    }
  };

  return (
    <>
      {/* Header */}
      <div
        className="sticky top-0 text-white pb-4 pt-[calc(var(--app-safe-top)+0.75rem)] px-4 mb-4 rounded-b-[40px] relative z-30"
        style={{ backgroundColor: '#8B6F47' }}
      >
        <div className="flex items-center justify-center gap-3">
          <FontAwesomeIcon icon={['fas', ICON_NAMES.WALLET]} className="text-4xl" />
          <div>
            <h1 className="text-2xl font-bold">記帳本</h1>
            <p className="text-sm opacity-90">
              匯率 1 JPY = NT${exchangeRate.toFixed(4)}
            </p>
            <p className="text-xs opacity-75">
              {isExchangeRateFallback
                ? '目前使用預設匯率（API 讀取失敗）'
                : exchangeRateUpdatedAt
                  ? `更新時間：${new Date(exchangeRateUpdatedAt).toLocaleString('zh-TW')}`
                  : '匯率載入中...'}
            </p>
          </div>
        </div>
      </div>

      <div className="pb-20 relative z-10">
        {/* Tab Bar */}
        <div className="px-4 mb-4">
          <div
            className="flex gap-2 p-2 rounded-[24px] relative z-10"
            style={{ backgroundColor: '#FDFAF3' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 px-4 rounded-[20px] font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-accent text-white shadow-soft'
                    : 'text-brown'
                }`}
              >
                <FontAwesomeIcon icon={['fas', tab.icon]} />
                <span className="whitespace-pre-line leading-tight text-center">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 relative z-10">
          {loading ? (
            <div>
              {[...Array(3)].map((_, i) => (
                <ExpenseCardSkeleton key={i} />
              ))}
            </div>
          ) : activeTab === 'records' ? (
            <div>
              {/* Expense List */}
              {expenses.length === 0 ? (
                <div
                  className="text-center py-16 rounded-[40px] shadow-soft"
                  style={{ backgroundColor: '#F5EFE1' }}
                >
                  <div className="mb-4">
                    <FontAwesomeIcon
                      icon={['fas', ICON_NAMES.WALLET]}
                      className="text-6xl text-brown opacity-20"
                    />
                  </div>
                  <p className="text-brown opacity-60 mb-2">尚無費用記錄</p>
                  <p className="text-brown opacity-40 text-sm">點擊下方按鈕新增記帳</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => {
                    const totalNTD = convertToNTD(expense.amount, expense.currency, exchangeRate);

                    return (
                      <div
                        key={expense.id}
                        onClick={() => setSelectedExpense(expense)}
                        className="rounded-[24px] shadow-soft p-4 transition-transform active:scale-[0.98] cursor-pointer relative overflow-hidden"
                        style={{ backgroundColor: '#F5EFE1' }}
                      >
                        {/* Settled Badge */}
                        {expense.isSettled && (
                          <div className="absolute top-3 right-3">
                            <span
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white"
                              style={{ backgroundColor: '#7AC5AD' }}
                            >
                              <FontAwesomeIcon icon={['fas', ICON_NAMES.CHECK]} className="mr-1" />
                              已還款
                            </span>
                          </div>
                        )}

                        <div className="mb-3">
                          <h3 className="font-bold text-brown text-lg mb-1">
                            {expense.description}
                          </h3>
                          <p className="text-sm text-brown opacity-60">
                            {getMemberName(expense.payerId)} 代墊
                          </p>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-brown opacity-60 mb-1">總金額</p>
                            <p className="text-xl font-bold text-accent">
                              {expense.currency === 'JPY' ? '¥' : 'NT$'}{expense.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-brown opacity-60">
                              = NT${totalNTD.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-brown opacity-60 mb-1">
                              分攤人數
                            </p>
                            <p className="text-lg font-bold text-primary">
                              {expense.splitIds.length} 人
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'calculator' ? (
            <div
              className="rounded-[28px] shadow-soft p-4"
              style={{ backgroundColor: '#F5EFE1' }}
            >
              <div className="rounded-[22px] bg-white px-4 py-4 border border-brown/10 mb-4">
                <div className="flex items-center justify-between rounded-[16px] px-3 py-2 mb-3 bg-brown/5">
                  <div>
                    <p className="text-xs text-brown opacity-70">日幣輸入</p>
                    <p className="text-2xl font-bold text-brown">
                      ¥{calculatorJpyValue.toLocaleString()}
                    </p>
                  </div>
                  <FontAwesomeIcon icon={['fas', ICON_NAMES.CALCULATOR]} className="text-brown opacity-50 text-xl" />
                </div>

                <div
                  className="rounded-[18px] px-4 py-4 text-left"
                  style={{ backgroundColor: '#78A153' }}
                >
                  <p className="text-xs text-white/90 mb-1">轉換後台幣</p>
                  <p className="text-4xl font-extrabold text-white tracking-wide">
                    NT${calculatorNtd.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((value) => (
                  <button
                    key={value}
                    onClick={() => appendCalculatorValue(value)}
                    className="py-3 rounded-xl bg-white text-brown font-bold border border-brown/10 active:scale-95 transition-transform shadow-soft"
                  >
                    {value}
                  </button>
                ))}
                <button
                  onClick={handleCalculatorClear}
                  className="py-3 rounded-xl text-white font-bold active:scale-95 transition-transform"
                  style={{ backgroundColor: '#E89EA3' }}
                >
                  C
                </button>
                <button
                  onClick={() => appendCalculatorValue('0')}
                  className="py-3 rounded-xl bg-white text-brown font-bold border border-brown/10 active:scale-95 transition-transform shadow-soft"
                >
                  0
                </button>
                <button
                  onClick={handleCalculatorBackspace}
                  className="py-3 rounded-xl text-white font-bold active:scale-95 transition-transform"
                  style={{ backgroundColor: '#8B6F47' }}
                >
                  ⌫
                </button>
              </div>
            </div>
          ) : activeTab === 'total' ? (
            <div className="space-y-3">
              <div
                className="rounded-[24px] shadow-soft p-5"
                style={{ backgroundColor: '#F5EFE1' }}
              >
                <p className="text-sm text-brown opacity-70 mb-1">本行程總花費（依分攤）</p>
                <p className="text-3xl font-bold text-accent">NT${totalTripSpendingNTD.toLocaleString()}</p>
                <p className="text-xs text-brown opacity-60 mt-1">
                  約 ¥{Math.round(totalTripSpendingNTD / exchangeRate).toLocaleString()}
                </p>
              </div>

              {memberSpendingSummary.map((item) => (
                <div
                  key={item.memberId}
                  className="rounded-[20px] shadow-soft p-4 flex items-center justify-between"
                  style={{ backgroundColor: '#F5EFE1' }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.memberAvatar}
                      alt={`${item.memberName} 頭像`}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-brown">{item.memberName}</p>
                      <p className="text-xs text-brown opacity-60">總花費</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">NT${item.totalNTD.toLocaleString()}</p>
                    <p className="text-xs text-brown opacity-60">
                      約 ¥{Math.round(item.totalNTD / exchangeRate).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div
                className="rounded-[20px] p-4 border border-brown/10 mb-3"
                style={{ backgroundColor: '#FDFAF3' }}
              >
                <p className="text-sm font-bold text-brown mb-3">批次還款（以記帳明細為單位）</p>
                <div className="flex gap-2 mb-2">
                  <button
                    className="flex-1 py-2 rounded-[16px] bg-white border border-brown/10 text-brown text-sm font-bold"
                    onClick={selectAllUnsettledExpenses}
                  >
                    全選未還款
                  </button>
                  <button
                    className="flex-1 py-2 rounded-[16px] bg-white border border-brown/10 text-brown text-sm font-bold"
                    onClick={clearExpenseSelection}
                  >
                    清除選取
                  </button>
                </div>
                {unsettledExpenses.length === 0 ? (
                  <div className="text-center text-xs text-brown/60 py-3">
                    目前沒有未還款項目
                  </div>
                ) : (
                  <div className="space-y-2 mb-2 max-h-44 overflow-y-auto pr-1">
                    {unsettledExpenses.map((expense) => (
                      <label
                        key={expense.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-[14px] border bg-white border-brown/10"
                      >
                        <input
                          type="checkbox"
                          checked={selectedExpenseIds.has(expense.id)}
                          onChange={() => toggleExpenseSelection(expense.id)}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-sm text-brown flex-1 truncate">{expense.description}</span>
                        <span className="text-xs text-brown opacity-70">
                          {expense.currency === 'JPY' ? '¥' : 'NT$'}{expense.amount.toLocaleString()}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <button
                  className="w-full py-3 rounded-[18px] bg-primary text-white font-bold disabled:opacity-50"
                  onClick={handleBatchSettleExpenses}
                  disabled={selectedUnsettledCount === 0}
                >
                  批次標記已還款 ({selectedUnsettledCount})
                </button>
              </div>

              {/* Settlement Results */}
              {settlementResults.length === 0 ? (
                <div
                  className="text-center py-16 rounded-[40px] shadow-soft"
                  style={{ backgroundColor: '#F5EFE1' }}
                >
                  <div className="mb-4">
                    <FontAwesomeIcon
                      icon={['fas', ICON_NAMES.CHECK]}
                      className="text-6xl text-primary opacity-40"
                    />
                  </div>
                  <p className="text-brown opacity-60 mb-2">太棒了！</p>
                  <p className="text-brown opacity-40 text-sm">目前沒有需要清算的費用</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settlementResults.map((result, index) => (
                    <div
                      key={index}
                      className={`rounded-[24px] shadow-soft p-5 relative overflow-hidden ${
                        result.isSettled ? 'opacity-60' : ''
                      }`}
                      style={{ backgroundColor: '#F5EFE1' }}
                    >
                      {/* Settled Badge */}
                      {result.isSettled && (
                        <div className="absolute top-3 right-3">
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: '#7AC5AD' }}
                          >
                            <FontAwesomeIcon icon={['fas', ICON_NAMES.CHECK]} className="mr-1" />
                            已還款
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getMemberAvatar(result.from)}
                            alt={`${getMemberName(result.from)} 頭像`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-brown">{getMemberName(result.from)}</p>
                            <p className="text-xs text-brown opacity-60">應付款</p>
                          </div>
                        </div>

                        <FontAwesomeIcon
                          icon={['fas', ICON_NAMES.CHEVRON_RIGHT]}
                          className="text-brown opacity-30 text-xl"
                        />

                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-bold text-brown text-right">{getMemberName(result.to)}</p>
                            <p className="text-xs text-brown opacity-60 text-right">應收款</p>
                          </div>
                          <img
                            src={getMemberAvatar(result.to)}
                            alt={`${getMemberName(result.to)} 頭像`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="text-center pt-3 border-t border-brown/10">
                        <p className="text-2xl font-bold text-accent">NT${result.amount.toLocaleString()}</p>
                        <p className="text-xs text-brown opacity-60 mt-1">
                          = ¥{Math.round(result.amount / exchangeRate).toLocaleString()}
                        </p>
                      </div>

                      {/* Settlement Button */}
                      <button
                        className={`w-full mt-4 py-3 rounded-[20px] font-bold transition-transform active:scale-95 ${
                          result.isSettled
                            ? 'bg-brown/20 text-brown'
                            : 'bg-primary text-white'
                        }`}
                        onClick={() => toggleSettlement(result.from, result.to, result.isSettled)}
                      >
                        <FontAwesomeIcon icon={['fas', ICON_NAMES.CHECK]} className="mr-2" />
                        {result.isSettled ? '取消已還款' : '標記為已還款'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        {activeTab === 'records' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-soft-lg transition-transform active:scale-95 z-30"
            style={{ backgroundColor: '#8B6F47' }}
          >
            <FontAwesomeIcon icon={['fas', ICON_NAMES.ADD]} className="text-2xl text-white" />
          </button>
        )}

        {/* Add Expense Form Bottom Sheet */}
        <BottomSheet isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
          {showAddForm && (
            <ExpenseForm
              members={members}
              onSubmit={handleAddExpense}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </BottomSheet>

        {/* Expense Detail Bottom Sheet */}
        <BottomSheet isOpen={selectedExpense !== null} onClose={() => setSelectedExpense(null)}>
          {selectedExpense && (
            <ExpenseDetail
              expense={selectedExpense}
              members={members}
              exchangeRate={exchangeRate}
              onToggleSettled={handleToggleSelectedExpenseSettled}
              onEdit={openEditExpense}
              onDelete={handleDeleteExpense}
            />
          )}
        </BottomSheet>

        {/* Edit Expense Form Bottom Sheet */}
        <BottomSheet isOpen={editingExpense !== null} onClose={() => setEditingExpense(null)}>
          {editingExpense && (
            <ExpenseForm
              members={members}
              initialData={{
                description: editingExpense.description,
                amount: editingExpense.amount,
                currency: editingExpense.currency,
                payerId: editingExpense.payerId,
                splitIds: editingExpense.splitIds,
                splitAmounts: editingExpense.splitAmounts || {},
              }}
              onSubmit={handleEditExpense}
              onCancel={() => setEditingExpense(null)}
            />
          )}
        </BottomSheet>
      </div>
    </>
  );
};

export default Expense;
