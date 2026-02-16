import type { Expense, Member, SettlementResult } from '@/types';

export const DEFAULT_JPY_TO_NTD_RATE = 0.2;

// 轉換為 NTD
export const convertToNTD = (
  amount: number,
  currency: 'JPY' | 'NTD',
  jpyToNtdRate: number = DEFAULT_JPY_TO_NTD_RATE
): number => {
  if (currency === 'NTD') return amount;
  return Math.round(amount * jpyToNtdRate);
};

// 計算清算結果（Netting 算法）
export const calculateSettlement = (
  expenses: Expense[],
  members: Member[],
  jpyToNtdRate: number = DEFAULT_JPY_TO_NTD_RATE
): SettlementResult[] => {
  // 只計算未還款的費用
  const unsettledExpenses = expenses.filter((e) => !e.isSettled);

  // 建立每個成員的淨額表（正數表示應收，負數表示應付）
  const balance: Record<string, number> = {};
  members.forEach((member) => {
    balance[member.id] = 0;
  });

  // 計算每筆費用的影響
  unsettledExpenses.forEach((expense) => {
    const totalNTD = convertToNTD(expense.amount, expense.currency, jpyToNtdRate);
    const perPersonAmount = Math.round(totalNTD / expense.splitIds.length);

    // 付款人應收回的金額（總額 - 自己應付的）
    const payerShouldReceive = totalNTD - perPersonAmount;
    balance[expense.payerId] += payerShouldReceive;

    // 其他分攤者應付的金額
    expense.splitIds.forEach((memberId) => {
      if (memberId !== expense.payerId) {
        balance[memberId] -= perPersonAmount;
      }
    });
  });

  // 執行 Netting（債務抵銷）
  const results: SettlementResult[] = [];

  // 分離債權人和債務人
  const creditors: Array<{ id: string; amount: number }> = [];
  const debtors: Array<{ id: string; amount: number }> = [];

  Object.entries(balance).forEach(([memberId, amount]) => {
    if (amount > 0) {
      creditors.push({ id: memberId, amount });
    } else if (amount < 0) {
      debtors.push({ id: memberId, amount: -amount });
    }
  });

  // 使用貪婪算法進行配對
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const settleAmount = Math.min(creditor.amount, debtor.amount);

    if (settleAmount > 0) {
      results.push({
        from: debtor.id,
        to: creditor.id,
        amount: settleAmount,
        isSettled: false,
      });
    }

    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;

    if (creditor.amount === 0) i++;
    if (debtor.amount === 0) j++;
  }

  return results;
};
