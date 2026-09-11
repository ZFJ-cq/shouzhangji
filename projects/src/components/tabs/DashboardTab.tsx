'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { exportData, importData, clearAllData, formatMonthCN, getCurrentMonth } from '@/lib/store';
import { EXPENSE_CATEGORIES } from '@/lib/types';

export default function DashboardTab() {
  const { data, addTx, refresh, realHourly, nominalHourly, wageDiffPercent, today, currentMonth } = useApp();
  const [dateStr, setDateStr] = useState('');
  const [toast, setToast] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Quick record form
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('吃饭');
  const [note, setNote] = useState('');

  useEffect(() => {
    const d = new Date();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    setDateStr(`${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日星期${weekdays[d.getDay()]}`);
  }, []);

  const hasMonthlySummary = data.monthlySummaries.some(s => s.month === currentMonth);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `记账备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('已导出');
    setTimeout(() => setToast(''), 2000);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = importData(reader.result as string);
        if (result) {
          setToast('导入成功');
          refresh();
        } else {
          setToast('导入失败，文件格式错误');
        }
        setTimeout(() => setToast(''), 3000);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClear = () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      clearAllData();
      refresh();
    }
  };

  const handleQuickRecord = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    addTx({
      id: Date.now().toString(),
      amount: numAmount,
      category,
      note,
      date: today,
      type: 'expense',
    });
    setAmount('');
    setNote('');
    setToast('已记录');
    setTimeout(() => setToast(''), 1500);
  };

  const recentExpenses = data.transactions.filter(t => t.type === 'expense').slice(0, 3);

  const getCategoryEmoji = (name: string) => EXPENSE_CATEGORIES.find(c => c.name === name)?.emoji || '';
  const formatHours = (amt: number) => {
    if (realHourly <= 0) return '0 分钟';
    const totalMin = Math.round((amt / realHourly) * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h === 0 ? `${m} 分钟` : `${h} 小时 ${m} 分钟`;
  };
  const formatDateCN = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="font-handwrite text-2xl sm:text-3xl text-[#2D5A4A]">今日驾驶舱</h1>
            <p className="text-[#8BA89E] text-base sm:text-lg mt-1 truncate">{dateStr}</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-[#D4E5DE] bg-white/60 text-[#5A7A6A] hover:bg-white/80 transition-all min-h-[44px] whitespace-nowrap"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <span className="hidden sm:inline">切换深色</span>
            <span className="sm:hidden">深色</span>
          </button>
        </div>
        <div className="border-b border-dashed border-[#C8D8D0] my-4" />

        {!hasMonthlySummary && (
          <div className="bg-[#FFF9E6] border border-dashed border-[#E8D8A0] rounded-2xl p-3 sm:p-4 mb-4">
            <p className="text-[#8B7D50] text-sm sm:text-base">这个月还没有月度总结。可以先随手记账，月底再补完整收入和支出。</p>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3">
          <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl border border-[#D4E5DE] bg-white/60 text-[#5A7A6A] hover:bg-white/80 transition-all min-h-[44px] text-sm sm:text-base">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            导出
          </button>
          <button onClick={handleImport} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl border border-[#D4E5DE] bg-white/60 text-[#5A7A6A] hover:bg-white/80 transition-all min-h-[44px] text-sm sm:text-base">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            导入
          </button>
          <button onClick={handleClear} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl border border-[#D4E5DE] bg-white/60 text-[#5A7A6A] hover:bg-white/80 transition-all min-h-[44px] text-sm sm:text-base">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            清空
          </button>
        </div>
      </div>

      {/* Real Hourly Card */}
      <div className="bg-[#E8F5F0] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/60 flex items-center justify-center">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="#5A7A6A" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        </div>
        <p className="text-[#5A7A6A] font-medium mb-1 sm:mb-2 text-sm sm:text-base">真实时薪</p>
        <p className="text-3xl sm:text-4xl font-bold text-[#2D8B6A] mb-1 sm:mb-2">¥{realHourly.toFixed(2)}<span className="text-xl sm:text-2xl">/时</span></p>
        <p className="text-[#8BA89E] text-sm sm:text-base">比名义时薪少 {wageDiffPercent.toFixed(1)}%</p>
      </div>
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="font-handwrite text-2xl sm:text-3xl text-[#2D5A4A] mb-2">今天也要算清楚</h2>
            <p className="text-[#8BA89E] text-base sm:text-lg">不是为了苛责每一笔钱，而是让每一小时更接近你想要的生活。</p>
          </div>
          <div className="flex-shrink-0">
            <svg width="60" height="60" viewBox="0 0 120 120" fill="none" className="sm:w-[80px] sm:h-[80px]">
              <ellipse cx="60" cy="95" rx="40" ry="8" fill="#E8F5F0" opacity="0.5" />
              <path d="M30 70 C30 40, 50 30, 60 30 C70 30, 90 40, 90 70 C90 85, 75 90, 60 90 C45 90, 30 85, 30 70Z" fill="#F0D0D0" stroke="#E8A0A0" strokeWidth="2" />
              <path d="M30 55 L20 45 L25 40 L35 50Z" fill="#F0D0D0" stroke="#E8A0A0" strokeWidth="1.5" />
              <circle cx="72" cy="55" r="3" fill="#2D5A4A" />
              <path d="M45 30 C45 20, 55 15, 60 15 C65 15, 70 20, 68 28" stroke="#7BC8A4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M55 22 C58 18, 62 18, 64 22" stroke="#7BC8A4" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="82" cy="42" r="10" fill="#FFF9E6" stroke="#E8D8A0" strokeWidth="1.5" />
              <text x="82" y="46" textAnchor="middle" fontSize="12" fill="#8B7D50" fontWeight="bold">¥</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Spending */}
      <div className="mb-6">
        <h2 className="font-handwrite text-2xl text-[#2D5A4A] flex items-center gap-2 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          刚刚花掉的时光
        </h2>
        {recentExpenses.length === 0 ? (
          <div className="text-[#8BA89E] text-center py-8">还没有支出记录，记一笔吧</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {recentExpenses.map(tx => (
              <div key={tx.id} className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F5F0] flex items-center justify-center text-2xl flex-shrink-0">{getCategoryEmoji(tx.category)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#2D5A4A] truncate">{tx.note || tx.category}</p>
                    <p className="text-sm text-[#8BA89E] mt-1">{tx.category} · {formatDateCN(tx.date)}</p>
                    <p className="text-sm text-[#8BA89E]">{formatHours(tx.amount)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-[#E8A0A0]">¥{tx.amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Record */}
      <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6 mb-6">
        <h2 className="font-handwrite text-2xl text-[#2D5A4A] flex items-center gap-2 mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          现在记一笔
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">金额</label>
            <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4] transition-colors" />
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">分类</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4] transition-colors">
              {EXPENSE_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">随手一句</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="可不填，写一句更有记忆点" className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4] transition-colors" />
          </div>
          <button onClick={handleQuickRecord} disabled={!amount || parseFloat(amount) <= 0} className="w-full py-3 rounded-xl bg-[#2D7A6A] text-white font-medium hover:bg-[#2D8B6A] disabled:bg-[#C8D8D0] disabled:cursor-not-allowed transition-all active:scale-[0.97]">保存并换算工时</button>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 bg-[#7BC8A4] text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">{toast}</div>
      )}
    </div>
  );
}
