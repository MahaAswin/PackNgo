import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Pencil, Check, X, Compass, Heart, BookOpen, Gift } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

export default function ProfilePage() {
  const { user, bookings, wishlist, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true);
    try {
      await api.put(`/users/${user.id}`, { ...user, name: name.trim() });
      // update local session
      const updated = { ...user, name: name.trim() };
      localStorage.setItem('pn_user', JSON.stringify(updated));
      window.location.reload(); // refresh to pick up new name
    } catch {
      // update locally even if backend fails
      const updated = { ...user, name: name.trim() };
      localStorage.setItem('pn_user', JSON.stringify(updated));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const memberSince = user?.id
    ? new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">My Profile</h1>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-2xl space-y-6">

            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
              {/* Cover */}
              <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600" />
              {/* Avatar + Info */}
              <div className="-mt-12 px-6 pb-6">
                <div className="flex items-end justify-between">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-blue-600 text-3xl font-black text-white shadow-lg dark:border-slate-900">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  {!editing ? (
                    <button onClick={() => { setName(user?.name || ''); setEditing(true); setError(''); }}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                      <Pencil size={14} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                        <Check size={14} /> {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(false)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  )}
                </div>

                {editing ? (
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-bold text-slate-500">Display Name</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                      className="input" placeholder="Your name" />
                    {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
                  </div>
                ) : (
                  <div className="mt-4">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h2>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{user?.level || 'Explorer'}</p>
                  </div>
                )}

                <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Mail size={16} className="text-blue-500" /> {user?.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar size={16} className="text-blue-500" /> Member since {memberSince}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <User size={16} className="text-blue-500" /> Traveler account
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4">
              {[
                { label: 'Bookings', value: bookings.length, icon: <BookOpen size={20} />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', to: '/dashboard' },
                { label: 'Wishlist', value: wishlist.length, icon: <Heart size={20} />, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/40', to: '/wishlist' },
                { label: 'Points', value: user?.travelPoints ?? 250, icon: <Gift size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', to: '/dashboard' },
              ].map(s => (
                <Link key={s.label} to={s.to} className="card p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</p>
                </Link>
              ))}
            </motion.div>

            {/* Quick Links */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="card p-5">
              <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Quick Links</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Link to="/dashboard" className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  <BookOpen size={16} className="text-blue-500" /> My Bookings
                </Link>
                <Link to="/wishlist" className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  <Heart size={16} className="text-rose-500" /> Wishlist
                </Link>
                <Link to="/explore" className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  <Compass size={16} className="text-indigo-500" /> Explore
                </Link>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
}
