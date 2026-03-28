import React from 'react';
import { Home, Settings, LogOut, X, Menu } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'My Syncs', icon: Home },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const Logo = () => (
    <div className="flex items-center gap-4 px-2 mb-10 group cursor-pointer" onClick={() => setActiveView('dashboard')}>
      <div className="relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl overflow-hidden shadow-xl shadow-slate-100 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
        <img src="/logo.jpg" alt="X-Echo Logo" className="w-full h-full object-cover" />
      </div>
      <div>
        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-600 font-outfit">
          SynchroFeed
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Synchronize all your social feeds</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <Logo />

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${activeView === item.id 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
