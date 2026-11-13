'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClosedProtocolsPage() {
  const [user, setUser] = useState(null);
  const [closedProtocols, setClosedProtocols] = useState([]);
  const [loading, setLoading] = useState(true);

  // Szűrés és keresés állapota
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'lender', 'borrower'

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        setUser(currentUser);
        try {
          // Lekérdezzük mindazokat, ahol a státusz 'Lezárva' és vagy bérbeadó vagy bérlő
          const q1 = query(collection(db, 'lending_protocols'), where('lenderId', '==', currentUser.uid), where('status', '==', 'Lezárva'));
          const q2 = query(collection(db, 'lending_protocols'), where('borrowerUid', '==', currentUser.uid), where('status', '==', 'Lezárva'));

          const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
          
          const map = new Map();
          snap1.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data(), userRole: 'lender' }));
          snap2.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data(), userRole: 'borrower' }));

          setClosedProtocols(Array.from(map.values()));
        } catch (err) {
          console.error("Hiba a lezártak betöltésekor:", err);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="flex-1 flex items-center justify-center p-12">Betöltés...</div>;

  // Szűrés és keresés logika
  const filteredProtocols = closedProtocols.filter(p => {
    const uniqueId = p.id.toLowerCase();
    const itemName = p.itemDetails?.name?.toLowerCase() || '';
    const borrowerName = `${p.borrowerData?.lastName || ''} ${p.borrowerData?.firstName || ''}`.toLowerCase();
    const lenderName = `${p.lenderData?.lastName || ''} ${p.lenderData?.firstName || ''}`.toLowerCase();

    const matchesSearch = 
      uniqueId.includes(searchTerm.toLowerCase()) ||
      itemName.includes(searchTerm.toLowerCase()) ||
      borrowerName.includes(searchTerm.toLowerCase()) ||
      lenderName.includes(searchTerm.toLowerCase());

    if (roleFilter === 'lender' && p.lenderId !== user.uid) return false;
    if (roleFilter === 'borrower' && p.borrowerUid !== user.uid) return false;

    return matchesSearch;
  });

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Vissza a vezérlőpultra</Link>
        <h1 className="text-xl font-bold text-slate-900">famity.hu – Lezárt Tranzakciók</h1>
      </div>

      {/* Kereső és szűrő sáv */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <input 
          type="text" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          placeholder="Keresés azonosító, eszköz vagy partner neve alapján..." 
          className="w-full sm:w-96 px-4 py-2 border rounded-xl text-sm"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)} 
            className="w-full sm:w-auto px-4 py-2 border rounded-xl text-sm bg-white"
          >
            <option value="all">Összes szerepkör</option>
            <option value="lender">Csak bérbeadóként</option>
            <option value="borrower">Csak bérlőként</option>
          </select>
        </div>
      </div>

      {filteredProtocols.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-slate-500">
          Nincs a keresési feltételeknek megfelelő lezárt jegyzőkönyv.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProtocols.map(p => {
            const uniqueId = p.id.slice(0, 8).toUpperCase();
            const returnDateStr = p.returnDetails?.returnedAt ? new Date(p.returnDetails.returnedAt).toLocaleString('hu-HU') : 'Ismeretlen';
            const isLender = p.lenderId === user?.uid;

            return (
              <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-lg">{p.itemDetails?.name}</h3>
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">#{uniqueId}</span>
                    <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-semibold">Lezárva</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Partner: <span className="font-medium">{isLender ? `${p.borrowerData?.lastName} ${p.borrowerData?.firstName} (Bérlő)` : `${p.lenderData?.lastName} ${p.lenderData?.firstName} (Bérbeadó)`}</span>
                  </p>
                  <p className="text-xs text-slate-500">Lezárás ideje: {returnDateStr}</p>
                </div>

                <Link href={`/dashboard/protocol/${p.id}`} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition whitespace-nowrap">
                  Jegyzőkönyv megtekintése →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
