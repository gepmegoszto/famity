'use client';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReturnProtocolPage() {
  const { id } = useParams();
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [isEverythingOk, setIsEverythingOk] = useState('yes');
  const [conditionNotes, setConditionNotes] = useState('');
  const [returnPhoto, setReturnPhoto] = useState('');
  
  const [withholdDeposit, setWithholdDeposit] = useState('no');
  const [withheldAmount, setWithheldAmount] = useState('');
  const [withholdReason, setWithholdReason] = useState('');

  const [showSignModal, setShowSignModal] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        try {
          const docRef = doc(db, 'lending_protocols', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProtocol({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (err) {
          console.error("Hiba a jegyzőkönyv betöltésekor:", err);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [id, router]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReturnPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (isEverythingOk === 'no' && !conditionNotes) {
      alert('Kérjük, írja le az észrevételt / sérülést!');
      return;
    }
    if (withholdDeposit !== 'no' && (!withheldAmount || !withholdReason)) {
      alert('Kérjük, adja meg a visszatartott összeget és az indoklást!');
      return;
    }
    setShowSignModal(true);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleFinalSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL();

    setSubmitting(true);
    try {
      const docRef = doc(db, 'lending_protocols', id);
      await updateDoc(docRef, {
        returnDetails: {
          isEverythingOk,
          conditionNotes,
          returnPhoto,
          withholdDeposit,
          withheldAmount: withholdDeposit !== 'no' ? withheldAmount : 0,
          withholdReason,
          returnedAt: new Date().toISOString(),
        },
        'signatures.returnLender': signatureDataUrl,
        'signatures.returnLenderTimestamp': new Date().toISOString(),
        // ITT ÁLLÍTJUK BE A HELYES STÁTUSZT, HOGY A BÉRLŐ LÁSSA:
        status: protocol.borrowerUid ? 'Vár a bérlő visszavételi aláírására' : 'Lezárva',
      });
      router.push('/dashboard');
    } catch (err) {
      console.error("Hiba mentés közben:", err);
      alert('Hiba történt a visszavétel mentése során.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center p-12">Betöltés...</div>;
  if (!protocol) return <div className="flex-1 flex items-center justify-center p-12">A jegyzőkönyv nem található.</div>;

  const totalFee = Number(protocol.rentalTerms?.totalFee || 0);
  const deposit = Number(protocol.rentalTerms?.deposit || 0);
  const withheld = withholdDeposit !== 'no' ? Number(withheldAmount || 0) : 0;
  const refundDeposit = Math.max(0, deposit - withheld);

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Vissza a vezérlőpultra</Link>
        <h1 className="text-xl font-bold text-slate-900">Eszköz Visszavétele és Elszámolás</h1>
      </div>

      <form onSubmit={handlePreSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-md font-bold text-slate-800 mb-2 border-b pb-2">Eszköz adatai</h2>
          <p><strong>Megnevezés:</strong> {protocol.itemDetails?.name}</p>
          <p><strong>Gyártási szám:</strong> {protocol.itemDetails?.serialNumber}</p>
        </div>

        <div>
          <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">1. Állapotfelmérés visszavételkor</h2>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase">Minden rendben volt az eszközzel?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="isEverythingOk" value="yes" checked={isEverythingOk === 'yes'} onChange={() => setIsEverythingOk('yes')} className="w-4 h-4 text-blue-600" />
                <span>Igen, sérülésmentes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="isEverythingOk" value="no" checked={isEverythingOk === 'no'} onChange={() => setIsEverythingOk('no')} className="w-4 h-4 text-blue-600" />
                <span>Nem / Van észrevétel</span>
              </label>
            </div>
          </div>

          {isEverythingOk === 'no' && (
            <div className="mt-4 space-y-4 pt-4 border-t">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Észrevétel, hiba vagy sérülés leírása *</label>
                <textarea rows={3} value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Írja le részletesen a problémát..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Fénykép csatolása a sérülésről</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-xs w-full" />
                {returnPhoto && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Fénykép rögzítve</p>}
              </div>
            </div>
          )}
        </div>

        {protocol.rentalTerms?.hasFee && (
          <div>
            <h2 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">2. Kaució és Pénzügyi Elszámolás</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Visszatart a kaucióból?</label>
                <select value={withholdDeposit} onChange={e => setWithholdDeposit(e.target.value)} className="w-full sm:w-1/2 px-3 py-2 border rounded-lg bg-white">
                  <option value="no">Nem, a teljes kaució visszajár ({deposit} HUF)</option>
                  <option value="partial">Igen, részleges visszatartás</option>
                  <option value="full">Igen, a teljes kaució visszatartásra kerül</option>
                </select>
              </div>

              {withholdDeposit !== 'no' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Visszatartott összeg (HUF) *</label>
                    <input type="number" value={withheldAmount} onChange={e => setWithheldAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Pl. 5000" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Visszatartás indoklása *</label>
                    <input type="text" value={withholdReason} onChange={e => setWithholdReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Pl. Esetleges tisztítási költség / alkatrész kár" />
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border space-y-2 text-sm">
                <h3 className="font-bold text-slate-900 border-b pb-1">Pénzügyi Összegzés</h3>
                <p>Teljes bérleti díj: <strong>{totalFee} HUF</strong> (A bérbeadót illeti)</p>
                <p>Átvett kaució: <strong>{deposit} HUF</strong></p>
                <p>Visszatartott kaució: <strong>{withheld} HUF</strong></p>
                <p className="text-emerald-700 font-bold pt-1 border-t">Bérlőnek visszajáró kaució: {refundDeposit} HUF</p>
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition">
          Tovább a lezáró aláíráshoz →
        </button>
      </form>

      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-900">Visszavételi Aláírás és Elszámolási Nyilatkozat</h3>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 space-y-2">
              <p className="font-bold">✅ Pénzügyi és tárgyi elszámolási nyilatkozat:</p>
              <p>Aláírásommal megerősítem, hogy a kaució elszámolása megtörtént, minden pénzügyi és tárgyi elszámolás lezárult, a felek egymással a bérlettel kapcsolatban elszámoltak, és az ügylet véglegesen lezárható.</p>
            </div>
            <p className="text-xs text-slate-600">Kérjük, rajzolja be az aláírását az alábbi mezőbe:</p>
            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex justify-center">
              <canvas ref={canvasRef} width={450} height={180} className="cursor-crosshair touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={clearCanvas} className="bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg">Törlés</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSignModal(false)} className="text-slate-600 px-3 py-2 text-sm">Mégse</button>
                <button type="button" onClick={handleFinalSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg shadow disabled:opacity-50">{submitting ? 'Mentés...' : 'Véglegesítés és Lezárás'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
