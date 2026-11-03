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
import DashboardOverview from '@/components/DashboardOverview';
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
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
    { id: 'dashboard', label: 'Áttekintés', icon: LayoutDashboard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'chores', label: 'Házimunka', icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'menu', label: 'Menü', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'calendar', label: 'Naptár', icon: CalendarIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'shopping', label: 'Bevásárlás', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'notices', label: 'Üzenőfal', icon: StickyNote, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'settings', label: 'Család', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  // Aktuális felhasználó színének lekérése
  const currentUserMember = familyData?.members?.find?.(m => m.id === user.uid);
  const userBubbleColor = currentUserMember?.color || '#3B82F6';

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-slate-800 pb-28 md:pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Fejléc */}
      <header className="sticky top-0 z-40 bg-[#FAF8F4]/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
              style={{ backgroundColor: userBubbleColor }}
            >
              {familyData?.name ? familyData.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 truncate tracking-tight">
                {familyData?.name || 'Családi Vezérlőpult'}
              </h1>
              <p className="text-xs text-slate-400 font-semibold">Család</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {familyData?.inviteCode && (
              <button
                onClick={handleCopyCode}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200/80 shadow-sm"
                title="Meghívókód másolása"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span className="font-mono">{familyData.inviteCode}</span>
              </button>
            )}

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition border border-transparent hover:border-slate-200 shadow-sm"
              title="Kijelentkezés"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Fő tartalom */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Főoldali nagy kép a fejléc alatt */}
        <div className="flex justify-center w-full">
          <img 
            src="/Gemini_Generated_Image_dn5mf6dn5mf6dn5m.jpeg" 
            alt="famity.hu" 
            className="w-full max-w-xl h-auto object-cover rounded-3xl shadow-md border border-slate-200/60" 
          />
        </div>

        {/* Asztali Navigáció - Magasabb, nagyobb, vizuálisabb, szebb ikonokkal */}
        <div className="hidden md:grid grid-cols-7 gap-3 p-3 bg-white/85 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                }`}
              >
                <div className={`p-2.5 rounded-xl transition ${isActive ? 'bg-white/10 text-white' : `${item.bg} ${item.color}`}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="tracking-tight text-xs">{item.label}</span>
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
            <DashboardOverview familyId={familyData.id} userId={user.uid} familyData={familyData} />
          )}

          {activeTab === 'chores' && <ChoreTracker familyId={familyData.id} userId={user.uid} />}
          {activeTab === 'menu' && <WeeklyMenu familyId={familyData.id} userId={user.uid} familyData={familyData} />}
          {activeTab === 'calendar' && <Calendar familyId={familyData.id} userId={user.uid} />}
          {activeTab === 'shopping' && <ShoppingList familyId={familyData.id} userId={user.uid} familyData={familyData} />}
          {activeTab === 'notices' && <NoticeBoard familyId={familyData.id} userId={user.uid} />}
          {activeTab === 'settings' && <FamilySettings familyId={familyData.id} currentUserId={user.uid} />}
        </div>

      </main>

      {/* Mobil Alsó Görgethető Navigációs Sáv */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-3 py-2 flex items-center gap-3 overflow-x-auto shadow-xl scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-xl transition shrink-0 cursor-pointer ${
                isActive ? 'text-blue-600 font-bold bg-blue-50/80' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
