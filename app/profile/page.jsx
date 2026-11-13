'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Profil mezők
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [mothersName, setMothersName] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [phone, setPhone] = useState('');
  
  // Lakcím mezők
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [door, setDoor] = useState('');

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        setUser(currentUser);
        // Adatok betöltése Firestore-ból, ha már léteznek
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setLastName(data.lastName || '');
            setFirstName(data.firstName || '');
            setMothersName(data.mothersName || '');
            setBirthPlace(data.birthPlace || '');
            setBirthDate(data.birthDate || '');
            setIdCardNumber(data.idCardNumber || '');
            setPhone(data.phone || '');
            setZip(data.address?.zip || '');
            setCity(data.address?.city || '');
            setStreet(data.address?.street || '');
            setHouseNumber(data.address?.houseNumber || '');
            setFloor(data.address?.floor || '');
            setDoor(data.address?.door || '');
          }
        } catch (err) {
          console.error("Hiba a profil betöltésekor:", err);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        lastName,
        firstName,
        mothersName,
        birthPlace,
        birthDate,
        idCardNumber,
        phone,
        address: {
          zip,
          city,
          street,
          houseNumber,
          floor,
          door,
        },
        updatedAt: new Date(),
      }, { merge: true });

      setSuccess('Adatok sikeresen mentve! Most már indíthatsz kölcsönzési jegyzőkönyvet.');
    } catch (err) {
      console.error("Hiba mentés közben:", err);
      alert('Hiba történt a mentés során.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center p-12">Betöltés...</div>;
  }

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Vissza a vezérlőpultra</Link>
        <h1 className="text-xl font-bold text-slate-900">Személyes adatok (Bérbeadói profil)</h1>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">1. Személyes azonosítók</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vezetéknév</label>
              <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Kovács" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Keresztnév</label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="János" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Anyja neve</label>
              <input type="text" required value={mothersName} onChange={e => setMothersName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Nagy Anna" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Születési hely</label>
              <input type="text" required value={birthPlace} onChange={e => setBirthPlace(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Budapest" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Születési idő</label>
              <input type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Személyi igazolvány száma</label>
              <input type="text" required value={idCardNumber} onChange={e => setIdCardNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="AB123456" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Telefonszám</label>
              <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="+36 30 123 4567" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">2. Lakcím</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Irányítószám</label>
              <input type="text" required value={zip} onChange={e => setZip(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="6000" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Település</label>
              <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Kecskemét" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Utca</label>
              <input type="text" required value={street} onChange={e => setStreet(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Fő utca" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Házszám</label>
              <input type="text" required value={houseNumber} onChange={e => setHouseNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="12." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Emelet (opcionális)</label>
              <input type="text" value={floor} onChange={e => setFloor(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="2." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Ajtó (opcionális)</label>
              <input type="text" value={door} onChange={e => setDoor(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="5." />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition disabled:opacity-50"
        >
          {saving ? 'Mentés folyamatban...' : 'Adatok mentése a profilba'}
        </button>
      </form>
    </main>
  );
}
