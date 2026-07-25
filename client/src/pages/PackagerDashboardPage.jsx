import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, MapPin, BarChart3, DollarSign, Star, TrendingUp, 
  AlertCircle, ShieldCheck, MessageCircle, Lock, ShieldAlert, 
  Clock, FileText, CheckCircle2, ChevronRight, UploadCloud, Mail, Phone
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { apiGetPackages, apiDeletePackage } from '../api/api';
import api from '../lib/axios';

export default function PackagerDashboardPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard Core States
  const [packages, setPackages] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Verification States
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [reapplying, setReapplying] = useState(false);
  
  // Re-application form states
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [ownerName, setOwnerName] = useState(user?.ownerName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [companyAddress, setCompanyAddress] = useState(user?.companyAddress || '');
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || '');
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || '');
  const [panNumber, setPanNumber] = useState(user?.panNumber || '');
  const [reapplyError, setReapplyError] = useState('');

  // Sync user details on load
  useEffect(() => {
    if (user) {
      setCompanyName(user.companyName || '');
      setOwnerName(user.ownerName || '');
      setPhone(user.phone || '');
      setWebsite(user.website || '');
      setCompanyAddress(user.companyAddress || '');
      setGstNumber(user.gstNumber || '');
      setLicenseNumber(user.licenseNumber || '');
      setPanNumber(user.panNumber || '');
    }
  }, [user]);

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
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingFeedback(true);
    api.get(`/feedback/packager/${user.id}`)
      .then(res => setFeedbackList(res.data || []))
      .catch(() => setFeedbackList([]))
      .finally(() => setLoadingFeedback(false));
  }, [user?.id]);

  const handleDelete = async (id) => {
    // Safety check: block deletions if not approved
    if (!isApproved) {
      alert('Your company account is pending administrator approval.');
      return;
    }
    if (!confirm('Delete this package?')) return;
    try {
      await apiDeletePackage(id);
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete request failed.');
    }
  };

  const isApproved = user?.packagerStatus?.toLowerCase() === 'approved';
  const isPending = user?.packagerStatus?.toLowerCase() === 'pending' || !user?.packagerStatus;
  const isRejected = user?.packagerStatus?.toLowerCase() === 'rejected';

  const stats = [
    { label: 'Active Packages', value: isApproved ? mine.length : 0, icon: <BarChart3 size={20} className="text-orange-500" /> },
    { label: 'Total Bookings', value: isApproved ? (user?.totalBookings || 0) : 0, icon: <TrendingUp size={20} className="text-blue-500" /> },
    { label: 'Reviews', value: isApproved ? feedbackList.length : 0, icon: <MessageCircle size={20} className="text-indigo-500" /> },
    { label: 'Rating', value: isApproved ? (user?.ratings || '5.0') : '5.0', icon: <Star size={20} className="text-yellow-500" /> },
  ];

  const handleReapply = async (e) => {
    e.preventDefault();
    if (!companyName || !gstNumber || !licenseNumber) {
      setReapplyError('Company name, GST, and license number are required for verification.');
      return;
    }
    setReapplying(true);
    setReapplyError('');
    try {
      await api.patch(`/users/${user.id}`, {
        companyName,
        ownerName,
        phone,
        website,
        companyAddress,
        gstNumber,
        licenseNumber,
        panNumber,
        packagerStatus: 'pending' // Set back to pending
      });
      await refreshUser();
      alert('Your verification details have been updated. Re-application submitted successfully!');
    } catch (err) {
      console.error(err);
      setReapplyError('Failed to submit application. Please verify parameters.');
    } finally {
      setReapplying(false);
    }
  };

  const handleNewPackageClick = (e) => {
    if (!isApproved) {
      e.preventDefault();
      setShowPendingModal(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#080B11]">
      <Sidebar isPackager />
      
      <div className="flex flex-1 flex-col">
        
        {/* Header navigation bar */}
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/50 bg-white/80 px-8 dark:border-white/5 dark:bg-[#0F172A]/80 backdrop-blur">
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-[-0.02em] leading-[1.2]">Partner Dashboard</h1>
          
          <button 
            onClick={handleNewPackageClick}
            className={`btn-premium py-2.5 px-4 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition ${
              !isApproved ? 'opacity-75 cursor-pointer shadow-none' : ''
            }`}
          >
            {!isApproved && <Lock size={12} className="text-slate-300" />}
            <span>New Package</span>
          </button>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mx-auto max-w-6xl space-y-8">
            
            {/* Status Indicator Banners */}
            {isPending && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-200/50 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-200 dark:border-amber-950/20">
                <AlertCircle size={18} className="shrink-0 text-amber-500" />
                <p className="text-xs font-semibold">Your vendor account is currently pending administrator approval. Listings creation and bookings are temporarily locked.</p>
              </div>
            )}

            {isRejected && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-200/50 bg-rose-500/10 p-4 text-rose-800 dark:text-rose-200 dark:border-rose-950/20">
                <ShieldAlert size={18} className="shrink-0 text-rose-500 animate-pulse" />
                <div>
                  <h4 className="font-bold text-xs">Verification Failed</h4>
                  <p className="text-[10px] mt-0.5 leading-relaxed font-semibold">The license registry check failed. Please submit a valid tourism certificate and reapply below.</p>
                </div>
              </div>
            )}

            {/* Dashboard Header Info */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-[-0.02em] leading-[1.2]">Partner Console</h2>
                <p className="text-[13px] text-slate-505 dark:text-slate-455 mt-1">Manage vacation experiences, travel statistics, and review logs.</p>
              </div>
            </div>

            {/* PENDING: Replace package stats with Verification Progress Card */}
            {isPending && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Panel: Progress Tracker details */}
                <div className="lg:col-span-2 glass-card rounded-4xl p-6 sm:p-8 space-y-6 shadow-xl bg-white dark:bg-[#0F172A] border border-slate-200/20 dark:border-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[13px] font-medium text-blue-500 leading-none">KYC Compliance Status</span>
                      <h3 className="text-[20px] font-semibold text-slate-800 dark:text-slate-200 mt-1">Verification Progress</h3>
                    </div>
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[12px] font-semibold px-3.5 py-1">Pending Approval</span>
                  </div>

                  {/* Progress Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Verification Steps Timeline</h4>
                    <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-3 space-y-5">
                      {[
                        { title: 'Agency Profile Registration', desc: 'Vendor records submitted on register.', done: true },
                        { title: 'Tax & License Uploads', desc: 'GSTIN, PAN and tourism license validation.', done: true },
                        { title: 'Admin Manual Review', desc: 'Our team is validating details against registry registries.', done: false, active: true },
                        { title: 'Console Access Unlocked', desc: 'Publish and receive travel bookings.', done: false }
                      ].map((step, idx) => (
                        <div key={idx} className="relative">
                          <span className={`absolute -left-[37px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-white shadow ${
                            step.done 
                              ? 'bg-emerald-500' 
                              : step.active 
                              ? 'bg-amber-500 animate-pulse' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {step.done ? <CheckCircle2 size={13} /> : idx + 1}
                          </span>
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{step.title}</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Checklist & Review details */}
                <div className="glass-card rounded-4xl p-6 shadow-xl flex flex-col justify-between bg-white dark:bg-[#0F172A] border border-slate-200/20 dark:border-white/5 space-y-6">
                  <div className="space-y-5">
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-white/5 pb-2">Verification Checklist</h4>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'GSTIN Compliance Status', ok: true },
                        { label: 'Tourism License Registry check', ok: false, pending: true },
                        { label: 'Owner Identity (PAN) Verify', ok: true }
                      ].map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/20 border border-slate-200/10">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-350">{c.label}</span>
                          <span className={`text-[10px] font-bold ${
                            c.ok ? 'text-emerald-500' : c.pending ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {c.ok ? 'Verified' : c.pending ? 'Under Review' : 'Missing'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5 text-[10px] text-slate-500 font-semibold leading-relaxed">
                      <p className="flex justify-between"><span>Submitted Date:</span><span className="text-slate-800 dark:text-slate-200">July 25, 2026</span></p>
                      <p className="flex justify-between"><span>Estimated Review Time:</span><span className="text-slate-800 dark:text-slate-200">24 - 48 Hours</span></p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-white/5">
                    <button type="button" onClick={() => alert('Loading submitted certificates details...')} className="btn-premium-secondary w-full py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1">
                      <FileText size={12} />
                      <span>View Uploaded Docs</span>
                    </button>
                    <a href="mailto:support@packngo.com" className="btn-premium w-full py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm">
                      <Mail size={12} />
                      <span>Contact Partner Support</span>
                    </a>
                  </div>
                </div>

              </div>
            )}

            {/* REJECTED: Render Failed verification and Company details update form */}
            {isRejected && (
              <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-xl bg-white dark:bg-[#0F172A] border border-rose-500/20 space-y-6">
                <div>
                  <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider">Verification Audit Failed</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 font-display">Update Company Verification Details</h3>
                  <p className="text-xs text-slate-500 mt-1">Please review details, upload necessary compliance certificates and reapply.</p>
                </div>

                <form onSubmit={handleReapply} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Company / Agency Name</label>
                      <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input rounded-xl px-4 py-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Owner / Director Name</label>
                      <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="input rounded-xl px-4 py-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">GST Registration (GSTIN)</label>
                      <input type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="27AAAAA1111A1Z1" className="input rounded-xl px-4 py-2.5 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Tourism License Number</label>
                      <input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="LIC-TA-2026-XXXX" className="input rounded-xl px-4 py-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">PAN Registration Card</label>
                      <input type="text" value={panNumber} onChange={e => setPanNumber(e.target.value)} placeholder="ABCDE1234F" className="input rounded-xl px-4 py-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Website Domain (Optional)</label>
                      <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.myagency.com" className="input rounded-xl px-4 py-2.5 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Contact Phone Number</label>
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="input rounded-xl px-4 py-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Registered Office Address</label>
                      <input type="text" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="input rounded-xl px-4 py-2.5 text-xs" />
                    </div>
                  </div>

                  {/* Document Uploader Mock */}
                  <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-5 text-center bg-slate-50/50 dark:bg-slate-900/10">
                    <UploadCloud className="mx-auto mb-2 text-slate-400" size={24} />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 block">Upload Certified Tourism License Scan</span>
                    <button type="button" onClick={() => alert('Selecting document PDF scan...')} className="mt-2 btn-premium-secondary px-4 py-1.5 rounded-lg text-[9px] font-bold">Select File</button>
                  </div>

                  {reapplyError && (
                    <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs text-rose-600 border border-rose-100 dark:border-rose-950/40">
                      <AlertCircle size={15} />
                      <span>{reapplyError}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={reapplying}
                    className="btn-premium px-6 py-3.5 rounded-2xl text-xs font-bold w-full sm:w-auto"
                  >
                    {reapplying ? 'Updating application records...' : 'Update & Reapply Verification'}
                  </button>
                </form>
              </div>
            )}

            {/* APPROVED: Standard Package stats & Lists */}
            {isApproved && (
              <>
                {/* Stats Counters Grid */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {stats.map(s => (
                    <div key={s.label} className="glass-card rounded-3xl p-5 shadow-xl bg-white dark:bg-[#0F172A] border border-slate-200/10 hover:shadow-2xl transition">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">{s.icon}</div>
                      </div>
                      <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-350 leading-none">{s.label}</p>
                      <p className="mt-2 text-[32px] font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Search / Filters block */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-[#0F172A] border border-slate-200/50 dark:border-white/5 rounded-3xl p-4 shadow-sm">
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search packages by title or location"
                    className="input w-full sm:w-72 rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                    {['ALL', 'ACTIVE', 'FEATURED', 'DRAFT'].map(option => (
                      <button key={option} type="button" onClick={() => setStatusFilter(option)}
                        className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase transition ${statusFilter === option ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* My Packages List Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[20px] font-semibold text-slate-800 dark:text-slate-200">Active Packages</h3>
                    <span className="text-[12px] font-medium text-blue-500">{visiblePackages.length} listings</span>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />)}
                    </div>
                  ) : mine.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center border-dashed border-2 py-20 text-center rounded-4xl bg-white/50 dark:bg-[#0F172A]/50">
                      <Plus className="mb-4 text-slate-350" size={48} />
                      <p className="text-slate-550 dark:text-slate-400 font-bold">No travel packages configured. Publish your first experience catalog!</p>
                      <button onClick={() => navigate('/packager/new')} className="btn-premium mt-6 px-6 py-3 rounded-2xl text-xs font-bold">Create Package</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {visiblePackages.map((pkg, i) => (
                        <motion.div key={pkg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="glass-card overflow-hidden shadow-lg border border-slate-200/50 dark:border-white/5 rounded-3xl bg-white dark:bg-[#0F172A] hover:-translate-y-1 transition duration-300">
                          <div className="relative h-44 bg-slate-100 dark:bg-slate-800">
                            {pkg.images?.[0] && <img src={pkg.images[0]} className="h-full w-full object-cover" alt="" />}
                            <span className={`absolute right-3.5 top-3.5 rounded-xl px-2.5 py-1 text-[9px] font-black tracking-wider uppercase ${
                              pkg.status === 'ACTIVE' 
                                ? 'bg-emerald-500 text-white' 
                                : pkg.status === 'FEATURED' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-500 text-white'
                            }`}>{pkg.status}</span>
                          </div>
                          
                          <div className="p-5 space-y-4">
                            <div className="space-y-1">
                              <h3 className="font-bold text-slate-900 dark:text-white font-display line-clamp-1 leading-tight">{pkg.title}</h3>
                              <p className="flex items-center gap-1 text-[10px] text-slate-555 font-bold"><MapPin size={11} className="text-blue-500" />{pkg.location}</p>
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 border-t border-slate-100 dark:border-white/5 pt-3">
                              <span>{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{pkg.rating?.toFixed(1) || '4.8'} ★</span>
                            </div>
                            
                            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                              <span className="font-black text-base text-blue-600 dark:text-blue-400">₹{pkg.price?.toLocaleString()}</span>
                              <div className="flex gap-2">
                                <Link to={`/package/${pkg.id}`} className="rounded-xl border border-slate-200/60 dark:border-white/5 px-3 py-2 text-[10px] font-bold hover:bg-slate-50 text-slate-800 dark:text-slate-300">View</Link>
                                <button onClick={() => handleDelete(pkg.id)} className="rounded-xl border border-rose-100 p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={13} /></button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customer Reviews Section */}
                <div className="rounded-4xl border border-slate-200/50 bg-white p-6 dark:border-white/5 dark:bg-[#0F172A] shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                    <div>
                      <h2 className="text-[20px] font-semibold text-slate-800 dark:text-slate-200">Recent Customer Feedback</h2>
                      <p className="text-[13px] text-slate-505 mt-1">Feedback left by travelers for your packages.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[12px] font-semibold text-slate-600 dark:text-slate-300">{feedbackList.length} reviews</span>
                  </div>

                  {loadingFeedback ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, idx) => <div key={idx} className="h-20 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />)}
                    </div>
                  ) : feedbackList.length === 0 ? (
                    <p className="text-xs text-slate-500 font-semibold">No feedback yet. Once customers leave a review, it appears here.</p>
                  ) : (
                    <div className="space-y-4">
                      {feedbackList.map(item => (
                        <div key={item.id} className="rounded-3xl border border-slate-200/40 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-slate-950/40 space-y-2">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between leading-none">
                            <div>
                              <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{item.packageTitle}</h3>
                              <p className="text-[9px] text-slate-450 font-bold mt-1">{item.userName || item.userEmail}</p>
                            </div>
                            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[9px] font-black text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">{item.rating || 'No rating'} ★</span>
                          </div>
                          <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-medium pt-2 border-t border-slate-200/30 dark:border-white/5">{item.comment || 'No comment provided.'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </main>
      </div>

      {/* PENDING: Premium Verification Modal Popup */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-4xl bg-white dark:bg-[#0F172A] border border-slate-250/20 dark:border-white/5 p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6 text-center"
            >
              
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mx-auto">
                <Lock size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider">Access Restrained</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">Account Pending Verification</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-medium">
                  Your account is currently pending administrator approval. Package creation will be unlocked after your travel agency verification has been completed.
                </p>
              </div>

              {/* Status details metadata card */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-4 text-left text-[11px] space-y-2 border border-slate-200/50 dark:border-white/5">
                <div className="flex justify-between"><span className="text-slate-500">Status Badge:</span><span className="font-bold text-amber-500 uppercase">Pending Review</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Est. Review Time:</span><span className="font-bold text-slate-800 dark:text-slate-200">24-48 Hours</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Submitted Date:</span><span className="font-bold text-slate-800 dark:text-slate-200">July 25, 2026</span></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowPendingModal(false); alert('Reviewing uploaded document scans...'); }}
                  className="flex-1 btn-premium-secondary py-3 rounded-2xl text-xs font-bold"
                >
                  View Submitted Docs
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowPendingModal(false)}
                  className="flex-1 btn-premium py-3 rounded-2xl text-xs font-bold shadow-md"
                >
                  Acknowledge
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
