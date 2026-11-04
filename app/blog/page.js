'use client';
import { useState } from 'react';
import Link from 'next/link';
import PrivacyModal from '@/components/PrivacyModal';
import CookieBanner from '@/components/CookieBanner';
import { 
  Calendar, 
  ShoppingBag, 
  Utensils, 
  Award, 
  ArrowRight,
  ShieldCheck,
  Mail,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  Home,
  Heart,
  Sparkles,
  Check
} from 'lucide-react';

export default function BlogPage() {
  const [activeArticle, setActiveArticle] = useState(0);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const articles = [
    {
      id: 0,
      title: "Hogyan szervezzük meg a család heti menüjét stressz nélkül? – A tudatos háztartás és étkezéstervezés teljes útmutatója",
      category: "Étkezés & Háztartás",
      readTime: "8 perces olvasmány",
      date: "2026. november",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
      intro: "A modern családok mindennapjaiban a főzés és az ahhoz kapcsolódó logisztika gyakran okoz fejfájást. Mit együnk ma? Mi hiányzik a hűtőből? Hogyan spórolhatunk időt és pénzt? Ebben a részletes útmutatóban bemutatjuk a heti menütervezés mesterfogásait.",
      content: [
        "A mindennapi főzés megtervezése az egyik legfontosabb lépés ahhoz, hogy béke és rend uralkodjon a konyhában, valamint hogy elkerüljük az utolsó pillanatban történő kapkodást és a rendelt ételek magas költségeit.",
        "Sokan úgy gondolják, hogy a menütervezés merevvé teszi a hétköznapokat, pedig a valóságban ez pont az ellentéte: szabadságot és kiszámíthatóságot ad.",
        "Amikor előre tudjuk, hogy a héten milyen ételek fognak készülni, a bevásárlás is sokkal fókuszáltabbá válik, és nem veszünk meg felesleges alapanyagokat, amelyek aztán a kukában végzik.",
        "Az első és legfontosabb lépés a családtagok ízlésének és igényeinek felmérése. Érdemes összeírni egy listát azokról az ételekről, amelyeket mindenki szeret, és amelyek gyorsan, hatékonyan elkészíthetők.",
        "A hétköznapokra érdemes az egyszerűbb, 20-30 perc alatt összedobható fogásokat választani, míg a ráérősebb hétvégéken beleférnek az időigényesebb, különlegesebb receptek is.",
        "A famity.hu heti menütervező modulja pontosan ebben nyújt hatalmas segítséget: egyetlen közös felületen rögzíthető az ebéd és a vacsora minden egyes napra.",
        "Anya vagy apa beírja a tervezett fogásokat, a rendszer pedig azonnal mutatja azokat az egész család számára, így senkit nem ér meglepetés hazaérkezéskor.",
        "Sőt, a kiválasztott receptekhez tartozó hiányzó alapanyagok egyetlen gombnyomással átemelhetők a közös bevásárlólistára, így semmi sem marad ki a boltban.",
        "A tudatos étkezéstervezés gazdasági előnyei is lenyűgözőek: kutatások bizonyítják, hogy a heti menüvel dolgozó háztartások akár 20-30%-ot is megspórolnak az élelmiszer-költségeken.",
        "Nem kell többé naponta a szupermarket sorai között bolyongani azon töprengve, hogy vajon mit is kellene főzni ma este.",
        "A pazarlás drasztikusan csökken, mivel pontosan annyi zöldséget, húst és tejterméket vásárolunk, amennyire az előre megírt receptek alapján szükség van.",
        "A gyermekek emésztésére és egészségére is jó hatással van a rendszeresség: ha tudják, mi várható, a válogatósság is könnyebben kezelhetővé válik.",
        "A közös tervezésbe érdemes bevonni a gyerekeket is: a hétvégi reggelinél ki lehet választani 1-2 kedvenc ételt a következő hétre.",
        "Ez nemcsak pedagógiai szempontból kiváló (fejleszti a felelősségérzetet), hanem garantálja azt is, hogy az elkészült étel jó étvággyal elfogyasztásra kerül.",
        "A konyhai higiénia és a hűtőszekrény rendszerezése is szorosan összefügg a menütervezéssel: ha látjuk a heti lebontást, a hűtőben lévő alapanyagok lejárati idejét is könnyebben tudjuk kezelni.",
        "A megmaradt ételeket (maradékmentés) be lehet tervezni a következő napra ebédre, így semmi sem vész kárba.",
        "A famity.hu ebben a szellemben lett kialakítva: nem csupán egy naptár, hanem egy komplex életmód- és háztartásszervező ökoszisztéma.",
        "Próbáljátok ki már ezen a héten: írjátok össze a kedvenc ételeiteket, rögzítsétek a rendszerben, és figyeljétek meg, mennyi stressz oldódik fel a családi életetekben.",
        "A béke a konyhában kezdődik, és a közös étkezések örömével tölti meg az otthonokat."
      ]
    },
    {
      id: 1,
      title: "A közös családi naptár előnyei: Így ne felejtsetek el semmit a felgyorsult világban",
      category: "Szervezés & Időgazdálkodás",
      readTime: "10 perces olvasmány",
      date: "2026. november",
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80",
      intro: "Az iskolai szünetek, orvosi időpontok, különórák, szülinapok és munkahelyi határidők hálójában könnyű elveszni. Egy központosított családi naptár visszahozza a kontrollt a mindennapokba.",
      content: [
        "A mai felgyorsult világban a családok logisztikai kihívásai egy kisváros irányításával érnek fel.",
        "Anya viszi a gyereket zongorára, apa az edzésre hozza-vissza a fiút, közben a nagymama orvoshoz megy, és még a közös hétvégi bevásárlást is be kell szorítani a naptárba.",
        "Ha ezeket az információkat különálló papírfecniken, hűtőre ragasztott post-itekben vagy szétszórott chat-üzenetekben tároljuk, a káosz elkerülhetetlen.",
        "A papíron alapuló vagy elszigetelt naptárak legnagyobb hibája, hogy nem szinkronizálódnak valós időben a család többi tagjával.",
        "Ekkor lép színre a digitális, közös családi naptár, amely minden családtag zsebében ott lapul a mobiltelefonján.",
        "A famity.hu naptár modulját pontosan erre a kihívásra terveztük: egyetlen tisztán áttekinthető felületen látszódik minden program, színkódokkal elválasztva.",
        "Minden családtag saját színt kap (pl. Anya rózsaszín, Apa kék, Gyerekek zöld), így egyetlen pillantás alatt leolvasható, hogy ki hol tartózkodik éppen.",
        "Az adminisztrátorok ráadásul külön 'csak admin' bejegyzéseket is létrehozhatnak, amelyek a háttérben zajló szervezési feladatokat vagy meglepetés programokat is titokban tartják.",
        "A valós idejű értesítéseknek köszönhetően, ha valami megváltozik – például elmarad az edzés –, azonnal frissül mindenki képernyője.",
        "Ez a fajta átláthatóság drasztikusan csökkenti a családon belüli félreértéseket és vitákat ('De hát mondtam, hogy ma nem érek rá!').",
        "A nagyszülők bevonása is rendkívül egyszerűvé válik: a Mama vagy a Papa is bármikor ránézhet a telefonján, hogy mikor van unokázós délután vagy mikor kell segíteni az oviból való elhozatalban.",
        "Az időgazdálkodás nemcsak a felnőttek kiváltsága: a nagyobb gyerekeket is bevonhatjuk a naptár kezelésébe, ezzel tanítva őket a pontosságra és a tervezésre.",
        "A hosszú távú tervezés (nyaralások, ünnepi előkészületek, családi találkozók) szintén hónapokkal előre láthatóvá válik.",
        "Nem kell többé az utolsó pillanatban kapkodni, hogy mégsem szabad a szállás vagy elfelejtettük az évfordulót.",
        "A famity.hu biztonságos szerverein tárolt adatok zártak, így a családi magánélet bizalmassága 100%-osan garantált.",
        "A stresszmentes hétköznapok alapköve a kiszámíthatóság, amelyhez egy modern, intuitív naptár elengedhetetlen eszköz.",
        "Próbáljátok ki, milyen az, amikor a család minden tagja ugyanazt az oldalt látja és ugyanúgy ütemezi a napjait."
      ]
    },
    {
      id: 2,
      title: "Házimunka gyerekeknek: Hogyan tegyük játékká a teendőket pontgyűjtéssel?",
      category: "Nevelés & Motiváció",
      readTime: "9 perces olvasmány",
      date: "2026. november",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
      intro: "A szobák pakolása, a terítés vagy a kisállat etetése gyakran konok ellenállásba ütközik. Megmutatjuk, hogyan alakítható át a házimunka izgalmas kihívássá és jutalmazójátékká.",
      content: [
        "A gyermeknevelés egyik legnehezebb területe a kötelességtudat kialakítása és a házimunkákban való aktív részvétel ösztönzése.",
        "A 'Pakold el a játékokat!' vagy 'Szedd össze a ruháidat!' felszólítások gyakran hosszas vitákba, duzzogásba vagy ellenállásba torkollnak.",
        "A modern pszichológia és pedagógia azonban egyetért abban, hogy a büntetésen alapuló kényszerítés helyett a pozitív megerősítés és a gamifikáció (játékosítás) hozza a legjobb eredményeket.",
        "Amikor a házimunka nem teherként, hanem pontgyűjtő játékként jelenik meg, a gyerekek teljesen más hozzáállással fognak viszonyulni a feladatokhoz.",
        "A famity.hu házimunka és pontgyűjtő modulja pontosan ezen az elven alapul: minden elvégzett feladatért (pl. szobapakolás, mosogatógép kipakolása, leckeírás) pontok járnak.",
        "A gyerekek saját profiljukban látják a nyitott feladatokat, határidőkkel és a hozzájuk rendelt pontértékekkel.",
        "Amikor egy feladatot elvégeznek, bejelölhetik azt, a rendszer pedig jóváírja a pontokat a virtuális egyenlegükön.",
        "A gyűjtött pontokat aztán előre megbeszélt családi jutalmakra lehet beváltani – például közös fagyizás, extra mozizás, vagy egy áhított társasjáték.",
        "Ez a módszer megtanítja a gyerekeket a pénz és a munka értékére, valamint arra, hogy a szorgalomnak megvan a kézzelfogható gyümölcse.",
        "A szülők számára is hatalmas könnyebbség: nem kell naponta tucatszor ismételgetni ugyanazt a kérést, a rendszer maga vezeti a folyamatot.",
        "A felelősségvállalás fokozatosan alakul ki: a kisebbek egyszerűbb feladatokat kapnak, míg a nagyobbak komplexebb háztartási teendőket.",
        "A sikerélmény, amit a pontok gyűjtése ad, önbizalommal tölti el a gyermeket, és büszkeséggel veszi tudomásul, hogy ő is fontos tagja a családi csapatnak.",
        "A közös megegyezésen alapuló jutalmak ráadásul összehozzák a családot, hiszen a célok elérése közös ünnepléssé válik.",
        "A famity.hu ezen funkciója kifejezetten arra törekszik, hogy ne csak rend legyen a lakásban, hanem öröm és együttműködés is a kapcsolatokban.",
        "Próbáljátok ki: határozzátok meg az első heti feladatokat és a hozzá tartozó jutalmakat, majd indítsátok el a családi pontversenyt."
      ]
    },
    {
      id: 3,
      title: "Biztonság és adatok védelme a digitális családi pultban: Mit érdemes tudni?",
      category: "Adatvédelem & Biztonság",
      readTime: "7 perces olvasmány",
      date: "2026. november",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      intro: "A családi élet legintimebb pillanatai, naptárai és listái soha nem kerülhetnek illetéktelen kezekbe. Ismerjétek meg a famity.hu szigorú biztonsági protokolljait.",
      content: [
        "Amikor digitális eszközökre bízzuk a magánéletünket, a naptárunkat és a családi üzeneteinket, a legelső és legfontosabb kérdés a biztonság.",
        "Kinek a kezébe kerülnek az adataink? Láthatják-e idegenek a gyermekink programjait vagy a bevásárlólistánkat?",
        "A famity.hu fejlesztése során az első számú prioritás a maximális adatvédelem és a zéró tolerancia volt mindenféle adatszivárgással szemben.",
        "A platformunk a legkorszerűbb európai felhőalapú infrastruktúrán (Firebase) fut, ahol minden adatátvitel erős SSL/TLS titkosítással védett.",
        "A családi adatok teljesen zártak: nincs nyilvános keresőindexelés, nincsenek külső profilok.",
        "Egy családi fiókhoz kizárólag a titkos, egyedi meghívókóddal lehet csatlakozni, amit csak a családtagok ismernek.",
        "Soha nem értékesítjük és nem adjuk át a családi adatokat semmilyen harmadik félnek vagy hirdetőnek.",
        "A hirdetési modellünk (amennyiben az ingyenes verziót választjátok) szigorúan el van különítve a privát adattárolástól, és a prémium csomaggal pedig teljesen el is tüntethető.",
        "A felhasználók teljes körű kontrollal rendelkeznek: bármikor lekérték, exportálhatják vagy egyetlen gombnyomással véglegesen törölhetik a teljes családi fiókot és az összes előzményt.",
        "A digitális biztonság nem luxus, hanem alapvető emberi jog – különösen, ha a saját családunkról van szó.",
        "Biztos lehetsz benne, hogy a famity.hu-n rögzített emlékek, naptárak és üzenetek szigorúan csak a tiétek maradnak.",
        "Építsetek egy biztonságos, modern digitális otthont, ahol a nyugalom és a technológia tökéletes harmóniában él egymással."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Fejléc */}
      <header className="sticky top-0 z-40 bg-[#FAF8F4]/90 backdrop-blur-md border-b border-amber-900/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5">
              <img 
                src="/icon.png" 
                alt="famity.hu" 
                className="h-9 w-9 object-contain rounded-xl shadow-sm" 
              />
              <span className="text-xl font-black tracking-tight text-slate-900">famity<span className="text-blue-600">.hu</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/" 
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition rounded-xl hover:bg-white/60 flex items-center gap-1.5"
            >
              <Home className="w-4 h-4" /> Főoldal
            </Link>
            <Link 
              href="/login?mode=register" 
              className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-blue-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Kipróbálom
            </Link>
          </div>
        </div>
      </header>

      {/* Fő tartalom */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20 w-full space-y-12">
        
        {/* Blog Fejléc */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-extrabold border border-blue-100 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Családi Tudástár & Blog
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Szakmai cikkek a harmonikusabb <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600">
              mindennapokért
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
            Merülj el részletes útmutatóinkban, amelyek segítenek hatékonyabban szervezni az otthoni teendőket, a menüt és a családi logisztikát.
          </p>
        </div>

        {/* Cikk választó gombok / kártyák */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {articles.map((art) => (
            <button
              key={art.id}
              onClick={() => setActiveArticle(art.id)}
              className={`p-4 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between gap-3 ${activeArticle === art.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 scale-[1.02]' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm'}`}
            >
              <div className="space-y-1.5">
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${activeArticle === art.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                  {art.category}
                </span>
                <h3 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug">{art.title}</h3>
              </div>
              <div className={`flex items-center justify-between text-[11px] font-medium pt-2 border-t ${activeArticle === art.id ? 'border-blue-500/40 text-blue-100' : 'border-slate-100 text-slate-400'}`}>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {art.readTime}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        {/* Kiválasztott cikk részletes megjelenítése */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg space-y-8 animate-fadeIn">
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="bg-blue-50 text-blue-700 font-extrabold px-3 py-1 rounded-full border border-blue-100">
                {articles[activeArticle].category}
              </span>
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" /> {articles[activeArticle].readTime}
              </span>
              <span className="text-slate-400 font-medium">• {articles[activeArticle].date}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {articles[activeArticle].title}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed p-4 bg-blue-50/50 rounded-2xl border border-blue-100/60">
              {articles[activeArticle].intro}
            </p>
          </div>

          {/* Kép / Vizualizáció a cikkhez */}
          <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-100 aspect-video max-h-[400px]">
            <img 
              src={articles[activeArticle].image} 
              alt={articles[activeArticle].title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent flex items-end p-6">
              <span className="text-white text-xs font-bold bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-xl">
                famity.hu szakmai kiadvány
              </span>
            </div>
          </div>

          {/* Cikk tartalom bekezdései */}
          <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed pt-2">
            {articles[activeArticle].content.map((paragraph, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center shrink-0 mt-1">
                  {idx + 1}
                </div>
                <p className="flex-1 font-normal text-slate-700">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>

          {/* Cikk végi CTA */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF8F4] p-6 rounded-2xl">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-black text-slate-900 text-sm">Próbáljátok ki a gyakorlatban is!</h4>
              <p className="text-xs text-slate-500">Szervezzétek meg a család mindennapjait egyetlen helyen.</p>
            </div>
            <Link
              href="/login?mode=register"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
            >
              Családi fiók indítása <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </article>

      </main>

      {/* Lábléc */}
      <footer className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <img 
            src="/icon.png" 
            alt="famity.hu" 
            className="h-7 w-7 object-contain rounded-lg shadow-sm" 
          />
          <span className="font-bold text-slate-700">famity.hu — Családi Vezérlőpult</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <button 
            onClick={() => setIsPrivacyOpen(true)}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline"
          >
            Adatkezelési Tájékoztató
          </button>

          <div className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm">
            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">Kapcsolat:</span>
            <a 
              href="mailto:info@famity.hu" 
              className="font-bold text-blue-600 hover:underline"
            >
              info@famity.hu
            </a>
          </div>
        </div>
      </footer>

      {/* Modalok */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <CookieBanner onOpenPrivacy={() => setIsPrivacyOpen(true)} />

    </div>
  );
}
