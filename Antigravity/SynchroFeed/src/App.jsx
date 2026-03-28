import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SyncForm from './components/SyncForm';
import Settings from './components/Settings';
import { INITIAL_SYNCS } from './data/mockData';
import { Menu, X as CloseIcon, User, Search, Bell } from 'lucide-react';
import { ToastProvider, useToast } from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import { db } from './firebase'; 
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [syncs, setSyncs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalWebhook, setGlobalWebhook] = useState('https://discord.com/api/webhooks/123456789/global-flight-hacks');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingSync, setEditingSync] = useState(null);
  const { showToast } = useToast();

  // Real-time Firestore Sync
  useEffect(() => {
    console.log("Initializing Firestore sync...");
    const q = query(collection(db, "syncs"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`Firestore Update: ${docs.length} syncs found.`);
      setSyncs(docs);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore Snapshot Error:", error);
      showToast("Cloud sync failed. Check your Firebase config.", "error");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Reset editing sync when navigating away from edit views
  useEffect(() => {
    if (activeView !== 'edit-sync' && activeView !== 'create-sync') {
      setEditingSync(null);
    }
  }, [activeView]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard 
          syncs={syncs} 
          setSyncs={setSyncs} 
          setActiveView={setActiveView} 
          setEditingSync={setEditingSync}
        />;
      case 'create-sync':
      case 'edit-sync':
        return <SyncForm 
          activeView={activeView}
          setActiveView={setActiveView}
          syncs={syncs}
          setSyncs={setSyncs}
          globalWebhook={globalWebhook}
          editingSync={editingSync}
        />;
      case 'settings':
        return <Settings 
          globalWebhook={globalWebhook} 
          setGlobalWebhook={setGlobalWebhook} 
          showToast={showToast}
        />;
      default:
        return isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
             <p className="text-slate-400 font-medium animate-pulse">Syncing with Cloud...</p>
          </div>
        ) : (
          <Dashboard 
            syncs={syncs} 
            setSyncs={setSyncs} 
            setActiveView={setActiveView} 
            setEditingSync={setEditingSync}
            showToast={showToast}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'create-sync': return 'Create New Sync';
      case 'edit-sync': return 'Edit Sync';
      case 'settings': return 'Settings';
      default: return 'SynchroFeed';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:pl-64 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 lg:hidden text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm font-medium">
              <span className="font-outfit font-bold text-indigo-600">SynchroFeed</span>
              <span>/</span>
              <span className="text-slate-900">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 rounded-xl border border-slate-200">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Universal Search..." 
                  className="bg-transparent border-none text-xs focus:ring-0 w-32 outline-none" 
                  title="Search syncs and events"
                />
             </div>
             <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white" />
             </button>
             <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 p-[1.5px] cursor-pointer hover:scale-105 transition-transform">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                   <User className="w-4 h-4 text-indigo-600" />
                </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto pb-20">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
