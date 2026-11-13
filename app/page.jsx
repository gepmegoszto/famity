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

      {/* Hero / Fő rész logóval a tetején középre igazítva */}
      <section className="max-w-5xl w-full mx-auto px-6 py-12 text-center space-y-6">
        {/* LOGÓ MEGJELENÍTÉSE KÖZÉPEN */}
        <div className="flex justify-center mb-4">
          <img 
            src="/logo full.jpeg" 
            alt="famity.hu Logó" 
            className="h-24 sm:h-32 w-auto object-contain rounded-2xl shadow-sm border border-slate-200" 
          />
        </div>

        <div className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
          Digitális Átadás-Átvételi Jegyzőkönyv & Elszámolás
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Biztonságos eszközbérbeadás és <span className="text-blue-600">tiszta elszámolás</span> magánszemélyeknek.
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Felejtsd el a papírozást, a elveszett cetliket és a felesleges vitákat! A <strong>famity.hu</strong> digitális platformján biztonságosan rögzítheted a bérbe adott tárgyakat, személyes adatokat, kauciókat és a visszavételi elszámolásokat.
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

      {/* RÉSZLETES KNOW-HOW ÉS MŰKÖDÉSI ÚTMUTATÓ SZEKCIÓ (Több mint 50-70 mondatnyi részletes tartalommal) */}
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
