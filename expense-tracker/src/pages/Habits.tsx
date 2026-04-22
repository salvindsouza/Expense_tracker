import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useMemo, useState } from 'react';

import './Home.css';
import './Habits.css';
import {
  deleteHabit,
  loadHabits,
  saveHabit,
  toggleHabitCompletion,
  type Habit,
} from '../services/storage';

const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const formatLocalDateKey = (date: Date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const getLastSevenDays = () => {
  const days: { key: string; label: string }[] = [];
  const today = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    days.push({
      key: formatLocalDateKey(day),
      label: dayLabels[day.getDay() === 0 ? 6 : day.getDay() - 1],
    });
  }

  return days;
};

const getHabitStreak = (habit: Habit) => {
  const completions = new Set(habit.completions);
  const cursor = new Date();
  let streak = 0;

  while (completions.has(formatLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const sortHabits = (habits: Habit[]) => {
  return [...habits].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

const Habits: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const todayKey = formatLocalDateKey(new Date());
  const lastSevenDays = useMemo(() => getLastSevenDays(), []);

  useEffect(() => {
    loadHabits().then((stored) => setHabits(sortHabits(stored)));
  }, []);

  const completedToday = habits.filter((habit) => habit.completions.includes(todayKey)).length;

  const handleAddHabit = async () => {
    const trimmedName = newHabitName.trim();
    if (!trimmedName) {
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: trimmedName,
      createdAt: new Date().toISOString(),
      completions: [],
    };

    await saveHabit(habit);
    setHabits((previous) => sortHabits([habit, ...previous]));
    setNewHabitName('');
    setFeedbackMessage('Habit added.');
  };

  const handleToggleToday = async (habit: Habit) => {
    const updatedHabit = await toggleHabitCompletion(habit.id, todayKey);
    if (!updatedHabit) {
      return;
    }

    setHabits((previous) =>
      sortHabits(previous.map((entry) => (entry.id === habit.id ? updatedHabit : entry)))
    );
    setFeedbackMessage(
      updatedHabit.completions.includes(todayKey)
        ? `${habit.name} marked for today.`
        : `${habit.name} unmarked for today.`
    );
  };

  const handleDeleteHabit = async (habit: Habit) => {
    await deleteHabit(habit.id);
    setHabits((previous) => previous.filter((entry) => entry.id !== habit.id));
    setFeedbackMessage('Habit deleted.');
  };

  return (
    <IonPage>
      <IonHeader translucent className="apple-header">
        <IonToolbar className="apple-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Habits</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" routerLink="/home" className="apple-header-link">
              Expenses
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="apple-home-page">
        <div className="apple-home-shell">
          <section className="habit-hero">
            <p className="apple-eyebrow">Habit tracker</p>
            <h1>Build simple daily consistency.</h1>
            <p className="habit-copy">
              Create custom habits, mark them once a day, and keep an easy weekly view without
              mixing them into your expense flow.
            </p>
          </section>

          <section className="apple-glass-card habit-top-card">
            <div>
              <p className="apple-section-label">Today</p>
              <h2>
                {habits.length} habits, {completedToday} completed
              </h2>
            </div>
            <div className="habit-top-actions">
              <IonItem className="apple-input-item habit-input-item" lines="none">
                <IonLabel position="stacked">New habit</IonLabel>
                <IonInput
                  value={newHabitName}
                  placeholder="Drink more water"
                  onIonInput={(event) => setNewHabitName(event.detail.value || '')}
                />
              </IonItem>
              <IonButton className="apple-primary-button habit-add-button" onClick={handleAddHabit}>
                Add habit
              </IonButton>
            </div>
          </section>

          <section className="apple-grid">
            <article className="apple-glass-card apple-section-card apple-section-card-full">
              <div className="apple-section-header">
                <p className="apple-section-label">Your habits</p>
                <h2>Daily tracker</h2>
                <p className="apple-section-copy">
                  Mark each habit once per day. The streak and weekly row update from stored daily
                  completions.
                </p>
              </div>

              {habits.length === 0 ? (
                <div className="apple-empty-state">
                  <h3>No habits yet</h3>
                  <p>Add your first habit above to start tracking a simple daily streak.</p>
                </div>
              ) : (
                <div className="habit-list">
                  {habits.map((habit) => {
                    const streak = getHabitStreak(habit);
                    const doneToday = habit.completions.includes(todayKey);

                    return (
                      <div key={habit.id} className="habit-row">
                        <div className="habit-main">
                          <div>
                            <h3>{habit.name}</h3>
                            <p>{streak} day streak</p>
                          </div>
                          <IonButton
                            fill={doneToday ? 'solid' : 'outline'}
                            className={doneToday ? 'habit-done-button' : 'habit-pending-button'}
                            onClick={() => handleToggleToday(habit)}
                          >
                            {doneToday ? 'Done today' : 'Mark today'}
                          </IonButton>
                        </div>

                        <div className="habit-history">
                          {lastSevenDays.map((day) => (
                            <div key={`${habit.id}-${day.key}`} className="habit-day">
                              <span>{day.label}</span>
                              <i className={habit.completions.includes(day.key) ? 'is-done' : 'is-missed'} />
                            </div>
                          ))}
                        </div>

                        <div className="habit-row-footer">
                          <span>Tap once per day to update streak</span>
                          <button type="button" onClick={() => handleDeleteHabit(habit)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </section>
        </div>
      </IonContent>

      <IonToast
        isOpen={!!feedbackMessage}
        message={feedbackMessage}
        duration={2200}
        onDidDismiss={() => setFeedbackMessage('')}
      />
    </IonPage>
  );
};

export default Habits;
