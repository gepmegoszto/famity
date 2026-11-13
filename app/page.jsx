'use client';
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal állapota a négy jogi/tájékoztató szekcióhoz
  const [activeModal, setActiveModal] = useState(null); // 'aszf' | 'adatvedelem' | 'cookie' | 'biztonsag' | null

  // Süti (cookie) elfogadás állapota
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Ellenőrizzük, hogy elfogadta-e már a sütiket
    const cookieAccepted = localStorage.getItem('famity_cookie_accepted');
    if (!cookieAccepted) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('famity_cookie_accepted', 'true');
    setShowCookieBanner(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative selection:bg-blue-600 selection:text-white">
      
      {/* Modern Fejléc */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
            F
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 tracking-tight">famity.hu</span>
            <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest">Biztonságos Kölcsönzés</span>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          {!loading && (
            <>
              {user ? (
                <Link href="/dashboard" className="text-sm font-semibold px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition flex items-center gap-2">
                  <span>Vezérlőpult</span>
                  <span>→</span>
                </Link>
              ) : (
                <Link href="/auth" className="text-sm font-semibold px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition">
                  Bejelentkezés
                </Link>
              )}
            </>
          )}
        </div>
      </header>

      {/* Hero / Fő rész */}
      <section className="max-w-5xl w-full mx-auto px-6 py-16 sm:py-24 text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight">
            famity<span className="text-blue-600">.hu</span>
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-500 uppercase tracking-widest">
            Digitális Átadás-Átvételi Jegyzőkönyv & Pénzügyi Elszámolás
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Biztonságos eszközbérbeadás és <span className="text-blue-600">tiszta elszámolás</span> magánszemélyeknek.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Felejtsd el a papírozást, az elveszett cetliket és a felesleges vitákat! Rögzítsd biztonságosan a bérbe adott tárgyakat, személyes adatokat, kauciókat és visszavételi elszámolásokat egy helyen.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <Link href="/dashboard/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition text-base flex items-center gap-2">
            <span>+ Új Kölcsönzés Indítása</span>
          </Link>
          <Link href="/dashboard" className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl transition text-base shadow-sm">
            Ugrás a Vezérlőpultra
          </Link>
        </div>
      </section>

      {/* Interaktív / Áttekinthető Főfunkciók */}
      <section className="max-w-6xl w-full mx-auto px-6 py-16 border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full">Egyszerű folyamat</span>
          <h2 className="text-3xl font-extrabold text-slate-900">Hogyan működik a platform?</h2>
          <p className="text-slate-600 text-sm">
            Három egyszerű lépés a tökéletes jogi és pénzügyi biztonságért.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900">Profil & Adatkezelés</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Add meg a hivatalos személyes adataidat. Adatkérés során a partnerek biztonságosan, kétlépcsős jóváhagyással férhetnek hozzá a szükséges információkhoz.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900">Jegyzőkönyv & Aláírás</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Rögzítsd az eszközt, állapotot, kauciót és bérleti díjat. Mindkét fél digitális aláírással hitelesíti a dokumentumot az átvétel pillanatában.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900">Visszavétel & Lezárás</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A bérlés végén állapotfelmérés, kaució-elszámolás és kétoldalú lezárás történik. Minden tranzakció kereshetően archiválásra kerül.
            </p>
          </div>
        </div>
      </section>

      {/* Részletes Tudástár & Know-How (MARADÉKTALANUL TELJES TARTALOMMAL) */}
      <section className="bg-white py-16 border-t border-slate-200 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full">Szakmai Tudástár & Know-How</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Minden, amit a biztonságos eszközbérlésről tudni kell</h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              A rendszer mögött álló jogi, technológiai háttér és a teljes részletességű bérlési folyamat.
            </p>
          </div>

          {/* RÉSZLETES BÉRLÉSI FOLYAMAT (MARADÉKTALANUL TELJES SZÖVEGGEL) */}
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-2xl font-black text-slate-900">A bérlési és elszámolási folyamat részletes útmutatója</h3>
              <p className="text-sm text-slate-600">Lépésről lépésre a regisztrációtól a lezárt archívumig.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* 1. pont */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">1</span>
                  <h4 className="font-bold text-slate-900 text-base">Regisztráció és Profil Beállítás</h4>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 pl-2">
                  <li className="leading-relaxed"><strong>Regisztráció / Bejelentkezés:</strong> A felhasználók email címmel és jelszóval regisztrálhatnak, vagy bejelentkezhetnek a platformra.</li>
                  <li className="leading-relaxed"><strong>Személyes adatok rögzítése:</strong> A bérbeadónak és a bérlőnek is ki kell töltenie a profilját a hivatalos adataival (név, anyja neve, születési hely és idő, személyi igazolvány száma, telefonszám és teljes lakcím), amelyek a jegyzőkönyv alapját képezik.</li>
                </ul>
              </div>

              {/* 2. pont */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">2</span>
                  <h4 className="font-bold text-slate-900 text-base">Adatkérés és Partner Hitelesítés</h4>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 pl-2">
                  <li className="leading-relaxed"><strong>Adatkérés küldése:</strong> Új bérlés indításakor a bérbeadó a bérlő email címe alapján adatkérési kérelmet indíthat.</li>
                  <li className="leading-relaxed"><strong>Jóváhagyás:</strong> A bérlő a vezérlőpultján értesítést kap, és egy kattintással engedélyezheti vagy elutasíthatja, hogy a bérbeadó hozzáférjen a hivatalos adataihoz.</li>
                </ul>
              </div>

              {/* 3. pont */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">3</span>
                  <h4 className="font-bold text-slate-900 text-base">Jegyzőkönyv Létrehozása és Eszköz Rögzítése</h4>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 pl-2">
                  <li className="leading-relaxed"><strong>Eszköz adatok:</strong> A bérbeadó kitölti az eszköz megnevezését, gyártási/sorozatszámát, részletes állapotleírását (esetleges meglévő karcok, tartozékok), valamint legfeljebb 3 db fotót tölthet fel az átvételi állapotról.</li>
                  <li className="leading-relaxed"><strong>Bérleti feltételek és Díjak:</strong> Megadásra kerül a tervezett visszavételi dátum és időpont. Opcionálisan bérleti díj (napi díj alapján automatikus kalkulációval) és kaució is beállítható.</li>
                  <li className="leading-relaxed"><strong>Kaució átvétel megerősítése:</strong> Ha van kaució, a bérbeadónak kötelezően be kell pipálnia, hogy azt a bérlőtől átvette.</li>
                </ul>
              </div>

              {/* 4. pont */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">4</span>
                  <h4 className="font-bold text-slate-900 text-base">Bérbeadói Aláírás és Indítás</h4>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 pl-2">
                  <li className="leading-relaxed"><strong>Felelősségi nyilatkozat elfogadása:</strong> A bérbeadó ellenőrzi az adatokat, és elfogadja a Ptk. szerinti jogi nyilatkozatot.</li>
                  <li className="leading-relaxed"><strong>Digitális aláírás:</strong> A bérbeadó a felületen rögzíti az aláírását, majd a jegyzőkönyv elindul, és átkerül a bérlőhöz aláírásra („Vár a bérlő aláírására” státusz).</li>
                </ul>
              </div>

              {/* 5. pont */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">5</span>
                  <h4 className="font-bold text-slate-900 text-base">Bérlői Ellenőrzés és Aláírás</h4>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 pl-2">
                  <li className="leading-relaxed"><strong>Jegyzőkönyv áttekintése:</strong> A bérlő a vezérlőpultján értesítést kap az aláírásra váró bérlésről, megtekintheti az eszköz adatait, a bérleti feltételeket és a bérbeadó adatait.</li>
                  <li className="leading-relaxed"><strong>Bérlői aláírás:</strong> A bérlő ellenőrzés után beírja/berajzolja az aláírását a digitális mezőbe, amivel a bérlés hivatalosan Aktív státuszba lép.</li>
                </ul>
              </div>

              {/* 6. pont */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">6</span>
                  <h4 className="font-bold text-slate-900 text-base">Aktív Bérlési Időszak és Eszköz Használat</h4>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 pl-2">
                  <li className="leading-relaxed"><strong>Nyomon követés:</strong> A felek a vezérlőpulton keresztül bármikor ellenőrizhetik az aktív bérléseiket, a visszavételi határidőt, valamint a partner elérhetőségeit és adatait.</li>
                </ul>
              </div>

              {/* 7. pont */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">7</span>
                  <h4 className="font-bold text-slate-900 text-base">Eszköz Visszavétele és Pénzügyi Elszámolás</h4>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 pl-2">
                  <li className="leading-relaxed"><strong>Állapotfelmérés:</strong> A bérlés végén a bérbeadó indítja a visszavételt, és nyilatkozik, hogy minden rendben volt-e, vagy rögzíti az esetleges sérüléseket/hibákat (fotó csatolási lehetőséggel).</li>
                  <li className="leading-relaxed"><strong>Kaució elszámolás:</strong> Díjköteles bérlésnél a bérbeadó dönthet a kaució teljes visszatérítéséről vagy részleges/teljes visszatartásáról (indoklással és összeg megadásával).</li>
                  <li className="leading-relaxed"><strong>Pénzügyi összesítő:</strong> A rendszer automatikusan összesíti a bérleti díjat, az átvett kauciót, a visszatartott összeget és a bérlőnek visszajáró kauciót.</li>
                </ul>
              </div>

              {/* 8. pont */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">8</span>
                  <h4 className="font-bold text-slate-900 text-base">Kétoldalú Lezárás és Archívum</h4>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 pl-2">
                  <li className="leading-relaxed"><strong>Visszavételi aláírások:</strong> A bérbeadó rögzíti a visszavételi aláírását, majd a kérelem átkerül a bérlőhöz jóváhagyásra („Vár a bérlő visszavételi aláírására”).</li>
                  <li className="leading-relaxed"><strong>Végleges lezárás:</strong> A bérlő ellenőrzi a visszavételi jegyzőkönyvet és a pénzügyi elszámolást, majd rárajzolja a visszavételi aláírását. Ezzel a tranzakció státusza Lezárva lesz.</li>
                  <li className="leading-relaxed"><strong>Kereshető archívum:</strong> A lezárt ügyletek egy külön, kereshető és szűrhető felületen (név, eszköz, egyedi azonosító vagy szerepkör alapján) bármikor visszakereshetők jogi vagy elszámolási referenciaként.</li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Lábléc a négy jogi linkkel és modális triggerrel */}
      <footer className="bg-slate-100 border-t border-slate-200 py-12">
        <div className="max-w-4xl w-full mx-auto px-6 text-center space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">⚖️ Átlátható jogi háttér és felelősség</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            A <strong>famity.hu</strong> kizárólag technikai, adattárolási és biztonságos közvetítői felületet biztosít a felek közötti megállapodásokhoz a Polgári Törvénykönyvről szóló 2013. évi V. törvény (Ptk.) keretei szerint. A platform nem vállal felelősséget a tárgyak állapotáért vagy a pénzügyi teljesítésekért, de vitás esetekben hiteles adatszolgáltatást nyújt.
          </p>

          {/* Négy jogi hivatkozás / gomb a modalok megnyitásához */}
          <div className="flex flex-wrap justify-center gap-6 pt-2 text-xs font-semibold text-blue-600">
            <button onClick={() => setActiveModal('aszf')} className="hover:underline">ÁSZF</button>
            <button onClick={() => setActiveModal('adatvedelem')} className="hover:underline">Adatvédelem</button>
            <button onClick={() => setActiveModal('cookie')} className="hover:underline">Cookie szabályzat</button>
            <button onClick={() => setActiveModal('biztonsag')} className="hover:underline">Biztonsági instrukciók</button>
          </div>

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

      {/* ========================================================= */}
      {/* RÉSZLETES MODÁLIS ABLAKOK MIND A NÉGY SZEKCIÓHOZ */}
      {/* ========================================================= */}

      {/* 1. ÁSZF MODAL */}
      {activeModal === 'aszf' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">Általános Szerződési Feltételek (ÁSZF)</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xl px-2">✕</button>
            </div>
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p><strong>1. Bevezető rendelkezések:</strong> A famity.hu weboldal (továbbiakban: Szolgáltató) által nyújtott digitális közvetítői szolgáltatások igénybevételével a Felhasználó elfogadja az alábbi feltételeket.</p>
              <p><strong>2. A Szolgáltatás tárgya:</strong> A platform magánszemélyek közötti ingó eszközbérbeadási folyamatok, digitális átadás-átvételi jegyzőkönyvek, kauciókezelési és pénzügyi elszámolási adatok rögzítésére szolgáló technikai felület.</p>
              <p><strong>3. Szerződő felek:</strong> A bérleti szerződést kizárólag a Bérbeadó és a Bérlő köti meg egymással a Polgári Törvénykönyvről szóló 2013. évi V. törvény (Ptk.) alapján. A Szolgáltató nem részes fele ezen megállapodásoknak.</p>
              <p><strong>4. Felelősségkorlátozás:</strong> A Szolgáltató semmilyen polgári jogi vagy anyagi felelősséget nem vállal a kölcsönbe adott tárgyak állapotáért, esetleges károsodásáért, megsemmisüléséért, illetve a bérleti díjak és kauciók elmaradásáért.</p>
              <p><strong>5. Adatszolgáltatás vitás esetben:</strong> Hivatalos hatósági vagy bírósági megkeresés esetén a Szolgáltató a rendszerben rögzített időbélyeggel ellátott jegyzőkönyveket és hiteles adatokat adatszolgáltatásként bocsáthatja rendelkezésre.</p>
            </div>
            <div className="pt-4 border-t flex justify-end">
              <button onClick={() => setActiveModal(null)} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow">Bezárás</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADATVÉDELEM MODAL */}
      {activeModal === 'adatvedelem' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">Adatvédelmi Tájékoztató (GDPR)</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xl px-2">✕</button>
            </div>
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p><strong>1. Adatkezelő adatai:</strong> A famity.hu platform üzemeltetője elkötelezett a felhasználók személyes adatainak védelme mellett. Az adatkezelés a hatályos adatvédelmi jogszabályok (GDPR) szerint történik.</p>
              <p><strong>2. Kezelt adatok köre:</strong> A regisztráció és a bérlési jegyzőkönyvek kitöltése során az alábbi adatok kerülnek rögzítésre: név, email cím, telefonszám, anyja neve, születési hely és idő, személyi igazolvány száma, valamint lakcím.</p>
              <p><strong>3. Az adatkezelés célja:</strong> A személyes adatok kezelésének kizárólagos célja a felek közötti hiteles bérleti szerződések és átadás-átvételi jegyzőkönyvek technikai generálása, valamint a partnerazonosítás.</p>
              <p><strong>4. Adatbiztonság és hozzáférés:</strong> Az adatok tárolása biztonságos felhőalapú adatbázisban (Firebase) történik titkosított csatornákon. A szenzitív személyes adatokat a partnerek kizárólag kölcsönös adatkérési jóváhagyással tekinthetik meg.</p>
              <p><strong>5. Felhasználói jogok:</strong> A felhasználó bármikor kérheti adatainak módosítását, törlését, vagy tájékoztatást kérhet azok kezeléséről a rendszeren belül vagy az üzemeltető felé.</p>
            </div>
            <div className="pt-4 border-t flex justify-end">
              <button onClick={() => setActiveModal(null)} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow">Bezárás</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. COOKIE SZABÁLYZAT MODAL */}
      {activeModal === 'cookie' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">Cookie (Süti) Szabályzat</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xl px-2">✕</button>
            </div>
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p><strong>1. Mik azok a sütik?</strong> A cookie-k kis méretű szöveges fájlok, amelyeket a weboldal helyez el a felhasználó számítógépén vagy mobileszközén a böngészés során.</p>
              <p><strong>2. Milyen sütiket használunk?</strong> A famity.hu kizárólag alapvető működést biztosító (munkamenet / session) sütiket, valamint a bejelentkezési állapot fenntartásához szükséges hitelesítési tokeneket használ.</p>
              <p><strong>3. Harmadik fél sütijei:</strong> Esetlegesen analitikai vagy hirdetési partnerek (pl. Google AdSense) sütijei is bekerülhetnek a felületre a hirdetések és a felhasználói élmény optimalizálása céljából.</p>
              <p><strong>4. Sütik kezelése és tiltása:</strong> A böngésző beállításaiban bármikor letilthatja vagy törölheti a sütiket, azonban ez befolyásolhatja a weboldal egyes funkcióinak (pl. bejelentkezés) működését.</p>
            </div>
            <div className="pt-4 border-t flex justify-end">
              <button onClick={() => setActiveModal(null)} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow">Bezárás</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. BIZTONSÁGI INSTRUKCIÓK MODAL */}
      {activeModal === 'biztonsag' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">Biztonsági Instrukciók</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xl px-2">✕</button>
            </div>
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p><strong>1. Személyes adatok védelme:</strong> Soha ne adja meg jelszavát illetékteleneknek. A platformon belüli adatkéréseket mindig ellenőrizze, mielőtt jóváhagyná.</p>
              <p><strong>2. Eszközök átvételekor:</strong> Mindig alaposan vizsgálja meg a kölcsönbe adott vagy vett tárgyat, ellenőrizze a sorozatszámot, és töltsön fel részletes fényképeket az átvételi állapotról.</p>
              <p><strong>3. Kaució és pénzügyi elszámolás:</strong> Kauciót kizárólag akkor pipáljon be átvettként, ha az összeg fizikai készpénzben vagy igazoltan átutalásra került. Visszavételkor pontosan rögzítse az esetleges hibákat.</p>
              <p><strong>4. Digitális hitelesítés:</strong> Az aláírásokat mindkét fél saját felelősségére rögzíti. A rendszer időbélyeggel rögzíti a tranzakciókat a későbbi viták elkerülése végett.</p>
            </div>
            <div className="pt-4 border-t flex justify-end">
              <button onClick={() => setActiveModal(null)} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow">Bezárás</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SÜTI (COOKIE) FELUGRÓ ABLAK AZ ELSŐ BETÖLTÉSKOR */}
      {/* ========================================================= */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 text-white p-4 sm:p-6 shadow-2xl z-50 backdrop-blur-md border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="max-w-4xl text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              🍪 A <strong>famity.hu</strong> sütiket (cookie-kat) használ a felhasználói élmény fokozása, a biztonságos bejelentkezés és a statisztikák biztosítása érdekében. A weboldal használatával ön elfogadja a sütik használatát. További részletek a <button onClick={() => setActiveModal('cookie')} className="underline font-semibold text-blue-400">Cookie szabályzatunkban</button> olvashatók.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={handleAcceptCookies} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl shadow transition"
            >
              Elfogadom
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
