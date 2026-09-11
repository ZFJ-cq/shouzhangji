import { AppData, Transaction, WorkParams, MonthlySummary, FreedomFund, MonthlyBudget } from './types';

const STORAGE_KEY = 'mint-accounting-data';

const defaultWorkParams: WorkParams = {
  monthlySalary: 13800,
  salaryMonths: 13,
  monthlyWorkCost: 850,
  dailyWorkHours: 9,
  commuteMinutes: 48,
  weeklyOvertimeHours: 6,
};

const defaultFreedomFund: FreedomFund = {
  targetAmount: 120000,
  targetMonth: '2028-02',
  currentSaved: 36800,
  monthlyBasicExpense: 5600,
  startMonth: '2026-02',
  reason: '攒出半年缓冲期，给下一次选择留出底气',
};

const defaultData: AppData = {
  transactions: [],
  workParams: defaultWorkParams,
  monthlySummaries: [],
  freedomFund: defaultFreedomFund,
  monthlyBudget: null,
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as AppData;
    return {
      transactions: parsed.transactions || [],
      workParams: parsed.workParams || defaultWorkParams,
      monthlySummaries: parsed.monthlySummaries || [],
      freedomFund: parsed.freedomFund || defaultFreedomFund,
      monthlyBudget: parsed.monthlyBudget || null,
    };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Transaction CRUD
export function addTransaction(tx: Transaction): AppData {
  const data = loadData();
  data.transactions = [tx, ...data.transactions];
  saveData(data);
  return data;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): AppData {
  const data = loadData();
  data.transactions = data.transactions.map(t =>
    t.id === id ? { ...t, ...updates } : t
  );
  saveData(data);
  return data;
}

export function deleteTransaction(id: string): AppData {
  const data = loadData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveData(data);
  return data;
}

// WorkParams
export function updateWorkParams(params: Partial<WorkParams>): AppData {
  const data = loadData();
  data.workParams = { ...data.workParams, ...params };
  saveData(data);
  return data;
}

// MonthlySummary CRUD
export function addMonthlySummary(summary: MonthlySummary): AppData {
  const data = loadData();
  const idx = data.monthlySummaries.findIndex(s => s.month === summary.month);
  if (idx >= 0) {
    data.monthlySummaries[idx] = { ...summary, id: data.monthlySummaries[idx].id };
  } else {
    data.monthlySummaries = [{ ...summary, id: Date.now().toString() }, ...data.monthlySummaries].sort(
      (a, b) => b.month.localeCompare(a.month)
    );
  }
  saveData(data);
  return data;
}

export function updateMonthlySummary(id: string, updates: Partial<MonthlySummary>): AppData {
  const data = loadData();
  data.monthlySummaries = data.monthlySummaries.map(s =>
    s.id === id ? { ...s, ...updates } : s
  );
  saveData(data);
  return data;
}

export function deleteMonthlySummary(id: string): AppData {
  const data = loadData();
  data.monthlySummaries = data.monthlySummaries.filter(s => s.id !== id);
  saveData(data);
  return data;
}

// FreedomFund
export function updateFreedomFund(fund: Partial<FreedomFund>): AppData {
  const data = loadData();
  data.freedomFund = { ...data.freedomFund, ...fund };
  saveData(data);
  return data;
}

// Import/Export
export function exportData(): string {
  return JSON.stringify(loadData(), null, 2);
}

export function importData(json: string): AppData | null {
  try {
    const parsed = JSON.parse(json) as AppData;
    saveData(parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function clearAllData(): AppData {
  saveData(defaultData);
  return defaultData;
}

// Budget
export function updateBudget(budget: MonthlyBudget | null): AppData {
  const data = loadData();
  data.monthlyBudget = budget;
  saveData(data);
  return data;
}

// Helpers
export function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getRecentCompleteMonths(count: number): string[] {
  const months: string[] = [];
  const now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth(); // 0-indexed
  for (let i = 0; i < count; i++) {
    m--;
    if (m < 0) { m = 11; y--; }
    months.push(`${y}-${String(m + 1).padStart(2, '0')}`);
  }
  return months;
}

// 时薪计算
export function calcNominalHourly(params: WorkParams): number {
  return params.monthlySalary / 21.75 / 8;
}

export function calcRealHourly(params: WorkParams): number {
  const annualIncome = params.monthlySalary * params.salaryMonths;
  const annualWorkCost = params.monthlyWorkCost * 12;
  const netAnnual = annualIncome - annualWorkCost;
  const monthlyWorkHours = params.dailyWorkHours * 21.75;
  const monthlyCommuteHours = (params.commuteMinutes * 2 / 60) * 21.75;
  const monthlyOvertimeHours = params.weeklyOvertimeHours * 4.33;
  const totalMonthlyHours = monthlyWorkHours + monthlyCommuteHours + monthlyOvertimeHours;
  const totalAnnualHours = totalMonthlyHours * 12;
  return netAnnual / totalAnnualHours;
}

export function calcWageDiffPercent(params: WorkParams): number {
  const nominal = calcNominalHourly(params);
  const real = calcRealHourly(params);
  if (nominal <= 0) return 0;
  return ((nominal - real) / nominal) * 100;
}

// 格式化
export function formatMoney(n: number): string {
  return '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function formatHoursFromAmount(amount: number, realHourly: number): string {
  if (realHourly <= 0) return '0 小时';
  const totalMinutes = Math.round((amount / realHourly) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} 分钟`;
  return `${h} 小时 ${m} 分钟`;
}

export function formatDateCN(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatMonthCN(monthStr: string): string {
  const [y, m] = monthStr.split('-');
  return `${y}年${m}月`;
}
