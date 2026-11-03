'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-500/20">
              F
            </div>
            <span className="text-xl font-extrabold text-slate-900">famity<span className="text-blue-600">.hu</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">
            {isRegister ? 'Családi fiók létrehozása' : 'Üdvözöljük újra!'}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {isRegister ? 'Hozz létre egy családot vagy csatlakozz kóddal' : 'Lépj be a családi vezérlőpultodba'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Neved</label>
                <input
                  type="text"
                  required
                  placeholder="pl. Sándor"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-lg transition ${familyOption === 'create' ? 'bg-white shadow text-slate-800 font-bold' : 'text-slate-500'}`}
                  onClick={() => setFamilyOption('create')}
                >
                  Új család alapítása
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-lg transition ${familyOption === 'join' ? 'bg-white shadow text-slate-800 font-bold' : 'text-slate-500'}`}
                  onClick={() => setFamilyOption('join')}
                >
                  Csatlakozás kóddal
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {familyOption === 'create' ? 'Család neve' : 'Családi Meghívókód'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={familyOption === 'create' ? 'pl. Kovács Család' : 'pl. X7K29P'}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  value={familyNameOrCode}
                  onChange={(e) => setFamilyNameOrCode(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Saját színed</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    className="h-9 w-14 border-0 rounded cursor-pointer"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <span className="text-xs text-slate-500">Ezzel lépsz fel a közös naptárban.</span>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail cím</label>
            <input
              type="email"
              required
              placeholder="email@pelda.hu"
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Jelszó</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition"
          >
            {isRegister ? 'Regisztráció és belépés' : 'Bejelentkezés'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <div>
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              {isRegister ? 'Már van fiókod? Lépj be!' : 'Még nincs fiókod? Hozz létre egyet!'}
            </button>
          </div>
          <div>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">
              ← Vissza a kezdőlapra
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
