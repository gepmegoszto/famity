'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { StickyNote, Plus, Trash2, Pin } from 'lucide-react';
import { notifyNewNotice } from '@/lib/emailNotify';

const NOTE_COLORS = [
  { name: 'Sárga', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', badge: 'bg-amber-200' },
  { name: 'Kék', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-200' },
  { name: 'Zöld', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-200' },
  { name: 'Rózsaszín', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', badge: 'bg-rose-200' },
];

export default function NoticeBoard({ familyId, userId }) {
  const [notices, setNotices] = useState([]);
  const [content, setContent] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!familyId) return;

    const q = query(
      collection(db, 'families', familyId, 'notices'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setNotices(list);
    });

    return () => unsubscribe();
  }, [familyId]);

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'families', familyId, 'notices'), {
        content: content.trim(),
        colorIndex: selectedColorIndex,
        pinned: isPinned,
        addedBy: userId,
        createdAt: serverTimestamp()
      });

      // Felhasználó nevének lekérése az e-mail küldéshez
      let senderName = 'Családtag';
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists() && userDoc.data().name) {
          senderName = userDoc.data().name;
        }
      } catch (e) {
        // Alapértelmezett név marad
      }

      // E-mail küldése minden családtagnak az új hűtőmágnesről
      await notifyNewNotice({
        familyId,
        senderId: userId,
        senderName,
        title: content.trim()
      });

      setContent('');
      setIsPinned(false);
    } catch (err) {
      console.error('Hiba a hirdetés mentésekor:', err);
      alert('Nem sikerült menteni a jegyzetet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotice = async (noticeId) => {
    try {
      await deleteDoc(doc(db, 'families', familyId, 'notices', noticeId));
    } catch (err) {
      console.error('Hiba törléskor:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <StickyNote className="w-5 h-5 text-amber-500" />
        <h2 className="text-base font-bold text-slate-800">Családi Üzenőfal</h2>
      </div>

      <form onSubmit={handleAddNotice} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <textarea
          rows={2}
          placeholder="Írj egy jegyzetet vagy fontos infót (pl. Wi-Fi jelszó, kapukód)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white resize-none"
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            {NOTE_COLORS.map((col, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedColorIndex(index)}
                className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${col.badge} ${
                  selectedColorIndex === index ? 'border-slate-800 scale-110' : 'border-transparent'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <Pin className="w-3.5 h-3.5 text-slate-500" />
              Kitűzés
            </label>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition flex items-center justify-center font-bold text-xs gap-1 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {loading ? 'Mentés...' : 'Kitűzés'}
            </button>
          </div>
        </div>
      </form>

      {notices.length === 0 ? (
        <p className="text-slate-400 text-xs text-center py-4">A hirdetőtábla még üres.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {notices.map((notice) => {
            const colorScheme = NOTE_COLORS[notice.colorIndex] || NOTE_COLORS[0];
            return (
              <div
                key={notice.id}
                className={`p-4 rounded-2xl border relative flex flex-col justify-between transition shadow-sm ${colorScheme.bg} ${colorScheme.border}`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs sm:text-sm font-medium whitespace-pre-wrap ${colorScheme.text}`}>
                      {notice.content}
                    </p>
                    {notice.pinned && (
                      <Pin className="w-4 h-4 text-amber-600 shrink-0 fill-amber-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end mt-3 pt-2 border-t border-black/5">
                  <button
                    onClick={() => deleteNotice(notice.id)}
                    className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
