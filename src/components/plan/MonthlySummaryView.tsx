'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { getCurrentMonth } from '@/lib/store';

export default function MonthlySummaryView() {
  const { data, addSummary, updateSummary, deleteSummary } = useApp();

  const [month, setMonth] = useState(getCurrentMonth());
  const [income, setIncome] = useState('');
  const [fixedExpense, setFixedExpense] = useState('');
  const [flexibleExpense, setFlexibleExpense] = useState('');
  const [editingMonthId, setEditingMonthId] = useState<string | null>(null);
  const [editIncome, setEditIncome] = useState('');
  const [editFixed, setEditFixed] = useState('');
  const [editFlexible, setEditFlexible] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState('');

  const currentMonth = getCurrentMonth();
  const autoBalance = (parseFloat(income) || 0) - (parseFloat(fixedExpense) || 0) - (parseFloat(flexibleExpense) || 0);
  const completeMonths = data.monthlySummaries.filter(s => s.month <= currentMonth);
  const avgSavings = completeMonths.length > 0
    ? completeMonths.reduce((sum, s) => sum + (s.totalIncome - s.fixedExpense - s.flexibleExpense), 0) / completeMonths.length
    : 0;
  const formatMonthLabel = (m: string) => {
    const [y, mo] = m.split('-');
    return `${y}年${parseInt(mo)}月`;
  };

  const handleSaveMonthly = () => {
    const inc = parseFloat(income) || 0;
    const fixed = parseFloat(fixedExpense) || 0;
    const flex = parseFloat(flexibleExpense) || 0;
    addSummary({ id: Date.now().toString(), month, totalIncome: inc, fixedExpense: fixed, flexibleExpense: flex });
    setIncome('');
    setFixedExpense('');
    setFlexibleExpense('');
    setToast('月度总结已保存');
    setTimeout(() => setToast(''), 2000);
  };

  const handleDeleteMonthly = (id: string) => {
    if (confirm('确定删除这条月度总结吗？')) {
      deleteSummary(id);
      setToast('已删除');
      setTimeout(() => setToast(''), 1500);
    }
  };

  const handleEditMonthly = (id: string) => {
    const summary = data.monthlySummaries.find(s => s.id === id);
    if (!summary) return;
    setEditingMonthId(id);
    setEditIncome(summary.totalIncome.toString());
    setEditFixed(summary.fixedExpense.toString());
    setEditFlexible(summary.flexibleExpense.toString());
    setShowEditModal(true);
  };

  const handleSaveEditMonthly = () => {
    if (!editingMonthId) return;
    updateSummary(editingMonthId, {
      totalIncome: parseFloat(editIncome) || 0,
      fixedExpense: parseFloat(editFixed) || 0,
      flexibleExpense: parseFloat(editFlexible) || 0,
    });
    setEditingMonthId(null);
    setShowEditModal(false);
    setToast('已更新');
    setTimeout(() => setToast(''), 1500);
  };

  return (
    <div className="animate-fade-in">
      <p className="text-[var(--c-text-muted)] text-base mb-6">结余不单独保存，每次都由收入减去两类支出现场计算。</p>

      <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-6 mb-6">
        <h3 className="font-handwrite text-xl text-[var(--c-text)] flex items-center gap-2 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          填写本月账页
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--c-text-body)] font-medium mb-2">月份</label>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]" />
          </div>
          <div>
            <label className="block text-[var(--c-text-body)] font-medium mb-2">总收入</label>
            <input type="number" inputMode="decimal" value={income} onChange={e => setIncome(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]" />
          </div>
          <div>
            <label className="block text-[var(--c-text-body)] font-medium mb-2">固定支出</label>
            <input type="number" inputMode="decimal" value={fixedExpense} onChange={e => setFixedExpense(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]" />
          </div>
          <div>
            <label className="block text-[var(--c-text-body)] font-medium mb-2">弹性支出</label>
            <input type="number" inputMode="decimal" value={flexibleExpense} onChange={e => setFlexibleExpense(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]" />
          </div>
        </div>
        <div className="bg-[var(--c-mint)] border border-dashed border-[var(--c-accent)] rounded-2xl p-4 mt-4">
          <p className="text-[var(--c-text-body)] font-medium mb-1">自动结余</p>
          <p className="text-3xl font-bold text-[var(--c-accent-strong)]">¥{autoBalance}</p>
          <p className="text-sm text-[var(--c-text-muted)] mt-1">¥{income || 0} - ¥{fixedExpense || 0} - ¥{flexibleExpense || 0} = ¥{autoBalance}</p>
        </div>
        <button onClick={handleSaveMonthly} className="mt-4 px-6 py-3 rounded-xl bg-[var(--c-accent-deep)] text-white font-medium hover:bg-[var(--c-accent-strong)] transition-all active:scale-[0.97]">保存月度总结</button>
      </div>

      {completeMonths.length > 0 && (
        <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-6 mb-6">
          <p className="text-[var(--c-text-body)] font-medium mb-1">最近完整月平均存款</p>
          <p className="text-3xl font-bold text-[var(--c-accent-strong)] mb-2">¥{avgSavings.toFixed(0)}</p>
          <p className="text-[var(--c-text-muted)]">采用 {completeMonths.map(s => formatMonthLabel(s.month)).join('、')} 共 {completeMonths.length} 个完整月，亏损月同样计入。</p>
        </div>
      )}

      <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-6">
        <h3 className="font-handwrite text-xl text-[var(--c-text)] mb-4">月度记录</h3>
        {data.monthlySummaries.length === 0 ? (
          <p className="text-[var(--c-text-muted)] text-center py-8">还没有月度总结</p>
        ) : (
          <div className="space-y-4">
            {[...data.monthlySummaries].reverse().map(s => {
              const balance = s.totalIncome - s.fixedExpense - s.flexibleExpense;
              return (
                <div key={s.id} className="pb-4 border-b border-dashed border-[var(--c-border)] last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-handwrite text-xl text-[var(--c-text)]">{formatMonthLabel(s.month)}</h4>
                    <p className="text-2xl font-bold text-[var(--c-accent-strong)]">¥{balance.toLocaleString()}</p>
                  </div>
                  <p className="text-[var(--c-text-muted)] mb-2">收入 ¥{s.totalIncome.toLocaleString()} · 固定 ¥{s.fixedExpense.toLocaleString()} · 弹性 ¥{s.flexibleExpense.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditMonthly(s.id)} className="px-4 py-2 rounded-lg border border-[var(--c-border)] text-[var(--c-text-body)] hover:bg-[var(--c-app)]">编辑</button>
                    <button onClick={() => handleDeleteMonthly(s.id)} className="px-4 py-2 rounded-lg bg-[var(--c-danger-soft)] text-[var(--c-danger)] hover:bg-[var(--c-danger-soft-2)]">删除</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 编辑弹窗（合并原两处重复弹窗） */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-[var(--c-surface)] rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-handwrite text-xl text-[var(--c-text)] mb-4">编辑月度总结</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[var(--c-text-body)] font-medium mb-2">总收入</label>
                <input type="number" inputMode="decimal" value={editIncome} onChange={e => setEditIncome(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]" />
              </div>
              <div>
                <label className="block text-[var(--c-text-body)] font-medium mb-2">固定支出</label>
                <input type="number" inputMode="decimal" value={editFixed} onChange={e => setEditFixed(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]" />
              </div>
              <div>
                <label className="block text-[var(--c-text-body)] font-medium mb-2">弹性支出</label>
                <input type="number" inputMode="decimal" value={editFlexible} onChange={e => setEditFlexible(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-[var(--c-border)] text-[var(--c-text-body)]">取消</button>
              <button onClick={handleSaveEditMonthly} className="flex-1 px-4 py-3 rounded-xl bg-[var(--c-accent-deep)] text-white">保存</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 right-4 bg-[var(--c-accent)] text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">{toast}</div>
      )}
    </div>
  );
}
