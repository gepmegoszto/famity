'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-3xl mx-auto space-y-8">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Digitális Jegyzőkönyv & Kölcsönadás
        </span>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900">
          Biztonságos kölcsönadás, <span className="text-blue-600">viták nélkül.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
          Rögzítsd hivatalosan szerszámaid, eszközeid és értékeid átadását. Digitális aláírás, pontos állapotfelmérés és jogi biztonság egy helyen.
        </p>

        <div className="pt-4">
          <Link
            href="/auth"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Kölcsönadás indítása →
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-16 text-left">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-blue-600 font-bold text-xl mb-2">01. Rögzítés</div>
            <p className="text-sm text-slate-600">Írd le pontosan az eszköz adatait, sorozatszámát és meglévő esztétikai hibáit.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-blue-600 font-bold text-xl mb-2">02. Átadás & Aláírás</div>
            <p className="text-sm text-slate-600">Az átvevő digitálisan ellenőrzi és jóváhagyja a jegyzőkönyv feltételeit.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-blue-600 font-bold text-xl mb-2">03. Visszavétel</div>
            <p className="text-sm text-slate-600">Biztonságos lezárás az eszköz visszakerülésekor, nyomon követhető előzménnyel.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
