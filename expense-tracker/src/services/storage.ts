import { Preferences } from '@capacitor/preferences';

const SETUP_KEY = 'expense_app_setup';
const CATEGORY_KEY = 'expense_categories';


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

export const saveCategories = async (categories: string[]) => {
  await Preferences.set({
    key: CATEGORY_KEY,
    value: JSON.stringify(categories),
  });
};

export const loadCategories = async (): Promise<string[]> => {
  const { value } = await Preferences.get({ key: CATEGORY_KEY });
  return value ? JSON.parse(value) : [];
};
