'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [familyOption, setFamilyOption] = useState('create');
  const [familyNameOrCode, setFamilyNameOrCode] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (modeParam === 'register') {
      setIsRegister(true);
    }
  }, [modeParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(email, password, userName, familyOption, familyNameOrCode, color);
      } else {
        await login(email, password);
      }
      router.push('/');
    } catch (err) {
      setError(err.message || 'Hiba történt a művelet során.');
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 w-full max-w-md border border-slate-100">
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
            F
          </div>
          <span className="text-xl font-black text-slate-900">famity<span className="text-blue-600">.hu</span></span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {isRegister ? 'Családi fiók létrehozása' : 'Üdvözlünk újra!'}
        </h1>
        <p className="text-slate-500 text-xs mt-1 font-medium">
          {isRegister ? 'Hozz létre egy családot vagy csatlakozz kóddal' : 'Lépj be a közös vezérlőpultotokba'}
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-3 rounded-2xl text-xs font-semibold mb-4 border border-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Neved</label>
              <input
                type="text"
                required
                placeholder="pl. Sándor"
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${familyOption === 'create' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500'}`}
                onClick={() => setFamilyOption('create')}
              >
                Új család
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${familyOption === 'join' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500'}`}
                onClick={() => setFamilyOption('join')}
              >
                Csatlakozás kóddal
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {familyOption === 'create' ? 'Család neve' : 'Meghívókód'}
              </label>
              <input
                type="text"
                required
                placeholder={familyOption === 'create' ? 'pl. Kovács Család' : 'pl. X7K29P'}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                value={familyNameOrCode}
                onChange={(e) => setFamilyNameOrCode(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Saját színed</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  className="h-10 w-16 border-0 rounded-xl cursor-pointer bg-white"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <span className="text-xs text-slate-500 font-medium">Ezzel lépsz fel a közös naptárban.</span>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">E-mail cím</label>
          <input
            type="email"
            required
            placeholder="email@pelda.hu"
            className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Jelszó</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition cursor-pointer"
        >
          {isRegister ? 'Regisztráció és belépés' : 'Bejelentkezés'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <div>
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
          >
            {isRegister ? 'Már van fiókod? Lépj be!' : 'Még nincs fiókod? Hozz létre egyet!'}
          </button>
        </div>
        <div>
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 font-medium">
            ← Vissza a kezdőlapra
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Suspense fallback={<div className="text-slate-500 text-sm font-medium">Betöltés...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
