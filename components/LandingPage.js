'use client';
import { useState } from 'react';
import Link from 'next/link';
import PrivacyModal from '@/components/PrivacyModal';
import CookieBanner from '@/components/CookieBanner';
import AdBanner from '@/components/AdBanner';
import { 
  Calendar, 
  ShoppingBag, 
  Utensils, 
  Award, 
  StickyNote, 
  Users, 
  ArrowRight,
  ShieldCheck,
  Lock,
  Smile,
  CheckCircle2,
  Mail,
  Sparkles,
  Check,
  BookOpen,
  Heart,
  Clock,
  ChevronDown,
  Star
} from 'lucide-react';

export default function LandingPage() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState('calendar');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const featureTabs = [
    { id: 'calendar', label: 'Naptár', title: 'Színes, áttekinthető családi naptár', desc: 'Minden családtagnak saját színkódja van. Anya, apa és a gyerekek programjai egyetlen nézetben, valós időben szinkronizálva.' },
    { id: 'shopping', label: 'Bevásárlás', title: 'Élő, több-listás bevásárlás', desc: 'Külön listák a zöldségesnek, hipermarketnek vagy a hétvégi grillpartynak. Ha valaki megveszi a tételt, azonnal frissül a boltban lévő társunk telefonján.' },
    { id: 'menu', label: 'Menüterv', title: 'Heti menütervezés könnyedén', desc: 'Tervezzétek meg az ebédet és a vacsorát előre. A hiányzó hozzávalók egyetlen kattintással átemelhetők a bevásárlólistára.' },
    { id: 'chores', label: 'Házimunka', title: 'Pontgyűjtő rendszer gyerekeknek', desc: 'A házimunka végre játék! A kijelölt teendők elvégzéséért járó pontok izgalmas családi jutalmakra válthatók be.' }
  ];

  const faqs = [
    { q: 'Hogyan tudnak a nagyszülők is csatlakozni?', a: 'Rendkívül egyszerűen! A regisztráció után kapott egyedi 6-jegyű családi kóddal a nagyszülők is bármikor beléphetnek a saját okostelefonjukon, letöltés nélkül, böngészőből.' },
    { q: 'Biztonságban vannak a családi adataink?', a: 'Igen. A legmodernebb európai felhőalapú infrastruktúrán (Firebase) futunk, erős SSL/TLS titkosítással. Soha nem adjuk el az adatokat harmadik félnek, és a fiók bármikor törölhető.' },
    { q: 'Hogyan működik a prémium csomag és a hirdetésmentesség?', a: 'Az ingyenes verziót diszkrét hirdetések tarthatják fenn. Ha előfizettek a Családi Prémiumra (1 990 Ft/hó), az adminisztrátor fizetésével a család MINDEN tagja teljes reklámmentességet élvez.' },
    { q: 'Szükséges-e letölteni alkalmazást az App Store-ból?', a: 'Nem szükséges! A famity.hu egy modern PWA webalkalmazás, ami közvetlenül a telefon böngészőjéből nyitható meg, és ikonként kirakható a kezdőképernyőre.' }
  ];

  const testimonials = [
    { name: 'Kovács Eszter', role: 'Háromgyermekes édesanya', text: 'Vége a hűtőre ragasztott post-itek káoszának! Most már mindenki pontosan tudja, ki hova megy és mit kell hozni a boltból.' },
    { name: 'Nagy Péter', role: 'Apa és logisztikai mindenes', text: 'A heti menütervező és a bevásárlólista összekötése óriási pénzt és időt spórol meg nekünk minden héten. Imádjuk!' },
    { name: 'Szabó Mária (Mama)', role: 'Nagymama', text: 'Fantasztikus, hogy a telefonomon én is látom, mikor jönnek az unokák, és egy gombnyomással beírhatom a közös programokat.' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* 1. Fejléc (Blog gomb eltávolítva) */}
      <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-amber-900/5 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/icon.png" 
              alt="famity.hu" 
              className="h-10 w-10 object-contain rounded-2xl shadow-sm" 
            />
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">famity<span className="text-blue-600">.hu</span></span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/login" 
              className="px-4.5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition rounded-xl hover:bg-white/80"
            >
              Belépés
            </Link>
            <Link 
              href="/login?mode=register" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-blue-500/25 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Kipróbálom
            </Link>
          </div>
        </div>
      </header>

      {/* Fő tartalom teljes szélességű, váltakozó hátterű szekciókkal */}
      <main className="w-full space-y-0">
        
        {/* HERO SZEKCIÓ */}
        <section className="w-full bg-[#FAF8F4] py-12 sm:py-20 px-4 sm:px-8 border-b border-slate-200/40">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-extrabold border border-blue-100 shadow-xs animate-pulse">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> A család digitális otthona
            </div>

            <div className="flex justify-center">
              <img 
                src="/Gemini_Generated_Image_dn5mf6dn5mf6dn5m.jpeg" 
                alt="famity.hu" 
                className="h-36 sm:h-48 w-auto object-contain rounded-3xl shadow-lg border border-slate-100" 
              />
            </div>

            <h1 className="text-3xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              A család közös élete, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600">
                együtt, egyetlen helyen.
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
              Anya, apa, a nagyszülők és a gyerekek — a <strong>famity.hu</strong> felületén mindenkinek megvan a maga szerepe. Felejtsétek el a kaotikus hűtőmágneses üzeneteket és az elfelejtett programokat!
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login?mode=register"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98]"
              >
                Új család indítása <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login?mode=register"
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl shadow-xs transition flex items-center justify-center text-sm sm:text-base"
              >
                Csatlakozás kóddal
              </Link>
            </div>
          </div>
        </section>

        {/* 1. ÖTLET: INTERAKTÍV MODUL ELŐNÉZET (Tabs) */}
        <section className="w-full bg-white py-16 px-4 sm:px-8 border-b border-slate-200/60 shadow-xs">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Interaktív bemutató</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Fedezd fel a funkciókat élőben</h2>
              <p className="text-xs sm:text-sm text-slate-500">Kattints a fülekre, és nézd meg, hogyan teszi a famity.hu egyszerűbbé a mindennapokat.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-xl mx-auto">
              {featureTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${activeFeatureTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-[#FAF8F4] border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                {featureTabs.map((tab) => tab.id === activeFeatureTab && (
                  <div key={tab.id} className="space-y-4 animate-fadeIn">
                    <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Kiemelt modul</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">{tab.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{tab.desc}</p>
                    <div className="pt-2">
                      <Link href="/login?mode=register" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700">
                        Próbáljátok ki most <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-400">famity.hu live preview</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs font-semibold text-blue-900 flex items-center justify-between">
                    <span>Családi fogorvos / Kontroll</span>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md">Holnap 15:00</span>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs font-semibold text-emerald-900 flex items-center justify-between">
                    <span>Heti nagybevásárlás (Aldi)</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md">Aktív lista</span>
                  </div>
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-between">
                    <span>Wi-Fi kód & Kapucsengő</span>
                    <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-md">Üzenőfal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hirdetés */}
        <div className="max-w-5xl mx-auto px-4">
          <AdBanner />
        </div>

        {/* CSALÁDI DINAMIKA SZEKCIÓ */}
        <section className="w-full bg-[#FAF8F4] py-16 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/60 shadow-sm space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Minden generációnak megvan a maga helye</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Így működik a mindennapi harmónia</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-slate-100 space-y-2.5 transition hover:shadow-md">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-xs">Anya</div>
                  <h3 className="font-bold text-xs text-slate-900">Menüterv & Áttekintés</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Heti étkezések és közös naptári időpontok átlátható koordinációja stressz nélkül.</p>
                </div>

                <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-slate-100 space-y-2.5 transition hover:shadow-md">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">Apa</div>
                  <h3 className="font-bold text-xs text-slate-900">Bevásárlás & Szervezés</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Élő bevásárlólisták kezelése közvetlenül a szupermarket sorai közül frissítve.</p>
                </div>

                <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-slate-100 space-y-2.5 transition hover:shadow-md">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">Mama</div>
                  <h3 className="font-bold text-xs text-slate-900">Üzenőfal & Programok</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Fontos családi információk, kapukódok és unokázós délutánok naptárba téve.</p>
                </div>

                <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-slate-100 space-y-2.5 transition hover:shadow-md">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">Gyerekek</div>
                  <h3 className="font-bold text-xs text-slate-900">Házimunka & Pontok</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Elvégzett teendők, pontgyűjtés és beváltás izgalmas megbeszélt jutalmakra.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRÉMIUM CSOMAG BEMUTATÁS */}
        <section className="w-full bg-white py-16 px-4 sm:px-8 border-y border-slate-200/60">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/60 shadow-sm space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                  <Sparkles className="w-3.5 h-3.5" /> Előfizetési rendszer
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Ingyenes vagy Családi Prémium?</h2>
                <p className="text-xs text-slate-500">Használjátok ingyen hirdetésekkel, vagy váltsatok prémiumra a teljes reklámmentességért.</p>
              </div>

              <div className="max-w-md mx-auto bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Egész családnak</span>
                    <h3 className="text-xl font-black">Famity Prémium</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black">1 990 Ft</span>
                    <span className="text-[11px] text-slate-300 block">/ hó</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Teljes reklámmentesség</strong> minden családtag számára (az adminisztrátor fizet, az egész család mentesül)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Korlátlan szinkronizáció és prioritás támogatás</span>
                  </div>
                </div>

                <Link
                  href="/login?mode=register"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 text-center"
                >
                  Próbáljátok ki ingyen <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FUNKCIONÁLIS MODUL KÁRTYÁK */}
        <section className="w-full bg-[#FAF8F4] py-16 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Minden modul egy célt szolgál</h2>
              <p className="text-xs text-slate-500">Egyszerű, átlátható és zűrzavarmentes funkciók.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Közös Családi Naptár</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Időrendi sorrendben áttekinthető események családtagok szerinti színkóddal. Az adminok külön csak-admin bejegyzéseket is létrehozhatnak.</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Több-listás Bevásárlás</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Hozz létre külön listát a zöldségesnek vagy a hétvégi nagybevásárlásnak. Élőben frissül a boltban tartózkodó családtag kezében.</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Heti Menüterv</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Tervezzétek meg az ebédet és a vacsorát. Az hiányzó alapanyagok egyetlen kattintással átemelhetők a kiválasztott bevásárlólistára.</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Házimunka & Pontgyűjtő</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Kijelölhető felelősök, határidők és pontos elvégzési időbélyegek. A gyűjtött pontok megbeszélt családi jutalmakra válthatók be.</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <StickyNote className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Digitális Hűtőmágnesek</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Wi-Fi jelszavak, kapukódok és fontos emlékeztetők kitűzése színes jegyzeteken, amiket minden belépő családtag azonnal lát.</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Zárt Családi Meghívás</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Egyetlen 6-jegyű kóddal csatlakozhat minden családtag. Nincsenek bonyolult beállítások vagy nyilvános profilok.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. ÖTLET: TUDNÁSTÁR / BLOG SZEKCIÓ (Főoldali előnézet) */}
        <section className="w-full bg-white py-16 px-4 sm:px-8 border-t border-slate-200/60">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Családi Szervezési Tudástár & Blog</h2>
                  <p className="text-xs text-slate-500">Szakmai tippek, útmutatók és módszertanok a harmonikusabb mindennapokért.</p>
                </div>
              </div>
              <Link 
                href="/blog" 
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                Összes cikk megtekintése <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
              <Link href="/blog" className="space-y-2.5 p-5 rounded-2xl bg-[#FAF8F4] border border-slate-100 hover:border-blue-200 transition group block">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5" /> 8 perces olvasmány
                </div>
                <h3 className="font-black text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition">Hogyan szervezzük meg a család heti menüjét stressz nélkül?</h3>
                <p className="leading-relaxed line-clamp-3">
                  A tudatos étkezéstervezés nemcsak pénztárcabarát megoldás, hanem óriási időmegtakarítás is a hétköznapokban. Ha előre tudjuk, mit főzünk, a bevásárlás célzottabbá válik, és elkerülhető a felesleges élelmiszer-pazarlás.
                </p>
              </Link>

              <Link href="/blog" className="space-y-2.5 p-5 rounded-2xl bg-[#FAF8F4] border border-slate-100 hover:border-blue-200 transition group block">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5" /> 10 perces olvasmány
                </div>
                <h3 className="font-black text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition">A közös családi naptár előnyei: Így ne felejtsetek el semmit</h3>
                <p className="leading-relaxed line-clamp-3">
                  A digitális szinkronizáció segít abban, hogy az iskolai szünetek, az orvosi időpontok és a délutáni különórák egyetlen helyen látszódjanak. Anya, apa és a nagyszülők is azonnal értesülnek a változásokról.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. ÖTLET: CSALÁDI VISSZAJELZÉSEK / SOCIAL PROOF SZEKCIÓ */}
        <section className="w-full bg-[#FAF8F4] py-16 px-4 sm:px-8 border-t border-slate-200/60">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Valódi családok tapasztalatai</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Mit mondanak rólunk?</h2>
              <p className="text-xs sm:text-sm text-slate-500">Így vált a famity.hu a mindennapi élet nélkülözhetetlen részévé.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">"{t.text}"</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{t.name}</h4>
                    <span className="text-[11px] text-blue-600 font-medium">{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. ÖTLET: RÉSZLETES GYIK (Gyakran Ismételt Kérdések) */}
        <section className="w-full bg-white py-16 px-4 sm:px-8 border-t border-slate-200/60">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Kérdések és válaszok</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Gyakran Ismételt Kérdések</h2>
              <p className="text-xs sm:text-sm text-slate-500">Minden, amit a famity.hu használatáról tudni érdemes.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="bg-[#FAF8F4] border border-slate-200/80 rounded-2xl overflow-hidden transition">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/40 pt-3 animate-fadeIn">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* VIDEÓ BEMUTATÓ SZEKCIÓ */}
        <section className="w-full bg-[#FAF8F4] py-16 px-4 sm:px-8 border-t border-slate-200/60">
          <div className="max-w-5xl mx-auto space-y-6 text-center">
            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Ismerd meg a platformot</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Így működik a famity.hu</h2>
              <p className="text-xs text-slate-500">Nézd meg rövid bemutató videónkat a felület működéséről.</p>
            </div>
            <div className="flex justify-center pt-2">
              <video 
                src="/bemutato.mp4" 
                controls 
                autoPlay 
                loop 
                muted 
                className="w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200"
              />
            </div>
          </div>
        </section>

        {/* ADATBIZTONSÁG SZEKCIÓ */}
        <section className="w-full bg-slate-900 text-white py-16 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Adatbiztonság és Magánélet</h3>
                <p className="text-xs text-slate-400">Az ti családi életetek kizárólag a tiétek marad.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="space-y-1.5 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-slate-200">Titkosított Adattárolás</h4>
                <p className="text-slate-400 leading-relaxed">Minden adatátvitel SSL/TLS titkosítással védett, európai Firebase szerverkörnyezetben.</p>
              </div>

              <div className="space-y-1.5 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-slate-200">Rugalmas Modell & Adatvédelem</h4>
                <p className="text-slate-400 leading-relaxed">Soha nem adjuk el a családi adataitokat. Választhattok hirdetéses ingyenes vagy tiszta prémium élményt.</p>
              </div>

              <div className="space-y-1.5 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <Smile className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-slate-200">Teljes Adatkezelési Kontroll</h4>
                <p className="text-slate-400 leading-relaxed">Bármikor lekérhető vagy törölhető a teljes családi fiók és az összes előzmény.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 5. ÖTLET: GAZDAGÍTOTT LÁBLÉC (Footer) */}
      <footer className="w-full bg-[#FAF8F4] border-t border-amber-900/10 py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-600">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <img src="/icon.png" alt="famity.hu" className="h-7 w-7 object-contain rounded-lg shadow-sm" />
                <span className="font-bold text-slate-900 text-sm">famity.hu</span>
              </div>
              <p className="text-slate-500 leading-relaxed">A modern magyar családok digitális otthona és mindennapi koordinációs vezérlőpultja.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Modulok</h4>
              <ul className="space-y-1.5 text-slate-500">
                <li><Link href="/login" className="hover:text-blue-600">Családi Naptár</Link></li>
                <li><Link href="/login" className="hover:text-blue-600">Bevásárlólisták</Link></li>
                <li><Link href="/login" className="hover:text-blue-600">Heti Menüterv</Link></li>
                <li><Link href="/login" className="hover:text-blue-600">Házimunka & Pontok</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Tudástár</h4>
              <ul className="space-y-1.5 text-slate-500">
                <li><Link href="/blog" className="hover:text-blue-600">Szakmai Cikkek & Blog</Link></li>
                <li><Link href="/blog" className="hover:text-blue-600">Háztartási Tippek</Link></li>
                <li><Link href="/blog" className="hover:text-blue-600">Adatvédelem</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Kapcsolat</h4>
              <div className="flex items-center gap-2 text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <a href="mailto:info@famity.hu" className="font-bold text-blue-600 hover:underline">info@famity.hu</a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 famity.hu — Minden jog fenntartva.</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsPrivacyOpen(true)}
                className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline"
              >
                Adatkezelési Tájékoztató
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modalok */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <CookieBanner onOpenPrivacy={() => setIsPrivacyOpen(true)} />

    </div>
  );
}
