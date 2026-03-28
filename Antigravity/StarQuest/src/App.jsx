import React, { useState, useEffect, useMemo } from 'react';
import { useAuth }      from './AuthContext';
import { useChildData } from './hooks/useChildData';
import LoginScreen      from './screens/LoginScreen';
import ChildSelector    from './screens/ChildSelector';

// --- BULLETPROOF INLINE SVG ICONS ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Minimalist Dino Icons
    TRex: (
      <g>
        <path d="M18.8 3.3c-1.2-1.2-3.1-1.3-4.3-.1l-4.5 4.5c-1 .9-1.5 2.3-1.5 3.7V12l-1.9 1.9c-.8.8-1.5 2-1.5 3.1 0 2.2 1.8 4 4 4h1v1.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V20h2v1.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V18h1.5c1.4 0 2.5-1.1 2.5-2.5 0-1.1-.7-2.1-1.6-2.4l1.1-1.1c1.5-1.5 1.5-3.8 0-5.3l-2.8-2.8v-.6z" />
        <circle cx="15.5" cy="6.5" r="0.5" fill="currentColor" />
      </g>
    ),
    Footprint: (
      <g>
        <path d="M12 2a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
        <path d="M5 6a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0V9a3 3 0 0 0-3-3z" />
        <path d="M19 6a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0V9a3 3 0 0 0-3-3z" />
        <path d="M12 12a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0v-2a5 5 0 0 0-5-5z" />
      </g>
    ),
    Bone: (
      <g>
        <path d="M17 4c1.1 0 2 .9 2 2s-.9 2-2 2v8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2h-6c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2V8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2h6c0-1.1.9-2 2-2z" />
      </g>
    ),
    // Core Icons
    Star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    Sun: (
      <g>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.72-12.72l-1.41 1.41" />
      </g>
    ),
    Moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
    CheckCircle: (
      <g>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </g>
    ),
    Gift: (
      <g>
        <rect x="3" y="8" width="18" height="4" />
        <path d="M12 12V22M19 12V22M5 12V22M7 8a4 4 0 0 1 0-8 4 4 0 0 1 0 8ZM17 8a4 4 0 0 1 0-8 4 4 0 0 1 0 8Z" />
      </g>
    ),
    Plus: (
      <g>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </g>
    ),
    Trash: (
      <g>
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </g>
    ),
    Lock: (
      <g>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </g>
    ),
    Unlock: (
      <g>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </g>
    ),
    ArrowLeft: (
      <g>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </g>
    ),
    Settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    Gamepad: (
      <g>
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M15 12h.01M18 10h.01" />
      </g>
    ),
    LogOut: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    Shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    ListTodo: <><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></>,
    ShoppingBag: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    Tv: (
      <g>
        <rect x="2" y="7" width="20" height="15" rx="2" />
        <polyline points="17 2 12 7 7 2" />
      </g>
    ),
    Heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    History: (
      <g>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </g>
    ),
    X: (
      <g>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </g>
    ),
    Repeat: (
      <g>
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </g>
    ),
    Pencil: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
    ChevronLeft: <polyline points="15 18 9 12 15 6" />,
    ChevronRight: <polyline points="9 18 15 12 9 6" />,
    CalendarDays: (
      <g>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
      </g>
    ),
    Book: (
      <g>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </g>
    ),
    Trophy: (
      <g>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </g>
    ),
    Car: (
      <g>
        <rect x="1" y="11" width="22" height="6" rx="2" />
        <path d="m3 11 2-5h14l2 5" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </g>
    ),
    Zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    Smile: (
      <g>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </g>
    ),
    Camera: (
      <g>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </g>
    ),
    Rocket: (
      <g>
        <path d="M12 2s-5 4.5-5 10v1l3 3h4l3-3v-1c0-5.5-5-10-5-10z" />
        <path d="M9 17c0 1.7 1.3 3 3 3s3-1.3 3-3" />
        <path d="M6.5 15.5c-2 .5-3 2.5-3 4 1.5 0 3.5-1 3.5-1" />
        <path d="M17.5 15.5c2 .5 3 2.5 3 4-1.5 0-3.5-1-3.5-1" />
      </g>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name] || icons.Star}
    </svg>
  );
};

const AVAILABLE_ICONS = [
  'TRex', 'Footprint', 'Bone', 'Star', 'Gamepad', 'Tv', 'Heart', 'Gift',
  'Book', 'Trophy', 'Car', 'Smile', 'Camera', 'Zap', 'Sun', 'Moon', 'CheckCircle'
];

