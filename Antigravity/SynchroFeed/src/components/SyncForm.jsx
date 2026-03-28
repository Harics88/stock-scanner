import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, X, Globe, Twitter, Rss, MessageSquare, AlertCircle } from 'lucide-react';
import { PLATFORMS_SOURCE, PLATFORMS_DESTINATION } from '../data/mockData';
import ConfirmModal from './ConfirmModal';
import { useToast } from './Toast';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

const SyncForm = ({ activeView, setActiveView, syncs, setSyncs, globalWebhook, editingSync }) => {
  const [formData, setFormData] = useState({
    name: '',
    source: 'Twitter',
    sourceNames: '',
    filterKeywords: '',
    destination: 'Discord',
    webhookUrl: '',
    skipReplies: false,
    skipRetweets: false,
    status: 'Active',
    deliveredCount: 0,
    lastRun: 'Just now'
  });

  const [parsedSources, setParsedSources] = useState([]);
  const [parsedKeywords, setParsedKeywords] = useState([]);
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (editingSync) {
      setFormData(editingSync);
    }
  }, [editingSync]);

  // Parser for inputs (comma-separated usernames or URLs)
  useEffect(() => {
    const items = formData.sourceNames
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    setParsedSources(items);
  }, [formData.sourceNames]);

  // Parser for keywords (respects double-quotes)
  useEffect(() => {
    const regex = /"[^"]+"|[^\s,]+/g;
    const matches = formData.filterKeywords.match(regex) || [];
    setParsedKeywords(matches.map(m => m.replace(/"/g, '')));
  }, [formData.filterKeywords]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const executeSubmit = async () => {
    try {
      if (editingSync) {
        const syncRef = doc(db, "syncs", editingSync.id);
        const { id, ...updateData } = { ...formData, isFiltered: parsedKeywords.length > 0 };
        await updateDoc(syncRef, updateData);
        showToast(`Sync "${formData.name}" updated successfully.`);
      } else {
        const newSync = {
          ...formData,
          isFiltered: parsedKeywords.length > 0,
          deliveredCount: 0,
          lastRun: 'Just now'
        };
        await addDoc(collection(db, "syncs"), newSync);
        showToast(`Sync "${formData.name}" created successfully.`);
      }
      setActiveView('dashboard');
    } catch (error) {
      console.error("Submit Error:", error);
      showToast("Failed to save sync. Check console for details.", "error");
    }
  };

  const InputPill = ({ label, colorClass }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-${colorClass}-50 text-${colorClass}-700 text-xs font-semibold rounded-full border border-${colorClass}-100 transition-all animate-in fade-in zoom-in duration-300`}>
      {label}
    </span>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setActiveView('dashboard')}
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {editingSync ? 'Edit Sync' : 'Create New Sync'}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Configure your data forwarding pipeline.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-soft divide-y divide-slate-100 overflow-hidden">
        {/* Section 1: Data Source */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Globe className="w-4 h-4 text-indigo-600" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">1. Data Source</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Platform</label>
              <select 
                title="Select source platform"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
              >
                {PLATFORMS_SOURCE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Sync Name</label>
               <input 
                 title="Enter sync name"
                 type="text"
                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                 placeholder="e.g. Flight Alerts"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                 required
               />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">
              {formData.source === 'Twitter' ? 'Usernames' : 'RSS Feed URLs'}
            </label>
            <textarea 
              title="Enter comma-separated inputs"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none min-h-[100px] text-sm"
              placeholder={formData.source === 'Twitter' ? 'e.g. @airmaharaj, @united, @rove' : 'e.g. https://techcrunch.com/feed'}
              value={formData.sourceNames}
              onChange={(e) => setFormData({...formData, sourceNames: e.target.value})}
              required
            />
            {parsedSources.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {parsedSources.map((item, id) => (
                  <InputPill key={id} label={item} colorClass="indigo" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Filters & Options */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">2. Filters & Options</h3>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Required Keywords (Comma-separated)</label>
            <input 
              title="Enter keywords to filter by"
              type="text"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
              placeholder='e.g. award, 75x, "business class"'
              value={formData.filterKeywords}
              onChange={(e) => setFormData({...formData, filterKeywords: e.target.value})}
            />
            <p className="text-[11px] text-slate-400">Posts must contain at least one of these keywords. Use quotes for exact phrases.</p>
            {parsedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {parsedKeywords.map((item, id) => (
                  <InputPill key={id} label={item} colorClass="amber" />
                ))}
              </div>
            )}
          </div>

          {formData.source === 'Twitter' && (
            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <label className="relative flex items-center gap-3 cursor-pointer group">
                <input 
                  title="Skip replies"
                  type="checkbox" 
                  className="peer hidden"
                  checked={formData.skipReplies}
                  onChange={(e) => setFormData({...formData, skipReplies: e.target.checked})}
                />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Skip Replies</span>
              </label>
              <label className="relative flex items-center gap-3 cursor-pointer group">
                <input 
                  title="Skip retweets"
                  type="checkbox" 
                  className="peer hidden"
                  checked={formData.skipRetweets}
                  onChange={(e) => setFormData({...formData, skipRetweets: e.target.checked})}
                />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Skip Retweets</span>
              </label>
            </div>
          )}
        </div>

        {/* Section 3: Delivery Destination */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">3. Delivery Destination</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Platform</label>
              <select 
                title="Select destination platform"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
              >
                {PLATFORMS_DESTINATION.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <label className="text-sm font-bold text-slate-700">Webhook URL</label>
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, webhookUrl: globalWebhook})}
                   className="text-[10px] font-bold text-indigo-600 uppercase hover:text-indigo-700 transition-colors"
                 >
                   Use Global
                 </button>
               </div>
               <input 
                 title="Enter destination webhook URL"
                 type="url"
                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                 placeholder="https://discord.com/api/webhooks/..."
                 value={formData.webhookUrl}
                 onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                 required
               />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={() => setActiveView('dashboard')}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Save className="w-5 h-5" />
            {editingSync ? 'Save Changes' : 'Create Sync'}
          </button>
        </div>
      </form>

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeSubmit}
        title={editingSync ? 'Save Changes?' : 'Create Sync?'}
        message={editingSync 
          ? `Are you sure you want to save the changes to "${formData.name}"?` 
          : `Are you sure you want to create "${formData.name}" and start the pipeline?`}
        confirmText={editingSync ? 'Save Changes' : 'Create Sync'}
        type="primary"
      />
    </div>
  );
};

export default SyncForm;
