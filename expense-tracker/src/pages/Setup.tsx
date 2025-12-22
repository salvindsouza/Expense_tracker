import {
  IonPage,
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
  IonNote
} from '@ionic/react';
import { useState } from 'react';
import { saveSetup } from '../services/storage';


interface SetupProps {
  onComplete: () => void;
}

const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const [currency, setCurrency] = useState('INR');
  const [income, setIncome] = useState<number>(0);
  const [needsAmt, setNeedsAmt] = useState<number>(0);
  const [savingsAmt, setSavingsAmt] = useState<number>(0);

  /* ---------- Derived values ---------- */
  const wantsAmt = Math.max(0, income - needsAmt - savingsAmt);
  
  const needsPct = income > 0 ? ((needsAmt / income) * 100).toFixed(1) : '0.0';
  const savingsPct = income > 0 ? ((savingsAmt / income) * 100).toFixed(1) : '0.0';
  const wantsPct = income > 0 ? ((wantsAmt / income) * 100).toFixed(1) : '0.0';

  const isValid = () => {
    return income > 0 && (needsAmt + savingsAmt + wantsAmt === income);
  };

  /* ---------- Handlers ---------- */
  const handleIncomeChange = (e: any) => {
    const value = Number((e.target as HTMLIonInputElement).value) || 0;
    setIncome(value);
  };

  const handleNeedsChange = (e: any) => {
    const value = Number((e.target as HTMLIonInputElement).value) || 0;
    // Don't allow more than income
    if (value <= income) {
      setNeedsAmt(value);
    }
  };

  const handleSavingsChange = (e: any) => {
    const value = Number((e.target as HTMLIonInputElement).value) || 0;
    // Don't allow more than remaining amount
    const remaining = income - needsAmt;
    if (value <= remaining) {
      setSavingsAmt(value);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Initial Setup</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        {/* Currency */}
        <IonItem>
          <IonLabel>Currency</IonLabel>
          <IonSelect value={currency} onIonChange={e => setCurrency(e.detail.value)}>
            <IonSelectOption value="INR">INR</IonSelectOption>
            <IonSelectOption value="USD">USD</IonSelectOption>
            <IonSelectOption value="EUR">EUR</IonSelectOption>
          </IonSelect>
        </IonItem>

        {/* Income */}
        <IonItem>
          <IonLabel position="stacked">Monthly Income</IonLabel>
          <IonInput
            type="number"
            value={income}
            onIonInput={handleIncomeChange}
            placeholder="Enter your monthly income"
          />
        </IonItem>

        <h3>Needs</h3>
        <IonItem>
          <IonLabel position="stacked">
            Needs Amount ({currency})
            <IonNote color="medium" style={{ marginLeft: '10px' }}>
              {needsPct}%
            </IonNote>
          </IonLabel>
          <IonInput 
            type="number" 
            value={needsAmt}
            onIonInput={handleNeedsChange}
            placeholder="0"
          />
        </IonItem>

        <h3>Savings</h3>
        <IonItem>
          <IonLabel position="stacked">
            Savings Amount ({currency})
            <IonNote color="medium" style={{ marginLeft: '10px' }}>
              {savingsPct}%
            </IonNote>
          </IonLabel>
          <IonInput 
            type="number" 
            value={savingsAmt}
            onIonInput={handleSavingsChange}
            placeholder="0"
          />
        </IonItem>

        <h3>Wants (Auto-calculated)</h3>
        <IonItem>
          <IonLabel position="stacked">
            Wants Amount ({currency})
            <IonNote color="medium" style={{ marginLeft: '10px' }}>
              {wantsPct}%
            </IonNote>
          </IonLabel>
          <IonInput 
            type="number" 
            value={wantsAmt}
            readonly
            disabled
          />
        </IonItem>

        <IonButton
            expand="block"
            disabled={!isValid()}
            onClick={async () => {
                await saveSetup({
                currency,
                income,
                needsAmt,
                savingsAmt
                });
                onComplete();
            }}>Complete Setup
        </IonButton>

      </IonContent>
    </IonPage>
  );
};

export default Setup;