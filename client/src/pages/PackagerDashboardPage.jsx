import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, MapPin, BarChart3, DollarSign, Star, TrendingUp, AlertCircle, ShieldCheck, MessageCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { apiGetPackages, apiDeletePackage } from '../api/api';
import api from '../lib/axios';

export default function PackagerDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [packages, setPackages] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const mine = packages.filter(p => p.createdById === user?.id);
  const visiblePackages = mine
    .filter(pkg => statusFilter === 'ALL' || pkg.status === statusFilter)
    .filter(pkg => {
      const query = searchQuery.toLowerCase();
      return !query || pkg.title?.toLowerCase().includes(query) || pkg.location?.toLowerCase().includes(query);
    });

  useEffect(() => {
    if (refreshUser) {
      refreshUser();
    }
    apiGetPackages()
      .then(setPackages)
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, [refreshUser]);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingFeedback(true);
    api.get(`/feedback/packager/${user.id}`)
      .then(res => setFeedbackList(res.data || []))
      .catch(() => setFeedbackList([]))
      .finally(() => setLoadingFeedback(false));
  }, [user?.id]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this package?')) return;
    await apiDeletePackage(id).catch(() => {});
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const stats = [
    { label: 'Active Packages', value: mine.length, icon: <BarChart3 size={20} className="text-orange-500" /> },
    { label: 'Total Bookings', value: user?.totalBookings || 0, icon: <TrendingUp size={20} className="text-blue-500" /> },
    { label: 'Reviews', value: feedbackList.length, icon: <MessageCircle size={20} className="text-indigo-500" /> },
    { label: 'Rating', value: user?.ratings || '5.0', icon: <Star size={20} className="text-yellow-500" /> },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar isPackager />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-950">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Partner Dashboard</h1>
          <Link to="/packager/new" className="btn-primary py-2 px-4 text-sm"><Plus size={16} /> New Package</Link>
        </header>

        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl">
            {user?.packagerStatus === 'pending' && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-semibold">Your account is pending admin approval. Packages won't be visible until approved.</p>
              </div>
            )}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Partner Dashboard</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your listings, bookings, and earnings from one place.</p>
              </div>
              <Link to="/packager/new" className="btn-primary py-2 px-4 text-sm"><Plus size={16} /> New Package</Link>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search packages by title or location"
                className="input w-full sm:w-72"
              />
              <div className="flex flex-wrap gap-2">
                {['ALL', 'ACTIVE', 'FEATURED', 'DRAFT'].map(option => (
                  <button key={option} type="button" onClick={() => setStatusFilter(option)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${statusFilter === option ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map(s => (
                <div key={s.label} className="card p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">{s.icon}</div>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Packages</h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
              </div>
            ) : mine.length === 0 ? (
              <div className="card flex flex-col items-center justify-center border-dashed py-20 text-center">
                <Plus className="mb-4 text-slate-300" size={48} />
                <p className="text-slate-500">No packages yet. Create your first one!</p>
                <Link to="/packager/new" className="btn-primary mt-6">Create Package</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visiblePackages.map((pkg, i) => (
                  <motion.div key={pkg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="card overflow-hidden">
                    <div className="relative h-44 bg-slate-200 dark:bg-slate-800">
                      {pkg.images?.[0] && <img src={pkg.images[0]} className="h-full w-full object-cover" alt="" />}
                      <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${pkg.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{pkg.status}</span>
                    </div>
                    <div className="p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{pkg.title}</h3>
                        {pkg.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{pkg.vendorName || user?.companyName || user?.name}</p>
                      <p className="mt-2 flex items-center gap-1 text-sm text-slate-500"><MapPin size={12} />{pkg.location}</p>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                        <span>{pkg.durationDays}D / {pkg.durationNights}N</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{pkg.rating?.toFixed(1) || '4.8'} ★</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-black text-blue-600">₹{pkg.price?.toLocaleString()}</span>
                        <div className="flex gap-2">
                          <Link to={`/package/${pkg.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-50 dark:border-slate-700">View</Link>
                          <button onClick={() => handleDelete(pkg.id)} className="rounded-lg border border-rose-100 p-1.5 text-rose-600 hover:bg-rose-50"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Customer Feedback</h2>
                  <p className="text-sm text-slate-500">Feedback left by travelers for your packages.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{feedbackList.length} reviews</span>
              </div>
              {loadingFeedback ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, idx) => <div key={idx} className="h-20 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />)}
                </div>
              ) : feedbackList.length === 0 ? (
                <p className="text-sm text-slate-500">No feedback yet. Once customers leave a review, it appears here.</p>
              ) : (
                <div className="space-y-4">
                  {feedbackList.map(item => (
                    <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{item.packageTitle}</h3>
                          <p className="text-sm text-slate-500">{item.userName || item.userEmail}</p>
                        </div>
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">{item.rating || 'No rating'} ★</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{item.comment || 'No comment provided.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
