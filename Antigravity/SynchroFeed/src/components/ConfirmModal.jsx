import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <AlertTriangle className="w-6 h-6" />
           </div>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="space-y-2">
           <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
           <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
           <button 
             onClick={onClose}
             className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
           >
             Cancel
           </button>
           <button 
             onClick={() => {
               onConfirm();
               onClose();
             }}
             className={`
               flex-1 px-6 py-3 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95
               ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}
             `}
           >
             {confirmText || 'Confirm'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
