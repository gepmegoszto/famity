'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        setUser(currentUser);
        // Lekérdezés Firestore-ból
        try {
          const q = query(collection(db, 'lending_protocols'), where('lenderId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProtocols(list);
        } catch (err) {
          console.error("Hiba az adatok betöltésekor:", err);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Betöltés...</div>;
  }

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kölcsönadási Jegyzőkönyvek</h1>
          <p className="text-sm text-slate-600">Bejelentkezve: {user?.email}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow text-sm transition"
          >
            + Új kölcsönzés indítása
          </Link>
          <button
            onClick={handleLogout}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            Kilépés
          </button>
        </div>
      </div>

      {protocols.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-600 mb-4">Még nincs rögzített kölcsönadási jegyzőkönyved.</p>
          <Link
            href="/dashboard/new"
            className="inline-block bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm"
          >
            Első jegyzőkönyv rögzítése
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {protocols.map((proto) => (
            <div key={proto.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{proto.itemDetails?.name || 'Ismeretlen eszköz'}</h3>
                <p className="text-xs text-slate-500">Átvevő: <span className="font-medium text-slate-700">{proto.borrowerData?.name}</span> | Dátum: {proto.handoverDate}</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                {proto.status || 'Aktív'}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
