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
  updateExpense,
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
  if (m === 0) {
    m = 12;
    y--;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
};

const nextMonth = (month: string) => {
  let [y, m] = month.split('-').map(Number);
  m++;
  if (m === 13) {
    m = 1;
    y++;
  }
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

  /* ---------- Sync Expense Date ---------- */
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7);
    setExpenseDate(
      selectedMonth === currentMonth ? today : `${selectedMonth}-01`
    );
  }, [selectedMonth]);

  /* ---------- Load Monthly Goals ---------- */
  useEffect(() => {
    const loadGoals = async () => {
      const stored = await loadMonthlyGoals(selectedMonth);
      if (stored) {
        setMonthlyGoals(stored);
        return;
      }

      const empty = { income: 0, needs: 0, savings: 0 };
      setMonthlyGoals(empty);
      await saveMonthlyGoals(selectedMonth, empty);
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
      createdAt: new Date().toISOString(),
    };

    await saveExpense(expense);
    setExpenses(prev => [...prev, expense]);

    setCategory('');
    setAmount(0);
    setType('need');
  };

  /* ---------- Edit / Delete ---------- */
  const saveEdit = async () => {
    if (!editingId || !editCategory.trim() || editAmount <= 0) return;

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


const remainingNeeds = goalNeeds - sumNeeds;
const remainingWants = goalWants - sumWants;

const needsExceeded = remainingNeeds < 0 ? Math.abs(remainingNeeds) : 0;
const wantsExceeded = remainingWants < 0 ? Math.abs(remainingWants) : 0;


const remainingNeedsRatio =
  goalNeeds > 0
    ? Math.max(Math.min(remainingNeeds / goalNeeds, 1), 0)
    : 0;

const wantsRemainingRatio =
  goalWants > 0
    ? Math.max(Math.min(remainingWants / goalWants, 1), 0)
    : 0;

const savingsProgress =
  goalSavings > 0 ? Math.min(actualSavings / goalSavings, 1) : 0;

  const savingsRemaining = goalSavings - actualSavings;
const savingsShortfall = savingsRemaining > 0 ? savingsRemaining : 0;
const savingsSurplus = actualSavings > goalSavings
  ? actualSavings - goalSavings
  : 0;

  const goalValidationMessage = (() => {
    if (income <= 0) return 'Income must be greater than 0';
    if (goalNeeds < 0 || goalSavings < 0) return 'Values cannot be negative';
    if (goalNeeds + goalSavings > income)
      return 'Needs + Savings cannot exceed Income';
    return '';
  })();


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
          <IonLabel style={{ textAlign: 'center', flex: 1 }}>
            <strong>{selectedMonth}</strong>
          </IonLabel>
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
          <IonItem lines="none">
            <IonLabel color="danger">{goalValidationMessage}</IonLabel>
          </IonItem>
        )}

        {/* Budget Progress */}
    
        <h3>Needs</h3>

        {remainingNeeds >= 0 ? (
          <>
            <IonLabel>
              Left to spend: <strong>{remainingNeeds}</strong>
            </IonLabel>
            <IonProgressBar value={remainingNeedsRatio} />
          </>
        ) : (
          <>
            <IonLabel color="danger">
              Exceeded by <strong>{needsExceeded}</strong>
            </IonLabel>
            <IonProgressBar value={1} color="danger" />
          </>
        )}

        <h3>Wants</h3>

{remainingWants >= 0 ? (
  <>
    <IonLabel>
      Left to spend: <strong>{remainingWants}</strong>
    </IonLabel>
    <IonProgressBar value={wantsRemainingRatio} color="secondary" />
  </>
) : (
  <>
    <IonLabel color="danger">
      Exceeded by <strong>{wantsExceeded}</strong>
    </IonLabel>
    <IonProgressBar value={1} color="danger" />
  </>
)}

<h3>Savings</h3>

{actualSavings < goalSavings ? (
  <>
    <IonLabel color="warning">
      Still need to save <strong>{savingsShortfall}</strong>
    </IonLabel>
    <IonProgressBar value={savingsProgress} color="warning" />
  </> ) : (
  <>
    <IonLabel color="success">
      Goal achieved 🎉
      {savingsSurplus > 0 && ( <> — Extra saved: <strong>{savingsSurplus}</strong></>
      )}
    </IonLabel>
    <IonProgressBar value={1} color="success" />
  </>
)}

        {/* -------- Add Expense -------- */}
<h2>Add Expense</h2>

<IonItem>
  <IonLabel position="stacked">Date</IonLabel>
  <IonInput
    type="date"
    value={expenseDate}
    onIonChange={e => setExpenseDate(e.detail.value!)}
  />
</IonItem>

<IonItem>
  <IonLabel position="stacked">Category</IonLabel>
  <IonInput
    value={category}
    placeholder="e.g. Rent, Food"
    onIonChange={e => setCategory(e.detail.value!)}
  />
</IonItem>

<IonItem>
  <IonLabel position="stacked">Amount</IonLabel>
  <IonInput
    type="number"
    value={amount}
    onIonChange={e => setAmount(Number(e.detail.value) || 0)}
  />
</IonItem>

<IonRadioGroup value={type} onIonChange={e => setType(e.detail.value)}>
  <IonItem>
    <IonLabel>Need</IonLabel>
    <IonRadio value="need" />
  </IonItem>
  <IonItem>
    <IonLabel>Want</IonLabel>
    <IonRadio value="want" />
  </IonItem>
</IonRadioGroup>

<IonButton expand="block" onClick={addExpense}>
  Add Expense
</IonButton>

{/* -------- Expense List -------- */}
<h2>Expenses</h2>

<IonList>
  {expenses.map(exp => (
    <IonItem key={exp.id}>
      <IonLabel>
        <strong>{exp.category}</strong><br />
        {exp.amount} – {exp.type}<br />
        <small>{exp.date}</small>
      </IonLabel>

      <IonButton
        size="small"
        onClick={() => {
          setEditingId(exp.id);
          setEditCategory(exp.category);
          setEditAmount(exp.amount);
          setEditType(exp.type);
          setEditDate(exp.date);
        }}
      >
        Edit
      </IonButton>

      <IonButton
        size="small"
        color="danger"
        onClick={() => removeExpense(exp.id)}
      >
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

