'use client';

import { useApp } from '@/lib/AppContext';
import { getCurrentMonth } from '@/lib/store';
import type { PlanSub } from './types';

const ENTRIES: { id: Exclude<PlanSub, 'menu'>; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'summary',
    title: '月度总结',
    desc: '记录每月收入与支出，自动算结余',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
  },
  {
    id: 'budget',
    title: '月度预算',
    desc: '给总支出定个上限，月初心里有数',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    ),
  },
  {
    id: 'freedom',
    title: '自由基金',
    desc: '攒一笔能让你说"不"的钱',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    ),
  },
];

export default function PlanMenu({ onNavigate }: { onNavigate: (s: PlanSub) => void }) {
  const { data, realHourly, monthlyCommuteHours, monthlyOvertimeHours } = useApp();

  const currentMonth = getCurrentMonth();
  const monthExpenses = data.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
  const monthExpenseTotal = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const commuteOvertimeHours = monthlyCommuteHours + monthlyOvertimeHours;
  const expenseWorkDays = realHourly > 0 ? (monthExpenseTotal / realHourly) / 8 : 0;

  const completeMonths = data.monthlySummaries.filter(s => s.month <= currentMonth);
  const formatMonthLabel = (m: string) => {
    const [y, mo] = m.split('-');
    return `${y}年${parseInt(mo)}月`;
  };
  const sortedMonths = [...completeMonths].sort((a, b) => {
    const balA = a.totalIncome - a.fixedExpense - a.flexibleExpense;
    const balB = b.totalIncome - b.fixedExpense - b.flexibleExpense;
    return balB - balA;
  });

  return (
    <div className="animate-fade-in">
      {/* 入口按钮 */}
      <div className="mb-6">
        <h2 className="font-handwrite text-3xl text-[#2D5A4A] mb-2">规划</h2>
        <p className="text-[#8BA89E] text-lg mb-6">把大目标拆成每月能落地的动作。</p>

        <div className="grid grid-cols-1 gap-3">
          {ENTRIES.map(e => (
            <button
              key={e.id}
              onClick={() => onNavigate(e.id)}
              className="flex items-center gap-4 bg-white/70 border border-[#D4E5DE] rounded-2xl p-5 text-left hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5F0] flex items-center justify-center text-[#2D7A6A] flex-shrink-0">
                {e.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-handwrite text-xl text-[#2D5A4A]">{e.title}</p>
                <p className="text-sm text-[#8BA89E] mt-0.5">{e.desc}</p>
              </div>
              <svg className="text-[#9B9B9B] flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          ))}
        </div>
      </div>

      {/* 有趣发现 */}
      <div className="mb-6">
        <h2 className="font-handwrite text-3xl text-[#2D5A4A] mb-2">有趣发现</h2>
        <p className="text-[#8BA89E] text-lg mb-6">少一点抽象焦虑，多一点可以动手调整的变量。</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-4">
            <p className="text-sm text-[#8BA89E] mb-1">本月为公司"白干"时间</p>
            <p className="text-2xl font-bold text-[#2D5A4A]">{commuteOvertimeHours.toFixed(1)} 小时</p>
            <p className="text-xs text-[#8BA89E] mt-1">通勤 {monthlyCommuteHours.toFixed(1)} 小时 + 额外加班 {monthlyOvertimeHours.toFixed(0)} 小时。</p>
          </div>
          <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-4">
            <p className="text-sm text-[#8BA89E] mb-1">其中通勤与加班</p>
            <p className="text-2xl font-bold text-[#2D5A4A]">{monthlyCommuteHours.toFixed(1)} 小时 + {monthlyOvertimeHours.toFixed(0)} 小时</p>
            <p className="text-xs text-[#8BA89E] mt-1">通勤按双程计算，加班按每周小时折算月均。</p>
          </div>
          <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-4">
            <p className="text-sm text-[#8BA89E] mb-1">本月支出折算</p>
            <p className="text-2xl font-bold text-[#2D5A4A]">{expenseWorkDays.toFixed(1)} 个工作日</p>
            <p className="text-xs text-[#8BA89E] mt-1">按每天 8 小时折算成工作日。</p>
          </div>
        </div>

        {sortedMonths.length > 0 && (
          <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6">
            <h3 className="font-handwrite text-xl text-[#2D5A4A] mb-4">存款月份排行</h3>
            <div className="space-y-4">
              {sortedMonths.slice(0, 5).map((s, i) => {
                const balance = s.totalIncome - s.fixedExpense - s.flexibleExpense;
                return (
                  <div key={s.id} className="flex justify-between items-center pb-3 border-b border-dashed border-[#D4E5DE] last:border-0">
                    <div>
                      <span className="font-bold text-[#2D5A4A] text-lg">{i + 1}. {formatMonthLabel(s.month)}</span>
                      {i === 0 && <span className="ml-2 text-sm text-[#7BC8A4]">最佳月</span>}
                    </div>
                    <span className="text-xl font-bold text-[#2D8B6A]">¥{balance.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
