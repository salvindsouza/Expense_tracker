import { Preferences } from '@capacitor/preferences';

/* ---------- KEYS ---------- */

const SETUP_KEY = 'expense_app_setup';
const EXPENSE_KEY = 'expenses';
const GOALS_KEY_PREFIX = 'monthly_goals_';

/* ---------- TYPES ---------- */

export interface MonthlyGoals {
  income: number;
  needs: number;
  savings: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  type: 'need' | 'want';
  date: string;
  month: string;
  createdAt: string;
}

export interface SetupData {
  currency: string;
  income: number;
  needsAmt: number;
  savingsAmt: number;
}

/* ---------- MONTHLY GOALS ---------- */

export const saveMonthlyGoals = async (
  month: string,
  goals: MonthlyGoals
): Promise<void> => {
  await Preferences.set({
    key: `${GOALS_KEY_PREFIX}${month}`,
    value: JSON.stringify(goals),
  });
};

export const loadMonthlyGoals = async (
  month: string
): Promise<MonthlyGoals | null> => {
  const { value } = await Preferences.get({
    key: `${GOALS_KEY_PREFIX}${month}`,
  });
  return value ? (JSON.parse(value) as MonthlyGoals) : null;
};

/* ---------- EXPENSES ---------- */

export const loadExpenses = async (): Promise<Expense[]> => {
  const { value } = await Preferences.get({ key: EXPENSE_KEY });
  return value ? (JSON.parse(value) as Expense[]) : [];
};

export const saveExpense = async (expense: Expense): Promise<void> => {
  const expenses = await loadExpenses();
  const updated = [...expenses, expense];

  await Preferences.set({
    key: EXPENSE_KEY,
    value: JSON.stringify(updated),
  });
};

export const updateExpense = async (
  updatedExpense: Expense
): Promise<void> => {
  const expenses = await loadExpenses();

  const updated = expenses.map(e =>
    e.id === updatedExpense.id ? updatedExpense : e
  );

  await Preferences.set({
    key: EXPENSE_KEY,
    value: JSON.stringify(updated),
  });
};

export const deleteExpense = async (id: string): Promise<void> => {
  const expenses = await loadExpenses();
  const filtered = expenses.filter(e => e.id !== id);

  await Preferences.set({
    key: EXPENSE_KEY,
    value: JSON.stringify(filtered),
  });
};

/* ---------- SETUP ---------- */

export const saveSetup = async (data: SetupData): Promise<void> => {
  await Preferences.set({
    key: SETUP_KEY,
    value: JSON.stringify(data),
  });
};

export const loadSetup = async (): Promise<SetupData | null> => {
  const { value } = await Preferences.get({ key: SETUP_KEY });
  return value ? (JSON.parse(value) as SetupData) : null;
};

export const clearSetup = async (): Promise<void> => {
  await Preferences.remove({ key: SETUP_KEY });
};
