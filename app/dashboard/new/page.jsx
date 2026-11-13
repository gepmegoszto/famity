'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProtocolPage() {
  const [user, setUser] = useState(null);
  const [lenderData, setLenderData] = useState(null);
  const router = useRouter();

  // Bérlő adatok
  const [borrowerEmail, setBorrowerEmail] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'approved', 'rejected'

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
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        setUser(currentUser);
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

  // Valós idejű figyelés, hogy a bérlő elfogadta-e a kérést
  useEffect(() => {
    if (!requestId) return;

    const unsubscribe = onSnapshot(doc(db, 'access_requests', requestId), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRequestStatus(data.status);

        // Ha a bérlő elfogadta, húzzuk be az adatait
        if (data.status === 'approved' && data.borrowerUid) {
          const bUserDoc = await getDoc(doc(db, 'users', data.borrowerUid));
          if (bUserDoc.exists()) {
            const bData = bUserDoc.data();
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
          }
        }
      }
    });

    return () => unsubscribe();
  }, [requestId]);

  // Adatkérés küldése a bérlőnek
  const handleSendAccessRequest = async (e) => {
    e.preventDefault();
    if (!borrowerEmail) return;

    setSendingRequest(true);
    try {
      // Megkeressük, hogy létezik-e a bérlő
      const q = query(collection(db, 'users'), where('email', '==', borrowerEmail.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Nincs regisztrált felhasználó ezzel az email címmel. Kérjük, add meg manuálisan az adatait!');
        setSendingRequest(false);
        return;
      }

      const borrowerUid = querySnapshot.docs[0].id;

      // Létrehozzuk a kérelmet
      const reqRef = await addDoc(collection(db, 'access_requests'), {
        lenderId: user.uid,
        lenderEmail: user.email,
        borrowerEmail: borrowerEmail.trim(),
        borrowerUid: borrowerUid,
        status: 'pending', // pending, approved, rejected
        createdAt: new Date(),
      });

      setRequestId(reqRef.id);
      setRequestStatus('pending');
    } catch (err) {
      console.error("Hiba az adatkérés küldésekor:", err);
      alert('Hiba történt a kérés elküldése során.');
    } finally {
      setSendingRequest(false);
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
        
        {/* Bérbeadó adatai */}
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">1. Bérbeadó (Saját) adatai</h2>
          {lenderData && (
            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 grid sm:grid-cols-2 gap-2">
              <p><strong>Név:</strong> {lenderData.lastName} {lenderData.firstName}</p>
              <p><strong>Szem. ig. szám:</strong> {lenderData.idCardNumber}</p>
              <p><strong>Anyja neve:</strong> {lenderData.mothersName}</p>
              <p><strong>Születési hely, idő:</strong> {lenderData.birthPlace}, {lenderData.birthDate}</p>
              <p className="sm:col-span-2"><strong>Lakcím:</strong> {lenderData.address?.zip} {lenderData.address?.city}, {lenderData.address?.street} {lenderData.address?.houseNumber}</p>
            </div>
          )}
        </div>

        {/* Bérlő adatai */}
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">2. Bérlő / Átvevő adatai</h2>
          
          <div className="mb-4 p-4 bg-slate-50 border rounded-xl">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Bérlő email címe (Adatkérés küldéséhez)</label>
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
                onClick={handleSendAccessRequest}
                disabled={sendingRequest || !borrowerEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {sendingRequest ? 'Küldés...' : 'Adatkérés küldése'}
              </button>
            </div>

            {requestStatus === 'pending' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg animate-pulse">
                ⏳ Adatkérés elküldve. Várakozás a bérlő jóváhagyására a fiókjában...
              </div>
            )}
            {requestStatus === 'approved' && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-semibold">
                ✓ A bérlő jóváhagyta az adatkérést! Az adatai betöltődtek.
              </div>
            )}
            {requestStatus === 'rejected' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                ❌ A bérlő elutasította az adatkérést. Add meg az adatait manuálisan alább.
              </div>
            )}
          </div>

          {/* Manuális kitöltés / Betöltött adatok */}
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
