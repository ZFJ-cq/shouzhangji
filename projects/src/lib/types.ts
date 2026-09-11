// 日常收支记录
export interface Transaction {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  type: 'expense' | 'income';
}

// 工作时间参数
export interface WorkParams {
  monthlySalary: number;       // 到手月薪
  salaryMonths: number;        // 一年发薪月数
  monthlyWorkCost: number;     // 每月为工作花的钱
  dailyWorkHours: number;      // 每天常规在公司小时
  commuteMinutes: number;      // 单程通勤分钟
  weeklyOvertimeHours: number; // 每周额外加班小时
}

// 月度总结
export interface MonthlySummary {
  id: string;              // 唯一标识
  month: string;           // YYYY-MM
  totalIncome: number;     // 总收入
  fixedExpense: number;    // 固定支出
  flexibleExpense: number; // 弹性支出
}

// 自由基金
export interface FreedomFund {
  targetAmount: number;       // 目标金额
  targetMonth: string;        // 目标月份 YYYY-MM
  currentSaved: number;       // 当前已攒
  monthlyBasicExpense: number;// 每月基本开销
  startMonth: string;         // 估算起始月 YYYY-MM
  reason: string;             // 为什么想攒这笔钱
}

// 月度预算
export interface MonthlyBudget {
  amount: number;
  month: string;
  category: 'total' | 'fixed' | 'flexible';
}

// 完整应用数据
export interface AppData {
  transactions: Transaction[];
  workParams: WorkParams;
  monthlySummaries: MonthlySummary[];
  freedomFund: FreedomFund;
  monthlyBudget: MonthlyBudget | null;
}

// 分类定义
export interface Category {
  name: string;
  emoji: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { name: '吃饭', emoji: '🍜' },
  { name: '交通', emoji: '🚌' },
  { name: '购物', emoji: '🛍️' },
  { name: '娱乐', emoji: '🎮' },
  { name: '居住', emoji: '🏠' },
  { name: '医疗', emoji: '' },
  { name: '学习', emoji: '📚' },
  { name: '社交', emoji: '🎉' },
  { name: '其他', emoji: '' },
];

export const INCOME_CATEGORIES: Category[] = [
  { name: '工资', emoji: '' },
  { name: '奖金', emoji: '🎁' },
  { name: '兼职', emoji: '💼' },
  { name: '理财', emoji: '📈' },
  { name: '其他', emoji: '' },
];
