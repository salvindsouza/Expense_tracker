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
  IonRadio
} from '@ionic/react';

import './Home.css';
import { useEffect, useState } from 'react';
import {
  loadExpenses,
  saveExpense,
  updateExpense,
  deleteExpense,
  saveMonthlyGoals,
  loadMonthlyGoals
} from '../services/storage';
import { Preferences } from '@capacitor/preferences';

/* -------- Helpers -------- */
const getMonthKey = (date: string) => date.slice(0, 7);

const prevMonth = (month: string) => {
  let [y, m] = month.split('-').map(Number);
  m -= 1;
  if (m === 0) {
    m = 12;
    y -= 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
};

const nextMonth = (month: string) => {
  let [y, m] = month.split('-').map(Number);
  m += 1;
  if (m === 13) {
    m = 1;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
};

const Home: React.FC = () => {

  /* -------------------- STATE -------------------- */

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [monthlyGoals, setMonthlyGoals] = useState({
    income: 0,
    needs: 0,
    savings: 0,
  });

  const [expenses, setExpenses] = useState<any[]>([]);

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<'need' | 'want'>('need');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState(0);
  const [editType, setEditType] = useState<'need' | 'want'>('need');
  const [editDate, setEditDate] = useState('');

  /* -------------------- DATE SYNC -------------------- */

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7);

    setExpenseDate(
      selectedMonth === currentMonth ? today : `${selectedMonth}-01`
    );
  }, [selectedMonth]);

  /* -------------------- LOAD MONTHLY GOALS -------------------- */

  useEffect(() => {
    const loadGoals = async () => {
      const stored = await loadMonthlyGoals(selectedMonth);
      if (stored) {
        setMonthlyGoals(stored);
        return;
      }

      const fallback = { income: 0, needs: 0, savings: 0 };
      setMonthlyGoals(fallback);
      await saveMonthlyGoals(selectedMonth, fallback);
    };

    loadGoals();
  }, [selectedMonth]);

  /* -------------------- LOAD EXPENSES -------------------- */

  useEffect(() => {
    loadExpenses().then(all =>
      setExpenses(all.filter(e => e.month === selectedMonth))
    );
  }, [selectedMonth]);

  /* -------------------- ADD EXPENSE -------------------- */

  const addExpense = async () => {
    if (!category.trim()) return;
    if (amount <= 0) return;

    const expense = {
      id: Date.now().toString(),
      category: category.trim(),
      amount,
      type,
      date: expenseDate,
      month: getMonthKey(expenseDate),
      createdAt: new Date().toISOString(),
    };

    await saveExpense(expense);
    setExpenses(prev => [...prev, expense]);

    setCategory('');
    setAmount(0);
    setType('need');
  };

  /* -------------------- EDIT / DELETE -------------------- */

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editCategory.trim() || editAmount <= 0) return;

    const updated = {
      id: editingId,
      category: editCategory.trim(),
      amount: editAmount,
      type: editType,
      date: editDate,
      month: getMonthKey(editDate),
      createdAt: new Date().toISOString(),
    };

    await updateExpense(updated);
    setEditingId(null);

    loadExpenses().then(all =>
      setExpenses(all.filter(e => e.month === selectedMonth))
    );
  };

  const removeExpense = async (id: string) => {
    await deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  /* -------------------- DERIVED -------------------- */

  const income = monthlyGoals.income;
  const goalNeeds = monthlyGoals.needs;
  const goalSavings = monthlyGoals.savings;
  const goalWants = income - goalNeeds - goalSavings;

  const sumNeeds = expenses
    .filter(e => e.type === 'need')
    .reduce((s, e) => s + e.amount, 0);

  const sumWants = expenses
    .filter(e => e.type === 'want')
    .reduce((s, e) => s + e.amount, 0);

  const actualSavings = income - sumNeeds - sumWants;

  /* -------------------- UI -------------------- */

const goalValidationMessage = (() => {
  if (income <= 0) return 'Income must be greater than 0';
  if (goalNeeds < 0 || goalSavings < 0) return 'Values cannot be negative';
  if (goalNeeds + goalSavings > income)
    return 'Needs + Savings cannot exceed Income';
  return '';
})();



  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Expense Tracker</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        {/* -------- MONTH NAV -------- */}
        <IonItem lines="none">
          <IonButton size="small" onClick={() => setSelectedMonth(prevMonth(selectedMonth))}>◀</IonButton>
          <IonLabel style={{ textAlign: 'center', flex: 1 }}>
            <strong>{selectedMonth}</strong>
          </IonLabel>
          <IonButton size="small" onClick={() => setSelectedMonth(nextMonth(selectedMonth))}>▶</IonButton>
        </IonItem>

        {/* -------- MONTHLY GOALS -------- */}
        <h2>Monthly Goals</h2>

        <IonItem>
          <IonLabel position="stacked">Income</IonLabel>
          <IonInput
            type="number"
            value={income}
            onIonChange={e =>
              setMonthlyGoals({ ...monthlyGoals, income: Number(e.detail.value) || 0 })
            }
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Needs</IonLabel>
          <IonInput
            type="number"
            value={goalNeeds}
            onIonChange={e =>
              setMonthlyGoals({ ...monthlyGoals, needs: Number(e.detail.value) || 0 })
            }
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Savings</IonLabel>
          <IonInput
            type="number"
            value={goalSavings}
            onIonChange={e =>
              setMonthlyGoals({ ...monthlyGoals, savings: Number(e.detail.value) || 0 })
            }
          />
        </IonItem>

        <IonButton
          expand="block"
          disabled={
            income <= 0 ||
            goalNeeds < 0 ||
            goalSavings < 0 ||
            goalNeeds + goalSavings > income
          }
          onClick={async () => {
            await saveMonthlyGoals(selectedMonth, monthlyGoals);
          }}
        >
          Save Goals
        </IonButton>
        {goalValidationMessage && (
        <IonItem lines="none">
          <IonLabel color="danger" style={{ fontSize: '0.9rem' }}>
            {goalValidationMessage}
          </IonLabel>
        </IonItem>
      )}


        {/* -------- SUMMARY -------- */}
        <h2>Summary</h2>
        <p>Needs: {sumNeeds} / {goalNeeds}</p>
        <p>Wants: {sumWants} / {goalWants}</p>
        <p>Savings: {actualSavings} / {goalSavings}</p>

        {/* -------- ADD EXPENSE -------- */}
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

        {/* -------- EXPENSE LIST -------- */}
        <IonList>
          {expenses.map(exp => (
            <IonItem key={exp.id}>
              <IonLabel>
                <strong>{exp.category}</strong><br />
                {exp.amount} – {exp.type}
              </IonLabel>
              <IonButton size="small" onClick={() => {
                setEditingId(exp.id);
                setEditCategory(exp.category);
                setEditAmount(exp.amount);
                setEditType(exp.type);
                setEditDate(exp.date);
              }}>Edit</IonButton>
              <IonButton size="small" color="danger" onClick={() => removeExpense(exp.id)}>Delete</IonButton>
            </IonItem>
          ))}
        </IonList>

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
