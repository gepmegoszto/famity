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
import { 
  Utensils, 
  ShoppingBag, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  X,
  ListPlus
} from 'lucide-react';

const DAYS = [
  { id: 'mon', name: 'Hétfő' },
  { id: 'tue', name: 'Kedd' },
  { id: 'wed', name: 'Szerda' },
  { id: 'thu', name: 'Csütörtök' },
  { id: 'fri', name: 'Péntek' },
  { id: 'sat', name: 'Szombat' },
  { id: 'sun', name: 'Vasárnap' },
];

const CATEGORIES = [
  'Élelmiszer',
  'Zöldség/Gyümölcs',
  'Pékáru',
  'Tejtermék',
  'Hús/Mentes',
  'Háztartás',
  'Vegyes'
];

export default function WeeklyMenu({ familyId, userId }) {
  const [menu, setMenu] = useState({});
  const [members, setMembers] = useState([]);
  const [shoppingLists, setShoppingLists] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [savingDay, setSavingDay] = useState(null);

  // Modal állapotok alapanyag küldéséhez
  const [activeModal, setActiveModal] = useState(null); // { dayId, dayName, mealType, mealName }
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientCategory, setIngredientCategory] = useState('Élelmiszer');
  const [selectedListId, setSelectedListId] = useState('');
  const [newListName, setNewListName] = useState('');
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);

  // Adminisztrátori jog ellenőrzése
  const currentUser = members.find(m => m.id === userId);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!familyId) return;

    // Családtagok
    const unsubMembers = onSnapshot(
      collection(db, 'families', familyId, 'members'),
      (snapshot) => {
        setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    // Heti menü
    const unsubMenu = onSnapshot(
      collection(db, 'families', familyId, 'weekly_menu'),
      (snapshot) => {
        const menuData = {};
        snapshot.docs.forEach(doc => {
          menuData[doc.id] = doc.data();
        });
        setMenu(menuData);
      }
    );

    // Bevásárlólisták
    const unsubLists = onSnapshot(
      collection(db, 'families', familyId, 'shopping_lists'),
      (snapshot) => {
        const lists = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setShoppingLists(lists);
        if (lists.length > 0 && !selectedListId) {
          setSelectedListId(lists[0].id);
        }
      }
    );

    // Bevásárlólista tételek
    const unsubItems = onSnapshot(
      collection(db, 'families', familyId, 'shopping_list'),
      (snapshot) => {
        setShoppingItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubMembers();
      unsubMenu();
      unsubLists();
      unsubItems();
    };
  }, [familyId]);

  // Nap mentése (Csak Admin)
  const handleSaveDay = async (dayId, lunch, dinner, ingredients = []) => {
    if (!isAdmin) return;
    setSavingDay(dayId);
    await setDoc(doc(db, 'families', familyId, 'weekly_menu', dayId), {
      lunch: lunch || '',
      dinner: dinner || '',
      ingredients: ingredients || [],
      updatedBy: userId,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => setSavingDay(null), 800);
  };

  // Új alapanyag felvétele a naphoz (Admin)
  const handleAddIngredientToDay = async (dayId, name, mealType) => {
    if (!isAdmin || !name.trim()) return;

    const dayData = menu[dayId] || { lunch: '', dinner: '', ingredients: [] };
    const currentIngredients = dayData.ingredients || [];

    const newIng = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      mealType: mealType // 'lunch' | 'dinner'
    };

    const updatedIngredients = [...currentIngredients, newIng];

    await setDoc(doc(db, 'families', familyId, 'weekly_menu', dayId), {
      ingredients: updatedIngredients,
      updatedBy: userId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  // Alapanyag törlése a napból (Admin)
  const handleDeleteIngredientFromDay = async (dayId, ingId) => {
    if (!isAdmin) return;

    const dayData = menu[dayId] || { ingredients: [] };
    const updatedIngredients = (dayData.ingredients || []).filter(i => i.id !== ingId);

    await setDoc(doc(db, 'families', familyId, 'weekly_menu', dayId), {
      ingredients: updatedIngredients,
      updatedBy: userId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  // Küldés a kiválasztott vagy új bevásárlólistára
  const handleSendToShoppingList = async (e) => {
    e.preventDefault();
    if (!ingredientName.trim()) return;

    let targetListId = selectedListId;

    // Ha új listát hozunk létre
    if (isCreatingNewList || !targetListId) {
      if (!newListName.trim()) {
        alert('Kérlek add meg az új bevásárlólista nevét!');
        return;
      }
      const newListRef = await addDoc(collection(db, 'families', familyId, 'shopping_lists'), {
        name: newListName.trim(),
        createdAt: serverTimestamp(),
        addedBy: userId
      });
      targetListId = newListRef.id;
      setSelectedListId(targetListId);
      setIsCreatingNewList(false);
      setNewListName('');
    }

    // Tétel felvétele a bevásárlólistára
    await addDoc(collection(db, 'families', familyId, 'shopping_list'), {
      name: ingredientName.trim(),
      category: ingredientCategory,
      listId: targetListId,
      completed: false,
      addedBy: userId,
      createdAt: serverTimestamp()
    });

    setIngredientName('');
    setActiveModal(null);
  };

  // Alapanyag státuszának ellenőrzése a bevásárlólistán
  const getIngredientStatus = (ingName) => {
    const cleanName = ingName.toLowerCase().trim();
    const matchedItems = shoppingItems.filter(item => 
      item.name.toLowerCase().trim() === cleanName
    );

    if (matchedItems.length === 0) return 'not_added';
    const isAnyCompleted = matchedItems.some(item => item.completed);
    if (isAnyCompleted) return 'bought';
    return 'pending'; // beszerzésre váró
  };

  // Nap teljes státuszának kiszámítása (Minden megvan-e)
  const getDayStatus = (ingredients = []) => {
    if (ingredients.length === 0) return 'empty';

    let pendingCount = 0;
    let boughtCount = 0;

    ingredients.forEach(ing => {
      const status = getIngredientStatus(ing.name);
      if (status === 'pending') pendingCount++;
      if (status === 'bought') boughtCount++;
    });

    if (pendingCount > 0) return 'pending'; // Beszerzésre váró
    if (boughtCount > 0 && pendingCount === 0) return 'complete'; // Minden megvan
    return 'empty';
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      
      {/* Fejléc */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Heti Menüterv</h2>
            <p className="text-xs text-slate-400">Tervezzétek meg az ebédet, vacsorát és állítsátok össze a bevásárlólistát!</p>
          </div>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/80 text-xs font-semibold self-start sm:self-auto">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>A menüt az Adminisztrátorok módosíthatják.</span>
          </div>
        )}
      </div>

      {/* Napok kártyái */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS.map((day) => {
          const dayData = menu[day.id] || { lunch: '', dinner: '', ingredients: [] };
          const dayStatus = getDayStatus(dayData.ingredients);

          return (
            <DayCard
              key={day.id}
              day={day}
              dayData={dayData}
              dayStatus={dayStatus}
              isAdmin={isAdmin}
              isSaving={savingDay === day.id}
              getIngredientStatus={getIngredientStatus}
              onSave={(lunch, dinner) => handleSaveDay(day.id, lunch, dinner, dayData.ingredients)}
              onAddIngredient={(name, mealType) => handleAddIngredientToDay(day.id, name, mealType)}
              onDeleteIngredient={(ingId) => handleDeleteIngredientFromDay(day.id, ingId)}
              onOpenShoppingModal={(mealType, mealName) => {
                setActiveModal({
                  dayId: day.id,
                  dayName: day.name,
                  mealType,
                  mealName
                });
                setIngredientName('');
              }}
            />
          );
        })}
      </div>

      {/* Hozzávaló Küldése / Lista Választó Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100 space-y-4">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900">Küldés a Bevásárlólistára</h3>
                <p className="text-xs text-slate-400">
                  {activeModal.dayName} — {activeModal.mealType === 'lunch' ? 'Ebéd' : 'Vacsora'}: <strong className="text-slate-700">{activeModal.mealName}</strong>
                </p>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendToShoppingList} className="space-y-4 pt-1">
              {/* Meglévő vagy Új Lista Választása */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cél Bevásárlólista</label>
                
                {!isCreatingNewList ? (
                  <div className="space-y-2">
                    <select
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {shoppingLists.length === 0 && <option value="">(Még nincs lista, hozz létre egyet!)</option>}
                      {shoppingLists.map(list => (
                        <option key={list.id} value={list.id}>
                          📋 {list.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsCreatingNewList(true)}
                      className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <ListPlus className="w-3.5 h-3.5" /> Új lista létrehozása...
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 bg-orange-50/60 p-3 rounded-2xl border border-orange-100">
                    <input
                      type="text"
                      placeholder="Új lista neve (pl. Hétvégi nagybevásárlás)"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewList(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold"
                    >
                      ← Mégse, meglévő lista választása
                    </button>
                  </div>
                )}
              </div>

              {/* Tétel neve */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alapanyag / Tétel neve</label>
                <input
                  type="text"
                  required
                  placeholder="Pl. 1 kg csirkemell, 20 dkg sajt..."
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Kategória */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategória</label>
                <select
                  value={ingredientCategory}
                  onChange={(e) => setIngredientCategory(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" /> Hozzáadás
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// Nap Kártya Komponens
function DayCard({ 
  day, 
  dayData, 
  dayStatus, 
  isAdmin, 
  isSaving, 
  getIngredientStatus,
  onSave, 
  onAddIngredient, 
  onDeleteIngredient, 
  onOpenShoppingModal 
}) {
  const [lunch, setLunch] = useState(dayData.lunch || '');
  const [dinner, setDinner] = useState(dayData.dinner || '');
  const [newLunchIng, setNewLunchIng] = useState('');
  const [newDinnerIng, setNewDinnerIng] = useState('');

  useEffect(() => {
    setLunch(dayData.lunch || '');
    setDinner(dayData.dinner || '');
  }, [dayData]);

  const lunchIngredients = (dayData.ingredients || []).filter(i => i.mealType === 'lunch');
  const dinnerIngredients = (dayData.ingredients || []).filter(i => i.mealType === 'dinner');

  return (
    <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-2xl space-y-3.5 relative flex flex-col justify-between">
      
      {/* Fejléc & Státusz Badgek */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-slate-800">{day.name}</span>
          
          {/* Zöld Pipa Badge (Minden megvan) */}
          {dayStatus === 'complete' && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Minden megvan
            </span>
          )}

          {/* Beszerzésre váró alapanyagok Badge */}
          {dayStatus === 'pending' && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
              <Clock className="w-3 h-3 text-amber-600" /> Beszerzésre vár
            </span>
          )}
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onSave(lunch, dinner)}
            className="p-1.5 text-slate-400 hover:text-blue-600 transition rounded-lg hover:bg-white"
            title="Mentés"
          >
            {isSaving ? <Check className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="space-y-4">
        
        {/* Ebéd Részleg */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ebéd</label>
            {lunch && (
              <button
                type="button"
                onClick={() => onOpenShoppingModal('lunch', lunch)}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100"
              >
                <ShoppingBag className="w-3 h-3" /> Lista
              </button>
            )}
          </div>

          <input
            type="text"
            disabled={!isAdmin}
            placeholder={isAdmin ? "Pl. Húsleves, Rántott hús" : "Nincs megadva"}
            value={lunch}
            onChange={(e) => setLunch(e.target.value)}
            onBlur={() => onSave(lunch, dinner)}
            className={`w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold ${
              isAdmin ? 'bg-white focus:ring-2 focus:ring-orange-500 text-slate-800' : 'bg-slate-100/60 text-slate-600 cursor-not-allowed'
            }`}
          />

          {/* Ebéd Alapanyagok Listája */}
          {lunchIngredients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {lunchIngredients.map(ing => {
                const status = getIngredientStatus(ing.name);
                return (
                  <span
                    key={ing.id}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${
                      status === 'bought'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : status === 'pending'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {status === 'bought' && <Check className="w-3 h-3 text-emerald-600" />}
                    {status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                    {ing.name}
                    {isAdmin && (
                      <button 
                        type="button" 
                        onClick={() => onDeleteIngredient(ing.id)} 
                        className="ml-0.5 text-slate-300 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          {/* Új ebéd alapanyag felvétel (Admin) */}
          {isAdmin && (
            <div className="flex gap-1 pt-0.5">
              <input
                type="text"
                placeholder="+ Alapanyag (pl. 50 dkg tészta)"
                value={newLunchIng}
                onChange={(e) => setNewLunchIng(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddIngredient(newLunchIng, 'lunch');
                    setNewLunchIng('');
                  }
                }}
                className="p-1.5 px-2 bg-white border border-slate-200 rounded-lg text-[11px] flex-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => {
                  onAddIngredient(newLunchIng, 'lunch');
                  setNewLunchIng('');
                }}
                className="px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Vacsora Részleg */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vacsora</label>
            {dinner && (
              <button
                type="button"
                onClick={() => onOpenShoppingModal('dinner', dinner)}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100"
              >
                <ShoppingBag className="w-3 h-3" /> Lista
              </button>
            )}
          </div>

          <input
            type="text"
            disabled={!isAdmin}
            placeholder={isAdmin ? "Pl. Sajtos melegszendvics" : "Nincs megadva"}
            value={dinner}
            onChange={(e) => setDinner(e.target.value)}
            onBlur={() => onSave(lunch, dinner)}
            className={`w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold ${
              isAdmin ? 'bg-white focus:ring-2 focus:ring-orange-500 text-slate-800' : 'bg-slate-100/60 text-slate-600 cursor-not-allowed'
            }`}
          />

          {/* Vacsora Alapanyagok Listája */}
          {dinnerIngredients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dinnerIngredients.map(ing => {
                const status = getIngredientStatus(ing.name);
                return (
                  <span
                    key={ing.id}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${
                      status === 'bought'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : status === 'pending'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {status === 'bought' && <Check className="w-3 h-3 text-emerald-600" />}
                    {status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                    {ing.name}
                    {isAdmin && (
                      <button 
                        type="button" 
                        onClick={() => onDeleteIngredient(ing.id)} 
                        className="ml-0.5 text-slate-300 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          {/* Új vacsora alapanyag felvétel (Admin) */}
          {isAdmin && (
            <div className="flex gap-1 pt-0.5">
              <input
                type="text"
                placeholder="+ Alapanyag (pl. Trappista sajt)"
                value={newDinnerIng}
                onChange={(e) => setNewDinnerIng(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddIngredient(newDinnerIng, 'dinner');
                    setNewDinnerIng('');
                  }
                }}
                className="p-1.5 px-2 bg-white border border-slate-200 rounded-lg text-[11px] flex-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => {
                  onAddIngredient(newDinnerIng, 'dinner');
                  setNewDinnerIng('');
                }}
                className="px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
              >
                +
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
