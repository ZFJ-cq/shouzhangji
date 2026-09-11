'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { getCurrentMonth } from '@/lib/store';

export default function BudgetView() {
  const { data, setBudget } = useApp();

  const [budgetAmount, setBudgetAmount] = useState(data.monthlyBudget?.amount?.toString() ?? '');
  const [budgetCategory, setBudgetCategory] = useState(data.monthlyBudget?.category ?? 'total');
  const [toast, setToast] = useState('');

  const currentMonth = getCurrentMonth();

  const handleSaveBudget = () => {
    const amount = parseFloat(budgetAmount);
    if (!amount || amount <= 0) {
      setBudget(null);
      setToast('预算已清除');
      setTimeout(() => setToast(''), 1500);
      return;
    }
    setBudget({ amount, month: currentMonth, category: budgetCategory });
    setToast('预算已设置');
    setTimeout(() => setToast(''), 1500);
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-6">
        <h3 className="font-handwrite text-xl text-[var(--c-text)] flex items-center gap-2 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          月度预算
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--c-text-body)] font-medium mb-2">预算金额</label>
            <input type="number" inputMode="decimal" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]" />
          </div>
          <div>
            <label className="block text-[var(--c-text-body)] font-medium mb-2">预算类型</label>
            <select value={budgetCategory} onChange={e => setBudgetCategory(e.target.value as 'total' | 'fixed' | 'flexible')} className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]">
              <option value="total">总支出</option>
              <option value="fixed">固定支出</option>
              <option value="flexible">弹性支出</option>
            </select>
          </div>
        </div>
        {data.monthlyBudget && (
          <div className="mt-4 p-4 bg-[var(--c-mint)] rounded-xl">
            <p className="text-[var(--c-text-body)] text-sm">当前预算：¥{data.monthlyBudget.amount.toLocaleString()} ({data.monthlyBudget.category === 'total' ? '总支出' : data.monthlyBudget.category === 'fixed' ? '固定支出' : '弹性支出'})</p>
          </div>
        )}
        <div className="flex gap-3 mt-4">
          <button onClick={handleSaveBudget} className="flex-1 px-6 py-3 rounded-xl bg-[var(--c-accent-deep)] text-white font-medium hover:bg-[var(--c-accent-strong)] transition-all active:scale-[0.97]">
            {data.monthlyBudget ? '更新预算' : '设置预算'}
          </button>
          {data.monthlyBudget && (
            <button onClick={() => { setBudget(null); setBudgetAmount(''); setToast('预算已清除'); setTimeout(() => setToast(''), 1500); }} className="px-6 py-3 rounded-xl border border-[var(--c-border)] text-[var(--c-text-body)] hover:bg-[var(--c-app)]">
              清除
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 bg-[var(--c-accent)] text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">{toast}</div>
      )}
    </div>
  );
}
