import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, LogOut, ShieldCheck,
  Eye, Building2, Phone, Globe, MapPin, FileText, Image,
  CheckCircle2, XCircle, Search, Mail, Calendar, Download, Package, Star,
  MessageCircle, AlertTriangle, ChevronRight, BarChart, FileCheck, X,
  ArrowUpRight, Paperclip, Check, ShieldAlert, AlertCircle, Copy, CheckSquare
} from 'lucide-react';
import api from '../lib/axios';
import { apiDeletePackage, apiUpdatePackage } from '../api/api';
import { getAllPackagerRegistrations } from '../store/packagerStore';
import ThemeToggle from '../components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const [tab, setTab]                     = useState('pending');
  const [allUsers, setAllUsers]           = useState([]);
  const [packages, setPackages]           = useState([]);
  const [complaints, setComplaints]       = useState([]);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [selected, setSelected]           = useState(null);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  const [search, setSearch]               = useState('');
  const [packageSearch, setPackageSearch] = useState('');
  const [packageFilter, setPackageFilter] = useState('ALL');
  const [loading, setLoading]             = useState(true);

  // Local store registrations (has documents)
  const localRegs = getAllPackagerRegistrations();

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/packages'), api.get('/complaints'), api.get('/feedback')])
      .then(([usersRes, packagesRes, complaintsRes, feedbackRes]) => {
        setAllUsers(usersRes.data || []);
        setPackages(packagesRes.data || []);
        setComplaints(complaintsRes.data || []);
        setFeedbackItems(feedbackRes.data || []);
      })
      .catch(() => {
        setAllUsers([]);
        setPackages([]);
        setComplaints([]);
        setFeedbackItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Merge backend users with local store docs
  const packagers = allUsers.filter(u => u.role === 'PACKAGER');
  const pending   = packagers.filter(u => u.packagerStatus === 'pending');
  const approved  = packagers.filter(u => u.packagerStatus === 'approved');
  const travelers = allUsers.filter(u => u.role === 'USER');

  const totalPackages = packages.length;
  const featuredPackages = packages.filter(p => p.status === 'FEATURED').length;
  const verifiedPackages = packages.filter(p => p.verified).length;

  const packageList = packages.filter(pkg => {
    const query = packageSearch.toLowerCase();
    const matchesFilter =
      packageFilter === 'ALL' ||
      (packageFilter === 'ACTIVE' && pkg.status === 'ACTIVE') ||
      (packageFilter === 'FEATURED' && pkg.status === 'FEATURED') ||
      (packageFilter === 'VERIFIED' && pkg.verified) ||
      (packageFilter === 'TRENDING' && pkg.isTrending);

    return matchesFilter &&
      (!query || pkg.title?.toLowerCase().includes(query) || pkg.location?.toLowerCase().includes(query) || pkg.vendorName?.toLowerCase().includes(query));
  });

  const getLocalReg = (u) =>
    localRegs.find(r => r.email === u.email || r.userId === String(u.id)) || null;

  const handleApprove = async (id) => {
    await api.patch(`/users/${id}/status`, { packagerStatus: 'approved' }).catch(() => {});
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, packagerStatus: 'approved' } : u));
    setSelected(null);
  };

  const handleReject = async (id) => {
    await api.patch(`/users/${id}/status`, { packagerStatus: 'rejected' }).catch(() => {});
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, packagerStatus: 'rejected' } : u));
    setSelected(null);
  };

  const handleUnapprove = async (id) => {
    await api.patch(`/users/${id}/status`, { packagerStatus: 'pending' }).catch(() => {});
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, packagerStatus: 'pending' } : u));
    setSelected(null);
  };

  const handleUpdateComplaintStatus = async (complaintId, status) => {
    const updated = await api.patch(`/complaints/${complaintId}/status`, { status }).then(r => r.data).catch(() => null);
    if (!updated) return;
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (selected?.id === updated.id) setSelected(updated);
  };

  const handlePackageFeature = async (pkg) => {
    const nextStatus = pkg.status === 'FEATURED' ? 'ACTIVE' : 'FEATURED';
    const updated = await apiUpdatePackage(pkg.id, { status: nextStatus }).catch(() => null);
    if (updated) setPackages(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handlePackageVerified = async (pkg) => {
    const updated = await apiUpdatePackage(pkg.id, { verified: !pkg.verified }).catch(() => null);
    if (updated) setPackages(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handlePackageDelete = async (id) => {
    if (!confirm('Delete this package? This cannot be undone.')) return;
    await apiDeletePackage(id).catch(() => {});
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const listToShow = () => {
    const q = search.toLowerCase().trim();
    if (tab === 'complaints') {
      return !q ? complaints : complaints.filter(item =>
        item.packageTitle?.toLowerCase().includes(q) ||
        item.subject?.toLowerCase().includes(q) ||
        item.userName?.toLowerCase().includes(q) ||
        item.userEmail?.toLowerCase().includes(q)
      );
    }
    if (tab === 'feedback') {
      return !q ? feedbackItems : feedbackItems.filter(item =>
        item.packageTitle?.toLowerCase().includes(q) ||
        item.comment?.toLowerCase().includes(q) ||
        item.userName?.toLowerCase().includes(q) ||
        item.userEmail?.toLowerCase().includes(q)
      );
    }
    const base = tab === 'pending' ? pending : tab === 'approved' ? approved : travelers;
    if (!q) return base;
    return base.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.companyName?.toLowerCase().includes(q)
    );
  };

  if (!isAdmin) return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans dark:bg-[#080B11]">
      
      {/* Sidebar Navigation */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200/40 bg-white/90 backdrop-blur-xl dark:border-white/5 dark:bg-[#080B11]/90 z-20">
        <div className="flex h-20 items-center gap-3 border-b border-slate-200/40 px-6 dark:border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/25">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <span className="font-display font-black text-slate-900 dark:text-white block leading-none">Admin Board</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">PackNgo Platform</span>
          </div>
        </div>

        <nav className="flex-grow space-y-1.5 p-4">
          {[
            { key: 'pending',    label: `Applications`, badge: pending.length, icon: <ShieldCheck size={18} /> },
            { key: 'approved',   label: `Verified Partners`, badge: approved.length, icon: <CheckCircle2 size={18} /> },
            { key: 'travelers',  label: `Traveler Hub`, badge: travelers.length, icon: <Users size={18} /> },
            { key: 'feedback',   label: `Guest Reviews`, badge: feedbackItems.length, icon: <MessageCircle size={18} /> },
            { key: 'complaints', label: `Open Issues`, badge: complaints.length, icon: <AlertTriangle size={18} /> },
          ].map(t => (
            <button 
              key={t.key} 
              onClick={() => { setTab(t.key); setSelected(null); }}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[14px] font-medium transition-all duration-200
                ${tab === t.key 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'}`}
            >
              <div className="flex items-center gap-3">
                {t.icon}
                <span>{t.label}</span>
              </div>
              {t.badge > 0 && (
                <span className={`h-5 px-2 rounded-full flex items-center justify-center text-[11px] font-semibold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-350'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-200/40 p-4 dark:border-white/5">
          <button 
            onClick={logout} 
            className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} /> 
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Header bar */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200/40 bg-white/70 backdrop-blur-xl px-8 dark:border-white/5 dark:bg-[#080B11]/70">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-[-0.02em] leading-[1.2]">
              {tab === 'pending' ? 'Partner Approvals'
                : tab === 'approved' ? 'Verified Partners'
                : tab === 'travelers' ? 'Traveler Accounts'
                : tab === 'feedback' ? 'Guest Feedback'
                : 'Incident Log'}
            </h1>
            <p className="text-[13px] font-medium text-slate-400 mt-1">Control Center</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder="Global search..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="input w-60 py-2.5 pl-9 text-xs rounded-2xl" 
              />
            </div>
          </div>
        </header>

        {/* Global Catalog Overview and Content Logs Grid (Merged to full-width table + flyout) */}
        <div className="flex-grow flex flex-col overflow-y-auto">
          
          {/* Top Quick Stats and Charts Row - Only display on the first tab ('pending') */}
          {tab === 'pending' && (
            <div className="p-8 pb-4 grid gap-6 grid-cols-1 lg:grid-cols-3 shrink-0">
              {/* Metric counters */}
              <div className="lg:col-span-2 grid gap-4 grid-cols-2">
                {[
                  { label: 'Total Listings', value: totalPackages, change: '+4 this month', icon: <Package size={18} className="text-blue-500" />, bgGrad: 'from-blue-500/5 to-cyan-500/5' },
                  { label: 'Featured Offers', value: featuredPackages, change: 'Promoted spots', icon: <Star size={18} className="text-amber-500" />, bgGrad: 'from-amber-500/5 to-orange-500/5' },
                  { label: 'Approved Hosts', value: approved.length, change: 'Verified operators', icon: <CheckCircle2 size={18} className="text-emerald-500" />, bgGrad: 'from-emerald-500/5 to-teal-500/5' },
                  { label: 'Open Incidents', value: complaints.length, change: 'Needs action', icon: <AlertTriangle size={18} className="text-rose-500" />, bgGrad: 'from-rose-500/5 to-red-500/5' },
                ].map(item => (
                  <div key={item.label} className={`glass-card rounded-3xl p-5 border border-slate-200/40 dark:border-white/5 bg-gradient-to-br ${item.bgGrad} bg-white dark:bg-[#0F172A] shadow-sm hover:shadow-md transition duration-200`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-slate-700 dark:text-slate-355">{item.label}</span>
                      <div className="h-8 w-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-center justify-center shadow-sm">{item.icon}</div>
                    </div>
                    <p className="mt-2 text-[32px] font-bold text-slate-950 dark:text-white leading-none">{item.value}</p>
                    <span className="text-[12px] font-medium text-slate-450 mt-1.5 block">{item.change}</span>
                  </div>
                ))}
              </div>

              {/* SVG Interactive Revenue Charts Panel */}
              <div className="glass-card rounded-3xl p-5 bg-white dark:bg-[#0F172A] border border-slate-200/40 dark:border-white/5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[12px] font-medium text-slate-400">Financial Intelligence</span>
                    <h3 className="text-[14px] font-semibold text-slate-800 dark:text-slate-200 leading-none mt-1">Revenue Flow & Platforms Margins</h3>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Sales</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>Margin</span>
                  </div>
                </div>
                
                <div className="h-36 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 40 L 0 35 L 15 30 L 30 38 L 45 20 L 60 10 L 80 18 L 100 5 L 100 40 Z" fill="url(#adminChartGrad)" />
                    <path d="M 0 35 L 15 30 L 30 38 L 45 20 L 60 10 L 80 18 L 100 5" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 0 38 L 15 35 L 30 39 L 45 32 L 60 28 L 80 34 L 100 25" fill="none" stroke="#14B8A6" strokeWidth="1" strokeDasharray="1,1" />
                  </svg>
                </div>

                <div className="flex justify-between items-center text-[12px] text-slate-455 pt-2 border-t border-slate-100 dark:border-white/5">
                  <span>Est. Net Commission:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">₹84,250 (+12%)</span>
                </div>
              </div>
            </div>
          )}

          {/* List Navigation Panel (Takes up full space at bottom, structured as a clean modern Data Table) */}
          <div className="px-8 pb-8 flex-1">
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/40 dark:border-white/5 rounded-4xl shadow-xl overflow-hidden flex flex-col">
              
              {/* Header inside the table component */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                <div>
                  <h3 className="text-[20px] font-semibold text-slate-800 dark:text-slate-200">
                    {tab === 'pending' ? 'Verification Applications' : tab === 'approved' ? 'Verified Partner Directory' : tab === 'travelers' ? 'Active Travelers' : tab === 'feedback' ? 'Guest Feedback Logs' : 'Open Complaints Log'}
                  </h3>
                  <p className="text-[13px] text-slate-505 mt-1">Click any row to display details or trigger action drawers.</p>
                </div>
                <span className="rounded-full bg-blue-500/10 text-blue-650 dark:text-blue-400 px-3.5 py-1 text-[12px] font-semibold">{listToShow().length} Listings</span>
              </div>
              
              {loading ? (
                <div className="p-6 space-y-3 flex-grow">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-50 dark:bg-slate-900" />)}
                </div>
              ) : listToShow().length === 0 ? (
                <div className="p-20 text-center text-xs text-slate-400 font-semibold flex-grow flex flex-col justify-center items-center">
                  <AlertCircle size={28} className="text-slate-300 mb-2" />
                  <span>No records found matching query filter.</span>
                </div>
              ) : (
                <div className="overflow-x-auto flex-grow">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5 text-[13px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
                        {tab === 'complaints' && (
                          <>
                            <th className="px-6 py-4">Incident Ticket</th>
                            <th className="px-6 py-4">Package</th>
                            <th className="px-6 py-4">Traveler</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </>
                        )}
                        {tab === 'feedback' && (
                          <>
                            <th className="px-6 py-4">Package</th>
                            <th className="px-6 py-4">Guest Review</th>
                            <th className="px-6 py-4">Rating</th>
                            <th className="px-6 py-4">Submitted By</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </>
                        )}
                        {tab === 'travelers' && (
                          <>
                            <th className="px-6 py-4">Traveler Hub User</th>
                            <th className="px-6 py-4">Status Tier</th>
                            <th className="px-6 py-4">Points</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </>
                        )}
                        {(tab === 'pending' || tab === 'approved') && (
                          <>
                            <th className="px-6 py-4">Agency Details</th>
                            <th className="px-6 py-4">Contact Phone</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Compliance Files</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-[14px] font-normal text-slate-800 dark:text-slate-200">
                      {listToShow().map(item => {
                        if (tab === 'complaints') {
                          return (
                            <tr 
                              key={item.id} 
                              onClick={() => setSelected(item)}
                              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition cursor-pointer"
                            >
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">{item.subject}</td>
                              <td className="px-6 py-4 font-semibold text-slate-500">{item.packageTitle}</td>
                              <td className="px-6 py-4 font-medium text-slate-450">{item.userName || item.userEmail}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase ${
                                  item.status === 'OPEN' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                  <span className={`h-1 w-1 rounded-full ${item.status === 'OPEN' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                  <span>{item.status}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="h-7 w-7 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 inline-flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white"><ChevronRight size={14} /></button>
                              </td>
                            </tr>
                          );
                        }

                        if (tab === 'feedback') {
                          return (
                            <tr 
                              key={item.id} 
                              onClick={() => setSelected(item)}
                              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition cursor-pointer"
                            >
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">{item.packageTitle}</td>
                              <td className="px-6 py-4 text-slate-450 italic line-clamp-1 max-w-xs">{item.comment}</td>
                              <td className="px-6 py-4">
                                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                  <Star size={11} className="fill-current" />
                                  <span>{item.rating}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-500">{item.userName || item.userEmail}</td>
                              <td className="px-6 py-4 text-right">
                                <button className="h-7 w-7 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 inline-flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white"><ChevronRight size={14} /></button>
                              </td>
                            </tr>
                          );
                        }

                        if (tab === 'travelers') {
                          return (
                            <tr 
                              key={item.id} 
                              onClick={() => setSelected(item)}
                              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition cursor-pointer"
                            >
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-350 flex items-center justify-center">
                                    {item.name?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                  <span>{item.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500">
                                  {item.level || 'Bronze Explorer'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-300">{item.travelPoints || 0} pts</td>
                              <td className="px-6 py-4 text-slate-400 font-semibold">{item.email}</td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={(e) => { e.stopPropagation(); setSelected(item); }} className="btn-premium-secondary px-3 py-1 rounded-lg text-[9px] font-bold">Inspect</button>
                              </td>
                            </tr>
                          );
                        }

                        const reg = getLocalReg(item);
                        const docCount = reg ? Object.keys(reg.documents || {}).length : 0;
                        const statusBadgeColor = item.packagerStatus === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : item.packagerStatus === 'rejected'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-amber-500/10 text-amber-500';

                        return (
                          <tr 
                            key={item.id} 
                            onClick={() => setSelected({ user: item, reg })}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition cursor-pointer"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-xs font-black text-white shadow-inner">
                                  {(item.companyName || item.name)?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white leading-tight">{item.companyName || item.name}</p>
                                  <p className="text-[10px] text-slate-450 mt-0.5 font-semibold">{item.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-500">{item.phone || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase ${statusBadgeColor}`}>
                                <span className={`h-1 w-1 rounded-full ${
                                  item.packagerStatus === 'approved' ? 'bg-emerald-500' : item.packagerStatus === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                                }`} />
                                <span>{item.packagerStatus || 'pending'}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {docCount > 0 ? (
                                <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                                  <Paperclip size={10} />
                                  <span>{docCount} Certificates</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No files uploaded</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="h-7 w-7 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 inline-flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white"><ChevronRight size={14} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* FLYOUT DRAWER MODAL: Details pop on the page in a premium panel */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex justify-end">
            
            {/* Backdrop dark blurred overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Drawer Container Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#0F172A] h-full shadow-2xl flex flex-col z-10 border-l border-slate-200/50 dark:border-white/5"
            >
              
              {/* Drawer Header layout */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-slate-900/30">
                <div>
                  <span className="text-[14px] font-medium text-blue-500 leading-none block">Record Details Overview</span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5 font-display uppercase tracking-wider">
                    {tab === 'complaints' ? 'Incident Complaint Sheet' 
                      : tab === 'feedback' ? 'Traveler Feedback Log' 
                      : tab === 'travelers' ? 'User Verification Details' 
                      : 'Company Verification Details'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-250/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-350 transition"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Scrollable body containing forms and detail render blocks */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                {tab === 'complaints' ? (
                  <ComplaintDetail complaint={selected} onUpdateStatus={handleUpdateComplaintStatus} />
                ) : tab === 'feedback' ? (
                  <FeedbackDetail feedback={selected} />
                ) : tab === 'travelers' ? (
                  <TravelerDetail user={selected} />
                ) : (
                  <PackagerDetail
                    user={selected.user}
                    reg={selected.reg}
                    onApprove={() => handleApprove(selected.user.id)}
                    onReject={() => handleReject(selected.user.id)}
                    onUnapprove={() => handleUnapprove(selected.user.id)}
                    onViewDoc={(file, label) => setActivePreviewDoc({ file, label })}
                  />
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Lightbox Doc Viewer Modal */}
      <AnimatePresence>
        {activePreviewDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-3xl w-full bg-white dark:bg-[#0F172A] rounded-4xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border border-slate-200/10"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Preview: {activePreviewDoc.label}
                </span>
                <button 
                  onClick={() => setActivePreviewDoc(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800 text-slate-505 dark:text-slate-350 transition"
                >
                  <X size={15} />
                </button>
              </div>

              {/* View Content Area */}
              <div className="flex-grow overflow-auto p-6 flex items-center justify-center bg-slate-50/20 dark:bg-slate-950/10">
                {activePreviewDoc.file.type === 'application/pdf' ? (
                  <iframe 
                    src={activePreviewDoc.file.data} 
                    className="w-full h-[55vh] rounded-2xl border-0" 
                    title={activePreviewDoc.label}
                  />
                ) : (
                  <img 
                    src={activePreviewDoc.file.data} 
                    alt={activePreviewDoc.label} 
                    className="max-h-[55vh] max-w-full object-contain rounded-2xl shadow"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* ── Packager Detail Panel ── */
function PackagerDetail({ user, reg, onApprove, onReject, onUnapprove, onViewDoc }) {
  const u   = user;
  const r   = reg;
  const docs = r?.documents || {};

  const statusColor = u.packagerStatus === 'approved'
    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
    : u.packagerStatus === 'rejected'
    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header Profile */}
      <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xl font-black text-white">
            {(u.companyName || u.name)?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none font-display">{u.companyName || u.name}</h3>
            <span className={`mt-2 inline-block rounded-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
              {u.packagerStatus || 'pending'}
            </span>
          </div>
        </div>
        {r?.registeredAt && (
          <span className="text-[10px] text-slate-400 font-semibold">Applied: {new Date(r.registeredAt).toLocaleDateString('en-IN')}</span>
        )}
      </div>

      {/* Details Lists */}
      <div className="space-y-4">
        
        <div className="glass-card rounded-3xl p-5 space-y-3 bg-slate-50/30 dark:bg-slate-900/20 border border-slate-200/10">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-white/5 pb-1.5">
            <Building2 size={14} className="text-blue-500" />
            <span>Company Specifications</span>
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <DetailRow label="GST Registration" value={u.gstNumber} />
            <DetailRow label="Travel License" value={u.licenseNumber} />
            <DetailRow label="PAN Number" value={u.panNumber} />
            <DetailRow label="Website" value={u.website} />
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 space-y-3 bg-slate-50/30 dark:bg-slate-900/20 border border-slate-200/10">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-white/5 pb-1.5">
            <Users size={14} className="text-blue-500" />
            <span>Contact Records</span>
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <DetailRow label="Representative" value={u.ownerName || u.name} />
            <DetailRow label="Email Address" value={u.email} />
            <DetailRow label="Phone Contact" value={u.phone} />
            <DetailRow label="Company Address" value={u.companyAddress} full />
          </div>
        </div>

      </div>

      {/* Uploaded Documents */}
      <div className="glass-card rounded-3xl p-6 bg-slate-50/30 dark:bg-slate-900/20 border border-slate-200/10">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-4 border-b border-slate-100 dark:border-white/5 pb-1.5">
          <FileCheck size={14} className="text-blue-500" />
          <span>Uploaded Compliance Certificates</span>
        </h4>
        
        {Object.keys(docs).length === 0 ? (
          <p className="text-xs text-slate-400 italic">No document archives found uploaded for this partner.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DOCS_META.map(d => {
              const file = docs[d.key];
              if (!file) return null;
              const isPdf = file.type === 'application/pdf';
              const isImg = file.type?.startsWith('image/');
              return (
                <div key={d.key} className="overflow-hidden rounded-2xl border border-slate-200/40 dark:border-white/5 bg-white dark:bg-[#0F172A]">
                  {isImg && (
                    <div className="h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img src={file.data} alt={d.label} className="h-full w-full object-cover" />
                    </div>
                  )}
                  {isPdf && (
                    <div className="flex h-32 items-center justify-center bg-rose-500/5">
                      <FileText size={32} className="text-rose-450" />
                    </div>
                  )}
                  <div className="p-3 flex justify-between items-center text-[10px]">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{d.label}</p>
                      <p className="text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        type="button" 
                        onClick={() => onViewDoc?.(file, d.label)}
                        className="flex h-7 px-2.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white items-center justify-center gap-1 font-bold transition"
                      >
                        <Eye size={11} />
                        <span>View</span>
                      </button>
                      <a href={file.data} download={file.name} className="flex h-7 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 items-center justify-center gap-1 font-bold text-slate-655 dark:text-slate-205">
                        <Download size={11} />
                        <span>Get</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action triggers */}
      <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex gap-3">
        {u.packagerStatus === 'pending' && (
          <>
            <button onClick={onApprove} className="btn-premium px-6 py-3.5 text-xs font-bold rounded-2xl flex-grow shadow-lg shadow-blue-500/10">Approve Application</button>
            <button onClick={onReject} className="bg-rose-550 hover:bg-rose-650 px-6 py-3.5 text-xs font-bold text-white transition rounded-2xl flex-grow">Reject Application</button>
          </>
        )}
        {u.packagerStatus === 'approved' && (
          <button onClick={onUnapprove} className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/25 py-3.5 text-xs font-bold transition rounded-2xl hover:bg-rose-500 hover:text-white">Revoke Approved Status</button>
        )}
        {u.packagerStatus === 'rejected' && (
          <button onClick={onUnapprove} className="w-full bg-blue-500/10 text-blue-500 border border-blue-500/25 py-3.5 text-xs font-bold transition rounded-2xl hover:bg-blue-500 hover:text-white">Reopen Application</button>
        )}
      </div>

    </motion.div>
  );
}

/* ── Complaint Detail Panel ── */
function ComplaintDetail({ complaint, onUpdateStatus }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Incident Ticket</span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 font-display">{complaint.subject}</h3>
        </div>
        <span className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-[9px] font-black text-rose-500 uppercase">{complaint.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <DetailRow label="Related Package" value={complaint.packageTitle} />
        <DetailRow label="Traveler Name" value={complaint.userName} />
        <DetailRow label="Email Address" value={complaint.userEmail} />
        <DetailRow label="Created Timestamp" value={new Date(complaint.createdAt).toLocaleString()} />
      </div>

      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 text-xs text-slate-655 dark:text-slate-350 leading-relaxed border border-slate-200/10">
        {complaint.message}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex gap-3">
        <button onClick={() => onUpdateStatus?.(complaint.id, 'REVIEWED')} className="btn-premium px-5 py-3.5 text-xs font-bold rounded-xl flex-1 shadow-md shadow-blue-500/5">Mark Reviewed</button>
        <button onClick={() => onUpdateStatus?.(complaint.id, 'RESOLVED')} className="btn-premium-teal px-5 py-3.5 text-xs font-bold rounded-xl flex-1 shadow-md shadow-teal-500/5">Mark Resolved</button>
      </div>
    </motion.div>
  );
}

/* ── Feedback Detail Panel ── */
function FeedbackDetail({ feedback }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Guest Review Log</span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 font-display">{feedback.packageTitle}</h3>
        </div>
        <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[9px] font-black text-indigo-500 uppercase">{feedback.rating} ★ Rating</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <DetailRow label="Traveler Name" value={feedback.userName} />
        <DetailRow label="Email Address" value={feedback.userEmail} />
        <DetailRow label="Date Submitted" value={new Date(feedback.createdAt).toLocaleString()} />
      </div>

      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 text-xs text-slate-650 dark:text-slate-350 leading-relaxed border border-slate-200/10">
        {feedback.comment || 'No comment text was supplied.'}
      </div>
    </motion.div>
  );
}


function TravelerDetail({ user }) {
  const u = user;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!u.id) return;
    setLoading(true);
    api.get(`/bookings/user/${u.id}`)
      .then(res => setBookings(res.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [u.id]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header Profile */}
      <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-xl font-black text-white">
            {u.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none font-display">{u.name}</h3>
            <span className="mt-2 inline-block rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider">
              {u.level || 'Bronze Explorer'}
            </span>
          </div>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="glass-card rounded-3xl p-5 space-y-3 bg-slate-50/30 dark:bg-slate-900/20 border border-slate-200/10">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-white/5 pb-1.5">
          <Users size={14} className="text-blue-500" />
          <span>Membership Identity</span>
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <DetailRow label="Traveler ID" value={`#${u.id}`} />
          <DetailRow label="Travel Loyalty Points" value={`${u.travelPoints || 0} Points`} />
          <DetailRow label="Registered Email" value={u.email} />
          <DetailRow label="Explorer Rank Class" value={u.level || 'Bronze Explorer'} />
        </div>
      </div>

      {/* Booking History logs list */}
      <div className="glass-card rounded-3xl p-5 space-y-3 bg-slate-50/30 dark:bg-slate-900/20 border border-slate-200/10">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-white/5 pb-1.5">
          <Briefcase size={14} className="text-blue-500" />
          <span>Completed & Upcoming Bookings</span>
        </h4>
        
        {loading ? (
          <div className="space-y-2 py-2">
            {[...Array(2)].map((_, i) => <div key={i} className="h-10 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No bookings registered for this traveler account.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="p-3 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/10 text-[10px] space-y-1.5 shadow-sm">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 leading-none">
                  <span>Package ID #{b.packageId}</span>
                  <span className="text-blue-505 font-black">₹{b.total?.toLocaleString() || 'Pending payment'}</span>
                </div>
                <div className="flex justify-between text-slate-450 leading-none">
                  <span>Travel Date: {b.travelDate}</span>
                  <span>Guests: {b.guests || 1}</span>
                </div>
                {b.bookingStatus && (
                  <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 leading-none pt-1 border-t border-slate-100 dark:border-white/5">
                    <span>Status:</span>
                    <span>{b.bookingStatus}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
}

const DOCS_META = [
  { key: 'regCert',       label: 'Business Registration Certificate' },
  { key: 'gstCert',       label: 'GST Certificate' },
  { key: 'travelLicense', label: 'Travel License' },
  { key: 'idProof',       label: 'Owner ID Proof' },
  { key: 'companyLogo',   label: 'Company Logo' },
];

function DetailRow({ label, value, icon, full = false }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block">{label}</span>
      <div className="mt-1.5 flex items-center gap-1.5">
        {icon && <span className="text-blue-500">{icon}</span>}
        <span className="text-[14px] font-normal text-slate-800 dark:text-slate-200 block truncate">{value || 'Not supplied'}</span>
      </div>
    </div>
  );
}