const BackgroundDinos = () => (
  <>
    {/* Pterodactyl (Left) */}
    <div className="fixed left-[-5%] lg:left-[2%] top-[15%] w-32 md:w-48 lg:w-64 z-0 pointer-events-none opacity-60">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl animate-bob">
        <ellipse cx="100" cy="120" rx="20" ry="40" fill="#A78BFA" transform="rotate(45 100 120)" />
        <path d="M110 90 L180 80 L120 110 Z" fill="#8B5CF6" />
        <path d="M120 95 L70 60 L100 100 Z" fill="#8B5CF6" />
        <circle cx="125" cy="92" r="3" fill="#1E293B" />
        <path d="M90 110 Q 40 20 10 10 Q 50 60 70 120 Z" fill="#C4B5FD" style={{ animation: 'wave 1.5s ease-in-out infinite', transformOrigin: '80px 110px' }} />
        <path d="M100 130 Q 160 170 190 190 Q 140 150 110 140 Z" fill="#8B5CF6" />
        <path d="M80 140 L 70 160 M 85 145 L 80 165" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>

    {/* Brachiosaurus & Tree (Right) */}
    <div className="fixed right-[-10%] lg:right-[-2%] bottom-[5%] w-48 md:w-64 lg:w-[350px] z-0 pointer-events-none opacity-70">
      <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
        <path d="M240 300 L245 150 L255 300 Z" fill="#92400E" />
        <path d="M245 200 L 220 180" stroke="#92400E" strokeWidth="8" strokeLinecap="round" />
        <circle cx="245" cy="130" r="50" fill="#34D399" />
        <circle cx="200" cy="110" r="40" fill="#10B981" />
        <circle cx="280" cy="100" r="45" fill="#059669" />
        <circle cx="240" cy="70" r="45" fill="#10B981" />

        <path d="M20 300 L20 220 Q 20 180 80 180 L 120 180 Q 150 180 150 220 L 150 300 Z" fill="#FBBF24" />
        <circle cx="60" cy="220" r="15" fill="#F59E0B" opacity="0.4" />
        <circle cx="110" cy="240" r="12" fill="#F59E0B" opacity="0.4" />
        <circle cx="40" cy="260" r="18" fill="#F59E0B" opacity="0.4" />

        <path d="M20 220 Q -20 220 -30 280 Q -10 240 20 260 Z" fill="#F59E0B" />
        <path d="M40 280 L 40 300 M 120 280 L 120 300" stroke="#D97706" strokeWidth="20" strokeLinecap="square" />

        <g style={{ animation: 'chew 3s ease-in-out infinite', transformOrigin: '130px 180px' }}>
          <path d="M110 190 Q 150 100 180 100 L 170 80 Q 110 100 90 180 Z" fill="#FBBF24" />
          <ellipse cx="180" cy="90" rx="20" ry="12" fill="#FBBF24" transform="rotate(15 180 90)" />
          <circle cx="185" cy="86" r="3" fill="#1E293B" />
          <circle cx="170" cy="94" r="5" fill="#F87171" opacity="0.6" />
          <path d="M195 92 Q 210 95 205 105 Q 190 100 195 92 Z" fill="#A7F3D0" />
          <path d="M195 92 Q 200 80 215 85 Q 205 95 195 92 Z" fill="#6EE7B7" />
        </g>
      </svg>
    </div>
  </>
);


