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
  X,
  ChevronLeft,
  ChevronRight
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
  const [filterVisibility, setFilterVisibility] = useState('all');

  // Valódi havi naptár nézet állapota (alapból az aktuális hónap)
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const currentUser = members.find(m => m.id === userId);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!familyId) return;

    const unsubMembers = onSnapshot(
      collection(db, 'families', familyId, 'members'),
      (snapshot) => {
        setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    const qEvents = query(
      collection(db, 'families', familyId, 'events'),
      orderBy('date', 'asc')
    );

    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const creatorName = currentUser?.name || currentUser?.email || 'Névtelen';
    const creatorColor = currentUser?.color || '#3B82F6';

    if (editingId) {
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

  const visibleEvents = events.filter(event => {
    if (event.adminOnly && !isAdmin) return false;
    if (filterVisibility === 'public' && event.adminOnly) return false;
    if (filterVisibility === 'admin' && !event.adminOnly) return false;
    if (filterMember !== 'all' && event.createdBy !== filterMember) return false;
    return true;
  });

  // --- VALÓDI HAVI NAPTÁR LOGIKA ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const monthNames = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június', 
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const todayStr = new Date().toISOString().split('T')[0];

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

      {/* VALÓDI HAVI NAPTÁR NÉZET */}
      <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800">
            {monthNames[month]} {year}
          </h3>
          <div className="flex items-center gap-1">
            <button 
              onClick={prevMonth}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Előző hónap"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Ma
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Következő hónap"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hét napjai fejléc */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase">
          <span>Hét</span>
          <span>Kedd</span>
          <span>Szer</span>
          <span>Csüt</span>
          <span>Pén</span>
          <span>Szom</span>
          <span>Vas</span>
        </div>

        {/* Naptár rács */}
        <div className="grid grid-cols-7 gap-1.5">
          {[...Array(startDayOfWeek)].map((_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24 bg-transparent rounded-xl opacity-30" />
          ))}

          {[...Array(daysInMonth)].map((_, i) => {
            const dayNum = i + 1;
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateString = `${year}-${monthStr}-${dayStr}`;

            const isToday = dateString === todayStr;
            const dayEvents = visibleEvents.filter(ev => ev.date === dateString);
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={dateString}
                onClick={() => {
                  if (hasEvents) {
                    setSelectedDayEvents({ dateStr: dateString, eventsList: dayEvents });
                  }
                }}
                className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition relative overflow-hidden ${
                  isToday 
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-400/20' 
                    : hasEvents 
                      ? 'border-blue-200 bg-white shadow-2xs cursor-pointer hover:border-blue-400' 
                      : 'border-slate-200/70 bg-white/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                    {dayNum}
                  </span>
                  {hasEvents && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {hasEvents && (
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex gap-1 flex-wrap">
                      {dayEvents.map(ev => {
                        const memberObj = members.find(m => m.id === ev.createdBy);
                        const evColor = memberObj?.color || ev.creatorColor || '#3B82F6';
                        return (
                          <div 
                            key={ev.id} 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: evColor }} 
                            title={ev.title}
                          />
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-600 font-semibold truncate hidden sm:block">
                      {dayEvents[0].title}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal adott nap eseményeihez */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Programok ezen a napon: {selectedDayEvents.dateStr}
              </h3>
              <button 
                onClick={() => setSelectedDayEvents(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              {selectedDayEvents.eventsList.map(ev => {
                const memberObj = members.find(m => m.id === ev.createdBy);
                const evColor = memberObj?.color || ev.creatorColor || '#3B82F6';
                return (
                  <div 
                    key={ev.id} 
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/80 space-y-1"
                    style={{ borderLeftWidth: '5px', borderLeftColor: evColor }}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800">{ev.title}</h4>
                      {ev.time && <span className="text-[11px] font-bold text-blue-600 font-mono">{ev.time}</span>}
                    </div>
                    {ev.description && <p className="text-xs text-slate-500">{ev.description}</p>}
                    <p className="text-[10px] text-slate-400 font-medium">Létrehozta: {ev.createdByName || memberObj?.name || 'Névtelen'}</p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedDayEvents(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Bezárás
            </button>
          </div>
        </div>
      )}

      {/* Űrlap esemény felvételéhez */}
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
            placeholder="Esemény neve (pl. Orvosi vizsgálat)"
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
                style={{ borderLeftWidth: '6px', borderLeftColor: eventColor }}
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
                  {event.description && <p className="text-xs text-slate-500">{event.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{event.date}</span>
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
