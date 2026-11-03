'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  ShoppingBag, 
  Utensils, 
  Award, 
  StickyNote, 
  Users, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Pin,
  Zap,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

export default function LandingPage() {
  const [activeDemoTab, setActiveDemoTab] = useState('calendar');

  // Interaktív demó állapotok
  const [demoShoppingItems, setDemoShoppingItems] = useState([
    { id: 1, name: 'Tej 2.8%', cat: 'Élelmiszer', done: true },
    { id: 2, name: 'Kovászos kenyér', cat: 'Élelmiszer', done: false },
    { id: 3, name: 'Mosógél', cat: 'Háztartás', done: false },
  ]);

  const toggleDemoShopping = (id) => {
    setDemoShoppingItems(items => items.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      
      {/* Fejléc */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
              F
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">famity<span className="text-blue-600">.hu</span></span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/login" 
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Belépés
            </Link>
            <Link 
              href="/login?mode=register" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Kipróbálom
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-12 w-full space-y-10 sm:space-y-12">
        
        {/* Címsor & Tömör Bevezető */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Valós idejű családi szinkronizáció</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            A család közös élete, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              egyetlen vezérlőpulton.
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto">
            Naptár, élő bevásárlólista, heti menüterv és teendők. Nincs több elfelejtett program vagy elveszett információ.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98]"
            >
              Új család indítása <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition flex items-center justify-center text-sm sm:text-base"
            >
              Csatlakozás kóddal
            </Link>
          </div>
        </div>

        {/* Interaktív Élő Demó Kijelző */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-3 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Próbáld ki élőben!</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              ● Élő demó
            </span>
          </div>

          {/* Demó Tab Váltó */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveDemoTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeDemoTab === 'calendar' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Naptár
            </button>

            <button
              onClick={() => setActiveDemoTab('shopping')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeDemoTab === 'shopping' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Bevásárlás
            </button>

            <button
              onClick={() => setActiveDemoTab('menu')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeDemoTab === 'menu' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" /> Menüterv
            </button>

            <button
              onClick={() => setActiveDemoTab('chores')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeDemoTab === 'chores' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Házimunka
            </button>

            <button
              onClick={() => setActiveDemoTab('notices')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeDemoTab === 'notices' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" /> Hirdetőtábla
            </button>
          </div>

          {/* Demó Tartalom Ablak */}
          <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-6 border border-slate-100 min-h-[220px] flex flex-col justify-center transition-all">
            
            {activeDemoTab === 'calendar' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                  <span>Mai Családi Események</span>
                  <span className="text-blue-600">Szerda, Nov. 15.</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Fogorvos (Peti)</p>
                        <p className="text-[10px] text-slate-400">Dr. Szabó Károly rendelője</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 16:30
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Szülői Értekezlet</p>
                        <p className="text-[10px] text-slate-400">Gimnázium 2/B terem</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 18:00
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === 'shopping' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Valós Idejű Lista (Kattints a kipipáláshoz!)</span>
                  <span className="text-emerald-600 font-semibold">{demoShoppingItems.filter(i => i.done).length} / {demoShoppingItems.length} kész</span>
                </div>
                <div className="space-y-2">
                  {demoShoppingItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleDemoShopping(item.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        item.done ? 'bg-slate-100/80 border-slate-200 opacity-60' : 'bg-white border-slate-100 shadow-sm hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                          item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                        }`}>
                          {item.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-xs font-medium ${item.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {item.cat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDemoTab === 'menu' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                  <span>Heti Menüterv</span>
                  <span className="text-orange-600 font-semibold">Mai nap: Szerda</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ebéd</span>
                    <p className="text-xs font-bold text-slate-800">Húsleves & Rántott csirkemell</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vacsora</span>
                    <p className="text-xs font-bold text-slate-800">Sajtos-sonkás melegszendvics</p>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === 'chores' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Házimunka & Zsebpénz Pontok</span>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">+40 pont gyűjtve</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Szelektív hulladék levitele</p>
                      <span className="text-[10px] font-medium text-slate-400">Felelős: Peti</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      +10 pont
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Kertöntözés & Fűnyírás</p>
                      <span className="text-[10px] font-medium text-slate-400">Felelős: Apa</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      +30 pont
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === 'notices' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase">Kitűzött Hűtőmágnesek</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 relative">
                    <Pin className="w-3.5 h-3.5 text-amber-600 absolute top-2.5 right-2.5 fill-amber-500" />
                    <span className="text-[10px] font-bold text-amber-800 uppercase">Wi-Fi Kód</span>
                    <p className="text-xs font-bold text-amber-950 font-mono">OtthoniNet_2026</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-blue-800 uppercase">Garázskapu kód</span>
                    <p className="text-xs font-bold text-blue-950 font-mono">#4829</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 3 Gyors Előny Kártya */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Azonnali Szinkron</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ami a boltban törlődik, az otthon is azonnal eltűnik.</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Letöltés Nélkül</h3>
              <p className="text-xs text-slate-500 mt-0.5">Bármilyen mobilról és böngészőből azonnal működik.</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Egyszerű Csatlakozás</h3>
              <p className="text-xs text-slate-500 mt-0.5">Egyetlen 6-jegyű kóddal beléphet az egész család.</p>
            </div>
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
