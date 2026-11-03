'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { Plus, Check, Trash2, ShoppingBag, ListPlus, Folder } from 'lucide-react';

const CATEGORIES = [
  'Élelmiszer',
  'Zöldség/Gyümölcs',
  'Pékáru',
  'Tejtermék',
  'Hús/Mentes',
  'Háztartás',
  'Vegyes'
];

export default function ShoppingList({ familyId, userId }) {
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState('');
  const [items, setItems] = useState([]);

  // Új tétel állapotok
  const [newItemName, setNewItemName] = useState('');
  const [category, setCategory] = useState('Élelmiszer');

  // Új lista állapotok
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    if (!familyId) return;

    // 1. Bevásárlólisták megfigyelése
    const qLists = query(
      collection(db, 'families', familyId, 'shopping_lists'),
      orderBy('createdAt', 'asc')
    );

    const unsubLists = onSnapshot(qLists, async (snapshot) => {
      const listData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ha még nincs egyetlen lista sem, hozzunk létre egy alapértelmezett "Fő lista"-t
      if (listData.length === 0) {
        const defaultRef = await addDoc(collection(db, 'families', familyId, 'shopping_lists'), {
          name: 'Fő bevásárlólista',
          createdAt: serverTimestamp(),
          addedBy: userId
        });
        setActiveListId(defaultRef.id);
      } else {
        setLists(listData);
        if (!activeListId || !listData.some(l => l.id === activeListId)) {
          setActiveListId(listData[0].id);
        }
      }
    });

    // 2. Tételek megfigyelése
    const qItems = query(
      collection(db, 'families', familyId, 'shopping_list'),
      orderBy('createdAt', 'desc')
    );

    const unsubItems = onSnapshot(qItems, (snapshot) => {
      const allItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(allItems);
    });

    return () => {
      unsubLists();
      unsubItems();
    };
  }, [familyId]);

  // Új lista létrehozása
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const newListRef = await addDoc(collection(db, 'families', familyId, 'shopping_lists'), {
      name: newListName.trim(),
      createdAt: serverTimestamp(),
      addedBy: userId
    });

    setActiveListId(newListRef.id);
    setNewListName('');
    setIsCreatingList(false);
  };

  // Lista törlése
  const handleDeleteList = async (listId) => {
    if (lists.length <= 1) {
      alert('Legalább egy bevásárlólistának maradnia kell!');
      return;
    }

    if (!confirm('Biztosan törlöd ezt a bevásárlólistát a hozzá tartozó tételekkel együtt?')) {
      return;
    }

    await deleteDoc(doc(db, 'families', familyId, 'shopping_lists', listId));

    // A listához tartozó tételek törlése
    const listItems = items.filter(i => i.listId === listId);
    for (const item of listItems) {
      await deleteDoc(doc(db, 'families', familyId, 'shopping_list', item.id));
    }
  };

  // Új tétel felvétele az aktív listára
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeListId) return;

    await addDoc(collection(db, 'families', familyId, 'shopping_list'), {
      name: newItemName.trim(),
      category: category,
      listId: activeListId,
      completed: false,
      addedBy: userId,
      createdAt: serverTimestamp()
    });

    setNewItemName('');
  };

  const toggleComplete = async (item) => {
    const itemRef = doc(db, 'families', familyId, 'shopping_list', item.id);
    await updateDoc(itemRef, {
      completed: !item.completed
    });
  };

  const deleteItem = async (itemId) => {
    await deleteDoc(doc(db, 'families', familyId, 'shopping_list', itemId));
  };

  // Aktív listához tartozó tételek szűrése (ha nincs listId megadva a korábbi adatoknál, rendelje az elsőhöz)
  const activeItems = items.filter(item => 
    item.listId ? item.listId === activeListId : activeListId === lists[0]?.id
  );

  const activeListObj = lists.find(l => l.id === activeListId);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      
      {/* Fejléc */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Bevásárlólisták</h2>
            <p className="text-xs text-slate-400">Élő szinkronizáció a boltban lévő családtagokkal.</p>
          </div>
        </div>

        {/* Új Lista gomb */}
        <button
          onClick={() => setIsCreatingList(!isCreatingList)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition border border-blue-100 self-start sm:self-auto"
        >
          <ListPlus className="w-4 h-4 text-blue-600" /> Új lista létrehozása
        </button>
      </div>

      {/* Új Lista Létrehozó Form */}
      {isCreatingList && (
        <form onSubmit={handleCreateList} className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 flex flex-col sm:flex-row gap-2 items-center">
          <input
            type="text"
            required
            placeholder="Lista neve (pl. Zöldséges, Hétvégi nagybevásárlás)..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Létrehozás
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingList(false)}
              className="flex-1 sm:flex-none px-3 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
            >
              Mégse
            </button>
          </div>
        </form>
      )}

      {/* Listák közötti fülek / választó sáv */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1">
          Listák:
        </span>
        {lists.map(list => {
          const isActive = list.id === activeListId;
          const listItemsCount = items.filter(i => (i.listId ? i.listId === list.id : list.id === lists[0]?.id) && !i.completed).length;

          return (
            <button
              key={list.id}
              onClick={() => setActiveListId(list.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200/70'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{list.name}</span>
              {listItemsCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {listItemsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Aktív Lista Fejléce & Törlése */}
      {activeListObj && (
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Aktív lista:</span>
            <span className="text-xs font-black text-blue-600 font-mono">{activeListObj.name}</span>
          </div>

          {lists.length > 1 && (
            <button
              onClick={() => handleDeleteList(activeListObj.id)}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" /> Lista törlése
            </button>
          )}
        </div>
      )}

      {/* Tétel hozzáadása a kiválasztott listához */}
      <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Pl. Tej, Kenyér, Csirkemell..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 p-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          type="submit"
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center justify-center font-bold text-xs gap-1 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Hozzáadás
        </button>
      </form>

      {/* A kiválasztott lista tételeinek megjelenítése */}
      {activeItems.length === 0 ? (
        <p className="text-slate-400 text-xs text-center py-6">Ez a bevásárlólista jelenleg üres.</p>
      ) : (
        <ul className="space-y-2">
          {activeItems.map((item) => (
            <li
              key={item.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                item.completed ? 'bg-slate-50/80 border-slate-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleComplete(item)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                    item.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-300 hover:border-blue-500 bg-white'
                  }`}
                >
                  {item.completed && <Check className="w-4 h-4" />}
                </button>
                <span className={`text-xs sm:text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 font-bold'}`}>
                  {item.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                  {item.category || 'Élelmiszer'}
                </span>
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-slate-300 hover:text-rose-500 transition p-1 cursor-pointer"
                title="Törlés"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
