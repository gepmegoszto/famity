'use client';
import { useState } from 'react';
import { ShieldCheck, Check, Sparkles, X } from 'lucide-react';

export default function SubscriptionModal({ isOpen, onClose, familyId, userId }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Itt fogjuk majd hívni a Stripe Checkout API route-ot a 6. lépésben
      // Például: const res = await fetch('/api/create-checkout-session', { method: 'POST', body: JSON.stringify({ familyId, userId }) });
      // const data = await res.json();
      // window.location.href = data.url;
      
      alert('A Stripe fizetési integráció a következő lépésben lesz élesítve!');
    } catch (err) {
      console.error('Hiba a fizetés indításakor:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-slate-100 space-y-6">
        
        {/* Bezárás gomb */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" /> Famity Prémium Család
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Váltsatok Családi Prémiumra!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Egyetlen előfizetés az egész családnak. Élvezzétek a teljes platformot zavaró reklámok nélkül.
          </p>
        </div>

        {/* Árazás kártya */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden space-y-4">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Éves vagy Havi Csomag</span>
              <h3 className="text-xl font-black">Családi csomag</h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black">1 990 Ft</span>
              <span className="text-xs text-slate-300 block">/ hó</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Teljes körű reklámmentesség</strong> az egész családnak</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Adminisztrátor fizet — <strong>minden családtag mentesül</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Korlátlan adattárolás és prioritás támogatás</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Átirányítás a fizetésre...' : 'Előfizetés indítása'}
        </button>

        <p className="text-[11px] text-center text-slate-400 font-medium">
          Biztonságos bankkártyás fizetés a Stripe rendszerén keresztül. Bármikor lemondható.
        </p>

      </div>
    </div>
  );
}
