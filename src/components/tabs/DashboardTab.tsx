'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { exportData, importData, clearAllData, formatMonthCN, getCurrentMonth } from '@/lib/store';
import { EXPENSE_CATEGORIES } from '@/lib/types';

export default function DashboardTab() {
  const { data, addTx, refresh, realHourly, nominalHourly, wageDiffPercent, today, currentMonth, theme, toggleTheme } = useApp();
  const [dateStr, setDateStr] = useState('');
  const [toast, setToast] = useState('');
  const [showClear, setShowClear] = useState(false);
  const [clearStep, setClearStep] = useState<1 | 2>(1);

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
    clearAllData();
    refresh();
    setShowClear(false);
    setClearStep(1);
    setToast('已清空全部数据');
    setTimeout(() => setToast(''), 2000);
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
            <h1 className="font-handwrite text-2xl sm:text-3xl text-[var(--c-text)]">今日驾驶舱</h1>
            <p className="text-[var(--c-text-muted)] text-base sm:text-lg mt-1 truncate">{dateStr}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[var(--c-text-body)] hover:bg-[var(--c-accent)] hover:text-white transition-all min-h-[44px] whitespace-nowrap"
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
            <span className="hidden sm:inline">{theme === 'dark' ? '切换浅色' : '切换深色'}</span>
            <span className="sm:hidden">{theme === 'dark' ? '浅色' : '深色'}</span>
          </button>
        </div>
        <div className="border-b border-dashed border-[var(--c-disabled)] my-4" />

        {!hasMonthlySummary && (
          <div className="bg-[var(--c-warn-bg)] border border-dashed border-[var(--c-warn-border)] rounded-2xl p-3 sm:p-4 mb-4">
            <p className="text-[var(--c-warn-text)] text-sm sm:text-base">这个月还没有月度总结。可以先随手记账，月底再补完整收入和支出。</p>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3">
          <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[var(--c-text-body)] hover:bg-[var(--c-surface-2)] transition-all min-h-[44px] text-sm sm:text-base">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            导出
          </button>
          <button onClick={handleImport} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[var(--c-text-body)] hover:bg-[var(--c-surface-2)] transition-all min-h-[44px] text-sm sm:text-base">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            导入
          </button>
          <button onClick={() => setShowClear(true)} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl border border-[var(--c-danger)] bg-[var(--c-danger-soft)] text-[var(--c-danger)] hover:bg-[var(--c-danger-soft-2)] transition-all min-h-[44px] text-sm sm:text-base font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            清空
          </button>
        </div>
      </div>

      {/* Real Hourly Card */}
      <div className="bg-[var(--c-mint)] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--c-surface-2)] flex items-center justify-center">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-body)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        </div>
        <p className="text-[var(--c-text-body)] font-medium mb-1 sm:mb-2 text-sm sm:text-base">真实时薪</p>
        <p className="text-3xl sm:text-4xl font-bold text-[var(--c-accent-strong)] mb-1 sm:mb-2">¥{realHourly.toFixed(2)}<span className="text-xl sm:text-2xl">/时</span></p>
        <p className="text-[var(--c-text-muted)] text-sm sm:text-base">比名义时薪少 {wageDiffPercent.toFixed(1)}%</p>
      </div>
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="font-handwrite text-2xl sm:text-3xl text-[var(--c-text)] mb-2">今天也要算清楚</h2>
            <p className="text-[var(--c-text-muted)] text-base sm:text-lg">不是为了苛责每一笔钱，而是让每一小时更接近你想要的生活。</p>
          </div>
          <div className="flex-shrink-0">
            <svg width="60" height="60" viewBox="0 0 120 120" fill="none" className="sm:w-[80px] sm:h-[80px]">
              <ellipse cx="60" cy="95" rx="40" ry="8" fill="var(--c-mint)" opacity="0.5" />
              <path d="M30 70 C30 40, 50 30, 60 30 C70 30, 90 40, 90 70 C90 85, 75 90, 60 90 C45 90, 30 85, 30 70Z" fill="#F0D0D0" stroke="var(--c-danger)" strokeWidth="2" />
              <path d="M30 55 L20 45 L25 40 L35 50Z" fill="#F0D0D0" stroke="var(--c-danger)" strokeWidth="1.5" />
              <circle cx="72" cy="55" r="3" fill="var(--c-text)" />
              <path d="M45 30 C45 20, 55 15, 60 15 C65 15, 70 20, 68 28" stroke="var(--c-accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M55 22 C58 18, 62 18, 64 22" stroke="var(--c-accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="82" cy="42" r="10" fill="var(--c-warn-bg)" stroke="var(--c-warn-border)" strokeWidth="1.5" />
              <text x="82" y="46" textAnchor="middle" fontSize="12" fill="var(--c-warn-text)" fontWeight="bold">¥</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Spending */}
      <div className="mb-6">
        <h2 className="font-handwrite text-2xl text-[var(--c-text)] flex items-center gap-2 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          刚刚花掉的时光
        </h2>
        {recentExpenses.length === 0 ? (
          <div className="text-[var(--c-text-muted)] text-center py-8">还没有支出记录，记一笔吧</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {recentExpenses.map(tx => (
              <div key={tx.id} className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--c-mint)] flex items-center justify-center text-2xl flex-shrink-0">{getCategoryEmoji(tx.category)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--c-text)] truncate">{tx.note || tx.category}</p>
                    <p className="text-sm text-[var(--c-text-muted)] mt-1">{tx.category} · {formatDateCN(tx.date)}</p>
                    <p className="text-sm text-[var(--c-text-muted)]">{formatHours(tx.amount)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-[var(--c-danger)]">¥{tx.amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Record */}
      <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-6 mb-6">
        <h2 className="font-handwrite text-2xl text-[var(--c-text)] flex items-center gap-2 mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          现在记一笔
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[var(--c-text-body)] font-medium mb-2">金额</label>
            <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)] transition-colors" />
          </div>
          <div>
            <label className="block text-[var(--c-text-body)] font-medium mb-2">分类</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)] transition-colors">
              {EXPENSE_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[var(--c-text-body)] font-medium mb-2">随手一句</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="可不填，写一句更有记忆点" className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)] transition-colors" />
          </div>
          <button onClick={handleQuickRecord} disabled={!amount || parseFloat(amount) <= 0} className="w-full py-3 rounded-xl bg-[var(--c-accent-deep)] text-white font-medium hover:bg-[var(--c-accent-strong)] disabled:bg-[var(--c-disabled)] disabled:cursor-not-allowed transition-all active:scale-[0.97]">保存并换算工时</button>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 bg-[var(--c-accent)] text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">{toast}</div>
      )}

      {showClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]" onClick={() => { setShowClear(false); setClearStep(1); }}>
          <div className="bg-[var(--c-surface)] rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            {clearStep === 1 ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--c-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <h3 className="font-handwrite text-xl text-[var(--c-danger)]">清空全部数据</h3>
                </div>
                <p className="text-[var(--c-text-body)] text-sm sm:text-base leading-relaxed mb-3">此操作会<span className="font-bold text-[var(--c-danger)]">永久删除</span>你在本应用中的<span className="font-bold">全部数据</span>，包括：</p>
                <ul className="list-disc pl-5 text-[var(--c-text-muted)] text-sm space-y-1 mb-5">
                  <li>所有记账记录（收入与支出）</li>
                  <li>月度总结、月度预算</li>
                  <li>真实时薪参数与自由基金</li>
                </ul>
                <p className="text-[var(--c-warn-text)] text-sm bg-[var(--c-warn-bg)] border border-dashed border-[var(--c-warn-border)] rounded-xl p-3 mb-5">⚠️ 该操作<span className="font-bold">不可恢复</span>。清空前建议先点「导出」做好备份。</p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowClear(false); setClearStep(1); }} className="flex-1 py-3 rounded-xl border border-[var(--c-border)] text-[var(--c-text-body)] transition-all">取消</button>
                  <button onClick={() => setClearStep(2)} className="flex-1 py-3 rounded-xl bg-[var(--c-danger)] text-white font-medium hover:bg-[var(--c-danger-hover)] transition-all">我仍要清空</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-handwrite text-xl text-[var(--c-danger)] mb-3">最后确认</h3>
                <p className="text-[var(--c-text-body)] text-sm sm:text-base leading-relaxed mb-5">请再次确认：你将<strong className="text-[var(--c-danger)]">清空全部数据且无法撤销</strong>。确定要继续吗？</p>
                <div className="flex gap-3">
                  <button onClick={() => setClearStep(1)} className="flex-1 py-3 rounded-xl border border-[var(--c-border)] text-[var(--c-text-body)] transition-all">返回</button>
                  <button onClick={handleClear} className="flex-1 py-3 rounded-xl bg-[var(--c-danger)] text-white font-medium hover:bg-[var(--c-danger-hover)] transition-all">确认清空全部</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
