'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { CheckCircle2, Plus, Trash2, Award, Sparkles } from 'lucide-react';

export default function ChoreTracker({ familyId, userId }) {
  const [chores, setChores] = useState([]);
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState(10);
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    if (!familyId) return;

    const q = query(
      collection(db, 'families', familyId, 'chores'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChores(list);
    });

    return () => unsubscribe();
  }, [familyId]);

  const handleAddChore = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addDoc(collection(db, 'families', familyId, 'chores'), {
      title: title.trim(),
      points: Number(points) || 10,
      assignee: assignee.trim() || 'Bárki',
      completed: false,
      completedBy: null,
      addedBy: userId,
      createdAt: serverTimestamp()
    });

    setTitle('');
    setPoints(10);
    setAssignee('');
  };

  const toggleComplete = async (chore) => {
    const choreRef = doc(db, 'families', familyId, 'chores', chore.id);
    await updateDoc(choreRef, {
      completed: !chore.completed,
      completedBy: !chore.completed ? userId : null,
      completedAt: !chore.completed ? new Date().toISOString() : null
    });
  };

  const deleteChore = async (choreId) => {
    await deleteDoc(doc(db, 'families', familyId, 'chores', choreId));
  };

  const totalEarnedPoints = chores
    .filter(c => c.completed)
    .reduce((sum, c) => sum + (c.points || 0), 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800">Házimunka & Pontgyűjtő</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-indigo-700 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Összes pont: {totalEarnedPoints} p</span>
        </div>
      </div>

      {/* Új feladat hozzáadása */}
      <form onSubmit={handleAddChore} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <input
          type="text"
          placeholder="Feladat neve (pl. Portörlés, Fűnyírás, Szelektív hulladék)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Felelős (pl. Peti, vagy üresen: Bárki)"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="flex-1 p-2.5 border border-slate-200 rounded-xl text-sm bg-white"
          />
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5">
            <span className="text-xs text-slate-400 font-medium">Pont:</span>
            <input
              type="number"
              min="1"
              max="500"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-14 p-1 text-sm font-semibold text-indigo-600 focus:outline-none text-center bg-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center justify-center font-medium text-sm gap-1 shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Felvétel
          </button>
        </div>
      </form>

      {/* Feladatok listája */}
      {chores.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">Még nincsenek felvett házimunkák.</p>
      ) : (
        <ul className="space-y-2">
          {chores.map((chore) => (
            <li
              key={chore.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                chore.completed 
                  ? 'bg-emerald-50/50 border-emerald-100 opacity-70' 
                  : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleComplete(chore)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                    chore.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 hover:border-indigo-500'
                  }`}
                >
                  {chore.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <div>
                  <span className={`text-sm ${chore.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                    {chore.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Felelős: {chore.assignee}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      +{chore.points} pont
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteChore(chore.id)}
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
