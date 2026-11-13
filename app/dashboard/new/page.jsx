'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProtocolPage() {
  const [user, setUser] = useState(null);
  const [lenderData, setLenderData] = useState(null);
  const router = useRouter();

  // Bérlő adatok
  const [borrowerEmail, setBorrowerEmail] = useState('');
  const [borrowerFound, setBorrowerFound] = useState(null); // null: nincs keresve, true: regisztrált, false: nem regisztrált
  const [borrowerLastName, setBorrowerLastName] = useState('');
  const [borrowerFirstName, setBorrowerFirstName] = useState('');
  const [borrowerMothersName, setBorrowerMothersName] = useState('');
  const [borrowerBirthPlace, setBorrowerBirthPlace] = useState('');
  const [borrowerBirthDate, setBorrowerBirthDate] = useState('');
  const [borrowerIdCard, setBorrowerIdCard] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  
  // Bérlő lakcím
  const [bZip, setBZip] = useState('');
  const [bCity, setBCity] = useState('');
  const [bStreet, setBStreet] = useState('');
  const [bHouseNumber, setBHouseNumber] = useState('');
  const [bFloor, setBFloor] = useState('');
  const [bDoor, setBDoor] = useState('');

  // Eszköz adatok
  const [itemName, setItemName] = useState('');
  const [itemSerial, setItemSerial] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingBorrower, setCheckingBorrower] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        setUser(currentUser);
        // Bérbeadó profil betöltése
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setLenderData(userDoc.data());
          } else {
            alert('Kérlek először töltsd ki a profilodat!');
            router.push('/profile');
          }
        } catch (err) {
          console.error("Hiba a bérbeadó adatainak betöltésekor:", err);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Bérlő keresése email alapján
  const handleCheckBorrower = async (e) => {
    e.preventDefault();
    if (!borrowerEmail) return;

    setCheckingBorrower(true);
    setBorrowerFound(null);

    try {
      const q = query(collection(db, 'users'), where('email', '==', borrowerEmail.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const bData = querySnapshot.docs[0].data();
        setBorrowerLastName(bData.lastName || '');
        setBorrowerFirstName(bData.firstName || '');
        setBorrowerMothersName(bData.mothersName || '');
        setBorrowerBirthPlace(bData.birthPlace || '');
        setBorrowerBirthDate(bData.birthDate || '');
        setBorrowerIdCard(bData.idCardNumber || '');
        setBorrowerPhone(bData.phone || '');
        setBZip(bData.address?.zip || '');
        setBCity(bData.address?.city || '');
        setBStreet(bData.address?.street || '');
        setBHouseNumber(bData.address?.houseNumber || '');
        setBFloor(bData.address?.floor || '');
        setBDoor(bData.address?.door || '');
        setBorrowerFound(true);
      } else {
        setBorrowerFound(false);
      }
    } catch (err) {
      console.error("Hiba a bérlő keresésekor:", err);
      alert('Hiba történt a bérlő keresése során.');
    } finally {
      setCheckingBorrower(false);
    }
  };

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
        lenderData: lenderData,
        borrowerData: {
          email: borrowerEmail,
          lastName: borrowerLastName,
          firstName: borrowerFirstName,
          mothersName: borrowerMothersName,
          birthPlace: borrowerBirthPlace,
          birthDate: borrowerBirthDate,
          idCardNumber: borrowerIdCard,
          phone: borrowerPhone,
          address: {
            zip: bZip,
            city: bCity,
            street: bStreet,
            houseNumber: bHouseNumber,
            floor: bFloor,
            door: bDoor,
          },
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
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Vissza a vezérlőpultra</Link>
        <h1 className="text-xl font-bold text-slate-900">Új Kölcsönadási Jegyzőkönyv</h1>
      </div>

      {/* Biztonsági figyelmeztetés */}
      <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 flex gap-3 items-start">
        <span className="text-xl">🛡️</span>
        <div>
          <h4 className="font-bold text-sm mb-1">Biztonsági figyelmeztetés a felek számára</h4>
          <p className="text-xs leading-relaxed">
            A felek biztonsága, az adatok valódisága és a viták elkerülése érdekében <strong>kérjük, hogy a jegyzőkönyv aláírása előtt ellenőrizzék egymás személyes iratait</strong> (személyi igazolvány, lakcímkártya)!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        
        {/* Bérbeadó adatai (automatikus) */}
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">1. Bérbeadó (Saját) adatai - Profilból behúzva</h2>
          {lenderData ? (
            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 grid sm:grid-cols-2 gap-2">
              <p><strong>Név:</strong> {lenderData.lastName} {lenderData.firstName}</p>
              <p><strong>Szem. ig. szám:</strong> {lenderData.idCardNumber}</p>
              <p><strong>Anyja neve:</strong> {lenderData.mothersName}</p>
              <p><strong>Születési hely, idő:</strong> {lenderData.birthPlace}, {lenderData.birthDate}</p>
              <p className="sm:col-span-2"><strong>Lakcím:</strong> {lenderData.address?.zip} {lenderData.address?.city}, {lenderData.address?.street} {lenderData.address?.houseNumber}</p>
            </div>
          ) : (
            <p className="text-sm text-amber-600">Betöltés...</p>
          )}
        </div>

        {/* Bérlő adatai */}
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">2. Bérlő / Átvevő adatai</h2>
          
          <div className="mb-4 p-4 bg-slate-50 border rounded-xl">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Bérlő email címe (ha van fiókja a rendszerben)</label>
            <div className="flex gap-2">
              <input 
                type="email" 
                value={borrowerEmail} 
                onChange={e => setBorrowerEmail(e.target.value)} 
                className="flex-1 px-3 py-2 border rounded-lg text-sm" 
                placeholder="berlo@email.hu" 
              />
              <button 
                type="button" 
                onClick={handleCheckBorrower}
                disabled={checkingBorrower || !borrowerEmail}
                className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {checkingBorrower ? 'Keresés...' : 'Adatkérés / Keresés'}
              </button>
            </div>

            {borrowerFound === true && (
              <p className="mt-2 text-xs text-emerald-600 font-semibold">✓ A bérlő regisztrált felhasználó! Az adatai betöltődtek a rendszerből.</p>
            )}
            {borrowerFound === false && (
              <p className="mt-2 text-xs text-amber-600 font-semibold">ℹ️ Nincs regisztrált felhasználó ezzel az emillel. Kérjük, add meg manuálisan az adatait alább!</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vezetéknév</label>
              <input type="text" required value={borrowerLastName} onChange={e => setBorrowerLastName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Kovács" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Keresztnév</label>
              <input type="text" required value={borrowerFirstName} onChange={e => setBorrowerFirstName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Péter" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Anyja neve</label>
              <input type="text" required value={borrowerMothersName} onChange={e => setBorrowerMothersName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Szabó Mária" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Születési hely</label>
              <input type="text" required value={borrowerBirthPlace} onChange={e => setBorrowerBirthPlace(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Debrecen" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Születési idő</label>
              <input type="date" required value={borrowerBirthDate} onChange={e => setBorrowerBirthDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Személyi igazolvány száma</label>
              <input type="text" required value={borrowerIdCard} onChange={e => setBorrowerIdCard(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="XY987654" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Telefonszám</label>
              <input type="text" required value={borrowerPhone} onChange={e => setBorrowerPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="+36 20 987 6543" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Irányítószám</label>
              <input type="text" required value={bZip} onChange={e => setBZip(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="4026" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Település</label>
              <input type="text" required value={bCity} onChange={e => setBCity(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Debrecen" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Utca</label>
              <input type="text" required value={bStreet} onChange={e => setBStreet(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Piac utca" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Házszám</label>
              <input type="text" required value={bHouseNumber} onChange={e => setBHouseNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="5." />
            </div>
          </div>
        </div>

        {/* Eszköz adatai */}
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">3. Kölcsönadott eszköz adatai</h2>
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

        {/* Műszaki állapot */}
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">4. Műszaki állapot és tartozékok</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Meglévő karcok, sérülések, tartozékok leírása</label>
            <textarea rows={3} value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Pl. Használati karcok, kofferrel együtt átadva." />
          </div>
        </div>

        {/* Elfogadás */}
        <div className="flex items-center gap-3 pt-2">
          <input type="checkbox" id="accept" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
          <label htmlFor="accept" className="text-sm text-slate-700">
            Kijelentem, hogy a fenti adatok a valóságot tükrözik, és a személyes iratokat ellenőriztük.
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
