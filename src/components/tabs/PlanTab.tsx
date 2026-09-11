'use client';

import { useState } from 'react';
import PlanMenu from '@/components/plan/PlanMenu';
import MonthlySummaryView from '@/components/plan/MonthlySummaryView';
import BudgetView from '@/components/plan/BudgetView';
import FreedomFundView from '@/components/plan/FreedomFundView';
import type { PlanSub } from '@/components/plan/types';

const SUB_TITLES: Record<Exclude<PlanSub, 'menu'>, string> = {
  summary: '月度总结',
  budget: '月度预算',
  freedom: '自由基金',
};

export default function PlanTab() {
  const [sub, setSub] = useState<PlanSub>('menu');

  if (sub !== 'menu') {
    const title = SUB_TITLES[sub];
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setSub('menu')}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[var(--c-text-body)] hover:bg-[var(--c-surface-2)] transition-all min-h-[44px]"
            aria-label="返回"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            <span className="text-sm">返回</span>
          </button>
          <h2 className="font-handwrite text-2xl text-[var(--c-text)]">{title}</h2>
        </div>
        {sub === 'summary' && <MonthlySummaryView />}
        {sub === 'budget' && <BudgetView />}
        {sub === 'freedom' && <FreedomFundView />}
      </div>
    );
  }

  return <PlanMenu onNavigate={setSub} />;
}
