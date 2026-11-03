'use client';
import { X, ShieldCheck, Lock, Database, UserCheck, Scale, Cookie } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col space-y-4 my-auto">
        
        {/* Fejléc */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Adatkezelési Tájékoztató</h3>
              <p className="text-xs text-slate-400">famity.hu — Hatályos: 2026. január 1-től</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Görgethető tartalom */}
        <div className="overflow-y-auto pr-2 space-y-5 text-xs text-slate-600 leading-relaxed font-sans">
          
          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" /> 1. Az Adatkezelő adatai
            </h4>
            <p>
              A <strong>famity.hu</strong> üzemeltetője elkötelezett a felhasználók személyes adatainak védelme iránt. 
              Kapcsolat: <a href="mailto:info@famity.hu" className="text-blue-600 font-bold underline">info@famity.hu</a>.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" /> 2. A kezelt adatok köre
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Fiókadatok:</strong> E-mail cím, jelszó-hash, választott név, családi színkód.</li>
              <li><strong>Családi adatok:</strong> Naptári események, bevásárlólisták, menüterv, házimunka pontok.</li>
              <li><strong>Technikai adatok:</strong> IP-cím, böngészőtípus, sütik (cookie-k).</li>
            </ul>
          </section>

          {/* Google AdSense specifikus pont */}
          <section className="space-y-1.5 bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
              <Cookie className="w-4 h-4 text-blue-600" /> 3. Google AdSense és Harmadik Feles Sütik
            </h4>
            <p className="text-blue-900">
              Weboldalunkon a Google AdSense szolgáltatást használhatjuk hirdetések megjelenítésére. A Google mint harmadik fél cookie-kat (pl. DART cookie) használ a hirdetések kiszolgálására a felhasználók korábbi látogatásai alapján.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-blue-900">
              <li>A felhasználók kikapcsolhatják a személyre szabott hirdetéseket a Google Hirdetési beállításaiban.</li>
              <li>A családi zárt felületen belüli bizalmas adatok (naptár, teendők) NEM kerülnek átadásra a hirdetési hálózatoknak.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" /> 4. Adatbiztonság
            </h4>
            <p>
              Minden adatátvitel SSL/TLS titkosítással védett. Az adatokat biztonságos európai szerverinfrastruktúrában tároljuk.
            </p>
          </section>

          <section className="space-y-1 border-t border-slate-100 pt-3">
            <p className="text-[11px] text-slate-400">
              A felhasználó bármikor kérheti fiókja és adatainak törlését az info@famity.hu e-mail címen.
            </p>
          </section>

        </div>

        <div className="pt-2 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer"
          >
            Értettem, bezárás
          </button>
        </div>

      </div>
    </div>
  );
}
