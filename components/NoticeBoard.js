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
  serverTimestamp 
} from 'firebase/firestore';
import { StickyNote, Plus, Trash2, Pin } from 'lucide-react';

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
      
      // Kitűzött üzenetek előre rendezése
      list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setNotices(list);
    });

    return () => unsubscribe();
  }, [familyId]);

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addDoc(collection(db, 'families', familyId, 'notices'), {
      content: content.trim(),
      colorIndex: selectedColorIndex,
      pinned: isPinned,
      addedBy: userId,
      createdAt: serverTimestamp()
    });

    setContent('');
    setIsPinned(false);
  };

  const deleteNotice = async (noticeId) => {
    await deleteDoc(doc(db, 'families', familyId, 'notices', noticeId));
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-800">Családi Hirdetőtábla</h2>
      </div>

      {/* Új üzenet rögzítése */}
      <form onSubmit={handleAddNotice} className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <textarea
          rows={2}
          placeholder="Írj egy jegyzetet vagy fontos infót (pl. Wi-Fi: password123)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white resize-none"
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Színválasztó */}
          <div className="flex items-center gap-1.5">
            {NOTE_COLORS.map((col, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedColorIndex(index)}
                className={`w-6 h-6 rounded-full border-2 transition ${col.badge} ${
                  selectedColorIndex === index ? 'border-slate-800 scale-110' : 'border-transparent'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Kitűzés opció */}
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <Pin className="w-3.5 h-3.5 text-slate-500" />
              Kitűzés felülre
            </label>

            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition flex items-center justify-center font-medium text-sm gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Kitűzés
            </button>
          </div>
        </div>
      </form>

      {/* Jegyzetek nézete */}
      {notices.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">A hirdetőtábla még üres.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {notices.map((notice) => {
            const colorScheme = NOTE_COLORS[notice.colorIndex] || NOTE_COLORS[0];
            return (
              <div
                key={notice.id}
                className={`p-4 rounded-xl border relative flex flex-col justify-between transition shadow-sm ${colorScheme.bg} ${colorScheme.border}`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium whitespace-pre-wrap ${colorScheme.text}`}>
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
                    className="text-slate-400 hover:text-red-500 transition p-1"
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
