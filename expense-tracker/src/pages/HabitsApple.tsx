import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import './HabitsApple.css';

const habits = [
  {
    id: '1',
    name: 'Morning walk',
    streak: 6,
    doneToday: true,
    history: [1, 1, 1, 0, 1, 1, 1],
  },
  {
    id: '2',
    name: 'Read 20 minutes',
    streak: 4,
    doneToday: false,
    history: [1, 0, 1, 1, 1, 1, 0],
  },
  {
    id: '3',
    name: 'No sugary drinks',
    streak: 9,
    doneToday: true,
    history: [1, 1, 1, 1, 1, 1, 1],
  },
];

const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const HabitsApple: React.FC = () => {
  return (
    <IonPage>
      <IonHeader translucent className="apple-header">
        <IonToolbar className="apple-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home-apple" />
          </IonButtons>
          <IonTitle>Habits Preview</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" routerLink="/home-apple" className="habit-header-link">
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
              Separate from expenses, focused on a lightweight daily check-in that is easy to
              maintain on mobile.
            </p>
          </section>

          <section className="apple-glass-card habit-top-card">
            <div>
              <p className="apple-section-label">Today</p>
              <h2>3 habits, 2 completed</h2>
            </div>
            <div className="habit-top-actions">
              <IonButton className="apple-primary-button habit-add-button">Add habit</IonButton>
            </div>
          </section>

          <section className="apple-grid">
            <article className="apple-glass-card apple-section-card apple-section-card-full">
              <div className="apple-section-header">
                <p className="apple-section-label">Your habits</p>
                <h2>Daily tracker</h2>
                <p className="apple-section-copy">
                  Mockup idea: create custom habits, tap once to mark today, and keep a visible
                  streak without extra complexity.
                </p>
              </div>

              <div className="habit-list">
                {habits.map((habit) => (
                  <div key={habit.id} className="habit-row">
                    <div className="habit-main">
                      <div>
                        <h3>{habit.name}</h3>
                        <p>{habit.streak} day streak</p>
                      </div>
                      <IonButton
                        fill={habit.doneToday ? 'solid' : 'outline'}
                        className={habit.doneToday ? 'habit-done-button' : 'habit-pending-button'}
                      >
                        {habit.doneToday ? 'Done today' : 'Mark today'}
                      </IonButton>
                    </div>

                    <div className="habit-history">
                      {habit.history.map((done, index) => (
                        <div key={`${habit.id}-${dayLabels[index]}`} className="habit-day">
                          <span>{dayLabels[index]}</span>
                          <i className={done ? 'is-done' : 'is-missed'} />
                        </div>
                      ))}
                    </div>

                    <div className="habit-row-footer">
                      <span>Tap once per day to update streak</span>
                      <button type="button">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="apple-grid apple-grid-bottom">
            <article className="apple-glass-card apple-section-card">
              <div className="apple-section-header">
                <p className="apple-section-label">Add flow</p>
                <h2>Keep it simple</h2>
              </div>
              <ul className="habit-notes">
                <li>One short habit name only</li>
                <li>No reminders in first version</li>
                <li>No categories or notes yet</li>
                <li>Just create, mark today, or delete</li>
              </ul>
            </article>

            <article className="apple-glass-card apple-section-card">
              <div className="apple-section-header">
                <p className="apple-section-label">Why this works</p>
                <h2>Feasible and useful</h2>
              </div>
              <ul className="habit-notes">
                <li>Fast to use every day</li>
                <li>Easy to store locally by date</li>
                <li>Clear streak feedback</li>
                <li>Separate from expense mental model</li>
              </ul>
            </article>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HabitsApple;
