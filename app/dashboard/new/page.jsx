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
  const [requestStatus, setRequestStatus] = useState(null);

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
  const [conditionNotes, setConditionNotes] = useState('');
  const [photos, setPhotos] = useState(['', '', '']); // 3 db fénykép Base64

  // Bérlés időpontjai
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  // Opcionális bérleti díj és kaució
  const [hasFee, setHasFee] = useState(false);
  const [deposit, setDeposit] = useState('');
  const [dailyFee, setDailyFee] = useState('');
  const [totalFee, setTotalFee] = useState('');

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

  // Valós idejű figyelés a bérlői adatkérésre
  useEffect(() => {
    if (!requestId) return;

    const unsubscribe = onSnapshot(doc(db, 'access_requests', requestId), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRequestStatus(data.status);

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

  const handleSendAccessRequest = async (e) => {
    e.preventDefault();
    if (!borrowerEmail) return;

    setSendingRequest(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', borrowerEmail.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Nincs regisztrált felhasználó ezzel az email címmel. Kérjük, add meg manuálisan az adatait!');
        setSendingRequest(false);
        return;
      }

      const borrowerUid = querySnapshot.docs[0].id;
      const lenderFullName = lenderData ? `${lenderData.lastName} ${lenderData.firstName}` : user.email;

      const reqRef = await addDoc(collection(db, 'access_requests'), {
        lenderId: user.uid,
        lenderEmail: user.email,
        lenderName: lenderFullName,
        borrowerEmail: borrowerEmail.trim(),
        borrowerUid: borrowerUid,
        status: 'pending',
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

  // Fénykép feltöltés és konvertálás Base64 formátumba
  const handlePhotoUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhotos = [...photos];
      newPhotos[index] = reader.result;
      setPhotos(newPhotos);
    };
    reader.readAsDataURL(file);
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
          conditionNotes,
          photos: photos.filter(p => p !== ''), // Csak a feltöltött képek mentése
        },
        rentalTerms: {
          expectedReturnDate,
          hasFee,
          deposit: hasFee ? deposit : null,
          dailyFee: hasFee ? dailyFee : null,
          totalFee: hasFee ? totalFee : null,
        },
        handoverTimestamp: new Date().toISOString(), // Aláírás rögzítésének pontos ideje
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
        
        {/* 1. Bérbeadó adatai */}
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

        {/* 2. Bérlő adatai */}
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

        {/* 3. Eszköz adatai, állapot, fényképek */}
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">3. Eszköz adatai és állapota</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Megnevezés</label>
              <input type="text" required value={itemName} onChange={e => setItemName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Pl. Bosch Fúrógép" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gyártási szám (Sorozatszám)</label>
              <input type="text" required value={itemSerial} onChange={e => setItemSerial(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="SN-987654" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Állapotleírás (meglévő karcok, tartozékok)</label>
            <textarea rows={3} required value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Pl. Használati karcok a burkolaton, kofferrel és 1 db akkumulátorral." />
          </div>

          {/* 3 db fényképfeltöltés */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Fényképek az eszközről (max. 3 db)</label>
            <div className="grid sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
                  <input type="file" accept="image/*" onChange={e => handlePhotoUpload(index, e)} className="text-xs w-full mb-2" />
                  {photos[index] ? (
                    <div className="text-xs text-emerald-600 font-semibold">✓ Fénykép csatolva</div>
                  ) : (
                    <div className="text-xs text-slate-400">{index +}. Kép (opcionális)</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Visszahozatali időpont & Opcionális díjak */}
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">4. Bérleti időtartam és Díjak</h2>
          
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mikor kell visszaadni az eszközt? (Tervezett visszahozatal)</label>
            <input type="datetime-local" required value={expectedReturnDate} onChange={e => setExpectedReturnDate(e.target.value)} className="w-full sm:w-1/2 px-3 py-2 border rounded-lg" />
            <p className="text-xs text-slate-500 mt-1">A bérlés kezdő időpontja automatikusan a jegyzőkönyv véglegesítésének pillanata lesz.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border">
            <div className="flex items-center gap-3 mb-4">
              <input type="checkbox" id="hasFee" checked={hasFee} onChange={e => setHasFee(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
              <label htmlFor="hasFee" className="text-sm font-bold text-slate-800 cursor-pointer">
                Bérleti díj és kaució alkalmazása
              </label>
            </div>

            {hasFee && (
              <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kaució (HUF)</label>
                  <input type="number" required={hasFee} value={deposit} onChange={e => setDeposit(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" placeholder="20000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Napi bérleti díj (HUF)</label>
                  <input type="number" required={hasFee} value={dailyFee} onChange={e => setDailyFee(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" placeholder="2000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Teljes bérleti díj (HUF)</label>
                  <input type="number" required={hasFee} value={totalFee} onChange={e => setTotalFee(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" placeholder="10000" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Elfogadás */}
        <div className="flex items-center gap-3 pt-2">
          <input type="checkbox" id="accept" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
          <label htmlFor="accept" className="text-sm text-slate-700">
            Kijelentem, hogy a fenti adatok a valóságot tükrözik, a személyes iratokat ellenőriztük, és a jegyzőkönyvet hitelesnek tekintem.
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
