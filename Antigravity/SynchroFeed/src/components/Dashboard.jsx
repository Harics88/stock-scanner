import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, PauseCircle, Twitter, Rss, MessageSquare, Hash } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { useToast } from './Toast';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

const Dashboard = ({ syncs, setSyncs, setActiveView, setEditingSync }) => {
  const { showToast } = useToast();
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const handleToggleStatus = (sync) => {
    setModalConfig({
      isOpen: true,
      title: sync.status === 'Active' ? 'Pause Sync?' : 'Activate Sync?',
      message: `Are you sure you want to ${sync.status === 'Active' ? 'pause' : 'activate'} "${sync.name}"? This will ${sync.status === 'Active' ? 'stop' : 'resume'} all automated data forwarding.`,
      confirmText: sync.status === 'Active' ? 'Pause Sync' : 'Activate Sync',
      type: sync.status === 'Active' ? 'danger' : 'primary',
      onConfirm: async () => {
        try {
          const syncRef = doc(db, "syncs", sync.id);
          await updateDoc(syncRef, {
            status: sync.status === 'Active' ? 'Paused' : 'Active'
          });
          showToast(`Sync "${sync.name}" ${sync.status === 'Active' ? 'paused' : 'activated'} successfully.`);
        } catch (error) {
          console.error("Update Error:", error);
          showToast("Failed to update sync status.", "error");
        }
      }
    });
  };

  const handleDeleteSync = (sync) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Sync?',
      message: `Are you sure you want to delete "${sync.name}"? This action cannot be undone and all configuration will be lost.`,
      confirmText: 'Delete Permanently',
      type: 'danger',
      onConfirm: async () => {
        try {
          const syncRef = doc(db, "syncs", sync.id);
          await deleteDoc(syncRef);
          showToast(`Sync "${sync.name}" deleted successfully.`, 'error');
        } catch (error) {
          console.error("Delete Error:", error);
          showToast("Failed to delete sync.", "error");
        }
      }
    });
  };

  const SourceIcon = ({ type }) => {
    if (type === 'Twitter') return <Twitter className="w-5 h-5 text-[#1DA1F2]" />;
    if (type === 'RSS') return <Rss className="w-5 h-5 text-[#EE802F]" />;
    return <Hash className="w-5 h-5" />;
  };

  const DestIcon = ({ type }) => {
    if (type === 'Discord') return <MessageSquare className="w-5 h-5 text-[#5865F2]" />;
    if (type === 'Slack') return <MessageSquare className="w-5 h-5 text-[#4A154B]" />;
    return <MessageSquare className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Syncs</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your automated data forwarding pipelines.</p>
        </div>
        <button 
          onClick={() => setActiveView('create-sync')}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Sync
        </button>
      </div>

      {syncs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-slate-300 rounded-2xl text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No syncs yet</h3>
          <p className="text-slate-500 max-w-sm mt-2">Get started by creating your first automated data pipeline to forward content from Twitter or RSS.</p>
          <button 
            onClick={() => setActiveView('create-sync')}
            className="mt-6 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            Create your first sync →
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sync Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Run</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syncs.map((sync) => (
                  <tr key={sync.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{sync.name}</span>
                          {sync.isFiltered && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                              Filtered
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{sync.deliveredCount} posts delivered</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-100 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-200">
                          <SourceIcon type={sync.source} />
                          <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
                            {sync.sourceNames.split(',')[0]}
                            {sync.sourceNames.split(',').length > 1 && ` + ${sync.sourceNames.split(',').length - 1} more`}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                        <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-200">
                           <DestIcon type={sync.destination} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleToggleStatus(sync)}
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all
                          ${sync.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                        `}
                      >
                        {sync.status === 'Active' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <PauseCircle className="w-3.5 h-3.5" />
                        )}
                        {sync.status}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-500">{sync.lastRun}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-10 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingSync(sync);
                            setActiveView('edit-sync');
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Sync"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSync(sync)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Sync"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />
    </div>
  );
};

export default Dashboard;
