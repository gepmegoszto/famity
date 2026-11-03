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
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Lock, 
  Clock, 
  User, 
  Filter, 
  Check, 
  Edit3, 
  X
} from 'lucide-react';
import { notifyNewCalendarEvent } from '@/lib/emailNotify';

export default function Calendar({ familyId, userId }) {
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);

  // Űrlap állapotok
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [adminOnly, setAdminOnly] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Szűrési állapotok
  const [filterMember, setFilterMember] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all'); // 'all' | 'public' | 'admin'

  const currentUser = members.find(m => m.id === userId);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!familyId) return;

    // 1. Családtagok lekérése (színek és szerepkörök miatt)
    const unsubMembers = onSnapshot(
      collection(db, 'families', familyId, 'members'),
      (snapshot) => {
        setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    // 2. Események lekérése időrendben
    const qEvents = query(
      collection(db, 'families', familyId, 'events'),
      orderBy('date', 'asc')
    );

    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Időrendbe rendezés dátum és időpont alapján
      list.sort((a, b) => {
        const dateA = `${a.date || ''} ${a.time || '00:00'}`;
        const dateB = `${b.date || ''} ${b.time || '00:00'}`;
        return dateA.localeCompare(dateB);
      });

      setEvents(list);
    });

    return () => {
      unsubMembers();
      unsubEvents();
    };
  }, [familyId]);

  // Új esemény mentése vagy meglévő frissítése
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const creatorName = currentUser?.name || currentUser?.email || 'Névtelen';
    const creatorColor = currentUser?.color || '#3B82F6';

    if (editingId) {
      // Módosítás
      const eventRef = doc(db, 'families', familyId, 'events', editingId);
      await updateDoc(eventRef, {
        title: title.trim(),
        date,
        time: time || '00:00',
        description: description.trim(),
        adminOnly: isAdmin ? adminOnly : false,
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
    } else {
      // Új esemény hozzáadása
      await addDoc(collection(db, 'families', familyId, 'events'), {
        title: title.trim(),
        date,
        time: time || '00:00',
        description: description.trim(),
        adminOnly: isAdmin ? adminOnly : false,
        createdBy: userId,
        createdByName: creatorName,
        creatorColor: creatorColor,
        createdAt: serverTimestamp()
      });

      // E-mail értesítés küldése minden családtagnak az új eseményről
      await notifyNewCalendarEvent({
        familyId,
        senderId: userId,
        senderName: creatorName,
        eventTitle: title.trim(),
        eventDate: date,
        eventTime: time || ''
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setDescription('');
    setAdminOnly(false);
    setEditingId(null);
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setTitle(event.title || '');
    setDate(event.date || '');
    setTime(event.time || '');
    setDescription(event.description || '');
    setAdminOnly(!!event.adminOnly);
  };

  const handleDelete = async (eventId) => {
    if (confirm('Biztosan törölni szeretnéd ezt az eseményt?')) {
      await deleteDoc(doc(db, 'families', familyId, 'events', eventId));
    }
  };

  // Láthatóság és szűrések alkalmazása
  const visibleEvents = events.filter(event => {
    // 1. Csak-admin események elrejtése a normál tagok elől
    if (event.adminOnly && !isAdmin) return false;

    // 2. Szűrés láthatóság szerint (Adminoknak)
    if (filterVisibility === 'public' && event.adminOnly) return false;
    if (filterVisibility === 'admin' && !event.adminOnly) return false;

    // 3. Szűrés kijelölt családtag szerint
    if (filterMember !== 'all' && event.createdBy !== filterMember) return false;

    return true;
  });

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      
      {/* Fejléc */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Közös Naptár</h2>
            <p className="text-xs text-slate-400">Családi programok, fontos időpontok és emlékeztetők.</p>
          </div>
        </div>
      </div>

      {/* Űrlap esemény felvételéhez / szerkesztéséhez */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
        <div className="flex justify-between items-center">
          <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {editingId ? 'Esemény szerkesztése' : 'Új esemény hozzáadása'}
          </span>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Mégse
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            required
            placeholder="Esemény neve (pl. Orvosi vizsgálat, Szülinap)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="sm:col-span-3 p-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Dátum</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Időpont</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Megjegyzés (opcionális)</label>
            <input
              type="text"
              placeholder="Helyszín, leírás..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Admin-only kapcsoló (Csak adminisztrátoroknak látható) */}
        {isAdmin && (
          <div className="pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-amber-50/80 border border-amber-200/80 px-3 py-2 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={adminOnly}
                onChange={(e) => setAdminOnly(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Csak Adminisztrátorok láthatják ezt a bejegyzést</span>
            </label>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {editingId ? 'Módosítás mentése' : 'Esemény rögzítése'}
        </button>
      </form>

      {/* Szűrők sávja */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Szűrés:
          </span>

          {/* Tagok szerinti szűrő */}
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="p-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Minden családtag</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name || m.email}</option>
            ))}
          </select>

          {/* Láthatóság szerinti szűrő (Adminoknak) */}
          {isAdmin && (
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Minden látható bejegyzés</option>
              <option value="public">Publikus bejegyzések</option>
              <option value="admin">🔒 Csak Admin bejegyzések</option>
            </select>
          )}
        </div>

        <span className="text-slate-400 font-medium">
          {visibleEvents.length} esemény megjelenítve
        </span>
      </div>

      {/* Események Listája */}
      {visibleEvents.length === 0 ? (
        <p className="text-slate-400 text-xs text-center py-6">Nincsenek megjeleníthető események.</p>
      ) : (
        <div className="space-y-2.5">
          {visibleEvents.map((event) => {
            const canEditOrDelete = isAdmin || event.createdBy === userId;
            const memberObj = members.find(m => m.id === event.createdBy);
            const eventColor = memberObj?.color || event.creatorColor || '#3B82F6';

            return (
              <div
                key={event.id}
                className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative transition hover:shadow-md"
                style={{
                  borderLeftWidth: '6px',
                  borderLeftColor: eventColor
                }}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">{event.title}</h4>
                    
                    {event.adminOnly && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        <Lock className="w-3 h-3 text-amber-600" /> Csak Admin
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-xs text-slate-500">{event.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {event.date}
                    </span>
                    
                    {event.time && (
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" /> {event.time}
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-slate-400 font-medium">
                      <User className="w-3 h-3 text-slate-300" />
                      <span className="font-semibold text-slate-700">{event.createdByName || memberObj?.name || 'Névtelen'}</span>
                    </span>
                  </div>
                </div>

                {/* Szerkesztés & Törlés gombok (Kizárólag a készítőnek vagy Adminnak) */}
                {canEditOrDelete && (
                  <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 transition rounded-lg hover:bg-slate-50"
                      title="Szerkesztés"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-slate-50"
                      title="Törlés"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
