'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { loadData, saveData, addTransaction, updateTransaction, deleteTransaction, updateWorkParams, addMonthlySummary, updateMonthlySummary, deleteMonthlySummary, updateFreedomFund, updateBudget, calcRealHourly, calcNominalHourly, calcWageDiffPercent, getToday, getCurrentMonth } from '@/lib/store';
import type { AppData, Transaction, WorkParams, MonthlySummary, FreedomFund, MonthlyBudget } from '@/lib/types';

interface AppContextType {
  data: AppData;
  workParams: WorkParams;
  refresh: () => void;
  // Transaction actions
  addTx: (tx: Transaction) => void;
  updateTx: (id: string, updates: Partial<Transaction>) => void;
  deleteTx: (id: string) => void;
  // Work params
  setWorkParams: (params: Partial<WorkParams>) => void;
  // Monthly summary
  addSummary: (s: MonthlySummary) => void;
  updateSummary: (id: string, updates: Partial<MonthlySummary>) => void;
  deleteSummary: (id: string) => void;
  // Freedom fund
  setFreedomFund: (f: Partial<FreedomFund>) => void;
  // Budget
  setBudget: (b: MonthlyBudget | null) => void;
  // Computed
  realHourly: number;
  nominalHourly: number;
  wageDiffPercent: number;
  annualIncome: number;
  annualWorkCost: number;
  monthlyWorkHours: number;
  monthlyCommuteHours: number;
  monthlyOvertimeHours: number;
  totalMonthlyHours: number;
  monthlyNetIncome: number;
  today: string;
  currentMonth: string;
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  const refresh = useCallback(() => {
    setData(loadData());
  }, []);

  const addTx = useCallback((tx: Transaction) => {
    addTransaction(tx);
    setData(prev => ({ ...prev, transactions: [tx, ...prev.transactions] }));
  }, []);

  const updateTx = useCallback((id: string, updates: Partial<Transaction>) => {
    updateTransaction(id, updates);
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    }));
  }, []);

  const deleteTx = useCallback((id: string) => {
    deleteTransaction(id);
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(tx => tx.id !== id) }));
  }, []);

  const setWorkParams = useCallback((params: Partial<WorkParams>) => {
    updateWorkParams(params);
    setData(prev => ({ ...prev, workParams: { ...prev.workParams, ...params } }));
  }, []);

  const addSummary = useCallback((s: MonthlySummary) => {
    addMonthlySummary(s);
    setData(prev => ({ ...prev, monthlySummaries: [...prev.monthlySummaries, s] }));
  }, []);

  const updateSummary = useCallback((id: string, updates: Partial<MonthlySummary>) => {
    updateMonthlySummary(id, updates);
    setData(prev => ({
      ...prev,
      monthlySummaries: prev.monthlySummaries.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  }, []);

  const deleteSummary = useCallback((id: string) => {
    deleteMonthlySummary(id);
    setData(prev => ({ ...prev, monthlySummaries: prev.monthlySummaries.filter(s => s.id !== id) }));
  }, []);

  const setFreedomFund = useCallback((f: Partial<FreedomFund>) => {
    updateFreedomFund(f);
    setData(prev => ({ ...prev, freedomFund: { ...prev.freedomFund, ...f } }));
  }, []);

  const setBudget = useCallback((b: MonthlyBudget | null) => {
    updateBudget(b);
    setData(prev => ({ ...prev, monthlyBudget: b }));
  }, []);

  const workParams = data.workParams;
  const realHourly = calcRealHourly(workParams);
  const nominalHourly = calcNominalHourly(workParams);
  const wageDiffPercent = calcWageDiffPercent(workParams);
  const annualIncome = workParams.monthlySalary * workParams.salaryMonths;
  const annualWorkCost = workParams.monthlyWorkCost * 12;
  const monthlyWorkHours = workParams.dailyWorkHours * 21.75;
  const monthlyCommuteHours = (workParams.commuteMinutes / 60) * 21.75;
  const monthlyOvertimeHours = workParams.weeklyOvertimeHours * 4.33;
  const totalMonthlyHours = monthlyWorkHours + monthlyCommuteHours + monthlyOvertimeHours;
  const monthlyNetIncome = (annualIncome - annualWorkCost) / 12;
  const today = getToday();
  const currentMonth = getCurrentMonth();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('mint-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mint-theme', theme);
    } catch {
      /* ignore */
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <AppContext.Provider value={{
      data, workParams, refresh,
      addTx, updateTx, deleteTx,
      setWorkParams,
      addSummary, updateSummary, deleteSummary,
      setFreedomFund,
      setBudget,
      realHourly, nominalHourly, wageDiffPercent,
      annualIncome, annualWorkCost,
      monthlyWorkHours, monthlyCommuteHours, monthlyOvertimeHours,
      totalMonthlyHours, monthlyNetIncome,
      today, currentMonth,
      theme, toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
