'use client';
import Link from 'next/link';
import { 
  Calendar, 
  ShoppingBag, 
  Utensils, 
  Award, 
  StickyNote, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Navigáció */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
              F
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">famity<span className="text-blue-600">.hu</span></span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Belépés
            </Link>
            <Link 
              href="/login?mode=register" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              Család indítása
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Minden családi infó egyetlen közös felületen</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            A család közös ritmusa, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500">
              egyszerűen és átláthatóan.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Nincs több elfelejtett szülői értekezlet, elmaradt bevásárlás vagy „Mi lesz a vacsora?” kérdés. Közös naptár, élő heti menü és teendők egy helyen.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 text-base"
            >
              Regisztráció családfőként <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl transition flex items-center justify-center text-base"
            >
              Csatlakozás kód alapján
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Ingyenesen használható</span>
            <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-blue-500" /> Mobilon és gépen is azonnali</span>
          </div>
        </div>

        {/* Interaktív / Látványos App Prezentáció */}
        <div className="mt-12 md:mt-16 bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/50">
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 text-white space-y-4">
            
            {/* Szimulált Fejléc */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">Kovács Család Vezérlőpult</span>
              </div>
              <span className="text-xs font-semibold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/30">
                Kód: K3X89P
              </span>
            </div>

            {/* Szimulált Modulok Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-slate-800">
              
              {/* Naptár Kártya */}
              <div className="bg-white p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" /> Mai Programok
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 flex justify-between font-semibold text-blue-900">
                    <span>16:30 Fogorvos (Peti)</span>
                    <span>16:30</span>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 flex justify-between font-semibold text-amber-900">
                    <span>18:00 Edzés (Apa)</span>
                    <span>18:00</span>
                  </div>
                </div>
              </div>

              {/* Menüterv Kártya */}
              <div className="bg-white p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
                  <Utensils className="w-4 h-4" /> Mai Menü
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Ebéd</span>
                    <span className="font-semibold text-slate-700">Húsleves & Rántott csirkemell</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Vacsora</span>
                    <span className="font-semibold text-slate-700">Melegszendvics</span>
                  </div>
                </div>
              </div>

              {/* Élő Bevásárlólista */}
              <div className="bg-white p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  <ShoppingBag className="w-4 h-4" /> Boltba kell
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between font-semibold text-slate-700">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tej 2.8%</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Élelmiszer</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between font-semibold text-slate-700">
                    <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded border border-slate-300" /> Kenyér (Kovászos)</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Élelmiszer</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Funkciók Részletezve */}
      <section className="py-16 bg-white border-y border-slate-200/80 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Minden, amire a családi szervezésben szükség van
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              Letisztult modulok, amiket a család apraja-nagyja könnyen tud használni.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Közös Naptár</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Színkódolt események családtagok szerint. Mindig látható, kinek hol van dolga a héten.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Élő Bevásárlólista</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Valós idejű szinkronizáció. Ha valaki a boltban kipipál egy tételt, az azonnal eltűnik a többiek kijelzőjén is.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Heti Menüterv</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ebéd és vacsora tervező hétfőtől vasárnapig. A szükséges hozzávalók egy kattintással átküldhetők a bevásárlólistára.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Házimunka & Pontgyűjtő</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Feladatok kiosztása pontértékekkel. A gyerekek elvégzett munkájukért pontokat gyűjthetnek.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <StickyNote className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Családi Hirdetőtábla</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Digitális hűtőmágnesek Wi-Fi jelszókhoz, kapukódokhoz és fontos üzenetekhez a lakásban.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Családkezelés & Szerepkörök</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Egyedi színek, adminisztrátori jogok és gyors csatlakozás egyetlen 6 jegyű meghívókóddal.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Csatlakozás Lépései */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">3 egyszerű lépés az induláshoz</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
              1
            </div>
            <h3 className="font-bold text-slate-800 text-base pt-2">Hozz létre egy fiókot</h3>
            <p className="text-xs text-slate-500">Add meg az e-mail címedet és nevezd el a családotokat.</p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
              2
            </div>
            <h3 className="font-bold text-slate-800 text-base pt-2">Küldd el a meghívókódot</h3>
            <p className="text-xs text-slate-500">A többiek másodpercek alatt csatlakozhatnak a megadott kóddal.</p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
              3
            </div>
            <h3 className="font-bold text-slate-800 text-base pt-2">Tervezzetek közösen</h3>
            <p className="text-xs text-slate-500">Események, feladatok és bevásárlólista egyetlen helyen.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="p-4 max-w-6xl mx-auto mb-12">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl shadow-blue-500/10">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Készen álltok a könnyebb szervezésre?</h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
            Nyiss egy saját családi vezérlőpultot még ma. Nincs letöltés, bármelyik böngészőből és telefonról eléred.
          </p>
          <div className="pt-2">
            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-slate-50 transition shadow-lg"
            >
              Családi fiók létrehozása <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Lábléc */}
      <footer className="border-t border-slate-200 py-8 bg-white text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-bold text-slate-600">famity.hu — Családi Vezérlőpult</span>
          <span>© {new Date().getFullYear()} Minden jog fenntartva.</span>
        </div>
      </footer>

    </div>
  );
}
