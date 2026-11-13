'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [protocols, setProtocols] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        setUser(currentUser);
        try {
          // Ellenőrizzük, hogy kitöltötte-e a profilját
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().lastName) {
            setHasProfile(true);
          }

          // Kölcsönzések lekérése
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
    return <div className="flex-1 flex items-center justify-center p-12">Betöltés...</div>;
  }

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kölcsönadási Vezérlőpult</h1>
          <p className="text-sm text-slate-600">Bejelentkezve: {user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/profile"
            className={`font-semibold px-4 py-2 rounded-lg shadow text-sm transition ${hasProfile ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
          >
            {hasProfile ? '⚙️ Saját adataim szerkesztése' : '⚠️ Add meg a személyes adataidat!'}
          </Link>
          {hasProfile && (
            <Link
              href="/dashboard/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow text-sm transition"
            >
              + Új kölcsönzés indítása
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            Kilépés
          </button>
        </div>
      </div>

      {!hasProfile && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
          <h3 className="font-bold text-lg mb-1">Hiányzó személyes adatok!</h3>
          <p className="text-sm mb-4">A kölcsönadási jegyzőkönyv kiállításához először töltsd ki a bérbeadói profilodat a személyes adataiddal és lakcímeddel.</p>
          <Link href="/profile" className="inline-block bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">
            Profil kitöltése most →
          </Link>
        </div>
      )}

      {protocols.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-600 mb-4">Még nincs rögzített kölcsönadási jegyzőkönyved.</p>
          {hasProfile && (
            <Link
              href="/dashboard/new"
              className="inline-block bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm"
            >
              Első jegyzőkönyv rögzítése
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {protocols.map((proto) => (
            <div key={proto.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{proto.itemDetails?.name || 'Ismeretlen eszköz'}</h3>
                <p className="text-xs text-slate-500">Bérlő / Átvevő: <span className="font-medium text-slate-700">{proto.borrowerData?.lastName} {proto.borrowerData?.firstName}</span></p>
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
