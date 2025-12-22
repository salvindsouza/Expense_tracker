import {IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonList,
  IonRadioGroup,
  IonRadio
 } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { useEffect, useState } from 'react';
import { loadSetup, SetupData, loadExpenses, saveExpense } from '../services/storage';
import { Preferences } from '@capacitor/preferences';


const Home: React.FC = () => {

const [setup, setSetup] = useState<SetupData | null>(null);
const [expenses, setExpenses] = useState<any[]>([]);

const [category, setCategory] = useState('');
const [amount, setAmount] = useState<number>(0);
const [type, setType] = useState<'need' | 'want'>('need');




useEffect(() => {
  const init = async () => {
    const savedSetup = await loadSetup();
    setSetup(savedSetup);
  };
  init();
}, []);


useEffect(() => {
  loadExpenses().then(setExpenses);
}, []);

const addExpense = async () => {
  if (!category || amount <= 0) return;

  const expense = {
    id: Date.now().toString(),
    category,
    amount,
    type,
    createdAt: new Date().toISOString(),
  };

  await saveExpense(expense);
  setExpenses(prev => [...prev, expense]);

  // reset
  setAmount(0);
  setCategory('');
  setType('need');
};



  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Expense Tracker</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {setup ? (
      <>
        <h2>Monthly Income: {setup.income} {setup.currency}</h2>
        <p>Needs: {setup.needsAmt}</p>
        <p>Savings: {setup.savingsAmt}</p>
        <p>Wants: {setup.income - setup.needsAmt - setup.savingsAmt}</p>
      </>
    ) : (
      <p>Loading setup...</p>
    )}

<h2>Add Expense</h2>

<IonItem>
  <IonLabel position="stacked">Category</IonLabel>
  <IonInput
    placeholder="e.g. Rent, Food, Internet"
    value={category}
    onIonChange={e => setCategory(e.detail.value!)}
  />
</IonItem>


<IonItem>
  <IonLabel position="stacked">Amount</IonLabel>
  <IonInput
    type="number"
    value={amount}
    onIonChange={e => setAmount(Number(e.detail.value))}
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
<h2>Expenses</h2>

<IonList>
  {expenses.map(exp => (
    <IonItem key={exp.id}>
      <IonLabel>
        <strong>{exp.category}</strong><br />
        {exp.amount} – {exp.type}
      </IonLabel>
    </IonItem>
  ))}
</IonList>

      </IonContent>
      <IonButton
  color="danger"
  onClick={async () => {
    await Preferences.clear();
    window.location.reload(); // reload app
  }}
>
  Reset App
</IonButton>

    </IonPage>
  );
};

export default Home;
