import { useState } from 'react';
import { useChildren, createChild } from '../hooks/useChildData';
import { useAuth } from '../AuthContext';

export default function ChildSelector({ onSelect }) {
  const { user, signOut } = useAuth();
  const { children, loading } = useChildren(user?.uid);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const id = await createChild(user.uid, newName.trim());
    setCreating(false);
    setAdding(false);
    setNewName('');
    onSelect(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl animate-bounce">🦕</div>
          <p className="text-white font-bold text-xl mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const DINO_EMOJIS = ['🦖', '🦕', '🐉', '🦎', '🐊'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Dino Star Quest!</h1>
          <p className="text-indigo-200 font-medium">{user.displayName}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSelect('parent')}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold transition-colors border border-white/20"
          >
            Settings
          </button>
          <button
            onClick={signOut}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-black text-white mb-6">
        {children.length === 0 ? "Let's add your first explorer! 🦕" : "Who's playing today? 🦕"}
      </h2>

      {/* Children grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {children.map((child, i) => (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            className="bg-white rounded-3xl p-6 text-center shadow-xl hover:scale-105 transition-all active:scale-95 animate-in fade-in"
          >
            <div className="text-5xl mb-2">{DINO_EMOJIS[i % DINO_EMOJIS.length]}</div>
            <p className="font-black text-xl text-slate-800">{child.name}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-yellow-500">⭐</span>
              <span className="font-bold text-yellow-600">{child.stars || 0} stars</span>
            </div>
          </button>
        ))}

        {/* Add child button */}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="bg-white/20 border-4 border-dashed border-white/50 rounded-3xl p-6 text-center hover:bg-white/30 transition-colors"
          >
            <div className="text-5xl mb-2">➕</div>
            <p className="font-black text-xl text-white">Add Child</p>
          </button>
        )}
      </div>

      {/* Add child form */}
      {adding && (
        <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm mx-auto w-full animate-in zoom-in duration-200">
          <h3 className="text-xl font-black text-slate-800 mb-1">New Dino Explorer!</h3>
          <p className="text-slate-500 text-sm mb-4">This will create a task list for them 🦕</p>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              autoFocus
              required
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Child's name (e.g. Alex)"
              className="w-full border-2 border-slate-200 p-3 rounded-xl text-lg font-bold outline-none focus:border-indigo-500"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setAdding(false); setNewName(''); }}
                className="flex-1 bg-slate-100 text-slate-600 font-bold p-3 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-indigo-600 text-white font-bold p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create! 🦕'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
