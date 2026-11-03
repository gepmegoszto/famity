'use client';
import Link from 'next/link';
import { 
  Calendar, 
  ShoppingBag, 
  Utensils, 
  Award, 
  StickyNote, 
  ArrowRight,
  Users
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans">
      
      {/* Fejléc */}
      <header className="max-w-5xl mx-auto w-full px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
            F
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">famity<span className="text-blue-600">.hu</span></span>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
          >
            Kipróbálom
          </Link>
        </div>
      </header>

      {/* Fő tartalom */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full space-y-10">
        
        {/* Címsor & Akció */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Családi szervezettség <br />
            <span className="text-blue-600">egyetlen közös felületen.</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg font-normal">
            Naptár, élő bevásárlólista, heti menüterv és teendők a családnak. Átlátható, gyors és mobilon is azonnal működik.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 text-base"
            >
              Új család indítása <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition flex items-center justify-center text-base"
            >
              Csatlakozás kóddal
            </Link>
          </div>
        </div>

        {/* 6 Fő Funkció Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Közös Naptár</h3>
            <p className="text-xs text-slate-500">Színkódolt családi programok és események egy helyen.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Élő Bevásárlólista</h3>
            <p className="text-xs text-slate-500">Valós idejű szinkronizáció a boltban lévő családtaggal.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Utensils className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Heti Menüterv</h3>
            <p className="text-xs text-slate-500">Ebéd és vacsora tervező, közvetlen lista-integrációval.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Házimunka</h3>
            <p className="text-xs text-slate-500">Feladatfelelősök és gyűjthető pontok a gyerekeknek.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <StickyNote className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Hirdetőtábla</h3>
            <p className="text-xs text-slate-500">Kitűzhető üzenetek, Wi-Fi jelszavak és kapukódok.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Családi Szerepek</h3>
            <p className="text-xs text-slate-500">Egyszerű csatlakozás egyetlen 6-jegyű meghívókóddal.</p>
          </div>

        </div>
      </main>

      {/* Lábléc */}
      <footer className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
        famity.hu — Családi Vezérlőpult
      </footer>

    </div>
  );
}
