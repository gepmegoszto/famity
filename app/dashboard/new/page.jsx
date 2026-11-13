'use client';
import { useState, useEffect, useRef } from 'react';
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
  
  const [bZip, setBZip] = useState('');
  const [bCity, setBCity] = useState('');
  const [bStreet, setBStreet] = useState('');
  const [bHouseNumber, setBHouseNumber] = useState('');

  // Eszköz adatok
  const [itemName, setItemName] = useState('');
  const [itemSerial, setItemSerial] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [photos, setPhotos] = useState(['', '', '']);

  // Időtartam & Díjak
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [hasFee, setHasFee] = useState(false);
  const [deposit, setDeposit] = useState('');
  const [dailyFee, setDailyFee] = useState('');
  const [totalFee, setTotalFee] = useState('');
  const [depositReceived, setDepositReceived] = useState(false); // ÚJ: Kaució átvétel checkbox

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Aláírás modal állapota
  const [showSignModal, setShowSignModal] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

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

  // Automatikus díjszámítás
  useEffect(() => {
    if (hasFee && dailyFee && expectedReturnDate) {
      const start = new Date();
      const end = new Date(expectedReturnDate);
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const calculatedTotal = diffDays * Number(dailyFee);
        setTotalFee(calculatedTotal.toString());
      }
    }
  }, [hasFee, dailyFee, expectedReturnDate]);

  // Valós idejű figyelés az adatkérésre
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
      console.error(err);
      alert('Hiba történt a kérés elküldése során.');
    } finally {
      setSendingRequest(false);
    }
  };

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

  // Validálás magyar nyelvű visszajelzéssel
  const handlePreSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!borrowerLastName || !borrowerFirstName || !borrowerIdCard || !borrowerPhone || !bZip || !bCity || !bStreet || !bHouseNumber) {
      setErrorMessage('Kérjük, töltsd ki az összes kötelező bérlői személyes adatot és a teljes lakcímet!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!itemName || !itemSerial || !conditionNotes) {
      setErrorMessage('Kérjük, add meg az eszköz megnevezését, gyártási számát és állapotleírását!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!expectedReturnDate) {
      setErrorMessage('Kérjük, add meg a tervezett visszavételi dátumot és időpontot!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (hasFee && (!deposit || !dailyFee)) {
      setErrorMessage('Amennyiben bérleti díjat és kauciót alkalmaz, mindkét mező kitöltése kötelező!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (hasFee && !depositReceived) {
      setErrorMessage('A továbblépéshez meg kell erősítenie, hogy a kauciót átvette!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!accepted) {
      setErrorMessage('A folytatáshoz el kell fogadni a felelősségi nyilatkozatot!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setShowSignModal(true);
  };

  // Canvas rajzolás kezelése
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleFinalSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL();

    setLoading(true);
    try {
      let borrowerUid = null;
      if (borrowerEmail) {
        const q = query(collection(db, 'users'), where('email', '==', borrowerEmail.trim()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          borrowerUid = querySnapshot.docs[0].id;
        }
      }

      await addDoc(collection(db, 'lending_protocols'), {
        lenderId: user.uid,
        lenderEmail: user.email,
        lenderData: lenderData,
        borrowerEmail: borrowerEmail.trim(),
        borrowerUid: borrowerUid,
        borrowerData: {
          lastName: borrowerLastName,
          firstName: borrowerFirstName,
          mothersName: borrowerMothersName,
          birthPlace: borrowerBirthPlace,
          birthDate: borrowerBirthDate,
          idCardNumber: borrowerIdCard,
          phone: borrowerPhone,
          address: { zip: bZip, city: bCity, street: bStreet, houseNumber: bHouseNumber },
        },
        itemDetails: {
          name: itemName,
          serialNumber: itemSerial,
          conditionNotes,
          photos: photos.filter(p => p !== ''),
        },
        rentalTerms: {
          expectedReturnDate,
          hasFee,
          deposit: hasFee ? deposit : null,
          dailyFee: hasFee ? dailyFee : null,
          totalFee: hasFee ? totalFee : null,
          depositReceived: hasFee ? depositReceived : false,
        },
        signatures: {
          lender: signatureDataUrl,
          lenderTimestamp: new Date().toISOString(),
          borrower: null,
          borrowerTimestamp: null,
        },
        status: 'Vár a bérlő aláírására',
        createdAt: new Date(),
      });

      router.push('/dashboard');
    } catch (err) {
      console.error("Hiba mentés közben:", err);
      alert('Hiba történt a mentés során.');
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Vissza a vezérlőpultra</Link>
        <h1 className="text-xl font-bold text-slate-900">Új Kölcsönadási Jegyzőkönyv</h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-semibold">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handlePreSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        
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
              <input type="email" value={borrowerEmail} onChange={e => setBorrowerEmail(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="berlo@email.hu" />
              <button type="button" onClick={handleSendAccessRequest} disabled={sendingRequest || !borrowerEmail} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50">
                {sendingRequest ? 'Küldés...' : 'Adatkérés küldése'}
              </button>
            </div>
            {requestStatus === 'approved' && <p className="mt-2 text-xs text-emerald-600 font-semibold">✓ A bérlő engedélyezte az adatok betöltését!</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vezetéknév *</label><input type="text" value={borrowerLastName} onChange={e => setBorrowerLastName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Kovács" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Keresztnév *</label><input type="text" value={borrowerFirstName} onChange={e => setBorrowerFirstName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Péter" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Anyja neve</label><input type="text" value={borrowerMothersName} onChange={e => setBorrowerMothersName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Szabó Mária" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Születési hely</label><input type="text" value={borrowerBirthPlace} onChange={e => setBorrowerBirthPlace(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Debrecen" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Születési idő</label><input type="date" value={borrowerBirthDate} onChange={e => setBorrowerBirthDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Személyi igazolvány száma *</label><input type="text" value={borrowerIdCard} onChange={e => setBorrowerIdCard(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="XY987654" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Telefonszám *</label><input type="text" value={borrowerPhone} onChange={e => setBorrowerPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="+36 20 987 6543" /></div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Irányítószám *</label><input type="text" value={bZip} onChange={e => setBZip(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="4026" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Település *</label><input type="text" value={bCity} onChange={e => setBCity(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Debrecen" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Utca *</label><input type="text" value={bStreet} onChange={e => setBStreet(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Piac utca" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Házszám *</label><input type="text" value={bHouseNumber} onChange={e => setBHouseNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="5." /></div>
          </div>
        </div>

        {/* 3. Eszköz adatai */}
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">3. Eszköz adatai és állapota</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Megnevezés *</label><input type="text" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Pl. Bosch Fúrógép" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gyártási szám (Sorozatszám) *</label><input type="text" value={itemSerial} onChange={e => setItemSerial(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="SN-987654" /></div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Állapotleírás (meglévő karcok, tartozékok) *</label>
            <textarea rows={3} value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Pl. Használati karcok a burkolaton..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Fényképek az eszközről (max. 3 db)</label>
            <div className="grid sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
                  <input type="file" accept="image/*" onChange={e => handlePhotoUpload(index, e)} className="text-xs w-full mb-2" />
                  {photos[index] ? <div className="text-xs text-emerald-600 font-semibold">✓ Fénykép csatolva</div> : <div className="text-xs text-slate-400">{index + 1}. Kép (opcionális)</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Időtartam és Díjak */}
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">4. Bérleti időtartam és Díjak</h2>
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mikor kell visszaadni az eszközt? *</label>
            <input type="datetime-local" value={expectedReturnDate} onChange={e => setExpectedReturnDate(e.target.value)} className="w-full sm:w-1/2 px-3 py-2 border rounded-lg" />
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="hasFee" checked={hasFee} onChange={e => setHasFee(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
              <label htmlFor="hasFee" className="text-sm font-bold text-slate-800 cursor-pointer">Bérleti díj és kaució alkalmazása</label>
            </div>

            {hasFee && (
              <div className="space-y-4 pt-2 border-t">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kaució (HUF) *</label><input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" placeholder="20000" /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Napi bérleti díj (HUF) *</label><input type="number" value={dailyFee} onChange={e => setDailyFee(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white" placeholder="2000" /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Teljes bérleti díj (Automatikus)</label><input type="number" value={totalFee} readOnly className="w-full px-3 py-2 border rounded-lg bg-slate-100 font-bold text-blue-700" /></div>
                </div>
                
                {/* ÚJ: Kaució átvétel checkbox */}
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <input type="checkbox" id="depositReceived" checked={depositReceived} onChange={e => setDepositReceived(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
                  <label htmlFor="depositReceived" className="text-sm font-semibold text-blue-900 cursor-pointer">
                    Kijelentem, hogy a fenti összegű kauciót a bérlőtől átvettem. *
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input type="checkbox" id="accept" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
          <label htmlFor="accept" className="text-sm text-slate-700">Kijelentem, hogy a fenti adatok a valóságot tükrözik, és a személyes iratokat ellenőriztük. *</label>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition">
          Tovább az aláíráshoz →
        </button>
      </form>

      {/* BÉRBEADÓI ALÁÍRÓ MODAL + JOGI TÁJÉKOZTATÓ */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-900">Bérbeadói Aláírás és Jogi Tájékoztató</h3>
            
            {/* Jogi tájékoztató szöveg */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-2 max-h-40 overflow-y-auto">
              <p className="font-bold">⚠️ Fontos jogi nyilatkozat és felelősségvállalási útmutató:</p>
              <p>1. <strong>Adatok helyessége:</strong> A felek felelnek a megadott adatok valódiságáért és helyességéért. Az oldal kizárólag egy biztonságos digitális felületet és rögzítőeszközt biztosít a megállapodáshoz.</p>
              <p>2. <strong>Felelősség kizárása:</strong> A platform üzemeltetője semmilyen felelősséget nem vállal a kölcsönbe adott tárgy állapotáért, esetleges károsodásáért, megsemmisüléséért, a bérleti díj vagy a kaució elmaradásáért.</p>
              <p>3. <strong>Panaszkezelés és jogviták:</strong> Esetleges vitás kérdések, nem teljesítés vagy kár esetén a felek elsődlegesen békés úton, egymás között kötelesek eljárni. Amennyiben ez nem vezet eredményre, a felek a magyar jogszabályok szerint illetékes békéltető testülethez vagy bírósághoz fordulhatnak.</p>
            </div>

            <p className="text-xs text-slate-600">Kérjük, rajzold be az aláírásodat az alábbi mezőbe az egérrel vagy az ujjaddal.</p>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex justify-center">
              <canvas
                ref={canvasRef}
                width={450}
                height={180}
                className="cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={clearCanvas} className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg">
                Törlés / Újra
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSignModal(false)} className="text-slate-600 px-3 py-2 text-sm">Mégse</button>
                <button type="button" onClick={handleFinalSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg shadow disabled:opacity-50">
                  {loading ? 'Mentés...' : 'Aláírás rögzítése és mentés'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
