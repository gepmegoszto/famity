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
  serverTimestamp 
} from 'firebase/firestore';
import { Calendar as CalendarIcon, Plus, Trash2, Clock } from 'lucide-react';

export default function Calendar({ familyId, userId }) {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (!familyId) return;

    const q = query(
      collection(db, 'families', familyId, 'events'),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(list);
    });

    return () => unsubscribe();
  }, [familyId]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    await addDoc(collection(db, 'families', familyId, 'events'), {
      title: title.trim(),
      date: date,
      time: time || 'Egész nap',
      addedBy: userId,
      createdAt: serverTimestamp()
    });

    setTitle('');
    setDate('');
    setTime('');
  };

  const deleteEvent = async (eventId) => {
    await deleteDoc(doc(db, 'families', familyId, 'events', eventId));
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-800">Közös Naptár</h2>
      </div>

      {/* Esemény hozzáadása */}
      <form onSubmit={handleAddEvent} className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <input
          type="text"
          placeholder="Esemény neve (pl. Fogorvos, Szülői értekezlet)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 p-2.5 border border-slate-200 rounded-xl text-sm bg-white"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-32 p-2.5 border border-slate-200 rounded-xl text-sm bg-white"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center justify-center font-medium text-sm gap-1"
          >
            <Plus className="w-4 h-4" /> Hozzáadás
          </button>
        </div>
      </form>

      {/* Események listája */}
      {events.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">Még nincsenek felvett események.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-medium text-blue-600">{event.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteEvent(event.id)}
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
