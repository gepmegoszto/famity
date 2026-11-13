'use client';
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* Fejléc */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-blue-600 tracking-tight">famity.hu</span>
          <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full">Biztonságos Kölcsönzés</span>
        </div>
        <div className="flex gap-3 items-center">
          {!loading && (
            <>
              {user ? (
                <Link href="/dashboard" className="text-sm font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition">
                  Vezérlőpult →
                </Link>
              ) : (
                <Link href="/auth" className="text-sm font-semibold px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition">
                  Bejelentkezés
                </Link>
              )}
            </>
          )}
        </div>
      </header>

      {/* Hero / Fő rész: Központi famity.hu felirat és szlogen */}
      <section className="max-w-5xl w-full mx-auto px-6 py-16 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-5xl sm:text-7xl font-black text-blue-600 tracking-tight">famity.hu</h2>
          <p className="text-lg sm:text-xl font-semibold text-slate-600 uppercase tracking-widest">Biztonságos Kölcsönzés</p>
        </div>

        <div className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mt-4">
          Digitális Átadás-Átvételi Jegyzőkönyv & Elszámolás
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Biztonságos eszközbérbeadás és <span className="text-blue-600">tiszta elszámolás</span> magánszemélyeknek.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Felejtsd el a papírozást, az elveszett cetliket és a felesleges vitákat! A <strong>famity.hu</strong> digitális platformján biztonságosan rögzítheted a bérbe adott tárgyakat, személyes adatokat, kauciókat és a visszavételi elszámolásokat.
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

      {/* Részletes Know-How és Működési Útmutató Szekció */}
      <section className="bg-white py-16 border-t border-slate-200 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full">Szakmai Tudástár & Működési Know-How</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Minden, amit a biztonságos eszközbérlésről tudni kell</h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              Átfogó útmutatónk bemutatja a platform mögött álló logikát, a jogi hátteret, valamint a legjobb gyakorlatokat bérbeadóknak és bérlőknek egyaránt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <span>📄</span> 1. A digitális jegyzőkönyv előnyei
              </h3>
              <p>
                A hagyományos kézzel írott papírok idejét múlták, mivel gyakran olvashatatlanok, elvesznek, vagy nem tartalmaznak elegendő részletet az eszköz pontos állapotáról. Ezzel szemben a famity.hu elektronikus rendszere pillanatok alatt generál hiteles dokumentumokat, amelyek megakadályozzák a későbbi vitákat. A bérbeadó pontosan rögzítheti a gép vagy szerszám sorozatszámát, esetleges külsérelmi nyomait, valamint meglévő tartozékait. A rendszerbe feltöltött fényképek megváltoztathatatlan bizonyítékként szolgálnak az átadás pillanatában. Mindkét fél biztonságban érezheti magát, mert a jogi felelősségvállalás határozottan lehatárolásra kerül. A digitalizáció felgyorsítja a folyamatokat, hiszen a feleknek nem kell fizikailag egyidejűleg papírokat aláírniuk az adatkérés és az online jóváhagyás révén.
              </p>
            </div>

            <div className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <span>💰</span> 2. Kauciókezelés és díjszámítás
              </h3>
              <p>
                A bérbeadás legkényesebb pontja szinte minden esetben a kaució és a bérleti díjak elszámolása a visszavételkor. A famity.hu ezen a területen maximális átláthatóságot biztosít a beépített kalkulátor és elszámolási modul révén. A bérbeadó a kölcsönzés indításakor rögzíti a kaució összegét, valamint a napi bérleti díjat. A rendszer a tervezett visszavételi dátum alapján automatikusan kiszámítja a teljes fizetendő bérleti díjat. Visszavételkor a bérbeadó nyilatkozik az eszköz sértetlenségéről, és ha bármilyen hiba vagy hiányosság merül fel, jogában áll a kaucióból részben vagy egészben összeget visszatartani. Minden egyes visszatartott összeghez kötelező részletes indoklást és bizonyító fényképet csatolni a teljes tisztaság érdekében.
              </p>
            </div>

            <div className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <span>🔒</span> 3. Adatvédelem és hitelesítés
              </h3>
              <p>
                A modern webes alkalmazások alapköve a szigorú adatvédelem és a felhasználók biztonsága. A famity.hu integrált fiókkezelése és Firebase alapú autentikációja garantálja, hogy illetéktelenek ne férhessenek hozzá a szenzitív dokumentumokhoz. A bérbeadók és a bérlők csak egymás jóváhagyásával tekinthetik meg a hivatalos személyes adataikat (személyi igazolvány száma, lakcím, anyja neve). Az adatkérési kérelem elküldése után a bérlő egyetlen kattintással engedélyezheti vagy elutasíthatja az adatok megosztását. Ez a kétlépcsős folyamat tökéletesen illeszkedik a hatályos adatvédelmi elvekhez, míg a digitális aláírások időbélyeggel igazolják az ügyletek hitelességét.
              </p>
            </div>

            <div className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <span>⚖️</span> 4. Jogi keretek és felelősségkizárás
              </h3>
              <p>
                Alapvető fontosságú annak a tisztázása, hogy a famity.hu miként pozicionálja magát a jogi viták terén. A platform kizárólag technikai, adattárolási és közvetítői infrastruktúrát biztosít a felhasználók számára. Az oldal üzemeltetője nem részes fele a bérleti szerződéseknek, és nem vállal anyagi felelősséget a kölcsönbe adott tárgyak esetleges károsodásáért vagy megsemmisüléséért. A Polgári Törvénykönyvről szóló 2013. évi V. törvény (Ptk.) előírásai szerint a felek közvetlen jogi viszonyban állnak. A platform szerepe abban merül ki, hogy vitás helyzetek vagy elszámolási viták esetén hiteles, időbélyeggel ellátott dokumentumokat és adatszolgáltatást nyújtson a hatóságok vagy bíróság felé.
              </p>
            </div>
          </div>

          {/* INTEGRÁLT: Teljes bérlési folyamat részletes vizuális lépései */}
          <div className="mt-16 pt-12 border-t border-slate-200 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full">Részletes Lépésről Lépésre Útmutató</span>
              <h3 className="text-2xl font-extrabold text-slate-900">A teljes bérlési és elszámolási folyamat áttekintése</h3>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                Így néz ki a kölcsönzés az első regisztrációtól egészen a lezárt archívumig.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-base">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-base">Regisztráció & Profil</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Email címmel történő fiókregisztráció, majd a hivatalos személyes adatok (név, lakcím, igazolványszám) kitöltése a profil menüpontban.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-base">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-base">Adatkérés & Hitelesítés</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A bérbeadó a bérlő email címe alapján adatkérést indít, amit a bérlő a vezérlőpultján egy kattintással engedélyez vagy elutasít.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-base">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-base">Jegyzőkönyv & Fotók</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Az eszköz adatainak, sorozatszámának, állapotának, fotóinak, valamint a bérleti díjnak és kauciónak a precíz rögzítése.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-base">
                  4
                </div>
                <h4 className="font-bold text-slate-900 text-base">Bérbeadói Aláírás</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A kaució átvételének megerősítése, jogi nyilatkozat elfogadása, majd a bérbeadói digitális aláírás rögzítése a jegyzőkönyvön.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-base">
                  5
                </div>
                <h4 className="font-bold text-slate-900 text-base">Bérlői Ellenőrzés & Aláírás</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A bérlő áttekinti a dokumentumot a vezérlőpulton, aláírja, amivel a kölcsönzés hivatalosan is **Aktív** státuszba lép.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-base">
                  6
                </div>
                <h4 className="font-bold text-slate-900 text-base">Aktív Bérlési Időszak</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Az eszköz használata a megadott visszavételi határidőig, a partneri adatok és a lejárat folyamatos követésével a rendszerben.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold text-base">
                  7
                </div>
                <h4 className="font-bold text-slate-900 text-base">Visszavétel & Elszámolás</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A bérbeadó rögzíti az állapotot, szükség esetén fényképez és kauciót tart vissza, majd a rendszer összesíti a pénzügyeket.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold text-base">
                  8
                </div>
                <h4 className="font-bold text-slate-900 text-base">Lezárás & Archívum</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A bérlő is aláírja a visszavételt, a státusz **Lezárva** lesz, az ügylet pedig bármikor kereshető a lezárt archívumban.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Egyetlen, tiszta lábléc dinamikus gombokkal */}
      <footer className="bg-slate-100 border-t border-slate-200 py-12">
        <div className="max-w-4xl w-full mx-auto px-6 text-center space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">⚖️ Átlátható jogi háttér és felelősség</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            A <strong>famity.hu</strong> kizárólag technikai, adattárolási és biztonságos közvetítői felületet biztosít a felek közötti megállapodásokhoz a Polgári Törvénykönyvről szóló 2013. évi V. törvény (Ptk.) keretei szerint. A platform nem vállal felelősséget a tárgyak állapotáért vagy a pénzügyi teljesítésekért, de vitás esetekben hiteles adatszolgáltatást nyújt.
          </p>
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
            <p>© 2026 famity.hu – Minden jog fenntartva.</p>
            <div className="flex gap-4 items-center">
              {!loading && (
                <>
                  {user ? (
                    <Link href="/dashboard" className="hover:underline font-semibold text-blue-600">Vezérlőpult</Link>
                  ) : (
                    <Link href="/auth" className="hover:underline font-semibold text-blue-600">Bejelentkezés</Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
