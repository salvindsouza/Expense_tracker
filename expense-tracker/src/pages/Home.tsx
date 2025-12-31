interface Expense {
  id: string;
  category: string;
  amount: number;
  type: 'need' | 'want';
  date: string;
  month: string;
  createdAt: string;
}

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonRadioGroup,
  IonRadio,
  IonProgressBar
} from '@ionic/react';

import './Home.css';
import { useEffect, useState } from 'react';
import {
  loadExpenses,
  saveExpense,
  deleteExpense,
  saveMonthlyGoals,
  loadMonthlyGoals
} from '../services/storage';
import { Preferences } from '@capacitor/preferences';

/* ---------- Helpers ---------- */
const getMonthKey = (date: string) => date.slice(0, 7);

const prevMonth = (month: string) => {
  let [y, m] = month.split('-').map(Number);
  m--;
  if (m === 0) { m = 12; y--; }
  return `${y}-${String(m).padStart(2, '0')}`;
};

const nextMonth = (month: string) => {
  let [y, m] = month.split('-').map(Number);
  m++;
  if (m === 13) { m = 1; y++; }
  return `${y}-${String(m).padStart(2, '0')}`;
};

const Home: React.FC = () => {

  /* ---------- STATE ---------- */

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [monthlyGoals, setMonthlyGoals] = useState({
    income: 0,
    needs: 0,
    savings: 0
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);


  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<'need' | 'want'>('need');

  /* ---------- Sync Expense Date ---------- */
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setExpenseDate(
      selectedMonth === today.slice(0, 7)
        ? today
        : `${selectedMonth}-01`
    );
  }, [selectedMonth]);

  /* ---------- Load Monthly Goals ---------- */
  useEffect(() => {
    const loadGoals = async () => {
      const stored = await loadMonthlyGoals(selectedMonth);
      if (stored) {
        setMonthlyGoals(stored);
      } else {
        const empty = { income: 0, needs: 0, savings: 0 };
        setMonthlyGoals(empty);
        await saveMonthlyGoals(selectedMonth, empty);
      }
    };
    loadGoals();
  }, [selectedMonth]);

  /* ---------- Load Expenses ---------- */
  useEffect(() => {
    loadExpenses().then(all =>
      setExpenses(all.filter(e => e.month === selectedMonth))
    );
  }, [selectedMonth]);

  /* ---------- Add Expense ---------- */
  const addExpense = async () => {
    if (!category.trim() || amount <= 0) return;

    const expense = {
      id: Date.now().toString(),
      category: category.trim(),
      amount,
      type,
      date: expenseDate,
      month: getMonthKey(expenseDate),
      createdAt: new Date().toISOString()
    };

    await saveExpense(expense);
    setExpenses(prev => [...prev, expense]);

    setCategory('');
    setAmount(0);
    setType('need');
  };

  /* ---------- Derived Metrics ---------- */

  const income = monthlyGoals.income;
  const goalNeeds = monthlyGoals.needs;
  const goalSavings = monthlyGoals.savings;
  const goalWants = income - goalNeeds - goalSavings;

  const sumNeeds = expenses.filter(e => e.type === 'need')
    .reduce((s, e) => s + e.amount, 0);

  const sumWants = expenses.filter(e => e.type === 'want')
    .reduce((s, e) => s + e.amount, 0);

  const actualSavings = income - sumNeeds - sumWants;

  /* ---------- Budget States ---------- */

  const remainingNeeds = goalNeeds - sumNeeds;
  const remainingWants = goalWants - sumWants;
  const savingsRemaining = goalSavings - actualSavings;

  const needsRatio = goalNeeds > 0 ? Math.min(sumNeeds / goalNeeds, 1) : 0;
  const wantsRatio = goalWants > 0 ? Math.min(sumWants / goalWants, 1) : 0;
  const savingsRatio = goalSavings > 0 ? Math.min(actualSavings / goalSavings, 1) : 0;

  const goalValidationMessage =
    income <= 0
      ? 'Income must be greater than 0'
      : goalNeeds < 0 || goalSavings < 0
      ? 'Values cannot be negative'
      : goalNeeds + goalSavings > income
      ? 'Needs + Savings cannot exceed Income'
      : '';

  /* ---------- UI ---------- */

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Expense Tracker</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        {/* Month Navigation */}
        <IonItem lines="none">
          <IonButton size="small" onClick={() => setSelectedMonth(prevMonth(selectedMonth))}>◀</IonButton>
          <IonLabel className="month-label">{selectedMonth}</IonLabel>
          <IonButton size="small" onClick={() => setSelectedMonth(nextMonth(selectedMonth))}>▶</IonButton>
        </IonItem>

        {/* Monthly Goals */}
        <h2>Monthly Goals</h2>

        <IonItem>
          <IonLabel position="stacked">Income</IonLabel>
          <IonInput type="number" value={income}
            onIonChange={e => setMonthlyGoals({ ...monthlyGoals, income: Number(e.detail.value) || 0 })} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Needs</IonLabel>
          <IonInput type="number" value={goalNeeds}
            onIonChange={e => setMonthlyGoals({ ...monthlyGoals, needs: Number(e.detail.value) || 0 })} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Savings</IonLabel>
          <IonInput type="number" value={goalSavings}
            onIonChange={e => setMonthlyGoals({ ...monthlyGoals, savings: Number(e.detail.value) || 0 })} />
        </IonItem>

        <IonButton expand="block" disabled={!!goalValidationMessage}
          onClick={() => saveMonthlyGoals(selectedMonth, monthlyGoals)}>
          Save Goals
        </IonButton>

        {goalValidationMessage && (
          <IonLabel className="budget-danger validation-text">
            {goalValidationMessage}
          </IonLabel>
        )}

        {/* Budget Summary */}
        <h2>Budget Summary</h2>

        {/* Needs */}
        <h3>Needs</h3>
        <IonLabel className={remainingNeeds >= 0 ? 'budget-ok' : 'budget-danger'}>
          {remainingNeeds >= 0
            ? <>Left to spend <span className="amount-strong">{remainingNeeds}</span></>
            : <>Exceeded by <span className="amount-strong">{Math.abs(remainingNeeds)}</span></>}
        </IonLabel>
        <IonProgressBar value={needsRatio} />

        {/* Wants */}
        <h3>Wants</h3>
        <IonLabel className={remainingWants >= 0 ? 'budget-ok' : 'budget-danger'}>
          {remainingWants >= 0
            ? <>Left to spend <span className="amount-strong">{remainingWants}</span></>
            : <>Exceeded by <span className="amount-strong">{Math.abs(remainingWants)}</span></>}
        </IonLabel>
        <IonProgressBar value={wantsRatio} />

        {/* Savings */}
        <h3>Savings</h3>
        <IonLabel className={actualSavings >= goalSavings ? 'budget-ok' : 'budget-warn'}>
          {actualSavings >= goalSavings
            ? <>Goal achieved 🎉</>
            : <>Still need to save <span className="amount-strong">{savingsRemaining}</span></>}
        </IonLabel>
        <IonProgressBar value={savingsRatio} />

        {/* Add Expense */}
        <h2>Add Expense</h2>

        <IonItem>
          <IonLabel position="stacked">Date</IonLabel>
          <IonInput type="date" value={expenseDate}
            onIonChange={e => setExpenseDate(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Category</IonLabel>
          <IonInput value={category}
            onIonChange={e => setCategory(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Amount</IonLabel>
          <IonInput type="number" value={amount}
            onIonChange={e => setAmount(Number(e.detail.value) || 0)} />
        </IonItem>

        <IonRadioGroup value={type} onIonChange={e => setType(e.detail.value)}>
          <IonItem><IonLabel>Need</IonLabel><IonRadio value="need" /></IonItem>
          <IonItem><IonLabel>Want</IonLabel><IonRadio value="want" /></IonItem>
        </IonRadioGroup>

        <IonButton expand="block" onClick={addExpense}>Add Expense</IonButton>

        {/* Expenses */}
        <h2>Expenses</h2>
        <IonList>
          {expenses.map(exp => (
            <IonItem key={exp.id}>
              <IonLabel>
                <strong>{exp.category}</strong><br />
                {exp.amount} – {exp.type}<br />
                <span className="expense-meta">{exp.date}</span>
              </IonLabel>
              <IonButton color="danger" size="small"
                onClick={() => deleteExpense(exp.id).then(() =>
                  setExpenses(prev => prev.filter(e => e.id !== exp.id))
                )}>
                Delete
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        {/* Reset */}
        <IonButton color="danger" expand="block"
          onClick={async () => {
            await Preferences.clear();
            window.location.reload();
          }}>
          Reset App
        </IonButton>

      </IonContent>
    </IonPage>
  );
};

export default Home;
