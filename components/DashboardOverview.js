'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import NoticeBoard from '@/components/NoticeBoard';
import AdBanner from '@/components/AdBanner';
import { Calendar as CalendarIcon, Users, Clock, Shield } from 'lucide-react';

export default function DashboardOverview({ familyId, userId, familyData }) {
  const [members, setMembers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    if (!familyId) return;

    // Családtagok
    const unsubMembers = onSnapshot(
      collection(db, 'families', familyId, 'members'),
      (snapshot) => {
        setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    // Közelgő események (következő 5)
    const eventsQuery = query(
      collection(db, 'families', familyId, 'events'),
      orderBy('date', 'asc'),
      limit(5)
    );
    const unsubEvents = onSnapshot(eventsQuery, (snapshot) => {
      setUpcomingEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubMembers();
      unsubEvents();
    };
  }, [familyId]);

  return (
    <div className="space-y-6">
      
      {/* 1. Családi Üzenőfal (Felül) */}
      <div className="bg-slate-100/90 p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <NoticeBoard familyId={familyId} userId={userId} />
      </div>

      {/* Hirdetés a dashboardon (Ha a család nem prémium) */}
      <AdBanner familyId={familyId} />

      {/* 2. Közelgő programok (Középen) */}
      <div className="bg-slate-100/90 p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Közelgő programok</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{upcomingEvents.length} esemény</span>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Nincsenek közeledő események.</p>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{event.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-blue-600">{event.date}</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" /> {event.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Család (Legalul) */}
      <div className="bg-slate-100/90 p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Család</h2>
          </div>
          <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
            {members.length} Családtag
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3 transition"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                style={{ backgroundColor: member.color || '#3B82F6' }}
              >
                {member.name ? member.name.substring(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 truncate">{member.name || 'Névtelen'}</span>
                  {member.role === 'admin' && (
                    <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-100 shrink-0" title="Adminisztrátor" />
                  )}
                  {member.id === userId && (
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Te</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
