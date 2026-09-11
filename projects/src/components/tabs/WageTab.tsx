'use client';

import { useApp } from '@/lib/AppContext';

export default function WageTab() {
  const { workParams, setWorkParams, realHourly, nominalHourly, wageDiffPercent, annualIncome, annualWorkCost, monthlyWorkHours, monthlyCommuteHours, monthlyOvertimeHours, totalMonthlyHours, monthlyNetIncome } = useApp();

  const handleChange = (field: string, value: number) => {
    setWorkParams({ [field]: value });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="font-handwrite text-3xl text-[#2D5A4A] mb-2">我的时薪</h2>
        <p className="text-[#8BA89E] text-lg">老板想让我以为的数字，和生活实际拿走时间后剩下的数字，都摊开来看。</p>
      </div>

      {/* Work Params */}
      <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6 mb-6">
        <h3 className="font-handwrite text-xl text-[#2D5A4A] flex items-center gap-2 mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          工作时间参数
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">到手月薪</label>
            <input type="number" inputMode="decimal" value={workParams.monthlySalary} onChange={e => handleChange('monthlySalary', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">一年发薪月数</label>
            <input type="number" inputMode="numeric" value={workParams.salaryMonths} onChange={e => handleChange('salaryMonths', parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">每月为工作花的钱</label>
            <input type="number" inputMode="decimal" value={workParams.monthlyWorkCost} onChange={e => handleChange('monthlyWorkCost', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">每天常规在公司小时</label>
            <input type="number" inputMode="decimal" value={workParams.dailyWorkHours} onChange={e => handleChange('dailyWorkHours', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">单程通勤分钟</label>
            <input type="number" inputMode="numeric" value={workParams.commuteMinutes} onChange={e => handleChange('commuteMinutes', parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
          <div>
            <label className="block text-[#5A7A6A] font-medium mb-2">每周额外加班小时</label>
            <input type="number" inputMode="decimal" value={workParams.weeklyOvertimeHours} onChange={e => handleChange('weeklyOvertimeHours', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#D4E5DE] bg-[#FFFDF7] text-[#2D5A4A] focus:outline-none focus:border-[#7BC8A4]" />
          </div>
        </div>
        <div className="bg-[#FFF9E6] border-l-4 border-[#E8D8A0] rounded-r-xl p-4 mt-4">
          <p className="text-[#8B7D50]">在公司小时包含无法自由支配的午休，不含额外加班。输入变化会自动保存，所有数值采用年度口径。</p>
        </div>
      </div>

      {/* Nominal Wage */}
      <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6 mb-6">
        <p className="text-[#5A7A6A] font-medium mb-2">名义时薪</p>
        <p className="text-4xl font-bold text-[#2D5A4A] mb-2">¥{nominalHourly.toFixed(2)}<span className="text-2xl">/时</span></p>
        <p className="text-[#8BA89E]">到手月薪 ÷ 21.75  8</p>
      </div>

      {/* Real Wage */}
      <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6 mb-6">
        <p className="text-[#5A7A6A] font-medium mb-2">真实时薪</p>
        <p className="text-4xl font-bold text-[#2D8B6A] mb-2">¥{realHourly.toFixed(2)}<span className="text-2xl">/时</span></p>
        <p className="text-[#8BA89E]">真实少了 {wageDiffPercent.toFixed(1)}%</p>
      </div>

      {/* Calculation Process */}
      <div className="bg-white/70 border border-[#D4E5DE] rounded-2xl p-6 mb-6">
        <h3 className="font-handwrite text-xl text-[#2D5A4A] mb-4">计算过程</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D4]">
            <span className="text-[#8BA89E]">名义时薪</span>
            <span className="text-xl font-bold text-[#2D5A4A]">¥{workParams.monthlySalary.toLocaleString()} ÷ 21.75 ÷ 8 = ¥{nominalHourly.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D4]">
            <span className="text-[#8BA89E]">年到手收入</span>
            <span className="text-xl font-bold text-[#2D5A4A]">¥{workParams.monthlySalary.toLocaleString()} × {workParams.salaryMonths} = ¥{annualIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D4]">
            <span className="text-[#8BA89E]">年工作成本</span>
            <span className="text-xl font-bold text-[#2D5A4A]">¥{workParams.monthlyWorkCost.toLocaleString()} × 12 = ¥{annualWorkCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D4]">
            <span className="text-[#8BA89E]">月在场时间</span>
            <span className="text-xl font-bold text-[#2D5A4A]">{workParams.dailyWorkHours} × 21.75 = {monthlyWorkHours.toFixed(2)} 小时</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D4]">
            <span className="text-[#8BA89E]">月通勤时间</span>
            <span className="text-xl font-bold text-[#2D5A4A]">{workParams.commuteMinutes} × 2 × 21.75 ÷ 60 = {monthlyCommuteHours.toFixed(1)} 小时</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D4]">
            <span className="text-[#8BA89E]">月加班时间</span>
            <span className="text-xl font-bold text-[#2D5A4A]">{workParams.weeklyOvertimeHours} × 4.33 = {monthlyOvertimeHours.toFixed(1)} 小时</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D4]">
            <span className="text-[#8BA89E]">月总占用时间</span>
            <span className="text-xl font-bold text-[#2D5A4A]">{totalMonthlyHours.toFixed(2)} 小时</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8BA89E]">月净收入</span>
            <span className="text-xl font-bold text-[#2D8B6A]">¥{monthlyNetIncome.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
