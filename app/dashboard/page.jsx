'use client';
import { useEffect, useState, useRef } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [protocolsAsLender, setProtocolsAsLender] = useState([]);
  const [protocolsAsBorrower, setProtocolsAsBorrower] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [pendingSignatures, setPendingSignatures] = useState([]);
  const [pendingReturnSignatures, setPendingReturnSignatures] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Aktív nézet ('active' | 'chat')
  const [activeTab, setActiveTab] = useState('active');

  // Kiválasztott chat (mostantól bármilyen státuszú protokoll lehet)
  const [selectedChatProtocol, setSelectedChatProtocol] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatMessagesEndRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);

  // Partner adatok & Kép nagyító
  const [selectedPartnerData, setSelectedPartnerData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  // Aláírások
  const [signingProtocolId, setSigningProtocolId] = useState(null);
  const [signingReturnProtocolId, setSigningReturnProtocolId] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().lastName) {
            setHasProfile(true);
          }

          const qLender = query(collection(db, 'lending_protocols'), where('lenderId', '==', currentUser.uid));
          const snapLender = await getDocs(qLender);
          setProtocolsAsLender(snapLender.docs.map(d => ({ id: d.id, ...d.data() })));

          const qBorrowerUid = query(collection(db, 'lending_protocols'), where('borrowerUid', '==', currentUser.uid));
          const snapBorrowerUid = await getDocs(qBorrowerUid);
          setProtocolsAsBorrower(snapBorrowerUid.docs.map(d => ({ id: d.id, ...d.data() })));

        } catch (err) {
          console.error("Hiba az adatok betöltésekor:", err);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const qReq = query(collection(db, 'access_requests'), where('borrowerUid', '==', user.uid), where('status', '==', 'pending'));
    const unsubReq = onSnapshot(qReq, (snap) => {
      setIncomingRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qSign = query(collection(db, 'lending_protocols'), where('borrowerUid', '==', user.uid), where('status', '==', 'Vár a bérlő aláírására'));
    const unsubSign = onSnapshot(qSign, (snap) => {
      setPendingSignatures(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qReturnSign = query(collection(db, 'lending_protocols'), where('borrowerUid', '==', user.uid), where('status', '==', 'Vár a bérlő visszavételi aláírására'));
    const unsubReturnSign = onSnapshot(qReturnSign, (snap) => {
      setPendingReturnSignatures(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubReq();
      unsubSign();
      unsubReturnSign();
    };
  }, [user]);

  useEffect(() => {
    if (!selectedChatProtocol) return;
    const qMsg = query(
      collection(db, 'lending_protocols', selectedChatProtocol.id, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubMsg = onSnapshot(qMsg, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      const unread = msgs.filter(m => m.senderId !== user?.uid).length;
      setUnreadCount(unread);

      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => unsubMsg();
  }, [selectedChatProtocol, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatProtocol || !user) return;

    try {
      await addDoc(collection(db, 'lending_protocols', selectedChatProtocol.id, 'messages'), {
        senderId: user.uid,
        senderEmail: user.email,
        text: newMessage.trim(),
        createdAt: new Date().toISOString()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Hiba az üzenet küldésekor:", err);
      alert('Nem sikerült elküldeni az üzenetet.');
    }
  };

  const handleApproveRequest = async (reqId) => {
    await updateDoc(doc(db, 'access_requests', reqId), { status: 'approved' });
  };
  const handleRejectRequest = async (reqId) => {
    await updateDoc(doc(db, 'access_requests', reqId), { status: 'rejected' });
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleBorrowerSignSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !signingProtocolId) return;
    const signatureDataUrl = canvas.toDataURL();

    try {
      await updateDoc(doc(db, 'lending_protocols', signingProtocolId), {
        'signatures.borrower': signatureDataUrl,
        'signatures.borrowerTimestamp': new Date().toISOString(),
        status: 'Aktív'
      });
      setSigningProtocolId(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Hiba történt az aláírás mentésekor.');
    }
  };

  const handleBorrowerReturnSignSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !signingReturnProtocolId) return;
    const signatureDataUrl = canvas.toDataURL();

    try {
      await updateDoc(doc(db, 'lending_protocols', signingReturnProtocolId), {
        'signatures.returnBorrower': signatureDataUrl,
        'signatures.returnBorrowerTimestamp': new Date().toISOString(),
        status: 'Lezárva'
      });
      setSigningReturnProtocolId(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Hiba történt a visszavételi aláírás mentésekor.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium">Betöltés...</div>;

  const activeLenderProtocols = protocolsAsLender.filter(p => p.status !== 'Lezárva');
  const activeBorrowerProtocols = protocolsAsBorrower.filter(p => p.status !== 'Lezárva');
  
  // Összes bérlés (aktívak ÉS lezártak is) a chathez, hogy lezárás után se vesszen el
  const allProtocolsForChat = [...protocolsAsLender, ...protocolsAsBorrower];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      
      {/* BAL OLDALI SÁV */}
      <aside className="w-64 bg-[#0f4c40] text-slate-300 flex flex-col justify-between hidden md:flex border-r border-[#0d3b32] shrink-0 sticky top-0 h-screen">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-[#145d50]">
            <div className="w-9 h-9 bg-white text-[#0f4c40] rounded-xl flex items-center justify-center font-black text-base shadow">
              F
            </div>
            <div>
              <Link href="/" className="text-lg font-black text-white tracking-tight hover:underline">famity.hu</Link>
              <span className="block text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Biztonságos Kölcsönzés</span>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('active')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'active' ? 'bg-[#145d50] text-white font-bold shadow-sm' : 'hover:bg-[#145d50]/50 text-slate-300'}`}
            >
              <span>📋</span> Új eszköz / Aktívak
            </button>
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'chat' ? 'bg-[#145d50] text-white font-bold shadow-sm' : 'hover:bg-[#145d50]/50 text-slate-300'}`}
            >
              <span>💬</span> Belső Chat
              {unreadCount > 0 && (
                <span className="ml-auto bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {unreadCount} új
                </span>
              )}
            </button>
            <Link href="/dashboard/closed" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#145d50]/50 text-slate-300 transition">
              <span>📁</span> Lezárt archívum
            </Link>
            <Link href="/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#145d50]/50 text-slate-300 transition">
              <span>⚙️</span> Saját adatok / Profil
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-[#145d50] space-y-3">
          <div className="text-xs text-slate-300 px-3 truncate">
            Bejelentkezve:<br/>
            <strong className="text-white font-mono">{user?.email}</strong>
          </div>
          <button onClick={handleLogout} className="w-full bg-[#145d50] hover:bg-[#1a7463] text-white text-xs font-semibold py-2.5 rounded-xl transition shadow">
            Kilépés
          </button>
        </div>
      </aside>

      {/* JOBB OLDALI TARTALOM */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center md:hidden">
          <span className="font-black text-[#0f4c40]">famity.hu</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('active')} className="text-xs px-3 py-1.5 bg-slate-100 rounded-lg font-semibold">Aktívak</button>
            <button onClick={() => setActiveTab('chat')} className="text-xs px-3 py-1.5 bg-slate-100 rounded-lg font-semibold">Chat</button>
            <Link href="/dashboard/closed" className="text-xs px-3 py-1.5 bg-slate-100 rounded-lg font-semibold">Archívum</Link>
            <button onClick={handleLogout} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-semibold">Kilépés</button>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-8">
          
          {incomingRequests.length > 0 && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-base text-blue-900 flex items-center gap-2">
                <span>🔔</span> Beérkező adatkérési kérelmek
              </h3>
              {incomingRequests.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="font-bold text-slate-900 text-sm">{req.lenderName || req.lenderEmail} hozzáférést kér a személyes adataihoz.</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveRequest(req.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">Engedélyezem</button>
                    <button onClick={() => handleRejectRequest(req.id)} className="bg-red-100 text-red-700 hover:bg-red-700 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition">Elutasítás</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pendingSignatures.length > 0 && (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-base text-amber-900 flex items-center gap-2">
                <span>✍️</span> Aláírásra váró bérleti jegyzőkönyv
              </h3>
              {pendingSignatures.map(proto => (
                <div key={proto.id} className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{proto.itemDetails?.name} <span className="text-xs font-mono text-slate-400">({proto.id.slice(0, 8).toUpperCase()})</span></p>
                    <p className="text-xs text-slate-500">Bérbeadó: {proto.lenderEmail}</p>
                  </div>
                  <button onClick={() => setSigningProtocolId(proto.id)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow">
                    Aláírás megtekintése →
                  </button>
                </div>
              ))}
            </div>
          )}

          {pendingReturnSignatures.length > 0 && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-base text-emerald-900 flex items-center gap-2">
                <span>🔄</span> Visszavétel aláírása szükséges
              </h3>
              {pendingReturnSignatures.map(proto => (
                <div key={proto.id} className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{proto.itemDetails?.name} <span className="text-xs font-mono text-slate-400">({proto.id.slice(0, 8).toUpperCase()})</span></p>
                    <p className="text-xs text-slate-500">Bérbeadó: {proto.lenderEmail}</p>
                  </div>
                  <button onClick={() => setSigningReturnProtocolId(proto.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow">
                    Visszavétel aláírása →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AKTÍV FÜL */}
          {activeTab === 'active' && (
            <div className="space-y-10">
              
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0f4c40] bg-emerald-50 px-3 py-1 rounded-full">Hitelesített Munkaterület</span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Kölcsönzési Vezérlőpult</h1>
                  <p className="text-sm text-slate-600">Kezeld eszközeidet és partnereidet biztonságosan a Ptk. szabályai szerint.</p>
                </div>
                <div>
                  {hasProfile ? (
                    <Link href="/dashboard/new" className="bg-[#0f4c40] hover:bg-[#145d50] text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg transition text-sm flex items-center gap-2">
                      <span>+ Új kölcsönzés indítása</span>
                    </Link>
                  ) : (
                    <Link href="/profile" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow transition text-sm animate-pulse">
                      ⚠️ Először töltsd ki a profilod
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Bérbeadóként */}
                <div className="space-y-4">
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span>📤</span> Aktív indításaim (Bérbeadóként)
                  </h2>
                  {activeLenderProtocols.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
                      Nincs aktív bérlésed bérbeadóként.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeLenderProtocols.map(p => {
                        const returnDateStr = p.rentalTerms?.expectedReturnDate ? new Date(p.rentalTerms.expectedReturnDate).toLocaleString('hu-HU') : 'Nincs megadva';
                        return (
                          <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-slate-900 text-base">{p.itemDetails?.name}</h3>
                              <span className="text-xs font-mono bg-emerald-50 text-[#0f4c40] px-2.5 py-1 rounded-xl font-semibold">Hitelesítve</span>
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <p>Bérlő: <span className="font-semibold text-slate-900">{p.borrowerData?.lastName} {p.borrowerData?.firstName}</span></p>
                              <p>Visszavételi határidő: <span className="font-semibold text-slate-900">{returnDateStr}</span></p>
                            </div>

                            {p.itemDetails?.photos && p.itemDetails.photos.length > 0 && (
                              <div className="pt-2">
                                <p className="text-[11px] font-bold text-slate-500 mb-1.5">Csatolt fényképek:</p>
                                <div className="flex gap-2 flex-wrap">
                                  {p.itemDetails.photos.map((photoUrl, idx) => (
                                    <button 
                                      key={idx} 
                                      onClick={() => setPreviewImage(photoUrl)}
                                      className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden hover:opacity-80 transition relative shadow-sm group"
                                    >
                                      <img src={photoUrl} alt="Eszköz fotó" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px]">🔍 Nagyítás</div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center">
                              <button onClick={() => setSelectedPartnerData({ title: 'Bérlő adatai', data: p.borrowerData, email: p.borrowerEmail })} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition">👤 Bérlő adatai</button>
                              <button onClick={() => { setSelectedChatProtocol(p); setActiveTab('chat'); }} className="bg-emerald-50 hover:bg-emerald-100 text-[#0f4c40] text-xs font-semibold px-3 py-2 rounded-xl transition">💬 Chat</button>
                              <Link href={`/dashboard/protocol/${p.id}`} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition">Jegyzőkönyv</Link>
                              {p.status === 'Aktív' && (
                                <Link href={`/dashboard/return/${p.id}`} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition ml-auto shadow">Visszavétel</Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bérlőként */}
                <div className="space-y-4">
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span>📥</span> Aktív bérléseim (Bérlőként)
                  </h2>
                  {activeBorrowerProtocols.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
                      Nincs aktív bérlésed bérlőként.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeBorrowerProtocols.map(p => {
                        const returnDateStr = p.rentalTerms?.expectedReturnDate ? new Date(p.rentalTerms.expectedReturnDate).toLocaleString('hu-HU') : 'Nincs megadva';
                        return (
                          <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-slate-900 text-base">{p.itemDetails?.name}</h3>
                              <span className="text-xs font-mono bg-emerald-50 text-[#0f4c40] px-2.5 py-1 rounded-xl font-semibold">Hitelesítve</span>
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <p>Bérbeadó: <span className="font-semibold text-slate-900">{p.lenderData?.lastName} {p.lenderData?.firstName}</span></p>
                              <p>Visszavételi határidő: <span className="font-semibold text-slate-900">{returnDateStr}</span></p>
                            </div>

                            {p.itemDetails?.photos && p.itemDetails.photos.length > 0 && (
                              <div className="pt-2">
                                <p className="text-[11px] font-bold text-slate-500 mb-1.5">Csatolt fényképek:</p>
                                <div className="flex gap-2 flex-wrap">
                                  {p.itemDetails.photos.map((photoUrl, idx) => (
                                    <button 
                                      key={idx} 
                                      onClick={() => setPreviewImage(photoUrl)}
                                      className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden hover:opacity-80 transition relative shadow-sm group"
                                    >
                                      <img src={photoUrl} alt="Eszköz fotó" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px]">🔍 Nagyítás</div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center">
                              <button onClick={() => setSelectedPartnerData({ title: 'Bérbeadó adatai', data: p.lenderData, email: p.lenderEmail })} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition">👤 Bérbeadó adatai</button>
                              <button onClick={() => { setSelectedChatProtocol(p); setActiveTab('chat'); }} className="bg-emerald-50 hover:bg-emerald-100 text-[#0f4c40] text-xs font-semibold px-3 py-2 rounded-xl transition">💬 Chat</button>
                              <Link href={`/dashboard/protocol/${p.id}`} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition">Jegyzőkönyv</Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* CHAT FÜL (MINDEN BÉRLÉSHEZ ELÉRHETŐ, AKÁR LEZÁRT IS) */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm h-[75vh] flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-sm">Beszélgetések</h3>
                  <p className="text-xs text-slate-500">Aktív és lezárt bérlések chatei</p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {allProtocolsForChat.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">Nincs elérhető beszélgetés.</div>
                  ) : (
                    allProtocolsForChat.map(p => {
                      const isSelected = selectedChatProtocol?.id === p.id;
                      const isClosed = p.status === 'Lezárva';
                      const partnerName = p.lenderId === user?.uid 
                        ? `${p.borrowerData?.lastName || ''} ${p.borrowerData?.firstName || ''}`
                        : `${p.lenderData?.lastName || ''} ${p.lenderData?.firstName || ''}`;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedChatProtocol(p)}
                          className={`w-full text-left p-4 transition flex flex-col gap-1 ${isSelected ? 'bg-emerald-50 border-l-4 border-[#0f4c40]' : 'hover:bg-slate-100'}`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-bold text-slate-900 text-sm truncate">{p.itemDetails?.name}</div>
                            {isClosed && <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">Lezárt</span>}
                          </div>
                          <div className="text-xs text-slate-500 flex justify-between">
                            <span>Partner: {partnerName || 'Partner'}</span>
                            <span className="font-mono text-[10px]">#{p.id.slice(0, 4)}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-white">
                {selectedChatProtocol ? (
                  <>
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{selectedChatProtocol.itemDetails?.name}</span>
                          {selectedChatProtocol.status === 'Lezárva' && <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-normal">Archivált bérlés</span>}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono">ID: #{selectedChatProtocol.id}</span>
                      </div>
                      <span className="text-xs bg-emerald-100 text-[#0f4c40] px-3 py-1 rounded-full font-bold">Biztonságos csatorna</span>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs py-16">Még nincsenek üzenetek ehhez a bérléshez.</div>
                      ) : (
                        messages.map(msg => {
                          const isMe = msg.senderId === user?.uid;
                          return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.senderEmail}</span>
                              <div className={`max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${isMe ? 'bg-[#0f4c40] text-white rounded-br-none shadow' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'}`}>
                                {msg.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-3">
                      <input 
                        type="text" 
                        value={newMessage} 
                        onChange={e => setNewMessage(e.target.value)} 
                        placeholder="Írd meg üzeneted a partnernek..." 
                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c40]"
                      />
                      <button type="submit" className="bg-[#0f4c40] hover:bg-[#145d50] text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition shadow">
                        Küldés
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                    <span className="text-4xl">💬</span>
                    <p className="text-sm font-semibold">Válassz ki egy beszélgetést a bal oldali listából.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Kép Nagyító (Lightbox) Modál */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setPreviewImage(null)} 
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white font-bold px-4 py-2 rounded-xl transition text-sm"
            >
              ✕ Bezárás
            </button>
            <img src={previewImage} alt="Nagyított fénykép" className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-black" />
          </div>
        </div>
      )}

      {/* Partner Adatainak Modál */}
      {selectedPartnerData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
            <h3 className="text-xl font-extrabold text-slate-900 border-b pb-3">{selectedPartnerData.title}</h3>
            <div className="text-sm space-y-2.5 text-slate-700">
              <p><strong>Név:</strong> {selectedPartnerData.data?.lastName} {selectedPartnerData.data?.firstName}</p>
              <p><strong>Email:</strong> {selectedPartnerData.email || selectedPartnerData.data?.email || 'Nincs megadva'}</p>
              <p><strong>Telefonszám:</strong> {selectedPartnerData.data?.phone || 'Nincs megadva'}</p>
              <p><strong>Személyi igazolvány sz.:</strong> {selectedPartnerData.data?.idCardNumber || 'Nincs megadva'}</p>
              <p><strong>Anyja neve:</strong> {selectedPartnerData.data?.mothersName || 'Nincs megadva'}</p>
              <p><strong>Születési hely, idő:</strong> {selectedPartnerData.data?.birthPlace || ''}, {selectedPartnerData.data?.birthDate || ''}</p>
              <p><strong>Lakcím:</strong> {selectedPartnerData.data?.address?.zip} {selectedPartnerData.data?.address?.city}, {selectedPartnerData.data?.address?.street} {selectedPartnerData.data?.address?.houseNumber}</p>
            </div>
            <div className="pt-4 border-t flex justify-end">
              <button onClick={() => setSelectedPartnerData(null)} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow">Bezárás</button>
            </div>
          </div>
        </div>
      )}

      {/* Aláíró Modál */}
      {signingProtocolId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl my-8">
            <h3 className="text-xl font-extrabold text-slate-900">famity.hu – Aláírás és Jogi Tájékoztató</h3>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex justify-center p-4">
              <canvas ref={canvasRef} width={420} height={180} className="cursor-crosshair touch-none bg-white rounded-xl border shadow-sm" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={clearCanvas} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition">Törlés</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSigningProtocolId(null)} className="text-slate-600 px-4 py-2.5 text-sm font-medium">Mégse</button>
                <button type="button" onClick={handleBorrowerSignSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow transition">Aláírás és Véglegesítés</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visszavételi Aláíró Modál */}
      {signingReturnProtocolId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl my-8">
            <h3 className="text-xl font-extrabold text-slate-900">famity.hu – Visszavételi Aláírás</h3>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex justify-center p-4">
              <canvas ref={canvasRef} width={420} height={180} className="cursor-crosshair touch-none bg-white rounded-xl border shadow-sm" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={clearCanvas} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition">Törlés</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSigningReturnProtocolId(null)} className="text-slate-600 px-4 py-2.5 text-sm font-medium">Mégse</button>
                <button type="button" onClick={handleBorrowerReturnSignSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow transition">Aláírás és Lezárás</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
