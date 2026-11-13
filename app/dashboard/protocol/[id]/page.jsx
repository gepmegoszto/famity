'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProtocolDetailPage() {
  const { id } = useParams();
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  if (loading) return <div className="flex-1 flex items-center justify-center p-12">Betöltés...</div>;
  if (!protocol) return <div className="flex-1 flex items-center justify-center p-12">A jegyzőkönyv nem található.</div>;

  const rentalTerms = protocol.rentalTerms || {};
  const returnDetails = protocol.returnDetails || {};
  const signatures = protocol.signatures || {};

  const totalFee = Number(rentalTerms.totalFee || 0);
  const deposit = Number(rentalTerms.deposit || 0);
  const withheld = returnDetails.withholdDeposit && returnDetails.withholdDeposit !== 'no' ? Number(returnDetails.withheldAmount || 0) : 0;
  const refundDeposit = Math.max(0, deposit - withheld);

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Vissza a vezérlőpultra</Link>
        <span className={`text-xs px-3 py-1 rounded-full font-bold ${protocol.status === 'Lezárva' ? 'bg-slate-200 text-slate-800' : protocol.status === 'Aktív' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          Státusz: {protocol.status}
        </span>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 border-b pb-4">Kölcsönadási Jegyzőkönyv Részletei</h1>

        {/* 1. Felek adatai */}
        <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border">
          <div>
            <h3 className="font-bold text-slate-800 mb-2">Bérbeadó</h3>
            <p className="text-sm"><strong>Név:</strong> {protocol.lenderData?.lastName} {protocol.lenderData?.firstName}</p>
            <p className="text-sm"><strong>Email:</strong> {protocol.lenderEmail}</p>
            <p className="text-sm"><strong>Telefonszám:</strong> {protocol.lenderData?.phone || 'Nincs megadva'}</p>
            <p className="text-sm"><strong>Szem. ig. sz.:</strong> {protocol.lenderData?.idCardNumber}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-2">Bérlő</h3>
            <p className="text-sm"><strong>Név:</strong> {protocol.borrowerData?.lastName} {protocol.borrowerData?.firstName}</p>
            <p className="text-sm"><strong>Email:</strong> {protocol.borrowerEmail}</p>
            <p className="text-sm"><strong>Telefonszám:</strong> {protocol.borrowerData?.phone || 'Nincs megadva'}</p>
            <p className="text-sm"><strong>Szem. ig. sz.:</strong> {protocol.borrowerData?.idCardNumber}</p>
          </div>
        </div>

        {/* 2. Eszköz adatai */}
        <div>
          <h3 className="font-bold text-slate-800 mb-2 border-b pb-1">Eszköz adatai és átvételi állapota</h3>
          <p className="text-sm"><strong>Megnevezés:</strong> {protocol.itemDetails?.name}</p>
          <p className="text-sm"><strong>Gyártási szám:</strong> {protocol.itemDetails?.serialNumber}</p>
          <p className="text-sm mt-2"><strong>Állapotleírás átvételkor:</strong> {protocol.itemDetails?.conditionNotes}</p>
          {protocol.itemDetails?.photos?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Átvételi fényképek:</p>
              <div className="flex gap-4 flex-wrap">
                {protocol.itemDetails.photos.map((photo, idx) => (
                  <img key={idx} src={photo} alt={`Eszköz ${idx + 1}`} className="w-32 h-32 object-cover rounded-lg border" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Bérleti feltételek */}
        <div>
          <h3 className="font-bold text-slate-800 mb-2 border-b pb-1">Bérleti feltételek és díjak</h3>
          <p className="text-sm"><strong>Tervezett visszavételi időpont:</strong> {rentalTerms.expectedReturnDate ? new Date(rentalTerms.expectedReturnDate).toLocaleString('hu-HU') : 'Nincs megadva'}</p>
          {rentalTerms.hasFee ? (
            <div className="mt-2 text-sm space-y-1 bg-blue-50 p-4 rounded-xl border border-blue-200">
              <p><strong>Kaució:</strong> {rentalTerms.deposit} HUF {rentalTerms.depositReceived && '(Átvéve ✓)'}</p>
              <p><strong>Napi bérleti díj:</strong> {rentalTerms.dailyFee} HUF</p>
              <p><strong>Teljes bérleti díj:</strong> {rentalTerms.totalFee} HUF</p>
            </div>
          ) : (
            <p className="text-sm text-slate-600 mt-1">Ingyenes kölcsönzés (nincs bérleti díj vagy kaució).</p>
          )}
        </div>

        {/* 4. Kezdeti aláírások */}
        <div>
          <h3 className="font-bold text-slate-800 mb-3 border-b pb-1">Kezdeti átadás-átvételi aláírások</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border p-4 rounded-xl bg-slate-50">
              <p className="text-xs font-semibold text-slate-600 mb-2">Bérbeadó aláírása:</p>
              {signatures.lender ? (
                <>
                  <img src={signatures.lender} alt="Bérbeadó aláírás" className="max-h-20 bg-white border rounded p-1 mb-2" />
                  <p className="text-xs text-slate-500">Időpont: {signatures.lenderTimestamp ? new Date(signatures.lenderTimestamp).toLocaleString('hu-HU') : '-'}</p>
                </>
              ) : (
                <p className="text-xs text-slate-400">Nincs aláírva</p>
              )}
            </div>
            <div className="border p-4 rounded-xl bg-slate-50">
              <p className="text-xs font-semibold text-slate-600 mb-2">Bérlő aláírása:</p>
              {signatures.borrower ? (
                <>
                  <img src={signatures.borrower} alt="Bérlő aláírás" className="max-h-20 bg-white border rounded p-1 mb-2" />
                  <p className="text-xs text-slate-500">Időpont: {signatures.borrowerTimestamp ? new Date(signatures.borrowerTimestamp).toLocaleString('hu-HU') : '-'}</p>
                </>
              ) : (
                <p className="text-xs text-amber-600 font-semibold">Vár a bérlő aláírására...</p>
              )}
            </div>
          </div>
        </div>

        {/* 5. VISSZAVÉTELI ÉS ELSZÁMOLÁSI INFORMÁCIÓK */}
        {returnDetails.returnedAt && (
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">🔄 Visszavételi és Pénzügyi Elszámolási Adatok</h3>
            
            <div className="bg-slate-50 p-4 rounded-xl border space-y-2 text-sm">
              <p><strong>Mikor zárult le / történt a visszavétel:</strong> {new Date(returnDetails.returnedAt).toLocaleString('hu-HU')}</p>
              <p><strong>Minden rendben volt az eszközzel:</strong> {returnDetails.isEverythingOk === 'yes' ? 'Igen, sérülésmentes' : 'Nem / Van észrevétel'}</p>
              {returnDetails.conditionNotes && (
                <p><strong>Észrevétel / sérülés leírása:</strong> {returnDetails.conditionNotes}</p>
              )}
              {returnDetails.returnPhoto && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Sérülésről készült fénykép:</p>
                  <img src={returnDetails.returnPhoto} alt="Visszavételi fénykép" className="w-32 h-32 object-cover rounded-lg border" />
                </div>
              )}
            </div>

            {rentalTerms.hasFee && (
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 space-y-3">
                <h4 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1">Pénzügyi Elszámolás Összegzése</h4>
                <div className="text-sm space-y-1 text-emerald-950">
                  <p>• Teljes bérleti díj (Bérbeadó kapta): <strong>{totalFee} HUF</strong></p>
                  <p>• Eredetileg átvett kaució: <strong>{deposit} HUF</strong></p>
                  <p>• Visszatartott kaució: <strong>{returnDetails.withholdDeposit !== 'no' ? `${returnDetails.withheldAmount} HUF (${returnDetails.withholdReason})` : '0 HUF (Nincs visszatartás)'}</strong></p>
                  <p className="text-base font-bold pt-2 border-t border-emerald-200">
                    • Bérlőnek visszaadott kaució: {refundDeposit} HUF
                  </p>
                </div>
              </div>
            )}

            {/* Visszavételi aláírások */}
            <div className="pt-2">
              <h4 className="font-bold text-slate-800 mb-3">Visszavételi és lezárási aláírások</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border p-4 rounded-xl bg-slate-50">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Bérbeadó visszavételi aláírása:</p>
                  {signatures.returnLender ? (
                    <>
                      <img src={signatures.returnLender} alt="Bérbeadó visszavételi aláírás" className="max-h-20 bg-white border rounded p-1 mb-2" />
                      <p className="text-xs text-slate-500">Időpont: {signatures.returnLenderTimestamp ? new Date(signatures.returnLenderTimestamp).toLocaleString('hu-HU') : '-'}</p>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400">Nincs aláírva</p>
                  )}
                </div>
                <div className="border p-4 rounded-xl bg-slate-50">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Bérlő visszavételi aláírása:</p>
                  {signatures.returnBorrower ? (
                    <>
                      <img src={signatures.returnBorrower} alt="Bérlő visszavételi aláírás" className="max-h-20 bg-white border rounded p-1 mb-2" />
                      <p className="text-xs text-slate-500">Időpont: {signatures.returnBorrowerTimestamp ? new Date(signatures.returnBorrowerTimestamp).toLocaleString('hu-HU') : '-'}</p>
                    </>
                  ) : (
                    <p className="text-xs text-amber-600 font-semibold">Vár a bérlő visszavételi aláírására...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
