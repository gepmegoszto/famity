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
  updateDoc,
  increment 
} from 'firebase/firestore';
import { 
  Award, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Gift, 
  Clock, 
  Calendar, 
  User, 
  Sparkles, 
  ShieldAlert,
  History
} from 'lucide-react';

export default function ChoreTracker({ familyId, userId }) {
  const [activeSubTab, setActiveSubTab] = useState('chores'); // 'chores' | 'rewards' | 'history'
  
  // Adatállapotok
  const [chores, setChores] = useState([]);
  const [members, setMembers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);

  // Új házimunka űrlap állapotok
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState(10);
  const [assigneeId, setAssigneeId] = useState('anyone');
  const [dueDate, setDueDate] = useState('');

  // Új jutalom űrlap állapotok (Admin)
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardPoints, setRewardPoints] = useState(50);

  // Aktuális felhasználó adatai
  const currentUser = members.find(m => m.id === userId);
  const isAdmin = currentUser?.role === 'admin';
  const myPoints = currentUser?.pointsBalance || 0;

  useEffect(() => {
    if (!familyId) return;

    // 1. Családtagok figyelése (pontok és szerepkörök miatt)
    const unsubMembers = onSnapshot(
      collection(db, 'families', familyId, 'members'),
      (snapshot) => {
        setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    // 2. Házimunkák figyelése
    const qChores = query(
      collection(db, 'families', familyId, 'chores'),
      orderBy('createdAt', 'desc')
    );
    const unsubChores = onSnapshot(qChores, (snapshot) => {
      setChores(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Jutalmak/Célok figyelése
    const qRewards = query(
      collection(db, 'families', familyId, 'rewards'),
      orderBy('pointsRequired', 'asc')
    );
    const unsubRewards = onSnapshot(qRewards, (snapshot) => {
      setRewards(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 4. Beváltási előzmények figyelése
    const qRedemptions = query(
      collection(db, 'families', familyId, 'redemptions'),
      orderBy('createdAt', 'desc')
    );
    const unsubRedemptions = onSnapshot(qRedemptions, (snapshot) => {
      setRedemptions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubMembers();
      unsubChores();
      unsubRewards();
      unsubRedemptions();
    };
  }, [familyId]);

  // Új feladat hozzáadása
  const handleAddChore = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedMember = members.find(m => m.id === assigneeId);

    await addDoc(collection(db, 'families', familyId, 'chores'), {
      title: title.trim(),
      points: Number(points) || 10,
      assigneeId: assigneeId,
      assigneeName: assigneeId === 'anyone' ? 'Bárki' : (assignedMember?.name || 'Névtelen'),
      dueDate: dueDate || null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null,
      addedBy: userId,
      createdAt: serverTimestamp()
    });

    setTitle('');
    setPoints(10);
    setAssigneeId('anyone');
    setDueDate('');
  };

  // Feladat lezárása / megnyitása
  const toggleCompleteChore = async (chore) => {
    const isCompleting = !chore.completed;
    const choreRef = doc(db, 'families', familyId, 'chores', chore.id);

    const completingMember = members.find(m => m.id === userId);

    await updateDoc(choreRef, {
      completed: isCompleting,
      completedBy: isCompleting ? userId : null,
      completedByName: isCompleting ? (completingMember?.name || 'Névtelen') : null,
      completedAt: isCompleting ? new Date().toISOString() : null
    });

    // Pontszám jóváírása / visszavonása a feladatot elvégző tagnál
    const targetMemberId = isCompleting ? userId : chore.completedBy;
    if (targetMemberId) {
      const memberRef = doc(db, 'families', familyId, 'members', targetMemberId);
      await updateDoc(memberRef, {
        pointsBalance: increment(isCompleting ? chore.points : -chore.points)
      }).catch(() => {});
    }
  };

  // Feladat törlése
  const deleteChore = async (choreId) => {
    await deleteDoc(doc(db, 'families', familyId, 'chores', choreId));
  };

  // Új Jutalom / Cél hozzáadása (Admin)
  const handleAddReward = async (e) => {
    e.preventDefault();
    if (!rewardTitle.trim() || !rewardPoints) return;

    await addDoc(collection(db, 'families', familyId, 'rewards'), {
      title: rewardTitle.trim(),
      pointsRequired: Number(rewardPoints),
      createdBy: userId,
      createdAt: serverTimestamp()
    });

    setRewardTitle('');
    setRewardPoints(50);
  };

  // Jutalom beváltása
  const handleRedeemReward = async (reward) => {
    if (myPoints < reward.pointsRequired) {
      alert('Nincs elég pontod ehhez a jutalomhoz!');
      return;
    }

    if (!confirm(`Biztosan beváltod ezt a jutalmat: "${reward.title}" (${reward.pointsRequired} pont)?`)) {
      return;
    }

    // 1. Pontok levonása a családtag egyenlegéből
    const memberRef = doc(db, 'families', familyId, 'members', userId);
    await updateDoc(memberRef, {
      pointsBalance: increment(-reward.pointsRequired)
    });

    // 2. Beváltási napló rögzítése
    await addDoc(collection(db, 'families', familyId, 'redemptions'), {
      rewardTitle: reward.title,
      pointsRequired: reward.pointsRequired,
      redeemedBy: userId,
      redeemedByName: currentUser?.name || 'Névtelen',
      createdAt: serverTimestamp()
    });

    alert('Sikeres beváltás! Értesítsd a családfőt a beváltott jutalomról.');
  };

  // Jutalom törlése (Admin)
  const deleteReward = async (rewardId) => {
    await deleteDoc(doc(db, 'families', familyId, 'rewards', rewardId));
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      
      {/* Fejléc & Saját Egyenleg */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Házimunka & Pontgyűjtő</h2>
            <p className="text-xs text-slate-400">Végezd el a teendőidet és váltsd be a pontjaidat!</p>
          </div>
        </div>

        {/* Saját Pontszám Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-2xl shadow-md shadow-indigo-500/20 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-medium">Pontjaid:</span>
          <span className="text-base font-black font-mono">{myPoints} p</span>
        </div>
      </div>

      {/* Családtagok Pontszám Ranglistája */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1">
          Ranglista:
        </span>
        {members.map(m => (
          <div 
            key={m.id} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50/80 shrink-0"
          >
            <div 
              className="w-3.5 h-3.5 rounded-full" 
              style={{ backgroundColor: m.color || '#3B82F6' }} 
            />
            <span className="font-bold text-slate-700">{m.name || 'Névtelen'}:</span>
            <span className="font-mono font-bold text-indigo-600">{m.pointsBalance || 0} p</span>
          </div>
        ))}
      </div>

      {/* Al-navigáció: Házimunkák / Jutalmak & Célok / Előzmények */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('chores')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'chores' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> Feladatok ({chores.filter(c => !c.completed).length})
        </button>

        <button
          onClick={() => setActiveSubTab('rewards')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'rewards' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" /> Jutalmak & Beváltás ({rewards.length})
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Előzmények
        </button>
      </div>

      {/* 1. TAB: HÁZIMUNKÁK NÉZET */}
      {activeSubTab === 'chores' && (
        <div className="space-y-6">
          
          {/* Új házimunka felvétele */}
          <form onSubmit={handleAddChore} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Új házimunka kiírása
            </span>

            <input
              type="text"
              placeholder="Feladat neve (pl. Portörlés, Fűnyírás, Szelektív hulladék)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Felelős kiválasztása legördülőből */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Felelős</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="anyone">Bárki elvégezheti</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Határidő megadása */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Határidő (opcionális)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Pontérték */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Járó pont</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Feladat kiírása
            </button>
          </form>

          {/* Házimunkák Listája */}
          {chores.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">Jelenleg nincs kiírt házimunka.</p>
          ) : (
            <div className="space-y-2">
              {chores.map((chore) => {
                const isOverdue = chore.dueDate && !chore.completed && new Date(chore.dueDate) < new Date(new Date().setHours(0,0,0,0));

                return (
                  <div
                    key={chore.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      chore.completed 
                        ? 'bg-emerald-50/40 border-emerald-100 opacity-75' 
                        : isOverdue 
                          ? 'bg-rose-50/50 border-rose-200' 
                          : 'bg-white border-slate-100 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Pipáló gomb */}
                      <button
                        onClick={() => toggleCompleteChore(chore)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition mt-0.5 sm:mt-0 ${
                          chore.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-indigo-500 bg-white'
                        }`}
                      >
                        {chore.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1">
                        <p className={`text-xs sm:text-sm font-bold ${chore.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {chore.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          {/* Felelős badge */}
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                            <User className="w-3 h-3 text-slate-400" />
                            {chore.assigneeName}
                          </span>

                          {/* Határidő badge */}
                          {chore.dueDate && (
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                              isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              {chore.dueDate} {isOverdue && '(Lejárt!)'}
                            </span>
                          )}

                          {/* Lezárás időpontja */}
                          {chore.completed && chore.completedAt && (
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                              <Clock className="w-3 h-3" />
                              Kész: {chore.completedByName} ({new Date(chore.completedAt).toLocaleDateString('hu-HU')} {new Date(chore.completedAt).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                        +{chore.points} p
                      </span>

                      <button
                        onClick={() => deleteChore(chore.id)}
                        className="text-slate-300 hover:text-rose-500 transition p-1"
                        title="Törlés"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 2. TAB: JUTALMAK & CÉLOK (PONTBEVÁLTÁS) NÉZET */}
      {activeSubTab === 'rewards' && (
        <div className="space-y-6">
          
          {/* Admin felület új jutalom felvételére */}
          {isAdmin ? (
            <form onSubmit={handleAddReward} className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Cél / Jutalom felvétele (Admin)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Jutalom neve (pl. 1 óra gépezés, Mozi, Csoki)"
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  className="p-2.5 sm:col-span-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Szükséges pont"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-amber-600 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Jutalom meghirdetése
              </button>
            </form>
          ) : (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Új jutalmakat és célokat a család Adminisztrátora írhat ki.</span>
            </div>
          )}

          {/* Jutalmak Listája */}
          {rewards.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">Még nincsenek meghirdetett jutalmak.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rewards.map((reward) => {
                const canRedeem = myPoints >= reward.pointsRequired;

                return (
                  <div
                    key={reward.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between gap-3 relative"
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">{reward.title}</h4>
                        <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl shrink-0">
                          {reward.pointsRequired} p
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleRedeemReward(reward)}
                        disabled={!canRedeem}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          canRedeem
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        {canRedeem ? 'Beváltás' : 'Kevés pont'}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => deleteReward(reward.id)}
                          className="text-slate-300 hover:text-rose-500 transition p-1"
                          title="Jutalom törlése"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 3. TAB: BEVÁLTÁSI ELŐZMÉNYEK NÉZET */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Legutóbbi pontbeváltások
          </span>

          {redemptions.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">Még nem váltott be senki jutalmat.</p>
          ) : (
            <div className="space-y-2">
              {redemptions.map((red) => (
                <div
                  key={red.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">
                      <span className="text-indigo-600">{red.redeemedByName}</span> beváltotta: <span className="text-slate-900">{red.rewardTitle}</span>
                    </p>
                    {red.createdAt && (
                      <p className="text-[10px] text-slate-400">
                        {new Date(red.createdAt.seconds * 1000).toLocaleDateString('hu-HU')} {new Date(red.createdAt.seconds * 1000).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>

                  <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl shrink-0">
                    -{red.pointsRequired} p
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
