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

      {/* Hero / Fő rész: Kép helyett központi famity.hu felirat és szlogen */}
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
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full">Szakmai Tudástár & Működési Know-How</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Minden, amit a biztonságos eszközbérlésről tudni kell</h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              Átfogó útmutatónk bemutatja a platform mögött álló logikát, a jogi hátteret, valamint a legjobb gyakorlatokat bérbeadóknak és bérlőknek egyaránt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">1. A digitális jegyzőkönyv előnyei a hagyományos papírral szemben</h3>
              <p>
                A hagyományos kézzel írott papírok idejét múlták, mivel gyakran olvashatatlanok, elvesznek, vagy nem tartalmaznak elegendő részletet az eszköz pontos állapotáról. Ezzel szemben a famity.hu elektronikus rendszere pillanatok alatt generál hiteles dokumentumokat, amelyek megakadályozzák a későbbi vitákat. A bérbeadó pontosan rögzítheti a gép vagy szerszám sorozatszámát, esetleges külsérelmi nyomait, valamint meglévő tartozékait. A rendszerbe feltöltött fényképek megváltoztathatatlan bizonyítékként szolgálnak az átadás pillanatában. Mindkét fél biztonságban érezheti magát, mert a jogi felelősségvállalás határozottan lehatárolásra kerül. A digitalizáció felgyorsítja a folyamatokat, hiszen a feleknek nem kell fizikailag egyidejűleg papírokat aláírniuk az adatkérés és az online jóváhagyás révén. A dokumentumok bármikor visszakereshetők a rendszerben, így az archívum mindig áttekinthető marad. A bérleti díjak és a kauciók összegzése automatikusan kiszámításra kerül a megadott naptári napok alapján. Ezzel elkerülhetőek a számítási hibák és a félreértések a pénzügyi elszámolás során. A platform kialakítása kifejezetten a magánszemélyek közötti bizalom erősítését célozza meg modern eszközökkel.
              </p>
            </div>

            <div className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">2. Kauciókezelés, díjszámítás és pénzügyi átláthatóság</h3>
              <p>
                A bérbeadás legkényesebb pontja szinte minden esetben a kaució és a bérleti díjak elszámolása a visszavételkor. A famity.hu ezen a területen maximális átláthatóságot biztosít a beépített kalkulátor és elszámolási modul révén. A bérbeadó a kölcsönzés indításakor rögzíti a kaució összegét, valamint a napi bérleti díjat. A rendszer a tervezett visszavételi dátum alapján automatikusan kiszámítja a teljes fizetendő bérleti díjat. Visszavételkor a bérbeadó nyilatkozik az eszköz sértetlenségéről, és ha bármilyen hiba vagy hiányosság merül fel, jogában áll a kaucióból részben vagy egészben összeget visszatartani. Minden egyes visszatartott összeghez kötelező részletes indoklást és bizonyító fényképet csatolni. A bérlő ezután ellenőrzi az elszámolást, és a visszavételi aláírásával jóváhagyja azt. Így a pénzügyi tranzakciók nyomon követhetőek, és pontosan dokumentálva marad, hogy mennyi pénz járt vissza a bérlőnek. Ez a strukturált folyamat teljesen transzparenssé teszi a felek közötti pénzmozgásokat.
              </p>
            </div>

            <div className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">3. Adatvédelem, hitelesítés és a felek azonosítása</h3>
              <p>
                A modern webes alkalmazások alapköve a szigorú adatvédelem és a felhasználók biztonsága. A famity.hu integrált fiókkezelése és Firebase alapú autentikációja garantálja, hogy illetéktelenek ne férhessenek hozzá a szenzitív dokumentumokhoz. A bérbeadók és a bérlők csak egymás jóváhagyásával tekinthetik meg a hivatalos személyes adataikat (személyi igazolvány száma, lakcím, anyja neve). Az adatkérési kérelem elküldése után a bérlő egyetlen kattintással engedélyezheti vagy elutasíthatja az adatok megosztását. Ez a kétlépcsős folyamat tökéletesen illeszkedik a hatályos adatvédelmi elvekhez. A rendszerben rögzített adatok titkosított csatornákon utaznak, és biztonságos felhőalapú adatbázisban tárolódnak. A digitális aláírások időbélyeggel vannak ellátva, ami igazolja az aláírás pontos pillanatát. Ezzel megakadályozható, hogy bárki utólagosan meghamisítsa a megállapodásokat. A platform ezáltal megbízható digitális közegként funkcionál a mindennapi kölcsönzési ügyletek lebonyolításához.
              </p>
            </div>

            <div className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">4. Jogi keretek és a platform felelősségkizárása</h3>
              <p>
                Alapvető fontosságú annak a tisztázása, hogy a famity.hu miként pozicionálja magát a jogi viták terén. A platform kizárólag technikai, adattárolási és közvetítői infrastruktúrát biztosít a felhasználók számára. Az oldal üzemeltetője nem részes fele a bérleti szerződéseknek, és nem vállal anyagi felelősséget a kölcsönbe adott tárgyak esetleges károsodásáért, megsemmisüléséért vagy elenyészéséért. A Polgári Törvénykönyvről szóló 2013. évi V. törvény (Ptk.) előírásai szerint a bérbeadó és a bérlő közvetlen polgári jogi viszonyban állnak egymással. A platform szerepe abban merül ki, hogy vitás helyzetek, elszámolási viták vagy esetleges jogi eljárások esetén hiteles, időbélyeggel ellátott dokumentumokat és adatszolgáltatást nyújtson a hatóságok vagy a bíróság felé. A felhasználók a regisztrációval és a jegyzőkönyv aláírásával kifejezetten elfogadják ezen felelősségkizárási feltételeket. Ezzel a transzparens felépítéssel minden felelősség ott marad, ahová való: a szerződő felek saját döntéseinél és megegyezéseinél.
              </p>
            </div>
          </div>

          {/* RÉSZLETES BÉRLÉSI FOLYAMAT (MARADÉKTALANUL TELJES SZÖVEGGEL BEILLESZTVE A KNOW-HOW ALÁ) */}
          <div className="mt-12 pt-10 border-t border-slate-200 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">A bérlési és elszámolási folyamat részletes menete</h3>
            
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed bg-slate-50 p-8 rounded-3xl border border-slate-200">
              
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">1. Regisztráció és Profil Beállítás</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Regisztráció / Bejelentkezés:</strong> A felhasználók email címmel és jelszóval regisztrálhatnak, vagy bejelentkezhetnek a platformra.</li>
                  <li><strong>Személyes adatok rögzítése:</strong> A bérbeadónak és a bérlőnek is ki kell töltenie a profilját a hivatalos adataival (név, anyja neve, születési hely és idő, személyi igazolvány száma, telefonszám és teljes lakcím), amelyek a jegyzőkönyv alapját képezik.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-base">2. Adatkérés és Partner Hitelesítés</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Adatkérés küldése:</strong> Új bérlés indításakor a bérbeadó a bérlő email címe alapján adatkérési kérelmet indíthat.</li>
                  <li><strong>Jóváhagyás:</strong> A bérlő a vezérlőpultján értesítést kap, és egy kattintással engedélyezheti vagy elutasíthatja, hogy a bérbeadó hozzáférjen a hivatalos adataihoz.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-base">3. Jegyzőkönyv Létrehozása és Eszköz Rögzítése</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Eszköz adatok:</strong> A bérbeadó kitölti az eszköz megnevezését, gyártási/sorozatszámát, részletes állapotleírását (esetleges meglévő karcok, tartozékok), valamint legfeljebb 3 db fotót tölthet fel az átvételi állapotról.</li>
                  <li><strong>Bérleti feltételek és Díjak:</strong> Megadásra kerül a tervezett visszavételi dátum és időpont. Opcionálisan bérleti díj (napi díj alapján automatikus kalkulációval) és kaució is beállítható.</li>
                  <li><strong>Kaució átvétel megerősítése:</strong> Ha van kaució, a bérbeadónak kötelezően be kell pipálnia, hogy azt a bérlőtől átvette.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-base">4. Bérbeadói Aláírás és Indítás</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Felelősségi nyilatkozat elfogadása:</strong> A bérbeadó ellenőrzi az adatokat, és elfogadja a Ptk. szerinti jogi nyilatkozatot.</li>
                  <li><strong>Digitális aláírás:</strong> A bérbeadó a felületen rögzíti az aláírását, majd a jegyzőkönyv elindul, és átkerül a bérlőhöz aláírásra („Vár a bérlő aláírására” státusz).</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-base">5. Bérlői Ellenőrzés és Aláírás</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Jegyzőkönyv áttekintése:</strong> A bérlő a vezérlőpultján értesítést kap az aláírásra váró bérlésről, megtekintheti az eszköz adatait, a bérleti feltételeket és a bérbeadó adatait.</li>
                  <li><strong>Bérlői aláírás:</strong> A bérlő ellenőrzés után beírja/berajzolja az aláírását a digitális mezőbe, amivel a bérlés hivatalosan Aktív státuszba lép.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-base">6. Aktív Bérlési Időszak és Eszköz Használat</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Nyomon követés:</strong> A felek a vezérlőpulton keresztül bármikor ellenőrizhetik az aktív bérléseiket, a visszavételi határidőt, valamint a partner elérhetőségeit és adatait.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-base">7. Eszköz Visszavétele és Pénzügyi Elszámolás</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Állapotfelmérés:</strong> A bérlés végén a bérbeadó indítja a visszavételt, és nyilatkozik, hogy minden rendben volt-e, vagy rögzíti az esetleges sérüléseket/hibákat (fotó csatolási lehetőséggel).</li>
                  <li><strong>Kaució elszámolás:</strong> Díjköteles bérlésnél a bérbeadó dönthet a kaució teljes visszatérítéséről vagy részleges/teljes visszatartásáról (indoklással és összeg megadásával).</li>
                  <li><strong>Pénzügyi összesítő:</strong> A rendszer automatikusan összesíti a bérleti díjat, az átvett kauciót, a visszatartott összeget és a bérlőnek visszajáró kauciót.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-base">8. Kétoldalú Lezárás és Archívum</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Visszavételi aláírások:</strong> A bérbeadó rögzíti a visszavételi aláírását, majd a kérelem átkerül a bérlőhöz jóváhagyásra („Vár a bérlő visszavételi aláírására”).</li>
                  <li><strong>Végleges lezárás:</strong> A bérlő ellenőrzi a visszavételi jegyzőkönyvet és a pénzügyi elszámolást, majd rárajzolja a visszavételi aláírását. Ezzel a tranzakció státusza Lezárva lesz.</li>
                  <li><strong>Kereshető archívum:</strong> A lezárt ügyletek egy külön, kereshető és szűrhető felületen (név, eszköz, egyedi azonosító vagy szerepkör alapján) bármikor visszakereshetők jogi vagy elszámolási referenciaként.</li>
                </ul>
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
