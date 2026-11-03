'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { Utensils, ShoppingBag, Save, Check } from 'lucide-react';

const DAYS = [
  { id: 'mon', name: 'Hétfő' },
  { id: 'tue', name: 'Kedd' },
  { id: 'wed', name: 'Szerda' },
  { id: 'thu', name: 'Csütörtök' },
  { id: 'fri', name: 'Péntek' },
  { id: 'sat', name: 'Szombat' },
  { id: 'sun', name: 'Vasárnap' },
];

export default function WeeklyMenu({ familyId, userId }) {
  const [menu, setMenu] = useState({});
  const [savingDay, setSavingDay] = useState(null);
  const [ingredientInput, setIngredientInput] = useState('');
  const [selectedDayForShopping, setSelectedDayForShopping] = useState(null);

  useEffect(() => {
    if (!familyId) return;

    const unsubscribe = onSnapshot(
      collection(db, 'families', familyId, 'weekly_menu'),
      (snapshot) => {
        const menuData = {};
        snapshot.docs.forEach(doc => {
          menuData[doc.id] = doc.data();
        });
        setMenu(menuData);
      }
    );

    return () => unsubscribe();
  }, [familyId]);

  const handleSaveDay = async (dayId, lunch, dinner) => {
    setSavingDay(dayId);
    await setDoc(doc(db, 'families', familyId, 'weekly_menu', dayId), {
      lunch: lunch || '',
      dinner: dinner || '',
      updatedBy: userId,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => setSavingDay(null), 1000);
  };

  const handleSendToShoppingList = async (e) => {
    e.preventDefault();
    if (!ingredientInput.trim()) return;

    await addDoc(collection(db, 'families', familyId, 'shopping_list'), {
      name: ingredientInput.trim(),
      category: 'Élelmiszer',
      completed: false,
      addedBy: userId,
      createdAt: serverTimestamp()
    });

    setIngredientInput('');
    setSelectedDayForShopping(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-slate-800">Heti Menüterv</h2>
        </div>
      </div>

      {/* Napok kártyái */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS.map((day) => {
          const dayData = menu[day.id] || { lunch: '', dinner: '' };
          return (
            <DayCard
              key={day.id}
              day={day}
              initialLunch={dayData.lunch}
              initialDinner={dayData.dinner}
              isSaving={savingDay === day.id}
              onSave={(lunch, dinner) => handleSaveDay(day.id, lunch, dinner)}
              onOpenShopping={() => setSelectedDayForShopping(day.name)}
            />
          );
        })}
      </div>

      {/* Hozzávaló gyors küldése a bevásárlólistára Modal/Form */}
      {selectedDayForShopping && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
          <span className="text-xs font-semibold text-orange-800">
            Hozzávaló hozzáadása a bevásárlólistához ({selectedDayForShopping}):
          </span>
          <form onSubmit={handleSendToShoppingList} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Pl. 1 kg csirkemell, tejszín..."
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 sm:w-64"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Küldés
            </button>
            <button
              type="button"
              onClick={() => setSelectedDayForShopping(null)}
              className="px-2 py-2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Mégse
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function DayCard({ day, initialLunch, initialDinner, isSaving, onSave, onOpenShopping }) {
  const [lunch, setLunch] = useState(initialLunch || '');
  const [dinner, setDinner] = useState(initialDinner || '');

  useEffect(() => {
    setLunch(initialLunch || '');
    setDinner(initialDinner || '');
  }, [initialLunch, initialDinner]);

  return (
    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3 relative">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <span className="font-bold text-sm text-slate-800">{day.name}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenShopping}
            title="Hozzávalók küldése a bevásárlólistára"
            className="p-1 text-slate-400 hover:text-orange-500 transition rounded-md"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onSave(lunch, dinner)}
            className="p-1 text-slate-400 hover:text-blue-600 transition rounded-md"
            title="Mentés"
          >
            {isSaving ? <Check className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ebéd</label>
          <input
            type="text"
            placeholder="Pl. Húsleves, Rántott hús"
            value={lunch}
            onChange={(e) => setLunch(e.target.value)}
            onBlur={() => onSave(lunch, dinner)}
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-700"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Vacsora</label>
          <input
            type="text"
            placeholder="Pl. Melegszendvics"
            value={dinner}
            onChange={(e) => setDinner(e.target.value)}
            onBlur={() => onSave(lunch, dinner)}
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
