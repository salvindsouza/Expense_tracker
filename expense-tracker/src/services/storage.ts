import { Preferences } from '@capacitor/preferences';

const SETUP_KEY = 'expense_app_setup';
const EXPENSE_KEY = 'expenses';



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


