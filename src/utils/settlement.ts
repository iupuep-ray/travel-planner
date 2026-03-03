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

const buildEqualShares = (total: number, memberIds: string[]): Record<string, number> => {
  const shares: Record<string, number> = {};
  if (memberIds.length === 0) return shares;

  const base = Math.floor(total / memberIds.length);
  let remainder = total - base * memberIds.length;

  memberIds.forEach((memberId) => {
    shares[memberId] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  });

  return shares;
};

const resolveSplitAmountsInNTD = (
  expense: Expense,
  jpyToNtdRate: number
): Record<string, number> => {
  const splitIds = expense.splitIds || [];
  const totalNTD = convertToNTD(expense.amount, expense.currency, jpyToNtdRate);
  if (splitIds.length === 0) return {};

  const splitAmounts = expense.splitAmounts || {};
  const hasAllMembersAmount = splitIds.every((memberId) => Number.isFinite(splitAmounts[memberId]));
  const rawSplitSum = splitIds.reduce((sum, memberId) => sum + (splitAmounts[memberId] || 0), 0);
  const isValidCustomSplit = hasAllMembersAmount && Math.abs(rawSplitSum - expense.amount) < 0.000001;

  if (!isValidCustomSplit) {
    return buildEqualShares(totalNTD, splitIds);
  }

  const convertedShares: Record<string, number> = {};
  splitIds.forEach((memberId) => {
    convertedShares[memberId] = convertToNTD(splitAmounts[memberId] || 0, expense.currency, jpyToNtdRate);
  });

  // 轉換後可能因四捨五入導致總和不等於總金額，將誤差補到付款人（或第一位分攤者）
  const convertedSum = splitIds.reduce((sum, memberId) => sum + (convertedShares[memberId] || 0), 0);
  const delta = totalNTD - convertedSum;
  if (delta !== 0) {
    const adjustTargetId = splitIds.includes(expense.payerId) ? expense.payerId : splitIds[0];
    convertedShares[adjustTargetId] = (convertedShares[adjustTargetId] || 0) + delta;
  }

  return convertedShares;
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
    if (!expense.splitIds || expense.splitIds.length === 0) return;

    const totalNTD = convertToNTD(expense.amount, expense.currency, jpyToNtdRate);
    const splitAmountsNTD = resolveSplitAmountsInNTD(expense, jpyToNtdRate);
    const payerShare = splitAmountsNTD[expense.payerId] || 0;

    // 付款人應收回的金額（總額 - 自己應付的）
    const payerShouldReceive = totalNTD - payerShare;
    if (!Number.isFinite(balance[expense.payerId])) {
      balance[expense.payerId] = 0;
    }
    balance[expense.payerId] += payerShouldReceive;

    // 其他分攤者應付的金額
    expense.splitIds.forEach((memberId) => {
      if (memberId !== expense.payerId) {
        if (!Number.isFinite(balance[memberId])) {
          balance[memberId] = 0;
        }
        balance[memberId] -= splitAmountsNTD[memberId] || 0;
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
