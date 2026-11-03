'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ShoppingList from '@/components/ShoppingList';
import Calendar from '@/components/Calendar';
import NoticeBoard from '@/components/NoticeBoard';
import WeeklyMenu from '@/components/WeeklyMenu';
import ChoreTracker from '@/components/ChoreTracker';
import FamilySettings from '@/components/FamilySettings';
import { LayoutDashboard, Calendar as CalendarIcon, ShoppingBag, Utensils, StickyNote, Award, Users } from 'lucide-react';

export default function HomePage() {
  const { user, familyData, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Betöltés...</p>
      </div>
    );
  }

  if (!user || !familyData) return null;

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Fejléc */}
      <header className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {familyData?.name || 'Családi Vezérlőpult'}
          </h1>
          <p className="text-sm text-slate-500">Bejelentkezve: {user.email}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition"
        >
          Kijelentkezés
        </button>
      </header>

      {/* Meghívókód sáv */}
      {familyData?.inviteCode && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 flex justify-between items-center shadow-sm">
          <span>
            Családi meghívókód a többieknek: <strong className="font-mono text-base ml-1">{familyData.inviteCode}</strong>
          </span>
        </div>
      )}

      {/* Tab Navigáció */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Áttekintés
        </button>

        <button
          onClick={() => setActiveTab('chores')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'chores' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" /> Házimunka
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'menu' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" /> Menüterv
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarIcon className="w-4 h-4" /> Naptár
        </button>

        <button
          onClick={() => setActiveTab('shopping')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'shopping' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Bevásárlás
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'notices' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <StickyNote className="w-4 h-4" /> Hirdetőtábla
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Családtagok
        </button>
      </div>

      {/* Aktív Tab Tartalma */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <NoticeBoard familyId={familyData.id} userId={user.uid} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChoreTracker familyId={familyData.id} userId={user.uid} />
            <Calendar familyId={familyData.id} userId={user.uid} />
          </div>
        </div>
      )}

      {activeTab === 'chores' && (
        <ChoreTracker familyId={familyData.id} userId={user.uid} />
      )}

      {activeTab === 'menu' && (
        <WeeklyMenu familyId={familyData.id} userId={user.uid} />
      )}

      {activeTab === 'calendar' && (
        <Calendar familyId={familyData.id} userId={user.uid} />
      )}

      {activeTab === 'shopping' && (
        <ShoppingList familyId={familyData.id} userId={user.uid} />
      )}

      {activeTab === 'notices' && (
        <NoticeBoard familyId={familyData.id} userId={user.uid} />
      )}

      {activeTab === 'settings' && (
        <FamilySettings familyId={familyData.id} currentUserId={user.uid} />
      )}
    </main>
  );
}
