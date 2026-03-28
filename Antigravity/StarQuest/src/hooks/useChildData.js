import { useState, useEffect } from 'react';
import {
  collection, doc, onSnapshot,
  updateDoc, addDoc, deleteDoc,
  writeBatch, setDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Default seed data ──────────────────────────────────────────────────────────
const DEFAULT_TASKS = [
  { title: 'Make Bed',       category: 'Morning',   points: 5,  frequency: 'daily',  icon: 'Smile',    completedDate: null },
  { title: 'Brush Teeth',    category: 'Morning',   points: 5,  frequency: 'daily',  icon: 'TRex',     completedDate: null },
  { title: 'Get Dressed',    category: 'Morning',   points: 5,  frequency: 'daily',  icon: 'Star',     completedDate: null },
  { title: 'Pack Backpack',  category: 'Morning',   points: 10, frequency: 'daily',  icon: 'Book',     completedDate: null },
  { title: 'Soccer Practice',category: 'Afternoon', points: 20, frequency: 'weekly', icon: 'Footprint', completedDate: null, daysOfWeek: ['Monday', 'Wednesday'] },
  { title: 'Do Homework',    category: 'Afternoon', points: 15, frequency: 'daily',  icon: 'Book',     completedDate: null },
  { title: 'Pajamas On',     category: 'Evening',   points: 5,  frequency: 'daily',  icon: 'Moon',     completedDate: null },
];

const DEFAULT_REWARDS = [
  { title: '15 mins iPad Time',          cost: 20,  icon: 'Gamepad' },
  { title: 'Pick Movie for Movie Night', cost: 50,  icon: 'Tv' },
  { title: 'Special Dino Treat',         cost: 100, icon: 'Bone' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
export const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// ── Create a brand-new child with seeded tasks & rewards ───────────────────────
export async function createChild(uid, name) {
  const childRef = doc(collection(db, `users/${uid}/children`));
  await setDoc(childRef, { name, stars: 0 });

  const basePath = `users/${uid}/children/${childRef.id}`;
  await Promise.all([
    ...DEFAULT_TASKS.map(t => addDoc(collection(db, `${basePath}/tasks`), t)),
    ...DEFAULT_REWARDS.map(r => addDoc(collection(db, `${basePath}/rewards`), r)),
  ]);

  return childRef.id;
}

// ── Hook: list of children for a parent ───────────────────────────────────────
export function useChildren(uid) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(collection(db, `users/${uid}/children`), snap => {
      setChildren(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { children, loading };
}

// ── Hook: all data for the active child (real-time) ───────────────────────────
export function useChildData(uid, childId) {
  const [tasks, setTasks]             = useState([]);
  const [rewards, setRewards]         = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [history, setHistory]         = useState({});
  const [stars, setStars]             = useState(0);
  const [child, setChild]             = useState(null);
  const [loading, setLoading]         = useState(true);

  const today = getTodayStr();

  useEffect(() => {
    if (!uid || !childId) { setLoading(false); return; }

    const base = `users/${uid}/children/${childId}`;

    const unsubChild = onSnapshot(doc(db, base), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setStars(data.stars ?? 0);
        setChild({ id: snap.id, ...data });
      }
    });

    const unsubTasks = onSnapshot(collection(db, `${base}/tasks`), snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubRewards = onSnapshot(collection(db, `${base}/rewards`), snap => {
      setRewards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubRedemptions = onSnapshot(collection(db, `${base}/redemptions`), snap => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setRedemptions(sorted);
      setLoading(false);
    });

    const unsubHistory = onSnapshot(collection(db, `${base}/history`), snap => {
      const hist = {};
      snap.docs.forEach(d => { hist[d.id] = d.data().points ?? 0; });
      setHistory(hist);
    });

    return () => {
      unsubChild(); unsubTasks(); unsubRewards();
      unsubRedemptions(); unsubHistory();
    };
  }, [uid, childId]);

  // Derive `completed` from `completedDate === today`
  const tasksWithCompletion = tasks.map(t => ({ ...t, completed: t.completedDate === today }));

  // ── Mutations ──────────────────────────────────────────────────────────────
  const base = uid && childId ? `users/${uid}/children/${childId}` : null;

  const completeTask = async (id, points) => {
    if (!base) return null;
    const task = tasks.find(t => t.id === id);
    if (!task) return null;
    const alreadyDone = task.completedDate === today;
    const taskRef  = doc(db, `${base}/tasks/${id}`);
    const childRef = doc(db, base);
    const histRef  = doc(db, `${base}/history/${today}`);

    if (!alreadyDone) {
      const newStars   = stars + points;
      const newHistory = (history[today] ?? 0) + points;
      await updateDoc(taskRef, { completedDate: today });
      await updateDoc(childRef, { stars: newStars });
      await setDoc(histRef, { points: newHistory }, { merge: true });
      return { earned: true, points };
    } else {
      const newStars   = stars - points;
      const newHistory = (history[today] ?? 0) - points;
      await updateDoc(taskRef, { completedDate: null });
      await updateDoc(childRef, { stars: newStars });
      await setDoc(histRef, { points: newHistory }, { merge: true });
      return { earned: false, points };
    }
  };

  const addTask    = (task)         => base && addDoc(collection(db, `${base}/tasks`), task);
  const updateTask = (id, updates)  => base && updateDoc(doc(db, `${base}/tasks/${id}`), updates);
  const deleteTask = (id)           => base && deleteDoc(doc(db, `${base}/tasks/${id}`));

  const addReward    = (reward)        => base && addDoc(collection(db, `${base}/rewards`), reward);
  const updateReward = (id, updates)   => base && updateDoc(doc(db, `${base}/rewards/${id}`), updates);
  const deleteReward = (id)            => base && deleteDoc(doc(db, `${base}/rewards/${id}`));

  const buyReward = async (reward) => {
    if (!base || stars < reward.cost) return false;
    const batch       = writeBatch(db);
    const childRef    = doc(db, base);
    const redemptRef  = doc(collection(db, `${base}/redemptions`));
    batch.update(childRef, { stars: stars - reward.cost });
    batch.set(redemptRef, {
      title: reward.title, cost: reward.cost, icon: reward.icon,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      fulfilled: false, createdAt: Date.now(),
    });
    await batch.commit();
    return true;
  };

  const toggleRedemption = async (id) => {
    if (!base) return;
    const r = redemptions.find(r => r.id === id);
    if (r) await updateDoc(doc(db, `${base}/redemptions/${id}`), { fulfilled: !r.fulfilled });
  };

  const deleteRedemption = (id) => base && deleteDoc(doc(db, `${base}/redemptions/${id}`));

  return {
    tasks: tasksWithCompletion, rewards, redemptions, history, stars, child, loading, today,
    completeTask, addTask, updateTask, deleteTask,
    addReward, updateReward, deleteReward, buyReward,
    toggleRedemption, deleteRedemption,
  };
}
