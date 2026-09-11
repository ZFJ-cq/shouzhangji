'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { getCurrentMonth } from '@/lib/store';

export default function FreedomFundView() {
  const { data, setFreedomFund } = useApp();

  const ff = data.freedomFund;
  const targetAmount = ff.targetAmount;
  const currentSaved = ff.currentSaved;
  const monthlyExpense = ff.monthlyBasicExpense;
  const remaining = Math.max(0, targetAmount - currentSaved);
  const progress = targetAmount > 0 ? (currentSaved / targetAmount) * 100 : 0;

  const completeMonths = data.monthlySummaries.filter(s => s.month <= getCurrentMonth());
  const avgMonthlySavings = completeMonths.length > 0
    ? completeMonths.reduce((sum, s) => sum + (s.totalIncome - s.fixedExpense - s.flexibleExpense), 0) / completeMonths.length
    : 0;
  const remainingMonths = avgMonthlySavings > 0 ? Math.ceil(remaining / avgMonthlySavings) : 0;
  const targetMonths = ff.targetMonth ? (() => {
    const [ty, tm] = ff.targetMonth.split('-').map(Number);
    const [cy, cm] = getCurrentMonth().split('-').map(Number);
    return (ty - cy) * 12 + (tm - cm);
  })() : 0;
  const requiredMonthly = targetMonths > 0 ? remaining / targetMonths : 0;
  const safetyMonths = monthlyExpense > 0 ? currentSaved / monthlyExpense : 0;

  const handleFFChange = (field: string, value: string | number) => {
    setFreedomFund({ [field]: value });
  };

  return (
    <div className="animate-fade-in">
      <p className="text-[#8BA89E] text-base mb-6">账户余额由你维护，历史结余只用来估算速度和趋势，不冒充真实流水。</p>

      <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6 mb-6">
        <h3 className="font-handwrite text-xl text-[#2D5A4A] flex items-center gap-2 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          设置自由目标
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">目标金额</label>
            <input type="number" inputMode="decimal" value={ff.targetAmount} onChange={e => handleFFChange('targetAmount', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">目标月份</label>
            <input type="month" value={ff.targetMonth} onChange={e => handleFFChange('targetMonth', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">当前已攒</label>
            <input type="number" inputMode="decimal" value={ff.currentSaved} onChange={e => handleFFChange('currentSaved', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">每月基本开销</label>
            <input type="number" inputMode="decimal" value={ff.monthlyBasicExpense} onChange={e => handleFFChange('monthlyBasicExpense', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">估算起始月</label>
            <input type="month" value={ff.startMonth} onChange={e => handleFFChange('startMonth', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-[#5A7A6A] font-medium mb-2">为什么想攒这笔钱</label>
          <textarea value={ff.reason} onChange={e => handleFFChange('reason', e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4] resize-none" />
        </div>
      </div>

      <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6 mb-6">
        <p className="text-[#5A7A6A] font-medium mb-1">完成率</p>
        <p className="text-4xl font-bold text-[#2D8B6A] mb-3">{progress.toFixed(1)}%</p>
        <div className="w-full bg-[#E8E0D4] rounded-full h-3 mb-2">
          <div className="bg-[#7BC8A4] h-3 rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        <p className="text-[#8BA89E]">已攒 ¥{currentSaved.toLocaleString()}，还差 ¥{remaining.toLocaleString()}</p>
      </div>

      <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6 mb-6">
        <h3 className="font-handwrite text-xl text-[#2D5A4A] mb-4">预计与期限</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D4]">
            <span className="text-[#8BA89E]">最近完整月平均速度</span>
            <span className="text-xl font-bold text-[#2D5A4A]">¥{avgMonthlySavings.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D4]">
            <span className="text-[#8BA89E]">预计剩余月数</span>
            <span className="text-xl font-bold text-[#2D5A4A]">{remainingMonths} 个月</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D4]">
            <span className="text-[#8BA89E]">预计达成日</span>
            <span className="text-xl font-bold text-[#2D5A4A]">{remainingMonths > 0 ? (() => { const d = new Date(); d.setMonth(d.getMonth() + remainingMonths); return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`; })() : '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8BA89E]">期限所需月存款</span>
            <span className="text-xl font-bold text-[#2D5A4A]">{targetMonths > 0 ? `¥${remaining.toLocaleString()} ÷ ${targetMonths} = ¥${requiredMonthly.toFixed(2)}` : '-'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6">
        <h3 className="font-handwrite text-xl text-[#2D5A4A] mb-2">安全垫</h3>
        <p className="text-3xl font-bold text-[#2D5A4A] mb-2">{safetyMonths.toFixed(2)} 个月</p>
        <p className="text-[#8BA89E]">当前存款可覆盖 {monthlyExpense > 0 ? safetyMonths.toFixed(1) : 0} 个月的基本开销</p>
      </div>
    </div>
  );
}
