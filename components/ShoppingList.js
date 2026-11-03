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
import { Plus, Check, Trash2, ShoppingBag } from 'lucide-react';

export default function ShoppingList({ familyId, userId }) {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [category, setCategory] = useState('Élelmiszer');

  useEffect(() => {
    if (!familyId) return;

    // Real-time szinkronizáció a Firestore-ból
    const q = query(
      collection(db, 'families', familyId, 'shopping_list'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(list);
    });

    return () => unsubscribe();
  }, [familyId]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    await addDoc(collection(db, 'families', familyId, 'shopping_list'), {
      name: newItemName.trim(),
      category: category,
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

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-800">Bevásárlólista</h2>
      </div>

      {/* Tétel hozzáadása */}
      <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Pl. Tej, Kenyér, Sajt..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700"
        >
          <option value="Élelmiszer">Élelmiszer</option>
          <option value="Háztartás">Háztartás</option>
          <option value="Vegyes">Vegyes</option>
        </select>
        <button
          type="submit"
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Lista megjelenítése */}
      {items.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">A lista jelenleg üres.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                item.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleComplete(item)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                    item.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-300 hover:border-blue-500'
                  }`}
                >
                  {item.completed && <Check className="w-4 h-4" />}
                </button>
                <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                  {item.name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {item.category}
                </span>
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-slate-300 hover:text-red-500 transition p-1"
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
