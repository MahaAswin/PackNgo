import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, LogOut, ShieldCheck,
  Eye, Building2, Phone, Globe, MapPin, FileText, Image,
  CheckCircle2, XCircle, Search, Mail, Calendar, Download, Package, Star,
  MessageCircle, AlertTriangle
} from 'lucide-react';
import api from '../lib/axios';
import { apiDeletePackage, apiUpdatePackage } from '../api/api';
import { getAllPackagerRegistrations } from '../store/packagerStore';

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const [tab, setTab]                     = useState('pending');
  const [allUsers, setAllUsers]           = useState([]);
  const [packages, setPackages]           = useState([]);
  const [complaints, setComplaints]       = useState([]);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [selected, setSelected]           = useState(null);
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
    <div className="flex min-h-screen bg-slate-50 font-sans dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LayoutDashboard size={16} />
          </div>
          <span className="font-black text-slate-900 dark:text-white">Admin Portal</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {[
            { key: 'pending',    label: `Pending (${pending.length})`,   icon: <ShieldCheck size={17} /> },
            { key: 'approved',   label: `Approved (${approved.length})`,  icon: <CheckCircle2 size={17} /> },
            { key: 'travelers',  label: `Travelers (${travelers.length})`, icon: <Users size={17} /> },
            { key: 'feedback',   label: `Feedback (${feedbackItems.length})`, icon: <MessageCircle size={17} /> },
            { key: 'complaints', label: `Complaints (${complaints.length})`, icon: <AlertTriangle size={17} /> },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSelected(null); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition
                ${tab === t.key ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-950">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {tab === 'pending' ? 'Pending Partner Applications'
              : tab === 'approved' ? 'Approved Partners'
              : tab === 'travelers' ? 'Travelers'
              : tab === 'feedback' ? 'Customer Feedback'
              : 'Customer Complaints'}
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="input w-52 py-2 pl-9 text-sm" />
          </div>
        </header>

        <div className="border-b border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Package Catalog</p>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Manage live listings</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input value={packageSearch} onChange={e => setPackageSearch(e.target.value)} placeholder="Search packages" className="input w-full sm:w-80" />
              <div className="flex flex-wrap gap-2">
                {['ALL','ACTIVE','FEATURED','VERIFIED','TRENDING'].map(option => (
                  <button key={option} type="button" onClick={() => setPackageFilter(option)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${packageFilter === option ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {packageList.slice(0, 3).map(pkg => (
              <div key={pkg.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{pkg.status || 'ACTIVE'}</p>
                    <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">{pkg.title}</h3>
                  </div>
                  {pkg.verified && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Verified</span>}
                </div>
                <p className="text-sm text-slate-500">{pkg.location}</p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{pkg.vendorName}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-black text-blue-600">₹{pkg.price?.toLocaleString()}</span>
                  <span className="text-slate-500">{pkg.durationDays}D/{pkg.durationNights}N</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => handlePackageFeature(pkg)} type="button" className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white hover:bg-slate-800">
                    {pkg.status === 'FEATURED' ? 'Unfeature' : 'Feature'}
                  </button>
                  <button onClick={() => handlePackageVerified(pkg)} type="button" className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-200">
                    {pkg.verified ? 'Unverify' : 'Verify'}
                  </button>
                  <button onClick={() => handlePackageDelete(pkg.id)} type="button" className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-200">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* List */}
          <div className="w-80 shrink-0 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            {loading ? (
              <div className="space-y-3 p-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}
              </div>
            ) : listToShow().length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No records found.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {listToShow().map(item => {
                  if (tab === 'complaints') {
                    return (
                      <button type="button" key={item.id} onClick={() => setSelected(item)}
                        className={`flex w-full flex-col gap-2 px-4 py-3.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selected?.id === item.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.packageTitle}</p>
                            <p className="truncate text-xs text-slate-500">{item.subject}</p>
                          </div>
                          <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700">{item.status}</span>
                        </div>
                        <p className="truncate text-xs text-slate-500">{item.userName || item.userEmail}</p>
                      </button>
                    );
                  }

                  if (tab === 'feedback') {
                    return (
                      <button type="button" key={item.id} onClick={() => setSelected(item)}
                        className={`flex w-full flex-col gap-2 px-4 py-3.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selected?.id === item.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.packageTitle}</p>
                            <p className="truncate text-xs text-slate-500">{item.comment}</p>
                          </div>
                          <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-700">{item.rating} ★</span>
                        </div>
                        <p className="truncate text-xs text-slate-500">{item.userName || item.userEmail}</p>
                      </button>
                    );
                  }

                  const reg = getLocalReg(item);
                  const docCount = reg ? Object.keys(reg.documents || {}).length : 0;
                  return (
                    <button key={item.id} onClick={() => setSelected({ user: item, reg })}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50
                        ${selected?.user?.id === item.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg font-black text-indigo-600 dark:bg-indigo-950/40">
                        {(item.companyName || item.name)?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.companyName || item.name}</p>
                        <p className="truncate text-xs text-slate-500">{item.email}</p>
                        {docCount > 0 && <p className="text-[10px] font-semibold text-indigo-500">{docCount} doc{docCount > 1 ? 's' : ''} uploaded</p>}
                      </div>
                      <Eye size={15} className="shrink-0 text-slate-300" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {[
                { label: 'Packages', value: totalPackages, icon: <Package size={16} className="text-blue-600" /> },
                { label: 'Featured', value: featuredPackages, icon: <Star size={16} className="text-amber-500" /> },
                { label: 'Verified', value: verifiedPackages, icon: <ShieldCheck size={16} className="text-emerald-500" /> },
                { label: 'Travelers', value: travelers.length, icon: <Users size={16} className="text-slate-600" /> },
                { label: 'Complaints', value: complaints.length, icon: <AlertTriangle size={16} className="text-rose-500" /> },
              ].map(item => (
                <div key={item.label} className="card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                    {item.icon}
                  </div>
                  <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {!selected ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Eye className="text-slate-300" size={36} />
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">Select an entry</p>
                <p className="mt-1 text-sm text-slate-400">Click any item on the left to view details.</p>
              </div>
            ) : tab === 'complaints' ? (
              <ComplaintDetail complaint={selected} onUpdateStatus={handleUpdateComplaintStatus} />
            ) : tab === 'feedback' ? (
              <FeedbackDetail feedback={selected} />
            ) : (
              <PackagerDetail
                user={selected.user}
                reg={selected.reg}
                onApprove={() => handleApprove(selected.user.id)}
                onReject={() => handleReject(selected.user.id)}
                onUnapprove={() => handleUnapprove(selected.user.id)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Packager Detail Panel ── */
function PackagerDetail({ user, reg, onApprove, onReject, onUnapprove }) {
  const u   = user;
  const r   = reg;
  const docs = r?.documents || {};

  const statusColor = u.packagerStatus === 'approved'
    ? 'bg-emerald-100 text-emerald-700'
    : u.packagerStatus === 'rejected'
    ? 'bg-rose-100 text-rose-700'
    : 'bg-amber-100 text-amber-700';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white">
            {(u.companyName || u.name)?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{u.companyName || u.name}</h2>
            <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusColor}`}>
              {u.packagerStatus || 'pending'}
            </span>
          </div>
        </div>
        {r?.registeredAt && (
          <p className="text-xs text-slate-400">Applied {new Date(r.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        )}
      </div>

      {/* Company Details */}
      <DetailCard title="Company Details" icon={<Building2 size={16} className="text-indigo-500" />}>
        <div className="grid grid-cols-2 gap-4">
          <DetailRow label="Company Name"  value={u.companyName} />
          <DetailRow label="Owner Name"    value={u.ownerName || u.name} />
          <DetailRow label="Email"         value={u.email} icon={<Mail size={13} />} />
          <DetailRow label="Phone Number"  value={u.phone} icon={<Phone size={13} />} />
          <DetailRow label="Office Address" value={u.companyAddress} icon={<MapPin size={13} />} full />
          <DetailRow label="Website"       value={u.website} icon={<Globe size={13} />} />
        </div>
      </DetailCard>

      {/* Verification Details */}
      <DetailCard title="Verification Details" icon={<ShieldCheck size={16} className="text-indigo-500" />}>
        <div className="grid grid-cols-3 gap-4">
          <DetailRow label="GST Number"     value={u.gstNumber} />
          <DetailRow label="License Number" value={u.licenseNumber} />
          <DetailRow label="PAN Number"     value={u.panNumber} />
        </div>
      </DetailCard>

      {/* Uploaded Documents */}
      <DetailCard title="Uploaded Documents" icon={<FileText size={16} className="text-indigo-500" />}>
        {Object.keys(docs).length === 0 ? (
          <p className="text-sm text-slate-400 italic">No documents uploaded.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DOCS_META.map(d => {
              const file = docs[d.key];
              if (!file) return null;
              const isPdf = file.type === 'application/pdf';
              const isImg = file.type?.startsWith('image/');
              return (
                <div key={d.key} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                  {/* Preview */}
                  {isImg && (
                    <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img src={file.data} alt={d.label} className="h-full w-full object-cover" />
                    </div>
                  )}
                  {isPdf && (
                    <div className="flex h-40 items-center justify-center bg-rose-50 dark:bg-rose-950/20">
                      <div className="text-center">
                        <FileText size={40} className="mx-auto mb-2 text-rose-400" />
                        <p className="text-xs font-bold text-rose-600">PDF Document</p>
                      </div>
                    </div>
                  )}
                  {/* Footer */}
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{d.label}</p>
                      <p className="text-[10px] text-slate-400">{file.name} • {(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <a href={file.data} download={file.name}
                      className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300">
                      <Download size={11} /> Save
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DetailCard>

      {/* Actions */}
      {u.packagerStatus === 'pending' && (
        <div className="flex gap-4">
          <button type="button" onClick={onApprove}
            className="flex-1 rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700">
            ✓ Approve Partner
          </button>
          <button type="button" onClick={onReject}
            className="flex-1 rounded-2xl border-2 border-slate-200 bg-white py-3.5 text-sm font-black text-rose-600 transition hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900">
            ✕ Reject Application
          </button>
        </div>
      )}
      {u.packagerStatus === 'approved' && onUnapprove && (
        <button type="button" onClick={onUnapprove}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-black text-rose-600 transition hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900">
          Cancel Approval
        </button>
      )}
      {u.packagerStatus === 'rejected' && onUnapprove && (
        <button type="button" onClick={onUnapprove}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-black text-blue-600 transition hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900">
          Reopen Application
        </button>
      )}
    </div>
  );
}

function ComplaintDetail({ complaint, onUpdateStatus }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Complaint</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{complaint.subject}</h2>
          </div>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {complaint.status}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Package" value={complaint.packageTitle} />
          <DetailRow label="Traveler" value={complaint.userName} />
          <DetailRow label="Email" value={complaint.userEmail} />
          <DetailRow label="Submitted" value={new Date(complaint.createdAt).toLocaleString()} />
        </div>
        <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950/50 dark:text-slate-300">
          {complaint.message}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => onUpdateStatus?.(complaint.id, 'REVIEWED')}
            className="rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white hover:bg-blue-700">
            Mark Reviewed
          </button>
          <button type="button" onClick={() => onUpdateStatus?.(complaint.id, 'RESOLVED')}
            className="rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white hover:bg-emerald-700">
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedbackDetail({ feedback }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Feedback</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{feedback.packageTitle}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Traveler" value={feedback.userName} />
          <DetailRow label="Email" value={feedback.userEmail} />
          <DetailRow label="Rating" value={`${feedback.rating} ★`} />
          <DetailRow label="Submitted" value={new Date(feedback.createdAt).toLocaleString()} />
        </div>
        <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950/50 dark:text-slate-300">
          {feedback.comment || 'No comment provided.'}
        </div>
      </div>
    </div>
  );
}

const DOCS_META = [
  { key: 'regCert',       label: 'Business Registration Certificate' },
  { key: 'gstCert',       label: 'GST Certificate' },
  { key: 'travelLicense', label: 'Travel License' },
  { key: 'idProof',       label: 'Owner ID Proof' },
  { key: 'companyLogo',   label: 'Company Logo' },
];

function DetailCard({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800 dark:text-white">{icon} {title}</h3>
      {children}
    </div>
  );
}

function DetailRow({ label, value, icon, full = false }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-0.5 flex items-center gap-1.5">
        {icon && <span className="text-blue-500">{icon}</span>}
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value || <span className="italic text-slate-400">Not provided</span>}</p>
      </div>
    </div>
  );
}


