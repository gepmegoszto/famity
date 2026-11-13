'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* Fejléc */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-blue-600 tracking-tight">famity.hu</span>
          <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full">Biztonságos Kölcsönzés</span>
        </div>
        <div className="flex gap-3">
          <Link href="/auth" className="text-sm font-semibold px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition">
            Bejelentkezés
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition">
            Vezérlőpult →
          </Link>
        </div>
      </header>

      {/* Hero / Fő rész */}
      <section className="max-w-5xl w-full mx-auto px-6 py-12 text-center space-y-6">
        <div className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
          Digitális Átadás-Átvételi Jegyzőkönyv & Elszámolás
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Biztonságos eszközbérbeadás és <span className="text-blue-600">tiszta elszámolás</span> magánszemélyeknek.
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Felejtsd el a papírozást és a vitákat! A <strong>famity.hu</strong> digitális platformján biztonságosan rögzítheted a bérbe adott tárgyakat, személyes adatokat, kauciókat és a visszavételi elszámolásokat.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <Link href="/dashboard/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition text-base">
            + Új Kölcsönzés Indítása Most
          </Link>
          <Link href="/dashboard" className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold px-8 py-4 rounded-2xl transition text-base">
            Ugrás a Vezérlőpultra
          </Link>
        </div>
      </section>

      {/* Részletes Útmutató / Hogyan működik? */}
      <section className="max-w-6xl w-full mx-auto px-6 py-16 border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900">Hogyan működik a platform?</h2>
          <p className="text-slate-600 text-sm">
            Részletes útmutató a zökkenőmentes, átlátható és jogilag szabályozott kölcsönzési folyamathoz.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* 1. Lépés */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900">Profil és Adatkezelés</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Regisztráció után add meg a személyes adataidat (név, lakcím, személyi igazolvány száma, elérhetőségek). A rendszer ezeket biztonságosan kezeli, és adatkérés során hitelesíti a feleket.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t">
              <li>✓ Biztonságos adattárolás</li>
              <li>✓ Gyors partnerazonosítás</li>
            </ul>
          </div>

          {/* 2. Lépés */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900">Jegyzőkönyv és Aláírás</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Indíts új kölcsönzést az eszköz adataival, fotóival, bérleti díjával és kauciójával. A bérlő megkapja a kérelmet, majd a digitális felületen mindketten áttekintik és aláírják a dokumentumot.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t">
              <li>✓ Kaució átvétel megerősítése</li>
              <li>✓ Kétoldalú digitális aláírás</li>
            </ul>
          </div>

          {/* 3. Lépés */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900">Visszavétel és Lezárás</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A bérlés végén a bérbeadó rögzíti az állapotfelmérést, fényképelheti az esetleges hibákat, elszámolja a kauciót és a díjakat. Utolsó lépésként mindkét fél véglegesíti a lezárást.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t">
              <li>✓ Pénzügyi összegzés & kaució visszatérítés</li>
              <li>✓ Lezárt tranzakciók archívuma</li>
            </ul>
          </div>

        </div>
      </section>

      {/* Jogi és Felelősségvállalási Információ */}
      <section className="bg-slate-100 border-t border-slate-200 py-12">
        <div className="max-w-4xl w-full mx-auto px-6 text-center space-y-3">
          <h4 className="font-bold text-slate-800 text-sm">⚖️ Átlátható jogi háttér és felelősség</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            A <strong>famity.hu</strong> kizárólag technikai, adattárolási és biztonságos közvetítői felületet biztosít a felek közötti megállapodásokhoz a Polgári Törvénykönyvről szóló 2013. évi V. törvény (Ptk.) keretei szerint. A platform nem vállal felelősséget a tárgyak állapotáért vagy a pénzügyi teljesítésekért, de vitás esetekben hiteles adatszolgáltatást nyújt.
          </p>
        </div>
      </section>

      {/* Lábléc */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200">
        <p>© 2026 famity.hu – Minden jog fenntartva.</p>
        <div className="flex gap-4">
          <Link href="/dashboard" className="hover:underline">Vezérlőpult</Link>
          <Link href="/auth" className="hover:underline">Bejelentkezés</Link>
        </div>
      </footer>

    </div>
  );
}
