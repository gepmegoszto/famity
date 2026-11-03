'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PrivacyModal from '@/components/PrivacyModal';
import { ShieldCheck } from 'lucide-react';

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
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
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

    if (isRegister && !acceptedPrivacy) {
      setError('A regisztrációhoz el kell fogadnod az Adatkezelési Tájékoztatót!');
      return;
    }

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
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <img src="/icon.png" alt="famity.hu" className="h-9 w-9 object-contain rounded-xl" />
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
                placeholder="pl. Anya, Apa, Peti..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
                <span className="text-xs text-slate-500 font-medium">Ezzel jelensz meg a közös naptárban.</span>
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

        {/* Adatkezelési Nyilatkozat Elfogadása Regisztrációnál */}
        {isRegister && (
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <span>
                Elfogadom az{' '}
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="text-blue-600 font-bold underline hover:text-blue-700 cursor-pointer inline-flex items-center gap-0.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Adatkezelési Tájékoztatót
                </button>
                .
              </span>
            </label>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition cursor-pointer mt-2"
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

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F4]">
      <Suspense fallback={<div className="text-slate-500 text-sm font-medium">Betöltés...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
