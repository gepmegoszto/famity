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
  StickyNote, 
  Users, 
  ArrowRight,
  ShieldCheck,
  Lock,
  Heart,
  Smile,
  CheckCircle2,
  Mail,
  Gift
} from 'lucide-react';

export default function LandingPage() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Fejléc */}
      <header className="sticky top-0 z-40 bg-[#FAF8F4]/90 backdrop-blur-md border-b border-amber-900/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/icon.png" 
              alt="famity.hu" 
              className="h-9 w-9 object-contain rounded-xl" 
            />
            <span className="text-xl font-black tracking-tight text-slate-900">famity<span className="text-blue-600">.hu</span></span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition rounded-xl hover:bg-white/60"
            >
              Belépés
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 w-full space-y-16">
        
        {/* HERO SZEKCIÓ */}
        <div className="text-center max-w-2xl mx-auto space-y-6">
          
          {/* Központi Logó Kép */}
          <div className="flex justify-center">
            <img 
              src="/Gemini_Generated_Image_dn5mf6dn5mf6dn5m.jpeg" 
              alt="famity.hu" 
              className="h-28 sm:h-36 w-auto object-contain rounded-2xl" 
            />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            A család közös élete, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600">
              együtt, egyetlen helyen.
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto">
            Anya, apa, a nagyszülők és a gyerekek — a <strong>famity.hu</strong> felületén mindenkinek megvan a maga szerepe. Egy átlátható, meleg hangulatú digitális otthon, amely összetartja a család mindennapi dinamikáját.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98]"
            >
              Új család indítása <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl shadow-sm transition flex items-center justify-center text-sm sm:text-base"
            >
              Csatlakozás kóddal
            </Link>
          </div>
        </div>

        {/* CSALÁDI DINAMIKA SZEKCIÓ */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Minden generációnak megvan a maga helye</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Együtt működik a család</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-[#FAF8F4] rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-xs">Anya</div>
              <h3 className="font-bold text-xs text-slate-900">Menüterv & Áttekintés</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Heti étkezések és közös naptári időpontok átlátható koordinációja.</p>
            </div>

            <div className="p-4 bg-[#FAF8F4] rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">Apa</div>
              <h3 className="font-bold text-xs text-slate-900">Bevásárlás & Szervezés</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Élő bevásárlólisták kezelése és adminisztratív feladatok átlátása.</p>
            </div>

            <div className="p-4 bg-[#FAF8F4] rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">Mama</div>
              <h3 className="font-bold text-xs text-slate-900">Üzenőfal & Programok</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Fontos családi információk, kapukódok és unokázós időpontok.</p>
            </div>

            <div className="p-4 bg-[#FAF8F4] rounded-2xl border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">Gyerekek</div>
              <h3 className="font-bold text-xs text-slate-900">Házimunka & Pontok</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Elvégzett teendők, pontgyűjtés és beváltás megbeszélt jutalmakra.</p>
            </div>
          </div>
        </div>

        {/* FUNKCIONÁLIS MODUL KÁRTYÁK */}
        <div className="space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Minden modul egy célt szolgál</h2>
            <p className="text-xs text-slate-500">Egyszerű, átlátható és zűrzavarmentes funkciók.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Naptár */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Közös Családi Naptár</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Időrendi sorrendben áttekinthető események családtagok szerinti színkóddal. Az adminok külön csak-admin bejegyzéseket is létrehozhatnak.
              </p>
            </div>

            {/* 2. Bevásárlás */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Több-listás Bevásárlás</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hozz létre külön listát a zöldségesnek vagy a hétvégi nagybevásárlásnak. Élőben frissül a boltban tartózkodó családtag kezében.
              </p>
            </div>

            {/* 3. Menüterv */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Heti Menüterv</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tervezzétek meg az ebédet és a vacsorát. Az hiányzó alapanyagok egyetlen kattintással átemelhetők a kiválasztott bevásárlólistára.
              </p>
            </div>

            {/* 4. Házimunka */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Házimunka & Pontgyűjtő</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kijelölhető felelősök, határidők és pontos elvégzési időbélyegek. A gyűjtött pontok megbeszélt családi jutalmakra válthatók be.
              </p>
            </div>

            {/* 5. Üzenőfal */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <StickyNote className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Digitális Hűtőmágnesek</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Wi-Fi jelszavak, kapukódok és fontos emlékeztetők kitűzése színes jegyzeteken, amiket minden belépő családtag azonnal lát.
              </p>
            </div>

            {/* 6. Meghívókód */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Zárt Családi Meghívás</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Egyetlen 6-jegyű kóddal csatlakozhat minden családtag. Nincsenek bonyolult beállítások vagy nyilvános profilok.
              </p>
            </div>

          </div>
        </div>

        {/* ADATBIZTONSÁG SZEKCIÓ */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl">
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
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-slate-200">Titkosított Adattárolás</h4>
              <p className="text-slate-400 leading-relaxed">Minden adatátvitel SSL/TLS titkosítással védett, európai Firebase szerverkörnyezetben.</p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <h4 className="font-bold text-slate-200">Zéró Reklám & Adatértékesítés</h4>
              <p className="text-slate-400 leading-relaxed">Soha nem adjuk el a családi adataitokat, és nem jelenítünk meg semmilyen reklámot.</p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <Smile className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-slate-200">Teljes Adatkezelési Kontroll</h4>
              <p className="text-slate-400 leading-relaxed">Bármikor lekérhető vagy törölhető a teljes családi fiók és az összes előzmény.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Lábléc */}
      <footer className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <img 
            src="/icon.png" 
            alt="famity.hu" 
            className="h-7 w-7 object-contain rounded-lg" 
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

      {/* Modalok & Bannerek */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <CookieBanner onOpenPrivacy={() => setIsPrivacyOpen(true)} />

    </div>
  );
}
