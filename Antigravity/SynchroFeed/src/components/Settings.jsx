import React from 'react';
import { User, Shield, Zap, Info, ExternalLink, Save } from 'lucide-react';

const Settings = ({ globalWebhook, setGlobalWebhook }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account and integration preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Account Details Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-soft p-8 space-y-6 transition-all hover:shadow-lg hover:shadow-slate-100">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                 <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Account Details</h3>
                <p className="text-xs text-slate-400">Personal information associated with your account.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium select-none flex items-center gap-2 cursor-not-allowed">
                  harics88@synchrofeed.io
                  <Shield className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Plan</label>
                <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-bold text-xs inline-flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Premium Enterprise
                </div>
              </div>
           </div>
        </div>

        {/* Global Integrations Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-soft p-8 space-y-6 transition-all hover:shadow-lg hover:shadow-slate-100">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                 <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Global Integration Variables</h3>
                <p className="text-xs text-slate-400">Set default values for your webhooks and generic parameters.</p>
              </div>
           </div>

           <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Default Discord Webhook</label>
                <div className="flex gap-2">
                  <input 
                    title="Enter global Discord webhook"
                    type="url"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={globalWebhook}
                    onChange={(e) => setGlobalWebhook(e.target.value)}
                  />
                  <button 
                    onClick={() => showToast('Global Discord Webhook saved successfully.')}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
           </div>
        </div>

        {/* Informational Banner */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                 <Info className="w-8 h-8" />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-bold">Automation Schedule</h3>
                <p className="text-indigo-100 text-sm leading-relaxed max-w-lg">
                  SynchroFeed workers are fully managed and run every <strong>30 minutes</strong> via GitHub Actions schedules. 
                  High-priority syncs are executed instantly upon data discovery.
                </p>
                <div className="pt-2">
                   <a href="#" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-indigo-200 hover:text-white transition-colors">
                      View Worker Documentation
                      <ExternalLink className="w-3 h-3" />
                   </a>
                </div>
              </div>
           </div>
           {/* Abstract Decorative Element */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>
    </div>
  );
};

export default Settings;
