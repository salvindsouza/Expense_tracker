import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonList
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { saveCategories, loadCategories } from '../services/storage';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadCategories().then(setCategories);
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    const updated = [...categories, newCategory.trim()];
    setCategories(updated);
    setNewCategory('');
    await saveCategories(updated);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Categories</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonInput
            placeholder="Add category (e.g. Rent)"
            value={newCategory}
            onIonChange={e => setNewCategory(e.detail.value!)}
          />
          <IonButton onClick={addCategory}>Add</IonButton>
        </IonItem>

        <IonList>
          {categories.map((cat, idx) => (
            <IonItem key={idx}>{cat}</IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Categories;
