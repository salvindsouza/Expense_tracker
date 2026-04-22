import { Preferences } from '@capacitor/preferences';

/* ---------- KEYS ---------- */

const SETUP_KEY = 'expense_app_setup';
const EXPENSE_KEY = 'expenses';
const HABITS_KEY = 'habits';
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

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  completions: string[];
}

const normalizeMonthlyGoals = (
  goals?: Partial<MonthlyGoals> | null
): MonthlyGoals => ({
  income: Number(goals?.income) || 0,
  needs: Number(goals?.needs) || 0,
  savings: Number(goals?.savings) || 0,
});

/* ---------- MONTHLY GOALS ---------- */

export const saveMonthlyGoals = async (
  month: string,
  goals: MonthlyGoals
): Promise<void> => {
  await Preferences.set({
    key: `${GOALS_KEY_PREFIX}${month}`,
    value: JSON.stringify(normalizeMonthlyGoals(goals)),
  });
};

export const loadMonthlyGoals = async (
  month: string
): Promise<MonthlyGoals | null> => {
  const { value } = await Preferences.get({
    key: `${GOALS_KEY_PREFIX}${month}`,
  });
  return value ? normalizeMonthlyGoals(JSON.parse(value) as Partial<MonthlyGoals>) : null;
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

/* ---------- HABITS ---------- */

const persistHabits = async (habits: Habit[]): Promise<void> => {
  await Preferences.set({
    key: HABITS_KEY,
    value: JSON.stringify(habits),
  });
};

export const loadHabits = async (): Promise<Habit[]> => {
  const { value } = await Preferences.get({ key: HABITS_KEY });
  return value ? (JSON.parse(value) as Habit[]) : [];
};

export const saveHabit = async (habit: Habit): Promise<void> => {
  const habits = await loadHabits();
  await persistHabits([habit, ...habits]);
};

export const deleteHabit = async (id: string): Promise<void> => {
  const habits = await loadHabits();
  await persistHabits(habits.filter(habit => habit.id !== id));
};

export const toggleHabitCompletion = async (
  id: string,
  date: string
): Promise<Habit | null> => {
  const habits = await loadHabits();
  let updatedHabit: Habit | null = null;

  const updatedHabits = habits.map(habit => {
    if (habit.id !== id) {
      return habit;
    }

    const completions = habit.completions.includes(date)
      ? habit.completions.filter(entry => entry !== date)
      : [...habit.completions, date].sort();

    updatedHabit = {
      ...habit,
      completions,
    };

    return updatedHabit;
  });

  await persistHabits(updatedHabits);
  return updatedHabit;
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
