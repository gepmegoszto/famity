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
  History,
  BarChart3,
  Trophy
} from 'lucide-react';
import { notifyNewChore, notifyRewardRedeemed } from '@/lib/emailNotify';

export default function ChoreTracker({ familyId, userId }) {
  const [activeSubTab, setActiveSubTab] = useState('chores'); // 'chores' | 'rewards' | 'stats' | 'history'
  
  // Adatállapotok
  const [chores, setChores] = useState([]);
  const [members, setMembers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [choreHistory, setChoreHistory] = useState([]);

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

  // Dátum és időszámítás a heti/havi resethez és kimutatásokhoz
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentWeekNumber = getISOWeek(now);

  function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  useEffect(() => {
    if (!familyId) return;

    // 1. Családtagok figyelése
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

    // 3. Jutalmak figyelése
    const qRewards = query(
      collection(db, 'families', familyId, 'rewards'),
      orderBy('pointsRequired', 'asc')
    );
    const unsubRewards = onSnapshot(qRewards, (snapshot) => {
      setRewards(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 4. Beváltási előzmények
    const qRedemptions = query(
      collection(db, 'families', familyId, 'redemptions'),
      orderBy('createdAt', 'desc')
    );
    const unsubRedemptions = onSnapshot(qRedemptions, (snapshot) => {
      setRedemptions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 5. Elvégzett feladatok története (heti/havi/éves pontokhoz)
    const qHistory = query(
      collection(db, 'families', familyId, 'choreHistory'),
      orderBy('completedAt', 'desc')
    );
    const unsubHistory = onSnapshot(qHistory, (snapshot) => {
      setChoreHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubMembers();
      unsubChores();
      unsubRewards();
      unsubRedemptions();
      unsubHistory();
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

    if (assigneeId !== 'anyone' && assignedMember) {
      await notifyNewChore({
        familyId,
        assignedUserId: assigneeId,
        assignedUserName: assignedMember.name || 'Családtag',
        choreTitle: title.trim(),
        points: Number(points) || 10
      });
    }

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
    const compName = completingMember?.name || 'Névtelen';
    const compId = userId;

    await updateDoc(choreRef, {
      completed: isCompleting,
      completedBy: isCompleting ? compId : null,
      completedByName: isCompleting ? compName : null,
      completedAt: isCompleting ? new Date().toISOString() : null
    });

    // Ha teljesítik, bekerül a history-ba is a heti/havi ranglistákhoz
    if (isCompleting) {
      await addDoc(collection(db, 'families', familyId, 'choreHistory'), {
        choreTitle: chore.title,
        points: chore.points,
        completedBy: compId,
        completedByName: compName,
        completedAt: new Date().toISOString(),
        year: currentYear,
        month: currentMonth,
        week: currentWeekNumber
      });
    }

    const targetMemberId = isCompleting ? compId : chore.completedBy;
    if (targetMemberId) {
      const memberRef = doc(db, 'families', familyId, 'members', targetMemberId);
      await updateDoc(memberRef, {
        pointsBalance: increment(isCompleting ? chore.points : -chore.points)
      }).catch(() => {});
    }
  };

  const deleteChore = async (choreId) => {
    await deleteDoc(doc(db, 'families', familyId, 'chores', choreId));
  };

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

  const handleRedeemReward = async (reward) => {
    if (myPoints < reward.pointsRequired) {
      alert('Nincs elég pontod ehhez a jutalomhoz!');
      return;
    }

    if (!confirm(`Biztosan beváltod ezt a jutalmat: "${reward.title}" (${reward.pointsRequired} pont)?`)) {
      return;
    }

    const memberRef = doc(db, 'families', familyId, 'members', userId);
    await updateDoc(memberRef, {
      pointsBalance: increment(-reward.pointsRequired)
    });

    await addDoc(collection(db, 'families', familyId, 'redemptions'), {
      rewardTitle: reward.title,
      pointsRequired: reward.pointsRequired,
      redeemedBy: userId,
      redeemedByName: currentUser?.name || 'Névtelen',
      createdAt: serverTimestamp()
    });

    if (reward.createdBy) {
      const creatorMember = members.find(m => m.id === reward.createdBy);
      await notifyRewardRedeemed({
        familyId,
        creatorUserId: reward.createdBy,
        creatorName: creatorMember?.name || 'Családfő',
        redeemerName: currentUser?.name || 'Családtag',
        rewardTitle: reward.title,
        pointsCost: reward.pointsRequired
      });
    }

    alert('Sikeres beváltás! Értesítést küldtünk a létrehozónak.');
  };

  const deleteReward = async (rewardId) => {
    await deleteDoc(doc(db, 'families', familyId, 'rewards', rewardId));
  };

  // --- RANGLISTÁK ÉS KIMUTATÁSOK SZÁMÍTÁSA ---
  const currentWeekHistory = choreHistory.filter(h => h.week === currentWeekNumber && h.year === currentYear);
  const weeklyScores = members.map(m => {
    const totalW = currentWeekHistory
      .filter(h => h.completedBy === m.id)
      .reduce((sum, h) => sum + (h.points || 0), 0);
    return { ...m, periodPoints: totalW };
  }).sort((a, b) => b.periodPoints - a.periodPoints);

  const currentMonthHistory = choreHistory.filter(h => h.month === currentMonth && h.year === currentYear);
  const monthlyScores = members.map(m => {
    const totalM = currentMonthHistory
      .filter(h => h.completedBy === m.id)
      .reduce((sum, h) => sum + (h.points || 0), 0);
    return { ...m, periodPoints: totalM };
  }).sort((a, b) => b.periodPoints - a.periodPoints);

  const yearlyScores = members.map(m => {
    const totalY = choreHistory
      .filter(h => h.completedBy === m.id && h.year === currentYear)
      .reduce((sum, h) => sum + (h.points || 0), 0);
    const totalAll = choreHistory
      .filter(h => h.completedBy === m.id)
      .reduce((sum, h) => sum + (h.points || 0), 0);
    return { ...m, yearlyPoints: totalY, allTimeHistoryPoints: totalAll };
  });

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

        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-2xl shadow-md shadow-indigo-500/20 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-medium">Pontjaid:</span>
          <span className="text-base font-black font-mono">{myPoints} p</span>
        </div>
      </div>

      {/* AKTUÁLIS HETI ÉS HAVI RANGLISTÁK (Vizuális kártyák) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 p-4 rounded-2xl border border-indigo-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Aktuális Heti Ranglista ({currentWeekNumber}. hét)</h3>
            </div>
            <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-full shadow-2xs">Hét elején nullázódik</span>
          </div>
          <div className="space-y-2">
            {weeklyScores.map((m, idx) => (
              <div key={m.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl shadow-2xs text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {idx + 1}
                  </span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color || '#3B82F6' }} />
                  <span className="font-bold text-slate-800">{m.name || 'Névtelen'}</span>
                </div>
                <span className="font-mono font-black text-indigo-600">{m.periodPoints} p</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Aktuális Havi Ranglista ({currentMonth}. hó)</h3>
            </div>
            <span className="text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-full shadow-2xs">Hó elején nullázódik</span>
          </div>
          <div className="space-y-2">
            {monthlyScores.map((m, idx) => (
              <div key={m.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl shadow-2xs text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {idx + 1}
                  </span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color || '#3B82F6' }} />
                  <span className="font-bold text-slate-800">{m.name || 'Névtelen'}</span>
                </div>
                <span className="font-mono font-black text-blue-600">{m.periodPoints} p</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Al-navigáció */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('chores')}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'chores' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> Feladatok ({chores.filter(c => !c.completed).length})
        </button>

        <button
          onClick={() => setActiveSubTab('rewards')}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'rewards' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" /> Jutalmak ({rewards.length})
        </button>

        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'stats' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Kimutatások
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Előzmények
        </button>
      </div>

      {/* 1. TAB: HÁZIMUNKÁK */}
      {activeSubTab === 'chores' && (
        <div className="space-y-6">
          <form onSubmit={handleAddChore} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Új házimunka kiírása
            </span>
            <input
              type="text"
              placeholder="Feladat neve (pl. Portörlés, Fűnyírás)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Felelős</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="anyone">Bárki elvégezheti</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name || m.email}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Határidő (opcionális)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
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
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                            <User className="w-3 h-3 text-slate-400" />
                            {chore.assigneeName}
                          </span>
                          {chore.dueDate && (
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                              isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              {chore.dueDate} {isOverdue && '(Lejárt!)'}
                            </span>
                          )}
                          {chore.completed && chore.completedAt && (
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                              <Clock className="w-3 h-3" />
                              Kész: {chore.completedByName}
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

      {/* 2. TAB: JUTALMAK */}
      {activeSubTab === 'rewards' && (
        <div className="space-y-6">
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
                  placeholder="Jutalom neve (pl. 1 óra gépezés, Mozi)"
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

          {rewards.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">Még nincsenek meghirdetett jutalmak.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rewards.map((reward) => {
                const canRedeem = myPoints >= reward.pointsRequired;
                return (
                  <div key={reward.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between gap-3">
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

      {/* 3. TAB: KIMUTATÁSOK */}
      {activeSubTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">Részletes Családi Kimutatások</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Heti Kimutatás</h4>
              <div className="space-y-2">
                {weeklyScores.map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700">{m.name || 'Névtelen'}</span>
                    <span className="font-mono font-bold text-indigo-600">{m.periodPoints} pont</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Havi Kimutatás</h4>
              <div className="space-y-2">
                {monthlyScores.map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700">{m.name || 'Névtelen'}</span>
                    <span className="font-mono font-bold text-blue-600">{m.periodPoints} pont</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider">Éves & Összesen</h4>
              <div className="space-y-2">
                {yearlyScores.map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700">{m.name || 'Névtelen'}</span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-purple-600 block">{m.yearlyPoints} p (év)</span>
                      <span className="text-[10px] text-slate-400 font-mono">Összesen: {m.allTimeHistoryPoints || 0} p</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: ELŐZMÉNYEK */}
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
                <div key={red.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">
                      <span className="text-indigo-600">{red.redeemedByName}</span> beváltotta: <span className="text-slate-900">{red.rewardTitle}</span>
                    </p>
                    {red.createdAt && (
                      <p className="text-[10px] text-slate-400">
                        {new Date(red.createdAt.seconds * 1000).toLocaleDateString('hu-HU')}
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
