'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProtocolDetailPage() {
  const { id } = useParams();
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProtocol = async () => {
      try {
        const docRef = doc(db, 'lending_protocols', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProtocol({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProtocol();
  }, [id]);

  if (loading) return <div className="flex-1 flex items-center justify-center p-12">Betöltés...</div>;
  if (!protocol) return <div className="flex-1 flex items-center justify-center p-12">A jegyzőkönyv nem található.</div>;

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Vissza a vezérlőpultra</Link>
        <button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow">
          🖨️ PDF letöltése / Nyomtatás
        </button>
      </div>

      {/* NYOMTATHATÓ / PDF DOKUMENTUM KERET */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-800 text-sm">
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight">KÖLCSÖNADÁSI ÉS ÁTADÁS-ÁTVÉTELI JEGYZŐKÖNYV</h1>
          <p className="text-xs text-slate-500 mt-1">Státusz: <span className="font-bold text-slate-800">{protocol.status}</span></p>
        </div>

        {/* 1. Bérbeadó adatai */}
        <div>
          <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">1. Bérbeadó adatai</h3>
          <p><strong>Név:</strong> {protocol.lenderData?.lastName} {protocol.lenderData?.firstName}</p>
          <p><strong>Anyja neve:</strong> {protocol.lenderData?.mothersName}</p>
          <p><strong>Születési hely, idő:</strong> {protocol.lenderData?.birthPlace}, {protocol.lenderData?.birthDate}</p>
          <p><strong>Személyi igazolvány sz.:</strong> {protocol.lenderData?.idCardNumber}</p>
          <p><strong>Lakcím:</strong> {protocol.lenderData?.address?.zip} {protocol.lenderData?.address?.city}, {protocol.lenderData?.address?.street} {protocol.lenderData?.address?.houseNumber}</p>
          <p><strong>Telefonszám:</strong> {protocol.lenderData?.phone}</p>
        </div>

        {/* 2. Bérlő adatai */}
        <div>
          <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">2. Bérlő adatai</h3>
          <p><strong>Név:</strong> {protocol.borrowerData?.lastName} {protocol.borrowerData?.firstName}</p>
          <p><strong>Anyja neve:</strong> {protocol.borrowerData?.mothersName}</p>
          <p><strong>Születési hely, idő:</strong> {protocol.borrowerData?.birthPlace}, {protocol.borrowerData?.birthDate}</p>
          <p><strong>Személyi igazolvány sz.:</strong> {protocol.borrowerData?.idCardNumber}</p>
          <p><strong>Lakcím:</strong> {protocol.borrowerData?.address?.zip} {protocol.borrowerData?.address?.city}, {protocol.borrowerData?.address?.street} {protocol.borrowerData?.address?.houseNumber}</p>
          <p><strong>Telefonszám:</strong> {protocol.borrowerData?.phone}</p>
        </div>

        {/* 3. Eszköz adatai */}
        <div>
          <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">3. Kölcsönadott eszköz adatai</h3>
          <p><strong>Megnevezés:</strong> {protocol.itemDetails?.name}</p>
          <p><strong>Gyártási szám (Sorozatszám):</strong> {protocol.itemDetails?.serialNumber}</p>
          <p><strong>Állapotleírás, tartozékok:</strong> {protocol.itemDetails?.conditionNotes}</p>
        </div>

        {/* 4. Időtartam és Díjak */}
        <div>
          <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">4. Időtartam és Pénzügyi feltételek</h3>
          <p><strong>Kezdés időbélyege:</strong> {new Date(protocol.createdAt?.toDate?.() || protocol.createdAt).toLocaleString('hu-HU')}</p>
          <p><strong>Tervezett visszahozatal:</strong> {protocol.rentalTerms?.expectedReturnDate ? new Date(protocol.rentalTerms.expectedReturnDate).toLocaleString('hu-HU') : '-'}</p>
          {protocol.rentalTerms?.hasFee ? (
            <div className="mt-2 p-3 bg-slate-50 rounded-lg space-y-1">
              <p><strong>Kaució:</strong> {protocol.rentalTerms.deposit} HUF</p>
              <p><strong>Napi bérleti díj:</strong> {protocol.rentalTerms.dailyFee} HUF</p>
              <p><strong>Teljes bérleti díj:</strong> {protocol.rentalTerms.totalFee} HUF</p>
            </div>
          ) : (
            <p className="mt-1 italic text-slate-500">Ingyenes bérlés / Nincs bérleti díj megadva.</p>
          )}
        </div>

        {/* Aláírások */}
        <div className="pt-4 border-t grid grid-cols-2 gap-8">
          <div>
            <p className="font-bold mb-2">Bérbeadó aláírása:</p>
            {protocol.signatures?.lender ? (
              <div>
                <img src={protocol.signatures.lender} alt="Bérbeadó aláírása" className="h-16 border bg-slate-50 p-1 rounded" />
                <p className="text-[10px] text-slate-500 mt-1">Aláírva: {new Date(protocol.signatures.lenderTimestamp).toLocaleString('hu-HU')}</p>
              </div>
            ) : (
              <p className="text-xs text-amber-600">Még nincs aláírva</p>
            )}
          </div>

          <div>
            <p className="font-bold mb-2">Bérlő aláírása:</p>
            {protocol.signatures?.borrower ? (
              <div>
                <img src={protocol.signatures.borrower} alt="Bérlő aláírása" className="h-16 border bg-slate-50 p-1 rounded" />
                <p className="text-[10px] text-slate-500 mt-1">Aláírva: {new Date(protocol.signatures.borrowerTimestamp).toLocaleString('hu-HU')}</p>
              </div>
            ) : (
              <p className="text-xs text-amber-600">Még nincs aláírva</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
