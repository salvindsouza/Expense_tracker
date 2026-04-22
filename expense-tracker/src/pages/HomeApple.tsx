import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useState } from 'react';

import './HomeApple.css';
import {
  deleteExpense,
  loadExpenses,
  loadMonthlyGoals,
  saveExpense,
  saveMonthlyGoals,
} from '../services/storage';

interface Expense {
  id: string;
  category: string;
  amount: number;
  type: 'need' | 'want';
  date: string;
  month: string;
  createdAt: string;
}

const getMonthKey = (date: string) => date.slice(0, 7);

const formatLocalDate = (date: Date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const formatLocalMonth = (date: Date) => formatLocalDate(date).slice(0, 7);

const prevMonth = (month: string) => {
  let [year, currentMonth] = month.split('-').map(Number);
  currentMonth -= 1;
  if (currentMonth === 0) {
    currentMonth = 12;
    year -= 1;
  }

  return `${year}-${String(currentMonth).padStart(2, '0')}`;
};

const nextMonth = (month: string) => {
  let [year, currentMonth] = month.split('-').map(Number);
  currentMonth += 1;
  if (currentMonth === 13) {
    currentMonth = 1;
    year += 1;
  }

  return `${year}-${String(currentMonth).padStart(2, '0')}`;
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'long',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const formatCurrency = (amount: number) => currencyFormatter.format(amount || 0);

const formatMonthLabel = (month: string) => {
  const [year, currentMonth] = month.split('-').map(Number);
  return monthFormatter.format(new Date(year, currentMonth - 1, 1));
};

const formatShortDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : shortDateFormatter.format(parsed);
};

const HomeApple: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    formatLocalMonth(new Date())
  );
  const [expenseDate, setExpenseDate] = useState(
    formatLocalDate(new Date())
  );
  const [monthlyGoals, setMonthlyGoals] = useState({
    income: 0,
    needs: 0,
    savings: 0,
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<'need' | 'want'>('need');

  const updateMonthlyGoal = (
    field: 'income' | 'needs' | 'savings',
    rawValue?: string | null
  ) => {
    setMonthlyGoals((previous) => ({
      ...previous,
      [field]: Number(rawValue) || 0,
    }));
  };

  useEffect(() => {
    const today = formatLocalDate(new Date());
    setExpenseDate(
      selectedMonth === today.slice(0, 7)
        ? today
        : `${selectedMonth}-01`
    );
  }, [selectedMonth]);

  useEffect(() => {
    const loadGoals = async () => {
      const stored = await loadMonthlyGoals(selectedMonth);
      if (stored) {
        setMonthlyGoals(stored);
        return;
      }

      setMonthlyGoals({ income: 0, needs: 0, savings: 0 });
    };

    loadGoals();
  }, [selectedMonth]);

  useEffect(() => {
    loadExpenses().then((all) => {
      const filtered = all
        .filter((expense) => expense.month === selectedMonth)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
      setExpenses(filtered);
    });
  }, [selectedMonth]);

  const addExpense = async () => {
    if (!category.trim() || amount <= 0) {
      return;
    }

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
    setExpenses((previous) =>
      [expense, ...previous].sort(
        (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
      )
    );

    setCategory('');
    setAmount(0);
    setType('need');
  };

  const income = monthlyGoals.income;
  const goalNeeds = monthlyGoals.needs;
  const goalSavings = monthlyGoals.savings;
  const goalWants = income - goalNeeds - goalSavings;

  const sumNeeds = expenses
    .filter((expense) => expense.type === 'need')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const sumWants = expenses
    .filter((expense) => expense.type === 'want')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const totalSpent = sumNeeds + sumWants;
  const actualSavings = income - totalSpent;

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

  const summaryCards = [
    {
      label: 'Needs',
      actualLabel: 'Spent',
      actualValue: formatCurrency(sumNeeds),
      remainingLabel: remainingNeeds >= 0 ? 'Left' : 'Over by',
      remainingValue: formatCurrency(Math.abs(remainingNeeds)),
      detail: `Budget ${formatCurrency(goalNeeds)}`,
      ratio: needsRatio,
      tone: remainingNeeds >= 0 ? 'good' : 'danger',
    },
    {
      label: 'Wants',
      actualLabel: 'Spent',
      actualValue: formatCurrency(sumWants),
      remainingLabel: remainingWants >= 0 ? 'Left' : 'Over by',
      remainingValue: formatCurrency(Math.abs(remainingWants)),
      detail: `Budget ${formatCurrency(goalWants)}`,
      ratio: wantsRatio,
      tone: remainingWants >= 0 ? 'neutral' : 'danger',
    },
    {
      label: 'Saved',
      actualLabel: 'Saved',
      actualValue: formatCurrency(actualSavings),
      remainingLabel: 'Goal',
      remainingValue: formatCurrency(goalSavings),
      detail:
        actualSavings >= goalSavings
          ? 'Goal achieved'
          : `To goal ${formatCurrency(Math.max(savingsRemaining, 0))}`,
      ratio: savingsRatio,
      tone: actualSavings >= goalSavings ? 'good' : 'neutral',
    },
  ] as const;

  const needsShare = totalSpent > 0 ? Math.round((sumNeeds / totalSpent) * 100) : 0;
  const wantsShare = totalSpent > 0 ? 100 - needsShare : 0;

  return (
    <IonPage>
      <IonHeader translucent className="apple-header">
        <IonToolbar className="apple-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Preview Home</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" routerLink="/habits-apple" className="apple-header-link">
              Habits
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="apple-home-page">
        <div className="apple-home-shell">
          <section className="apple-hero">
            <p className="apple-eyebrow">Monthly overview</p>
            <h1>Track your month.</h1>
          </section>

          <section className="apple-glass-card apple-month-card">
            <div className="apple-month-actions">
              <IonButton
                fill="clear"
                className="apple-circle-button"
                onClick={() => setSelectedMonth(prevMonth(selectedMonth))}
              >
                ←
              </IonButton>
              <h2>{formatMonthLabel(selectedMonth)}</h2>
              <IonButton
                fill="clear"
                className="apple-circle-button"
                onClick={() => setSelectedMonth(nextMonth(selectedMonth))}
              >
                →
              </IonButton>
            </div>
          </section>

          <section className="apple-grid">
            <article className="apple-glass-card apple-section-card apple-section-card-full">
              <div className="apple-section-header">
                <p className="apple-section-label">Budget Summary</p>
                <h2>See what matters</h2>
                <p className="apple-section-copy">
                  Check spending, split, and savings at a glance.
                </p>
              </div>

              <div className="apple-summary-overview">
                <div className="apple-overview-chip apple-overview-chip-primary">
                  <span>Spent</span>
                  <strong>{formatCurrency(totalSpent)}</strong>
                </div>
                <div className="apple-overview-chip apple-overview-chip-status">
                  <span>Savings</span>
                  <strong>
                    {actualSavings >= goalSavings
                      ? 'Goal achieved'
                      : formatCurrency(Math.max(savingsRemaining, 0))}
                  </strong>
                </div>
              </div>

              <div className="apple-split-card">
                <div className="apple-summary-topline">
                  <h3>Needs and wants</h3>
                  <span>
                    {totalSpent > 0
                      ? `${formatCurrency(sumNeeds)} / ${formatCurrency(sumWants)}`
                      : 'No spending yet'}
                  </span>
                </div>

                <div className="apple-split-bar" aria-hidden="true">
                  <span
                    className="apple-split-bar-needs"
                    style={{ width: `${needsShare}%` }}
                  />
                  <span
                    className="apple-split-bar-wants"
                    style={{ width: `${wantsShare}%` }}
                  />
                </div>

                <div className="apple-split-legend">
                  <span className="apple-split-legend-item needs">Needs</span>
                  <span className="apple-split-legend-item wants">Wants</span>
                </div>
              </div>

              <div className="apple-summary-stack">
                {summaryCards.map((card) => (
                  <div key={card.label} className={`apple-summary-row tone-${card.tone}`}>
                    <div className="apple-summary-row-header">
                      <div>
                        <h3>{card.label}</h3>
                        <p>{card.detail}</p>
                      </div>
                      <strong>{card.actualValue}</strong>
                    </div>
                    <div className="apple-summary-row-meta">
                      <span>{card.actualLabel}</span>
                      <span>
                        {card.remainingLabel} {card.remainingValue}
                      </span>
                    </div>
                    <IonProgressBar value={card.ratio} />
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="apple-grid apple-grid-bottom">
            <article className="apple-glass-card apple-section-card">
              <div className="apple-section-header">
                <p className="apple-section-label">Add Expense</p>
                <h2>Log a new entry</h2>
                <p className="apple-section-copy">
                  The flow stays the same: date, category, amount, type, then save.
                </p>
              </div>

              <div className="apple-form-stack">
                <IonItem className="apple-input-item" lines="none">
                  <IonLabel position="stacked">Date</IonLabel>
                  <IonInput
                    type="date"
                    value={expenseDate}
                    onIonInput={(event) => setExpenseDate(event.detail.value || expenseDate)}
                  />
                </IonItem>

                <IonItem className="apple-input-item" lines="none">
                  <IonLabel position="stacked">Category</IonLabel>
                  <IonInput
                    value={category}
                    placeholder="Groceries"
                    onIonInput={(event) => setCategory(event.detail.value || '')}
                  />
                </IonItem>

                <IonItem className="apple-input-item" lines="none">
                  <IonLabel position="stacked">Amount</IonLabel>
                  <IonInput
                    type="number"
                    value={amount}
                    placeholder="0"
                    onIonInput={(event) => setAmount(Number(event.detail.value) || 0)}
                  />
                </IonItem>
              </div>

              <div className="apple-toggle-row" role="tablist" aria-label="Expense type">
                <button
                  type="button"
                  className={type === 'need' ? 'is-active' : ''}
                  onClick={() => setType('need')}
                >
                  Need
                </button>
                <button
                  type="button"
                  className={type === 'want' ? 'is-active' : ''}
                  onClick={() => setType('want')}
                >
                  Want
                </button>
              </div>

              <IonButton expand="block" className="apple-primary-button" onClick={addExpense}>
                Add Expense
              </IonButton>
            </article>

            <article className="apple-glass-card apple-section-card">
              <div className="apple-section-header">
                <p className="apple-section-label">Monthly Goals</p>
                <h2>Plan the month</h2>
                <p className="apple-section-copy">
                  Keep goals lower in the flow, since they change less often than daily tracking.
                </p>
              </div>

              <div className="apple-form-stack">
                <IonItem className="apple-input-item" lines="none">
                  <IonLabel position="stacked">Income</IonLabel>
                  <IonInput
                    type="number"
                    value={income}
                    placeholder="0"
                    onIonInput={(event) =>
                      updateMonthlyGoal('income', event.detail.value)
                    }
                  />
                </IonItem>

                <IonItem className="apple-input-item" lines="none">
                  <IonLabel position="stacked">Needs</IonLabel>
                  <IonInput
                    type="number"
                    value={goalNeeds}
                    placeholder="0"
                    onIonInput={(event) =>
                      updateMonthlyGoal('needs', event.detail.value)
                    }
                  />
                </IonItem>

                <IonItem className="apple-input-item" lines="none">
                  <IonLabel position="stacked">Savings</IonLabel>
                  <IonInput
                    type="number"
                    value={goalSavings}
                    placeholder="0"
                    onIonInput={(event) =>
                      updateMonthlyGoal('savings', event.detail.value)
                    }
                  />
                </IonItem>
              </div>

              <IonButton
                expand="block"
                className="apple-primary-button"
                disabled={!!goalValidationMessage}
                onClick={() => saveMonthlyGoals(selectedMonth, monthlyGoals)}
              >
                Save Goals
              </IonButton>

              {goalValidationMessage && (
                <p className="apple-inline-error">{goalValidationMessage}</p>
              )}
            </article>
          </section>

          <section className="apple-grid apple-grid-bottom apple-expenses-section">
            <article className="apple-glass-card apple-section-card apple-section-card-full">
              <div className="apple-section-header">
                <p className="apple-section-label">Expenses</p>
                <h2>This month&apos;s list</h2>
                <p className="apple-section-copy">
                  The same delete action, presented with a cleaner, denser layout.
                </p>
              </div>

              {expenses.length === 0 ? (
                <div className="apple-empty-state">
                  <h3>No expenses yet</h3>
                  <p>Add your first expense for {formatMonthLabel(selectedMonth)} to populate this list.</p>
                </div>
              ) : (
                <IonList className="apple-expense-list">
                  {expenses.map((expense) => (
                    <IonItem key={expense.id} lines="none" className="apple-expense-item">
                      <IonLabel>
                        <div className="apple-expense-row">
                          <div>
                            <strong>{expense.category}</strong>
                            <p>{formatShortDate(expense.date)}</p>
                          </div>
                          <div className="apple-expense-right">
                            <strong>{formatCurrency(expense.amount)}</strong>
                            <span className={`apple-pill apple-pill-${expense.type}`}>
                              {expense.type}
                            </span>
                          </div>
                        </div>
                      </IonLabel>
                      <IonButton
                        fill="clear"
                        size="small"
                        className="apple-delete-button"
                        onClick={() =>
                          deleteExpense(expense.id).then(() =>
                            setExpenses((previous) => previous.filter((entry) => entry.id !== expense.id))
                          )
                        }
                      >
                        Delete
                      </IonButton>
                    </IonItem>
                  ))}
                </IonList>
              )}

              <div className="apple-export-module">
                <div className="apple-export-copy">
                  <p className="apple-section-label">CSV Export</p>
                  <h3>Export expenses for Google Sheets</h3>
                  <p>
                    Mockup idea: generate a clean CSV with columns like date, month, category,
                    type, amount, and created_at, then save it to a phone-accessible folder.
                  </p>
                  <div className="apple-export-columns">
                    <span>date</span>
                    <span>month</span>
                    <span>category</span>
                    <span>type</span>
                    <span>amount</span>
                    <span>created_at</span>
                  </div>
                </div>
                <div className="apple-export-actions">
                  <IonButton className="apple-primary-button apple-export-button">
                    Export CSV
                  </IonButton>
                  <span>Suggested location: Documents/Expense Tracker</span>
                </div>
              </div>
            </article>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomeApple;
