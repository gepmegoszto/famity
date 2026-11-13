'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProtocolPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [borrowerIdCard, setBorrowerIdCard] = useState('');

  const [itemName, setItemName] = useState('');
  const [itemSerial, setItemSerial] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push('/auth');
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accepted) {
      alert('A jegyzőkönyv érvényesítéséhez el kell fogadni a feltételeket!');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'lending_protocols'), {
        lenderId: user.uid,
        lenderEmail: user.email,
        borrowerData: {
          name: borrowerName,
          phone: borrowerPhone,
          idCard: borrowerIdCard,
        },
        itemDetails: {
          name: itemName,
          serialNumber: itemSerial,
          value: itemValue,
        },
        conditionNotes,
        handoverDate: new Date().toISOString(),
        status: 'Aktív',
        createdAt: new Date(),
      });
      router.push('/dashboard');
    } catch (err) {
      console.error("Hiba mentés közben:", err);
      alert('Hiba történt a mentés során.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Vissza a vezérlőpultra</Link>
        <h1 className="text-xl font-bold text-slate-900">Új Kölcsönadási Jegyzőkönyv</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">1. Átvevő adatai</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Teljes név / Cégnév</label>
              <input type="text" required value={borrowerName} onChange={e => setBorrowerName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Kovács János" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Telefonszám</label>
              <input type="text" required value={borrowerPhone} onChange={e => setBorrowerPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="+36 30 123 4567" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Személyi igazolvány / Útlevél szám</label>
              <input type="text" required value={borrowerIdCard} onChange={e => setBorrowerIdCard(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="AB123456" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">2. Eszköz adatai</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Eszköz megnevezése</label>
              <input type="text" required value={itemName} onChange={e => setItemName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Pl. Bosch Fúrógép" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gyári szám</label>
              <input type="text" value={itemSerial} onChange={e => setItemSerial(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="SN-987654" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Becsült piaci érték (HUF)</label>
              <input type="number" required value={itemValue} onChange={e => setItemValue(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="50000" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">3. Műszaki állapot</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Meglévő karcok, tartozékok leírása</label>
            <textarea rows={3} value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Pl. Használati karcok, kofferrel együtt átadva." />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input type="checkbox" id="accept" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
          <label htmlFor="accept" className="text-sm text-slate-700">
            Kijelentem, hogy a fenti adatok a valóságot tükrözik.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition disabled:opacity-50"
        >
          {loading ? 'Mentés folyamatban...' : 'Jegyzőkönyv véglegesítése és mentése'}
        </button>
      </form>
    </main>
  );
}