export default function App() {
  const { user, signOut, parentPin, updateParentPin }  = useAuth();
  const [activeChildId, setActiveChildId] = useState(null);

  const {
    tasks, rewards, redemptions, history, stars, child, loading, today,
    completeTask:    completeTaskFS,
    addTask,         updateTask,  deleteTask,
    addReward,       updateReward, deleteReward,
    buyReward:       buyRewardFS,
    toggleRedemption, deleteRedemption,
  } = useChildData(user?.uid, activeChildId);

  const [view,             setView]             = useState('child');
  const [floatingStars,    setFloatingStars]    = useState([]);
  const [celebrationReward, setCelebrationReward] = useState(null);
  const [confirmState,      setConfirmState]      = useState({ isOpen: false, title: '', onConfirm: null, color: 'indigo' });

  const confirm = (title, onConfirm, color = 'indigo') => setConfirmState({ isOpen: true, title, onConfirm, color });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));

  const DAYS_OF_WEEK   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const now            = new Date();
  const todayDayName   = DAYS_OF_WEEK[now.getDay()];
  const todayDateNum   = now.getDate();

  const [parentTab,             setParentTab]             = useState('tasks');
  const [historyView,           setHistoryView]           = useState('weekly');
  const [calendarDate,          setCalendarDate]          = useState(new Date());
  const [selectedCalendarDate,  setSelectedCalendarDate]  = useState(today);

  const [showAddTask,    setShowAddTask]    = useState(false);
  const [editingTaskId,  setEditingTaskId]  = useState(null);
  const [showAddReward,  setShowAddReward]  = useState(false);
  const [editingRewardId,setEditingRewardId]= useState(null);

  const [newTask, setNewTask] = useState({
    title: '', category: 'Morning', points: 5, frequency: 'daily',
    daysOfWeek: [todayDayName], dayOfMonth: todayDateNum, specificDate: today, icon: 'TRex', completedDate: null,
  });
  const [newReward, setNewReward] = useState({ title: '', cost: 20, icon: 'Gift' });

  const resetTaskForm = () => setNewTask({
    title: '', category: 'Morning', points: 5, frequency: 'daily',
    daysOfWeek: [todayDayName], dayOfMonth: todayDateNum, specificDate: today, icon: 'TRex', completedDate: null,
  });
  const resetRewardForm = () => setNewReward({ title: '', cost: 20, icon: 'Gift' });

  const getTasksForDate = (dateStr) => {
    const parts       = dateStr.split('-');
    const target      = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const targetDay   = DAYS_OF_WEEK[target.getDay()];
    const targetDate  = target.getDate();
    return tasks.filter(t => {
      if (t.frequency === 'daily')   return true;
      if (t.frequency === 'specific' && t.specificDate === dateStr)     return true;
      if (t.frequency === 'weekly'   && t.daysOfWeek?.includes(targetDay)) return true;
      if (t.frequency === 'monthly'  && t.dayOfMonth === targetDate)    return true;
      return false;
    });
  };

  const completeTask = async (id, points, event) => {
    const result = await completeTaskFS(id, points);
    if (result?.earned && event) {
      const newStar = { id: Date.now() + Math.random(), x: event.clientX, y: event.clientY, points };
      setFloatingStars(prev => [...prev, newStar]);
      setTimeout(() => setFloatingStars(prev => prev.filter(s => s.id !== newStar.id)), 1000);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (editingTaskId) {
      confirm("Save changes to this task? 🦖", async () => {
        await updateTask(editingTaskId, { ...newTask });
        setShowAddTask(false);
        setEditingTaskId(null);
        resetTaskForm();
      }, 'indigo');
    } else {
      await addTask({ ...newTask, completedDate: null });
      setShowAddTask(false);
      resetTaskForm();
    }
  };

  const handleAddReward = async (e) => {
    e.preventDefault();
    if (editingRewardId) {
      confirm("Save changes to this reward? 🎁", async () => {
        await updateReward(editingRewardId, newReward);
        setShowAddReward(false);
        setEditingRewardId(null);
        resetRewardForm();
      }, 'pink');
    } else {
      await addReward(newReward);
      setShowAddReward(false);
      resetRewardForm();
    }
  };

  const buyReward = async (reward) => {
    const ok = await buyRewardFS(reward);
    if (ok) setCelebrationReward(reward);
  };

  const handleDeleteTask = (id) => {
    confirm("Delete this task forever? 🦕", () => deleteTask(id), 'red');
  };

  const handleToggleTaskActive = (task) => {
    updateTask(task.id, { isActive: task.isActive === false });
  };

  const handleToggleRewardActive = (reward) => {
    updateReward(reward.id, { isActive: reward.isActive === false });
  };

  const handleDeleteReward = (id) => {
    confirm("Delete this reward forever? 🦴", () => deleteReward(id), 'red');
  };

  const handleDeleteRedemption = (id) => {
    confirm("Delete this history record? 🦖", () => deleteRedemption(id), 'red');
  };

  // --- KID-FRIENDLY CELEBRATION POPUP ---

  const CelebrationPopup = ({ reward, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border-4 border-yellow-300 animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
          <div className="text-7xl mb-3 animate-bounce">🎉</div>
          <h2 className="text-3xl font-black text-indigo-600 mb-2">You got it!</h2>
          <div className="bg-pink-50 rounded-2xl p-5 mb-6 border-2 border-pink-200">
            <div className="flex justify-center mb-2 text-pink-500"><Icon name={reward.icon} size={40} /></div>
            <p className="text-xl font-black text-slate-800">{reward.title}</p>
            <p className="text-slate-500 font-medium mt-1">Tell Mom or Dad to give it to you! 🦕</p>
          </div>
          <button onClick={onClose} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xl py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
            Yay! 🌟
          </button>
          <p className="text-xs text-slate-400 mt-3">Tap anywhere to close</p>
        </div>
      </div>
    );
  };

  const ConfirmModal = () => {
    if (!confirmState.isOpen) return null;
    const { title, onConfirm, color } = confirmState;
    const colorMap = {
      indigo: 'border-indigo-300 text-indigo-600 bg-indigo-50',
      pink:   'border-pink-300 text-pink-600 bg-pink-50',
      red:    'border-red-300 text-red-600 bg-red-50',
    };
    const btnMap = {
      indigo: 'bg-indigo-600 hover:bg-indigo-700',
      pink:   'bg-pink-600 hover:bg-pink-700',
      red:    'bg-red-600 hover:bg-red-700',
    };

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border-4 border-white animate-in zoom-in duration-300">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${colorMap[color]}`}>
            <Icon name={color === 'red' ? 'Trash' : 'CheckCircle'} size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-6 text-center leading-tight">{title}</h2>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => { onConfirm(); closeConfirm(); }}
              className={`w-full ${btnMap[color]} text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all`}
            >
              Yes, I'm sure! 🦕
            </button>
            <button 
              onClick={closeConfirm}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-lg py-4 rounded-2xl transition-all"
            >
              Oops, go back
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- SUB-COMPONENTS ---
  const ChildView = () => {
    const todaysTasks = useMemo(() => getTasksForDate(today), [tasks, today]);
    const morningTasks = todaysTasks.filter(t => t.category === "Morning");
    const afternoonTasks = todaysTasks.filter(t => t.category === "Afternoon");
    const eveningTasks = todaysTasks.filter(t => t.category === "Evening");
    const completedCount = todaysTasks.filter(t => t.completed).length;
    const totalCount = todaysTasks.length;
    const allDone = totalCount > 0 && completedCount === totalCount;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className={`bg-gradient-to-r ${stars < 0 ? 'from-red-500 to-orange-600' : 'from-indigo-500 to-purple-600'} rounded-3xl p-6 text-white shadow-xl flex justify-between items-center transform transition-all hover:scale-[1.02]`}>
          <div>
            <h1 className="text-3xl font-black mb-1 flex items-center gap-2">
              <Icon name="TRex" className="text-yellow-300" /> {child?.name ? `${child.name}'s Star Quest!` : 'Dino Star Quest!'}
            </h1>
            <p className="text-indigo-100 font-medium">
              {stars < 0 ? 'Dino is looking for stars... 🥚' : (allDone ? 'You finished everything! 🎉' : 'You are doing great today!')}
            </p>
          </div>
          <div className={`px-6 py-4 rounded-2xl flex flex-col items-center backdrop-blur-sm border ${stars < 0 ? 'bg-black/20 border-white/20' : 'bg-white/20 border-white/30'}`}>
            <Icon name={stars < 0 ? 'Heart' : 'Star'} className={`${stars < 0 ? 'text-red-200' : 'text-yellow-300 fill-yellow-300'} w-10 h-10 mb-1 animate-bounce`} size={40} />
            <span className="text-4xl font-black">{stars}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-slate-600 text-sm">Today's Progress</span>
            <span className="font-black text-indigo-600 text-sm uppercase tracking-tighter">{completedCount}/{totalCount} Quests Done</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setView('shop')} className="bg-pink-500 hover:bg-pink-600 text-white rounded-2xl p-4 font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 group">
            <Icon name="Gift" className="group-hover:rotate-12 transition-transform" /> Reward Shop
          </button>
          <button onClick={() => setView('login')} className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl p-4 font-black text-lg shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95">
            <Icon name="Settings" /> Parents
          </button>
        </div>

        {allDone ? (
          <div className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-3xl p-8 border-4 border-yellow-300 text-center shadow-lg animate-in zoom-in duration-500">
            <div className="text-7xl mb-4 animate-bounce">🦖🌟🎉</div>
            <h2 className="text-4xl font-black text-green-700 mb-2">Quest Master!</h2>
            <p className="text-xl font-bold text-green-600">You completed everything for today!</p>
            <div className="mt-6 inline-block bg-white px-8 py-4 rounded-2xl shadow-sm border-2 border-green-100">
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-1">Stars earned today</p>
              <p className="text-3xl font-black text-yellow-600">+{history[today] || 0} ⭐</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <TaskSection title="Morning Mission" icon="Sun" tasks={morningTasks.filter(t => t.isActive !== false)} onComplete={completeTask} color="sky" />
            <TaskSection title="Afternoon Mission" icon="Zap" tasks={afternoonTasks.filter(t => t.isActive !== false)} onComplete={completeTask} color="yellow" />
            <TaskSection title="Evening Mission" icon="Moon" tasks={eveningTasks.filter(t => t.isActive !== false)} onComplete={completeTask} color="indigo" />
          </div>
        )}
      </div>
    );
  };

  const TaskSection = ({ title, icon, tasks, onComplete, color }) => {
    if (tasks.length === 0) return null;

    const colorClasses = {
      sky: { bg: 'bg-sky-100', border: 'border-sky-200', text: 'text-sky-800', icon: 'text-orange-500 fill-orange-500' },
      yellow: { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-600 fill-yellow-600' },
      indigo: { bg: 'bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-800', icon: 'text-indigo-500 fill-indigo-500' }
    }[color];

    return (
      <div className={`${colorClasses.bg} rounded-3xl p-5 border-4 ${colorClasses.border}`}>
        <h2 className={`text-2xl font-black ${colorClasses.text} mb-4 flex items-center gap-2`}>
          <Icon name={icon} className={colorClasses.icon} /> {title}
        </h2>
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} onClick={(e) => onComplete(task.id, task.points, e)} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 active:scale-[0.98] ${task.completed ? 'bg-green-100 border-green-300 opacity-90 scale-[0.99]' : 'bg-white border-transparent hover:border-sky-300 shadow-sm hover:-translate-y-1'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-green-500 shadow-md shadow-green-200 rotate-0' : 'bg-slate-100 text-slate-500'}`}>
                  {task.completed ? <Icon name="CheckCircle" className="text-white w-7 h-7" size={28} /> : <Icon name={task.icon || 'Star'} size={24} />}
                </div>
                <span className={`text-xl font-bold transition-all duration-300 ${task.completed ? 'text-green-800 line-through opacity-70' : 'text-slate-700'}`}>{task.title}</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold transition-colors duration-300 ${task.completed ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-700'}`}>
                +{task.points} <Icon name="Star" className={`w-4 h-4 transition-colors duration-300 ${task.completed ? 'fill-green-600 text-green-600' : 'fill-yellow-500 text-yellow-500'}`} size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ShopView = () => (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setView('child')} className="bg-slate-200 p-3 rounded-full hover:bg-slate-300">
          <Icon name="ArrowLeft" className="text-slate-700" />
        </button>
        <div className={`flex items-center gap-2 ${stars < 0 ? 'bg-red-100 border-red-300' : 'bg-yellow-100 border-yellow-300'} px-6 py-2 rounded-full border-2`}>
          <Icon name={stars < 0 ? 'Heart' : 'Star'} className={`${stars < 0 ? 'text-red-500' : 'text-yellow-500 fill-yellow-500'} w-6 h-6`} size={24} />
          <span className={`text-2xl font-black ${stars < 0 ? 'text-red-700' : 'text-yellow-700'}`}>{stars} Stars</span>
        </div>
      </div>
      <h1 className="text-4xl font-black text-center text-pink-500 mb-8">Reward Shop!</h1>
      <div className="grid gap-4">
        {rewards.filter(r => r.isActive !== false).map(reward => {
          const canAfford = stars >= reward.cost;
          return (
            <div key={reward.id} className={`p-6 rounded-3xl border-4 flex items-center justify-between ${canAfford ? 'bg-white border-pink-200 shadow-md' : 'bg-slate-50 border-slate-200 opacity-75'}`}>
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-4 rounded-2xl text-pink-500">
                  <Icon name={reward.icon} size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{reward.title}</h3>
                  <p className="text-slate-500 font-medium">Cost: {reward.cost} Stars</p>
                </div>
              </div>
              <div className="text-right">
                {!canAfford && (
                  <p className="text-xs text-slate-400 font-bold mb-1">Need {reward.cost - stars} more ⭐</p>
                )}
                <button
                  onClick={() => buyReward(reward)}
                  disabled={!canAfford}
                  className={`px-6 py-3 rounded-2xl font-bold text-lg transition-transform active:scale-95 ${canAfford ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  {canAfford ? 'Buy! 🎁' : '🔒 Locked'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const LoginView = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [setupMode, setSetupMode] = useState(false);
    const [setupStep, setSetupStep] = useState(1); // 1 = first entry, 2 = confirm
    const [tempPin, setTempPin] = useState('');

    const pinToMatch = parentPin || '1234'; // Fallback if still loading or if the user wants a default
    const isNewUser = parentPin === undefined; 

    const handleKey = (digit) => {
      if (error) { setError(false); setPin(''); return; }
      if (pin.length >= 4) return;
      const next = pin + digit;
      setPin(next);

      if (next.length === 4) {
        if (isNewUser || setupMode) {
          if (setupStep === 1) {
            setTempPin(next);
            setPin('');
            setSetupStep(2);
          } else {
            if (next === tempPin) {
              updateParentPin(next);
              setView('parent');
            } else {
              setError(true);
              setTimeout(() => { setPin(''); setSetupStep(1); setError(false); }, 900);
            }
          }
        } else {
          if (next === pinToMatch) {
            setView('parent');
          } else {
            setError(true);
            setTimeout(() => { setPin(''); setError(false); }, 900);
          }
        }
      }
    };

    const handleDel = () => { setPin(p => p.slice(0, -1)); setError(false); };

    useEffect(() => {
      const handleKeyDown = (e) => {
        // Prevent default for digits if on the PIN screen to avoid double-entry if an input was focused
        // (though we don't have one, it's good practice)
        
        let digit = null;
        if (e.key >= '0' && e.key <= '9') {
          digit = e.key;
        } else if (e.code && e.code.startsWith('Numpad')) {
          digit = e.code.replace('Numpad', '');
          if (digit.length > 1) digit = digit.match(/\d/)?.[0]; // Handle Numpad1 vs 1
        }

        if (digit !== null) {
          handleKey(digit);
          e.preventDefault();
        }
        if (e.key === 'Backspace') {
          handleDel();
          e.preventDefault();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pin, error, setupStep, isNewUser, handleKey, handleDel]);

    return (
      <div className="p-4 sm:p-6 max-w-sm mx-auto min-h-[90vh] flex flex-col items-center justify-center animate-in zoom-in duration-300 relative">
        <button onClick={() => setView('child')} className="absolute top-6 left-6 bg-slate-200 p-3 rounded-full hover:bg-slate-300">
          <Icon name="ArrowLeft" className="text-slate-700" />
        </button>
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full border border-slate-100 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 transition-colors ${error ? 'bg-red-100' : 'bg-indigo-100'}`}>
            <Icon name={isNewUser ? "Shield" : "Lock"} className={`w-10 h-10 ${error ? 'text-red-500' : 'text-indigo-500'}`} size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">
            {isNewUser ? (setupStep === 1 ? 'Create PIN' : 'Confirm PIN') : 'Parent Area'}
          </h2>
          <p className="text-slate-500 mb-6 text-sm font-medium">
            {isNewUser 
              ? (setupStep === 1 ? 'Set a 4-digit PIN for safety' : 'Enter it one more time') 
              : 'Enter your 4-digit PIN'}
          </p>
          
          <div className="flex justify-center gap-4 mb-2">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${i < pin.length ? (error ? 'bg-red-500 border-red-500' : 'bg-indigo-500 border-indigo-500') : 'border-slate-300'}`} />
            ))}
          </div>
          <div className="h-6 mb-2">
            {error && <p className="text-red-500 font-bold text-sm">
              {isNewUser ? "PINs don't match! Try again" : "Wrong PIN! Try again 🙅"}
            </p>}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} onClick={() => handleKey(String(n))} className="bg-slate-100 hover:bg-indigo-100 active:bg-indigo-200 text-slate-700 font-black text-2xl py-3 sm:py-4 rounded-2xl transition-all active:scale-95 select-none">
                {n}
              </button>
            ))}
            <div />
            <button key="0" onClick={() => handleKey('0')} className="bg-slate-100 hover:bg-indigo-100 active:bg-indigo-200 text-slate-700 font-black text-2xl py-3 sm:py-4 rounded-2xl transition-all active:scale-95 select-none">0</button>
            <button onClick={handleDel} className="bg-slate-100 hover:bg-red-100 active:bg-red-200 text-slate-400 text-2xl py-3 sm:py-4 rounded-2xl transition-all active:scale-95 select-none">⌫</button>
          </div>

          {!isNewUser && (
            <button 
              onClick={() => {
                confirm("Forgot PIN? You'll need to sign out and sign back in to reset it.", () => signOut(), 'red');
              }}
              className="text-indigo-600 font-bold text-sm hover:underline"
            >
              Forgot PIN?
            </button>
          )}
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [message, setMessage] = useState(null);

    const handleSave = async () => {
      if (newPin.length !== 4) return setMessage({ type: 'error', text: 'PIN must be 4 digits!' });
      if (newPin !== confirmPin) return setMessage({ type: 'error', text: 'PINs do not match!' });
      await updateParentPin(newPin);
      setMessage({ type: 'success', text: 'PIN updated successfully! 🦖' });
      setNewPin(''); setConfirmPin('');
    };

    return (
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in max-w-md mx-auto">
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Icon name="Settings" className="text-slate-400" /> Account Settings
        </h2>
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 text-xs uppercase tracking-widest opacity-70">Change Parent PIN</h3>
            <div className="space-y-3">
              <input 
                type="password" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g,''))} 
                placeholder="New 4-digit PIN"
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-400 font-bold text-center text-xl tracking-[0.5em]"
              />
               <input 
                type="password" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g,''))} 
                placeholder="Confirm New PIN"
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-400 font-bold text-center text-xl tracking-[0.5em]"
              />
              {message && <p className={`text-sm font-bold text-center ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
              <button 
                onClick={handleSave}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95"
              >Save New PIN</button>
            </div>
          </div>
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3 hover:bg-red-50 rounded-xl transition-colors mt-4 border border-red-100">
             <Icon name="LogOut" size={20} /> Sign Out of App
          </button>
        </div>
      </div>
    );
  };

  const TabBtn = ({ active, onClick, label, color, icon }) => (
    <button onClick={onClick} className={`whitespace-nowrap pb-2 px-4 font-bold text-lg border-b-4 transition-colors flex items-center gap-2 ${active ? `border-${color}-500 text-${color}-600` : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
      {icon && <Icon name={icon} size={20} />} {label}
    </button>
  );

  const TaskManager = ({ tasks, onDelete, onEdit, onAdd, onToggleActive }) => (
    <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Icon name="ListTodo" className="text-indigo-500" /> Active Tasks
        </h2>
        <button onClick={onAdd} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl hover:bg-indigo-700 flex items-center gap-2 font-bold shadow-sm transition-all active:scale-95">
          <Icon name="Plus" size={20} /> New Task
        </button>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className={`p-4 rounded-[1.5rem] border-2 flex items-center justify-between transition-all ${task.isActive === false ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-50 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl flex items-center justify-center transition-colors ${task.isActive === false ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-500'}`}>
                <Icon name={task.icon || 'Star'} size={24} />
              </div>
              <div>
                <h4 className={`font-black text-lg transition-opacity ${task.isActive === false ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                  {task.title} {task.isActive === false && "(Disabled)"}
                </h4>
                <p className="text-sm font-bold text-slate-400">{task.category} • {task.points} Stars</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onToggleActive(task)} className={`p-3 rounded-xl transition-all ${task.isActive === false ? 'text-slate-300 hover:bg-indigo-100 hover:text-indigo-500' : 'text-indigo-500 hover:bg-indigo-50'}`} title={task.isActive === false ? "Enable Task" : "Disable Task"}>
                <Icon name={task.isActive === false ? "Unlock" : "Lock"} size={20} />
              </button>
              <button onClick={() => onEdit(task)} className="text-slate-300 hover:text-indigo-500 p-3 rounded-xl hover:bg-indigo-50 transition-colors"><Icon name="Pencil" size={20} /></button>
              <button onClick={() => onDelete(task.id)} className="text-slate-300 hover:text-red-500 p-3 rounded-xl hover:bg-red-50 transition-colors"><Icon name="Trash" size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RewardManager = ({ rewards, onDelete, onEdit, onAdd }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-pink-600">Rewards</h2>
        <button onClick={onAdd} className="text-pink-600 bg-pink-50 px-4 py-2 rounded-xl hover:bg-pink-100 flex items-center gap-2 font-bold">
          <Icon name="Plus" size={20} /> Add Reward
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {rewards.map(reward => (
          <div key={reward.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${reward.isActive === false ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-50 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl flex items-center justify-center transition-colors ${reward.isActive === false ? 'bg-slate-200 text-slate-400' : 'bg-pink-50 text-pink-500'}`}>
                <Icon name={reward.icon || 'Gift'} size={24} />
              </div>
              <div>
                <h4 className={`font-black text-lg transition-opacity ${reward.isActive === false ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                  {reward.title} {reward.isActive === false && "(Disabled)"}
                </h4>
                <p className="text-sm font-bold text-slate-400">{reward.cost} Stars</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onToggleActive(reward)} className={`p-3 rounded-xl transition-all ${reward.isActive === false ? 'text-slate-300 hover:bg-pink-100 hover:text-pink-500' : 'text-pink-500 hover:bg-pink-50'}`} title={reward.isActive === false ? "Enable Reward" : "Disable Reward"}>
                <Icon name={reward.isActive === false ? "Unlock" : "Lock"} size={20} />
              </button>
              <button onClick={() => onEdit(reward)} className="text-slate-300 hover:text-pink-500 p-3 rounded-xl hover:bg-pink-50 transition-colors"><Icon name="Pencil" size={20} /></button>
              <button onClick={() => onDelete(reward.id)} className="text-slate-300 hover:text-red-500 p-3 rounded-xl hover:bg-red-50 transition-colors"><Icon name="Trash" size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RedemptionsManager = ({ redemptions, onToggleFulfill, onDelete }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-purple-600">Redemption History</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {redemptions.length === 0 ? (
          <p className="text-center text-slate-400 py-8 font-medium">No rewards redeemed yet.</p>
        ) : (
          redemptions.map(r => (
            <div key={r.id} className={`py-4 flex items-center justify-between transition-opacity ${r.fulfilled ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${r.fulfilled ? 'bg-slate-100 text-slate-400' : 'bg-purple-50 text-purple-500'}`}>
                  <Icon name={r.icon} size={24} />
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${r.fulfilled ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{r.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">{r.cost} Stars • {r.date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onToggleFulfill(r.id)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${r.fulfilled ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                  {r.fulfilled ? 'Fulfilled' : 'Mark Done'}
                </button>
                <button onClick={() => onDelete(r.id)} className="text-slate-300 hover:text-red-500 p-2"><Icon name="Trash" size={20} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const HistoryView = ({ history, historyView, setHistoryView, calendarDate, setCalendarDate, today, selectedDate, onDayClick, getTasksForDate }) => {
    const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];
    
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= getDaysInMonth(calendarDate.getFullYear(), calendarDate.getMonth()); i++) days.push(i);

    const monthName = calendarDate.toLocaleString('default', { month: 'long' });
    const year = calendarDate.getFullYear();

    return (
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl border border-slate-100 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl"><Icon name="CalendarDays" className="text-blue-600" /></div>
              Quest Calendar
            </h2>
            <p className="text-slate-400 font-bold mt-1">Track your child's daily star streaks!</p>
          </div>
          <div className="flex bg-slate-100 rounded-2xl p-1.5 shadow-inner">
            <button onClick={() => setHistoryView('weekly')} className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${historyView === 'weekly' ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-500 hover:text-slate-700'}`}>Weekly</button>
            <button onClick={() => setHistoryView('monthly')} className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${historyView === 'monthly' ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-500 hover:text-slate-700'}`}>Monthly</button>
          </div>
        </div>

        {historyView === 'weekly' ? (
          <div className="space-y-4">
            {Object.entries(history).sort((a,b) => b[0].localeCompare(a[0])).slice(0, 10).map(([date, pts]) => (
              <div key={date} onClick={() => onDayClick(date)} className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${selectedDate === date ? 'border-blue-400 bg-blue-50' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}>
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-colors ${pts > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                    <span className="text-xs font-black uppercase tracking-widest">{date.split('-')[1]}/{date.split('-')[2]}</span>
                    {pts > 0 && <Icon name="Star" className="fill-green-500 text-green-500 w-4 h-4 mt-1" />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{date === today ? "Today" : new Date(date + "T00:00:00").toLocaleDateString('en-US', { weekday: 'long' })}</h4>
                    <p className="text-sm font-bold text-slate-400">{getTasksForDate(date).filter(t => t.completed).length} Quests Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="text-right mr-2">
                    <span className="block font-black text-2xl text-blue-600">{pts}</span>
                   </div>
                   <Icon name="ChevronRight" className={`transition-transform ${selectedDate === date ? 'translate-x-1 text-blue-500' : 'text-slate-300'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-xl font-black text-slate-700 tracking-tight">{monthName} {year}</h3>
              <div className="flex gap-2">
                <button onClick={() => setCalendarDate(new Date(year, calendarDate.getMonth() - 1, 1))} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 transition-colors"><Icon name="ChevronLeft" size={20} /></button>
                <button onClick={() => setCalendarDate(new Date(year, calendarDate.getMonth() + 1, 1))} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 transition-colors"><Icon name="ChevronRight" size={20} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-3 sm:gap-4">
              {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center font-black text-slate-300 text-sm pb-2">{d}</div>)}
              {days.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateStr = `${year}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const pts = history[dateStr] || 0;
                const isToday = dateStr === today;
                const isSelected = selectedDate === dateStr;

                return (
                  <button 
                    key={idx} 
                    onClick={() => onDayClick(dateStr)}
                    className={`relative aspect-square rounded-2xl sm:rounded-3xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 group ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100' : isToday ? 'border-indigo-200 bg-white shadow-sm ring-4 ring-indigo-50' : 'border-slate-50 bg-white hover:border-slate-200'}`}
                  >
                    <span className={`text-lg sm:text-2xl font-black ${isSelected ? 'text-blue-700' : isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{day}</span>
                    {pts > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white rounded-full p-1 shadow-sm border-2 border-white scale-75 sm:scale-100">
                        <Icon name="Star" size={10} className="fill-white text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedDate && (
          <div className="mt-8 pt-8 border-t-2 border-slate-50 animate-in slide-in-from-bottom duration-500">
            <h3 className="font-black text-slate-800 text-xl mb-6 flex items-center gap-2">
               <div className="w-2 h-8 bg-blue-500 rounded-full" />
               Details for {selectedDate === today ? "Today" : new Date(selectedDate + "T00:00:00").toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <div className="grid gap-3">
              {selectedTasks.length > 0 ? (
                selectedTasks.map(task => (
                  <div key={task.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${task.completed ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl text-white ${task.completed ? 'bg-green-500' : 'bg-slate-300'}`}><Icon name={task.icon || 'Star'} size={18} /></div>
                      <div>
                        <span className={`font-black tracking-tight block ${task.completed ? 'text-green-800' : 'text-slate-500'}`}>{task.title}</span>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{task.category}</span>
                      </div>
                    </div>
                    {task.completed && <span className="font-black text-green-600">+{task.points} ⭐</span>}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold">No tasks scheduled for this day 🥚</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ParentDashboard = () => (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Parent Dashboard</h1>
          <p className="text-slate-500 font-medium">Explorer: {user?.email || user?.displayName}</p>
        </div>
        <button onClick={() => setView('child')} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
          <Icon name="ArrowLeft" size={20} /> Back to Child View
        </button>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        <TabBtn active={parentTab === 'tasks'}     onClick={() => setParentTab('tasks')}     label="Tasks"     color="indigo" icon="ListTodo" />
        <TabBtn active={parentTab === 'rewards'}   onClick={() => setParentTab('rewards')}   label="Rewards"   color="purple" icon="Gift" />
        <TabBtn active={parentTab === 'history'}   onClick={() => setParentTab('history')}   label="History"   color="blue"   icon="Calendar" />
        <TabBtn active={parentTab === 'redemptions'} onClick={() => setParentTab('redemptions')} label="Shop"      color="pink"   icon="ShoppingBag" />
        <TabBtn active={parentTab === 'settings'}  onClick={() => setParentTab('settings')}  label="Settings"  color="slate"  icon="Settings" />
      </div>

      <div className="transition-all duration-300">
        {parentTab === 'tasks' && (
          <TaskManager 
            tasks={tasks} 
            onAdd={() => { resetTaskForm(); setEditingTaskId(null); setShowAddTask(true); }} 
            onEdit={(t) => { 
              setNewTask({...t, daysOfWeek: t.daysOfWeek || [], dayOfMonth: t.dayOfMonth || todayDateNum}); 
              setEditingTaskId(t.id); 
              setShowAddTask(true); 
            }} 
            onDelete={handleDeleteTask} 
            onToggleActive={handleToggleTaskActive}
          />
        )}
        {parentTab === 'rewards' && (
          <RewardManager 
            rewards={rewards} 
            onAdd={() => { resetRewardForm(); setEditingRewardId(null); setShowAddReward(true); }} 
            onEdit={(r) => { 
              setNewReward({...r}); 
              setEditingRewardId(r.id); 
              setShowAddReward(true); 
            }} 
            onDelete={handleDeleteReward} 
            onToggleActive={handleToggleRewardActive}
          />
        )}
        {parentTab === 'redemptions' && <RedemptionsManager redemptions={redemptions} onToggleFulfill={toggleRedemption} onDelete={handleDeleteRedemption} />}
        {parentTab === 'history' && <HistoryView history={history} historyView={historyView} setHistoryView={setHistoryView} calendarDate={calendarDate} setCalendarDate={setCalendarDate} today={today} selectedDate={selectedCalendarDate} onDayClick={setSelectedCalendarDate} getTasksForDate={getTasksForDate} />}
        {parentTab === 'settings' && <SettingsView />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-200 overflow-x-hidden relative">
      <style>{`
        @keyframes floatUpAndFade {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          20% { opacity: 1; transform: translateY(-20px) scale(1.2) rotate(-10deg); }
          100% { opacity: 0; transform: translateY(-120px) scale(1) rotate(10deg); }
        }
        @keyframes bob {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-15px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }
        @keyframes chew {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(4deg); }
        }
        .floating-star-anim { animation: floatUpAndFade 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .animate-bob { animation: bob 3s ease-in-out infinite alternate; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <BackgroundDinos />

      {floatingStars.map(star => (
        <div key={star.id} className="floating-star-anim fixed z-50 pointer-events-none flex items-center gap-1 text-yellow-500 font-black text-4xl" style={{ left: star.x - 40, top: star.y - 40 }}>
          +{star.points} <Icon name="Star" className="fill-yellow-400 text-orange-500" size={48} />
        </div>
      ))}

      {celebrationReward && (
        <CelebrationPopup reward={celebrationReward} onClose={() => setCelebrationReward(null)} />
      )}
      <ConfirmModal />

      {/* --- AUTH GATE --- */}
      {user === undefined || (user && loading) ? (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl animate-bounce">🦕</div>
            <p className="text-slate-500 font-bold text-xl mt-4">Waking up the dinos...</p>
          </div>
        </div>
      ) : user === null ? (
        <LoginScreen />
      ) : activeChildId === null ? (
        <ChildSelector onSelect={(id) => {
          if (id === 'parent') {
            setView('login');
          } else {
            setActiveChildId(id);
            setView('child');
          }
        }} />
      ) : (
        <div className="relative z-10">
          {view === 'child' && <ChildView />}
          {view === 'shop' && <ShopView />}
          {view === 'login' && <LoginView />}
          {view === 'parent' && <ParentDashboard />}
        </div>
      )}

      {showAddTask && (
        <Modal title={editingTaskId ? 'Edit Task' : 'New Task'} onClose={() => setShowAddTask(false)}>
          <form onSubmit={handleAddTask} className="space-y-4">
            <input required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none" placeholder="Task Name" />
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map(i => (
                <button key={i} type="button" onClick={() => setNewTask({ ...newTask, icon: i })} className={`p-2 rounded-xl transition-all ${newTask.icon === i ? 'bg-indigo-500 text-white scale-110' : 'bg-slate-100 text-slate-500'}`}><Icon name={i} size={20} /></button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })} className="border-2 border-slate-200 p-3 rounded-xl bg-white outline-none focus:border-indigo-500"><option>Morning</option><option>Afternoon</option><option>Evening</option></select>
              <input type="number" value={newTask.points} onChange={e => setNewTask({ ...newTask, points: parseInt(e.target.value) })} className="border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-indigo-500" />
            </div>
            <select value={newTask.frequency} onChange={e => setNewTask({ ...newTask, frequency: e.target.value })} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-white outline-none focus:border-indigo-500"><option value="daily">Daily</option><option value="weekly">Weekly Days</option><option value="monthly">Monthly Day</option><option value="specific">Specific Date</option></select>
            {newTask.frequency === 'weekly' && <div className="flex justify-between">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <button key={d} type="button" onClick={() => { const days = newTask.daysOfWeek.includes(d) ? newTask.daysOfWeek.filter(x => x !== d) : [...newTask.daysOfWeek, d]; setNewTask({ ...newTask, daysOfWeek: days }) }} className={`w-8 h-8 rounded-full text-xs font-bold ${newTask.daysOfWeek.includes(d) ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{d[0]}</button>)}</div>}
            {newTask.frequency === 'monthly' && <input type="number" min="1" max="31" value={newTask.dayOfMonth} onChange={e => setNewTask({ ...newTask, dayOfMonth: parseInt(e.target.value) })} className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none" />}
            {newTask.frequency === 'specific' && <input type="date" value={newTask.specificDate} onChange={e => setNewTask({ ...newTask, specificDate: e.target.value })} className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none" />}
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold p-4 rounded-xl shadow-md hover:bg-indigo-700 transition-colors">Save Task</button>
          </form>
        </Modal>
      )}

      {showAddReward && (
        <Modal title={editingRewardId ? 'Edit Reward' : 'New Reward'} onClose={() => setShowAddReward(false)}>
          <form onSubmit={handleAddReward} className="space-y-4">
            <input required value={newReward.title} onChange={e => setNewReward({ ...newReward, title: e.target.value })} className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-pink-500 outline-none" placeholder="Reward Name" />
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map(i => (
                <button key={i} type="button" onClick={() => setNewReward({ ...newReward, icon: i })} className={`p-2 rounded-xl transition-all ${newReward.icon === i ? 'bg-pink-500 text-white scale-110' : 'bg-slate-100 text-slate-500'}`}><Icon name={i} size={20} /></button>
              ))}
            </div>
            <input type="number" value={newReward.cost} onChange={e => setNewReward({ ...newReward, cost: parseInt(e.target.value) })} className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-pink-500 outline-none" placeholder="Star Cost" />
            <button type="submit" className="w-full bg-pink-500 text-white font-bold p-4 rounded-xl shadow-md hover:bg-pink-600 transition-colors">Save Reward</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh] hide-scrollbar border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">{title}</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full"><Icon name="X" size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);