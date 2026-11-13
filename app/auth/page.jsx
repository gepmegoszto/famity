'use client';
import { useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
          });
        }
        router.push('/profile');
      }
    } catch (err) {
      console.error(err);
      setError('Hiba történt: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Vissza a főoldalra gomb */}
        <div>
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
            ← Vissza a famity.hu főoldalára
          </Link>
        </div>

        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">famity.hu platform</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">{isLogin ? 'Bejelentkezés' : 'Regisztráció'}</h1>
          <p className="text-sm text-slate-600 mt-1">Kölcsönadási jegyzőkönyvek és eszközkezelés biztonságosan</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email cím</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
              placeholder="pelda@email.hu" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jelszó</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Folyamatban...' : (isLogin ? 'Bejelentkezés' : 'Regisztráció és adatok megadása →')}
          </button>
        </form>

        <div className="text-center pt-2 border-t">
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? 'Nincs még fiókod? Regisztrálj itt!' : 'Már van fiókod? Jelentkezz be!'}
          </button>
        </div>
      </div>
    </main>
  );
}
