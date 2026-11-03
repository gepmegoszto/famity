'use client';
import { useEffect } from 'react';

export default function AdBanner({ 
  dataAdSlot, 
  dataAdFormat = 'auto', 
  dataFullWidthResponsive = 'true' 
}) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense hirdetésbetöltési hiba:', err);
    }
  }, []);

  return (
    <div className="my-6 text-center overflow-hidden bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
        Hirdetés
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
}
