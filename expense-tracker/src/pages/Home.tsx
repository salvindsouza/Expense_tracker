import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { useEffect, useState } from 'react';
import { loadSetup, SetupData } from '../services/storage';
import { Preferences } from '@capacitor/preferences';


const Home: React.FC = () => {

const [setup, setSetup] = useState<SetupData | null>(null);
useEffect(() => {
  const init = async () => {
    const savedSetup = await loadSetup();
    setSetup(savedSetup);
  };
  init();
}, []);


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
