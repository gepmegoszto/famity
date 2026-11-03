'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, familyData, loading, logout } = useAuth();
  const router = useRouter();

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

  if (!user) return null;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
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

      {familyData?.inviteCode && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-sm text-blue-800 flex justify-between items-center shadow-sm">
          <span>
            Családi meghívókód a többieknek: <strong className="font-mono text-base ml-1">{familyData.inviteCode}</strong>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Közös Naptár</h2>
          <p className="text-sm text-slate-500">Még nincsenek felvett események.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Bevásárlólista</h2>
          <p className="text-sm text-slate-500">A lista még üres.</p>
        </div>
      </div>
    </main>
  );
}
