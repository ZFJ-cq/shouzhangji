'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';

export default function RecordTab() {
  const { data, addTx, updateTx, deleteTx, realHourly, today, currentMonth } = useApp();

  // 10-second record form
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('吃饭');
  const [note, setNote] = useState('');
  const [isIncome, setIsIncome] = useState(false);
  const [toast, setToast] = useState('');

  // Edit modal
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');

  const todayExpenses = data.transactions.filter(t => t.type === 'expense' && t.date === today);
  const monthExpenses = data.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));

  const todayTotal = todayExpenses.reduce((s, t) => s + t.amount, 0);
  const monthTotal = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const monthWorkMinutes = realHourly > 0 ? Math.round((monthTotal / realHourly) * 60) : 0;
  const monthWorkHours = Math.floor(monthWorkMinutes / 60);
  const monthWorkMins = monthWorkMinutes % 60;

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    addTx({
      id: Date.now().toString(),
      amount: numAmount,
      category,
      note,
      date,
      type: isIncome ? 'income' : 'expense',
    });
    setAmount('');
    setNote('');
    setToast('已记录');
    setTimeout(() => setToast(''), 1500);
  };

  const handleEdit = (id: string) => {
    const tx = data.transactions.find(t => t.id === id);
    if (!tx) return;
    setEditingId(id);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category);
    setEditNote(tx.note);
    setEditDate(tx.date);
    setIsIncome(tx.type === 'income');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const numAmount = parseFloat(editAmount);
    if (!numAmount || numAmount <= 0) return;
    updateTx(editingId, { amount: numAmount, category: editCategory, note: editNote, date: editDate });
    setEditingId(null);
    setToast('已更新');
    setTimeout(() => setToast(''), 1500);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除这条记录吗？')) {
      deleteTx(id);
      setToast('已删除');
      setTimeout(() => setToast(''), 1500);
    }
  };

  const getCategoryEmoji = (name: string) => {
    const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    return all.find(c => c.name === name)?.emoji || '';
  };

  const formatHours = (amt: number) => {
    if (realHourly <= 0) return '0 分钟';
    const totalMin = Math.round((amt / realHourly) * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h === 0 ? `${m} 分钟` : `${h} 小时 ${m} 分钟`;
  };

  const formatDateCN = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // Transactions are already newest-first, no need to reverse
  const recentRecords = data.transactions;

  // Category statistics for current month
  const categoryStats = monthExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  const categoryEntries = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
  const pieColors = ['#7BC8A4', '#E8A0A0', '#F2C6A0', '#A8D8B9', '#6BBF9E', '#D4A0A0', '#C6B896', '#9BC4B2', '#B8A9C9', '#F0B6B6'];

  return (
    <div className="animate-fade-in">
      {/* 10 Second Record */}
      <div className="mb-6">
        <h2 className="font-handwrite text-3xl text-[#2D5A4A] mb-2">10 秒记账</h2>
        <p className="text-[#8BA89E] text-lg mb-6">你不是乱花钱，你是在拿工时换体验。知道换了多少，选择就更踏实。</p>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          <div className="aspect-square bg-white/70 border border-[#D4E5DE] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] sm:text-sm text-[#8BA89E] mb-1 leading-none">今日支出</p>
            <p className="text-base sm:text-2xl font-bold text-[#E8A0A0] leading-tight">¥{todayTotal}</p>
          </div>
          <div className="aspect-square bg-white/70 border border-[#D4E5DE] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] sm:text-sm text-[#8BA89E] mb-1 leading-none">本月支出</p>
            <p className="text-base sm:text-2xl font-bold text-[#E8A0A0] leading-tight">¥{monthTotal}</p>
          </div>
          <div className="aspect-square bg-white/70 border border-[#D4E5DE] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] sm:text-sm text-[#8BA89E] mb-1 leading-none">本月等价工时</p>
            <p className="text-sm sm:text-xl font-bold text-[#2D5A4A] leading-tight">{monthWorkHours}h {monthWorkMins}m</p>
          </div>
        </div>

        {/* Category Pie Chart */}
        {categoryEntries.length > 0 && (
          <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6 mb-6">
            <h3 className="font-handwrite text-xl text-[#2D5A4A] mb-4">本月分类统计</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {categoryEntries.reduce((acc, [cat, amount], i) => {
                    const pct = (amount / monthTotal) * 100;
                    const circ = 2 * Math.PI * 40;
                    const dash = `${(pct / 100) * circ} ${circ}`;
                    const offset = -acc.offset;
                    acc.offset += (pct / 100) * circ;
                    acc.elems.push(
                      <circle key={cat} cx="50" cy="50" r="40" fill="none" stroke={pieColors[i % pieColors.length]} strokeWidth="20" strokeDasharray={dash} strokeDashoffset={offset} />
                    );
                    return acc;
                  }, { offset: 0, elems: [] as React.ReactElement[] }).elems}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-[#8BA89E]">总支出</p>
                    <p className="text-sm font-bold text-[#2D5A4A]">¥{monthTotal}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {categoryEntries.slice(0, 5).map(([cat, amount], i) => {
                  const pct = ((amount / monthTotal) * 100).toFixed(1);
                  const catInfo = EXPENSE_CATEGORIES.find(c => c.name === cat);
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                      <span className="text-sm text-[#5A7A6A] flex-1">{catInfo?.emoji || ''} {cat}</span>
                      <span className="text-sm font-medium text-[#2D5A4A]">¥{amount.toFixed(0)}</span>
                      <span className="text-xs text-[#8BA89E] w-12 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6">
          <h3 className="font-handwrite text-xl text-[#2D5A4A] flex items-center gap-2 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
            记下一笔体验
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5A7A6A] font-medium mb-2">日期</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
            </div>
            <div>
              <label className="block text-[#5A7A6A] font-medium mb-2">金额</label>
              <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
            </div>
            <div>
              <label className="block text-[#5A7A6A] font-medium mb-2">分类</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]">
                {(isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[#5A7A6A] font-medium mb-2">备注</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="这笔体验是什么" className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 mb-4">
            <button onClick={() => setIsIncome(false)} className={`px-4 py-2 rounded-lg text-sm ${!isIncome ? 'bg-[#E8F5F0] text-[#2D7A6A]' : 'text-[#8BA89E]'}`}>支出</button>
            <button onClick={() => setIsIncome(true)} className={`px-4 py-2 rounded-lg text-sm ${isIncome ? 'bg-[#E8F5F0] text-[#2D7A6A]' : 'text-[#8BA89E]'}`}>收入</button>
          </div>
          <button onClick={handleSave} disabled={!amount || parseFloat(amount) <= 0} className="w-full py-3 rounded-xl bg-[#2D7A6A] text-white font-medium hover:bg-[#2D8B6A] disabled:bg-[#C8D8D0] disabled:cursor-not-allowed transition-all active:scale-[0.97]">保存支出</button>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6 mb-6">
        <h3 className="font-handwrite text-2xl text-[#2D5A4A] mb-4">最近记录</h3>
        {recentRecords.length === 0 ? (
          <p className="text-[#8BA89E] text-center py-8">还没有记录</p>
        ) : (
          <div className="space-y-4">
            {recentRecords.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 pb-4 border-b border-dashed border-[#D4E5DE] last:border-0">
                <div className="w-12 h-12 rounded-xl bg-[#E8F5F0] flex items-center justify-center text-2xl flex-shrink-0">{getCategoryEmoji(tx.category)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#2D5A4A] truncate">{tx.note || tx.category}</p>
                  <p className="text-sm text-[#8BA89E] mt-1">{tx.category} · {formatDateCN(tx.date)} · {formatHours(tx.amount)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xl font-bold ${tx.type === 'income' ? 'text-[#6BBF9E]' : 'text-[#E8A0A0]'}`}>¥{tx.amount}</p>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => handleEdit(tx.id)} className="text-sm text-[#5A7A6A] hover:text-[#2D7A6A]">编辑</button>
                    <button onClick={() => handleDelete(tx.id)} className="text-sm text-[#E8A0A0] hover:text-[#D07070]">删除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-handwrite text-xl text-[#2D5A4A] mb-4">编辑记录</h3>
            <div className="space-y-3">
              <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
              <input type="number" inputMode="decimal" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
              <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]">
                {(isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
              </select>
              <input type="text" value={editNote} onChange={e => setEditNote(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditingId(null)} className="flex-1 py-3 rounded-xl border border-[#D4E5DE] text-[#5A7A6A]">取消</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 rounded-xl bg-[#2D7A6A] text-white">保存</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 right-4 bg-[#7BC8A4] text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">{toast}</div>
      )}
    </div>
  );
}
