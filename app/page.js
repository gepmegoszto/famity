'use client';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import ShoppingList from '@/components/ShoppingList';
import Calendar from '@/components/Calendar';
import NoticeBoard from '@/components/NoticeBoard';
import WeeklyMenu from '@/components/WeeklyMenu';
import ChoreTracker from '@/components/ChoreTracker';
import FamilySettings from '@/components/FamilySettings';
import LandingPage from '@/components/LandingPage';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  ShoppingBag, 
  Utensils, 
  StickyNote, 
  Award, 
  Users, 
  LogOut, 
  Copy, 
  Check 
} from 'lucide-react';

const NotificationSetup = dynamic(() => import('@/components/NotificationSetup'), {
  ssr: false,
});

export default function HomePage() {
  const { user, familyData, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-4 h-4 rounded-full bg-blue-600 animate-ping" />
          <span className="text-sm font-semibold text-slate-600">Betöltés...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (!familyData) return null;

  const handleCopyCode = () => {
    if (familyData?.inviteCode) {
      navigator.clipboard.writeText(familyData.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Áttekintés', icon: LayoutDashboard },
    { id: 'chores', label: 'Házimunka', icon: Award },
    { id: 'menu', label: 'Menü', icon: Utensils },
    { id: 'calendar', label: 'Naptár', icon: CalendarIcon },
    { id: 'shopping', label: 'Bevásárlás', icon: ShoppingBag },
    { id: 'notices', label: 'Üzenőfal', icon: StickyNote },
    { id: 'settings', label: 'Család', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 pb-24 md:pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Fejléc */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Családnév & User infó */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 shrink-0">
              {familyData?.name ? familyData.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 truncate tracking-tight">
                {familyData?.name || 'Családi Vezérlőpult'}
              </h1>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Jobb oldali opciók */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Meghívókód gomb */}
            {familyData?.inviteCode && (
              <button
                onClick={handleCopyCode}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200/60"
                title="Meghívókód másolása"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span className="font-mono">{familyData.inviteCode}</span>
              </button>
            )}

            {/* Értesítések gomb */}
            <NotificationSetup familyId={familyData.id} userId={user.uid} />

            {/* Kijelentkezés */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              title="Kijelentkezés"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* Fő tartalom konténer */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Asztali Tab Navigáció */}
        <div className="hidden md:flex items-center gap-1.5 p-1.5 bg-slate-200/50 rounded-2xl border border-slate-200/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Családi kód mobilon */}
        {familyData?.inviteCode && (
          <div className="sm:hidden flex items-center justify-between p-3 bg-blue-50/80 border border-blue-100 rounded-2xl text-xs text-blue-900">
            <span className="font-medium text-blue-700">Családi meghívókód:</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 font-mono font-bold bg-white px-2.5 py-1 rounded-xl shadow-sm border border-blue-200/60 text-blue-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-500" />}
              <span>{familyData.inviteCode}</span>
            </button>
          </div>
        )}

        {/* Nézetek */}
        <div className="transition-all duration-150">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <NoticeBoard familyId={familyData.id} userId={user.uid} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChoreTracker familyId={familyData.id} userId={user.uid} />
                <Calendar familyId={familyData.id} userId={user.uid} />
              </div>
            </div>
          )}

          {activeTab === 'chores' && <ChoreTracker familyId={familyData.id} userId={user.uid} />}
          {activeTab === 'menu' && <WeeklyMenu familyId={familyData.id} userId={user.uid} />}
          {activeTab === 'calendar' && <Calendar familyId={familyData.id} userId={user.uid} />}
          {activeTab === 'shopping' && <ShoppingList familyId={familyData.id} userId={user.uid} />}
          {activeTab === 'notices' && <NoticeBoard familyId={familyData.id} userId={user.uid} />}
          {activeTab === 'settings' && <FamilySettings familyId={familyData.id} currentUserId={user.uid} />}
        </div>

      </main>

      {/* Mobil Alsó Navigációs Sáv (Fixed Bottom Nav) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
