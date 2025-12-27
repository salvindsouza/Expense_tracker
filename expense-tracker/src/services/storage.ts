import { Preferences } from '@capacitor/preferences';

const SETUP_KEY = 'expense_app_setup';
const EXPENSE_KEY = 'expenses';

const GOALS_KEY_PREFIX = 'monthly_goals_';

export const saveMonthlyGoals = async (month: string, goals: any) => {
  await Preferences.set({
    key: `${GOALS_KEY_PREFIX}${month}`,
    value: JSON.stringify(goals),
  });
};

export const loadMonthlyGoals = async (month: string) => {
  const { value } = await Preferences.get({
    key: `${GOALS_KEY_PREFIX}${month}`,
  });
  return value ? JSON.parse(value) : null;
};


export const updateExpense = async (updatedExpense: any) => {
  const { value } = await Preferences.get({ key: EXPENSE_KEY });
  const expenses = value ? JSON.parse(value) : [];

  const updated = expenses.map((e: any) =>
    e.id === updatedExpense.id ? updatedExpense : e
  );

  await Preferences.set({
    key: EXPENSE_KEY,
    value: JSON.stringify(updated),
  });
};

export const deleteExpense = async (id: string) => {
  const { value } = await Preferences.get({ key: EXPENSE_KEY });
  const expenses = value ? JSON.parse(value) : [];

  const filtered = expenses.filter((e: any) => e.id !== id);

  await Preferences.set({
    key: EXPENSE_KEY,
    value: JSON.stringify(filtered),
  });
};



export interface SetupData {
  currency: string;
  income: number;
  needsAmt: number;
  savingsAmt: number;
}

export const saveSetup = async (data: SetupData) => {
  await Preferences.set({
    key: SETUP_KEY,
    value: JSON.stringify(data),
  });
};

export const loadSetup = async (): Promise<SetupData | null> => {
  const { value } = await Preferences.get({ key: SETUP_KEY });
  return value ? JSON.parse(value) : null;
};

export const clearSetup = async () => {
  await Preferences.remove({ key: SETUP_KEY });
};


export const loadExpenses = async (): Promise<any[]> => {
  const { value } = await Preferences.get({ key: EXPENSE_KEY });
  return value ? JSON.parse(value) : [];
};

export const saveExpense = async (expense: any) => {
  const expenses = await loadExpenses();
  const updated = [...expenses, expense];

  await Preferences.set({
    key: EXPENSE_KEY,
    value: JSON.stringify(updated),
  });
};


