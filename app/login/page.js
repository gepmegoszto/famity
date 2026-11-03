'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [familyOption, setFamilyOption] = useState('create'); // 'create' | 'join'
  const [familyNameOrCode, setFamilyNameOrCode] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const router = useRouter();

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Famity.hu</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isRegister ? 'Hozz létre egy fiókot a családodnak' : 'Lépj be a családi vezérlőpultba'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">
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
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-lg transition ${familyOption === 'create' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                  onClick={() => setFamilyOption('create')}
                >
                  Új család alapítása
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-lg transition ${familyOption === 'join' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                  onClick={() => setFamilyOption('join')}
                >
                  Csatlakozás meglévőhöz
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
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={familyNameOrCode}
                  onChange={(e) => setFamilyNameOrCode(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">A te színed a naptárban</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    className="h-10 w-16 border-0 rounded cursor-pointer"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <span className="text-xs text-slate-500">Ezzel a színnel jelennek meg az eseményeid.</span>
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
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition"
          >
            {isRegister ? 'Regisztráció és belépés' : 'Bejelentkezés'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            {isRegister ? 'Már van fiókod? Lépj be!' : 'Még nincs fiókod? Regisztrálj most!'}
          </button>
        </div>
      </div>
    </div>
  );
}
