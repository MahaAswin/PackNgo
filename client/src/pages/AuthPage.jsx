import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Eye, EyeOff, Building2, ShieldCheck, Upload, 
  UserCircle2, Briefcase, CheckCircle2, X, FileText, Image, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { savePackagerRegistration, linkUserIdToRegistration, fileToBase64 } from '../store/packagerStore';

const DOCS = [
  { key: 'regCert',      label: 'Business Registration Certificate', accept: '.pdf,image/*' },
  { key: 'gstCert',      label: 'GST Certificate',                   accept: '.pdf,image/*' },
  { key: 'travelLicense',label: 'Travel License',                    accept: '.pdf,image/*' },
  { key: 'idProof',      label: 'Owner ID Proof',                    accept: '.pdf,image/*' },
  { key: 'companyLogo',  label: 'Company Logo',                      accept: 'image/*' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode]     = useState('signin');
  const [role, setRole]     = useState('customer');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', gender: 'male',
    companyName: '', ownerName: '', phone: '', website: '',
    companyAddress: '', gstNumber: '', licenseNumber: '', panNumber: '',
  });

  const [docs, setDocs] = useState({});
  const fileRefs = useRef({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isPackager = role === 'packager';

  const handleFileChange = async (key, file) => {
    if (!file) return;
    const b64 = await fileToBase64(file);
    setDocs(d => ({ ...d, [key]: b64 }));
  };

  const removeDoc = (key) => {
    setDocs(d => { const n = { ...d }; delete n[key]; return n; });
    if (fileRefs.current[key]) fileRefs.current[key].value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signin') {
      const res = await login(form.email, form.password);
      setLoading(false);
      if (res.error) { setError(res.error); return; }
      const u = res.user;
      if (u.role === 'ADMIN' || u.role === 'admin') navigate('/admin');
      else if (u.role === 'PACKAGER') navigate('/packager');
      else navigate('/dashboard');
      return;
    }

    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }

    if (isPackager) {
      const required = ['companyName','ownerName','email','phone','companyAddress','gstNumber','licenseNumber','panNumber'];
      for (const k of required) {
        if (!form[k]?.trim()) { setError(`${k.replace(/([A-Z])/g,' $1')} is required.`); setLoading(false); return; }
      }
    }

    const payload = {
      email: form.email.trim(),
      password: form.password,
      name: isPackager ? form.ownerName.trim() : form.name.trim(),
      role: isPackager ? 'PACKAGER' : 'USER',
      ...(isPackager ? {
        companyName:    form.companyName.trim(),
        ownerName:      form.ownerName.trim(),
        phone:          form.phone.trim(),
        website:        form.website.trim(),
        companyAddress: form.companyAddress.trim(),
        gstNumber:      form.gstNumber.trim(),
        licenseNumber:  form.licenseNumber.trim(),
        panNumber:      form.panNumber.trim(),
      } : { gender: form.gender }),
    };

    const res = await register(payload);
    setLoading(false);
    if (res.error) { setError(res.error); return; }

    if (isPackager) {
      const registration = {
        ...payload,
        userId: res.user?.id,
        packagerStatus: 'pending',
        documents: docs,
        registeredAt: new Date().toISOString(),
      };
      savePackagerRegistration(registration);
      if (res.user?.id) linkUserIdToRegistration(payload.email, res.user.id);
    }

    navigate(isPackager ? '/packager' : '/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#080B11] font-sans">
      
      {/* Branding Column (Left) */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-5/12">
        <div className={`absolute inset-0 bg-gradient-to-br ${isPackager ? 'from-indigo-700 via-indigo-600 to-purple-600' : 'from-blue-700 via-blue-600 to-sky-500'}`} />
        <div className="relative z-10 flex h-full flex-col justify-between p-16 text-white">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md"><Compass size={22} className="group-hover:rotate-12 transition-transform" /></div>
            <span className="text-xl font-display font-black tracking-tight">PackNgo</span>
          </Link>
          
          <div>
            <h2 className="text-4xl font-black leading-tight font-display tracking-tight">
              {isPackager ? 'Deliver Incredible Travel Experiences' : 'Redefine Your Travel Booking Journey'}
            </h2>
            <p className="mt-4 text-sm text-blue-100 max-w-sm leading-relaxed">
              {isPackager 
                ? 'Join our premium travel partner program and reach thousands of explorers seeking luxury and customized excursions.' 
                : 'Plan itineraries, coordinate private transportations, and secure booking reservations instantly.'}
            </p>
          </div>
          
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">© 2026 PackNgo Platform Inc.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Compass size={400} />
        </div>
      </div>

      {/* Forms Column (Right) */}
      <div className="flex w-full flex-col items-center justify-center overflow-y-auto px-6 py-12 lg:w-7/12">
        <div className="w-full max-w-xl space-y-8 bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-4xl p-8 shadow-2xl dark:shadow-none">
          
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display text-center">
              {mode === 'signin' ? 'Welcome Back' : 'Create Credentials'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 text-center font-medium">Please enter your workspace access options below.</p>
          </div>

          {/* Mode Pill Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800/40 p-1 rounded-2xl border border-slate-200/20">
            {['signin','register'].map(m => (
              <button 
                key={m} 
                onClick={() => setMode(m)}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${mode === m ? 'bg-white dark:bg-[#0F172A] text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                {m === 'signin' ? 'Sign In' : 'Register Account'}
              </button>
            ))}
          </div>

          {/* Role selector buttons */}
          <div className="flex gap-4">
            {[
              { key: 'customer', label: 'I am a Traveler', icon: <UserCircle2 size={16} /> },
              { key: 'packager', label: 'I am a Tour Partner', icon: <Briefcase size={16} /> },
            ].map(r => (
              <button 
                key={r.key} 
                onClick={() => setRole(r.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-xs font-bold transition-all
                  ${role === r.key
                    ? r.key === 'packager' ? 'border-indigo-650 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-blue-650 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#0F172A]/40 text-slate-650'}`}
              >
                {r.icon} 
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 px-4 py-3.5 text-xs font-bold text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-950/40">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-6"
                >
                  {isPackager ? (
                    <>
                      {/* Company details section */}
                      <Section icon={<Building2 size={16} className="text-indigo-500" />} title="Business Specifications">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Company Legal Name" value={form.companyName} onChange={v => set('companyName', v)} />
                          <Field label="Managing Owner Name" value={form.ownerName} onChange={v => set('ownerName', v)} />
                          <Field label="Corporate Email Address" type="email" value={form.email} onChange={v => set('email', v)} />
                          <Field label="Business Telephone" value={form.phone} onChange={v => set('phone', v)} />
                          <Field label="Office Location Address" value={form.companyAddress} onChange={v => set('companyAddress', v)} />
                          <Field label="Corporate Website URL" value={form.website} onChange={v => set('website', v)} required={false} />
                        </div>
                      </Section>

                      {/* Tax details section */}
                      <Section icon={<ShieldCheck size={16} className="text-indigo-500" />} title="Compliance Credentials">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <Field label="GSTIN Number" value={form.gstNumber} onChange={v => set('gstNumber', v)} />
                          <Field label="Travel License ID" value={form.licenseNumber} onChange={v => set('licenseNumber', v)} />
                          <Field label="Permanent Account Number (PAN)" value={form.panNumber} onChange={v => set('panNumber', v)} />
                        </div>
                      </Section>

                      {/* Document uploads */}
                      <Section icon={<Upload size={16} className="text-indigo-500" />} title="Required Doc Uploads">
                        <p className="mb-3 text-[10px] text-slate-450 leading-relaxed font-semibold">Please upload copies of certificates to fast-track verification status.</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {DOCS.map(doc => (
                            <DocUpload
                              key={doc.key}
                              label={doc.label}
                              accept={doc.accept}
                              file={docs[doc.key]}
                              inputRef={el => fileRefs.current[doc.key] = el}
                              onChange={f => handleFileChange(doc.key, f)}
                              onRemove={() => removeDoc(doc.key)}
                            />
                          ))}
                        </div>
                      </Section>
                    </>
                  ) : (
                    /* Traveler Info fields */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Full Name" value={form.name} onChange={v => set('name', v)} />
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Gender</label>
                        <div className="flex gap-2">
                          {['male','female','other'].map(g => (
                            <button key={g} type="button" onClick={() => set('gender', g)}
                              className={`flex-1 rounded-xl border-2 py-2.5 text-xs font-bold capitalize transition-all
                                ${form.gender === g ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#0F172A]/40 text-slate-650'}`}>
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field */}
            {!(isPackager && mode === 'register') && (
              <Field label="Workspace Email Address" type="email" value={form.email} onChange={v => set('email', v)} />
            )}

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Secure Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} 
                  required
                  value={form.password} 
                  onChange={e => set('password', e.target.value)}
                  className="input pr-12" 
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-premium w-full py-4 text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
              <span>{loading ? 'Securing Access...' : mode === 'signin' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
              <ChevronRight size={14} />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}

/* ── Form Auxiliaries ── */

function Section({ icon, title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white/20 dark:bg-slate-900/10 p-5 space-y-4">
      <h3 className="flex items-center gap-2 font-display font-black text-slate-800 dark:text-white text-xs uppercase tracking-wide border-b border-slate-100 dark:border-white/5 pb-3">
        {icon} 
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, required = true }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>
      <input
        type={type} 
        required={required} 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={label} 
        className="input py-3 text-xs rounded-2xl"
      />
    </div>
  );
}

function DocUpload({ label, accept, file, inputRef, onChange, onRemove }) {
  const isPdf  = file?.type === 'application/pdf';
  const isImg  = file?.type?.startsWith('image/');

  return (
    <div className={`relative rounded-2xl border-2 transition-all ${file ? 'border-indigo-400 bg-indigo-500/5 dark:bg-indigo-950/20' : 'border-dashed border-slate-200 dark:border-white/5 hover:border-indigo-400'}`}>
      {!file ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 p-4 text-center">
          <Upload size={18} className="text-slate-450" />
          <span className="text-[10px] font-bold leading-tight text-slate-650 dark:text-slate-350">{label}</span>
          <span className="text-[9px] text-slate-400 font-semibold">Tap to select archive</span>
          <input
            type="file" 
            accept={accept} 
            className="hidden"
            ref={inputRef}
            onChange={e => onChange(e.target.files?.[0])}
          />
        </label>
      ) : (
        <div className="flex items-center gap-3 p-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isPdf ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {isPdf ? <FileText size={18} /> : <Image size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold text-slate-700 dark:text-slate-200">{file.name}</p>
            <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">{(file.size / 1024).toFixed(1)} KB • {isPdf ? 'PDF' : 'IMG'}</p>
          </div>
          <button type="button" onClick={onRemove} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition">
            <X size={14} />
          </button>
        </div>
      )}
      {file && (
        <div className="absolute right-2.5 top-2.5">
          <CheckCircle2 size={13} className="text-indigo-500 fill-indigo-500/10" />
        </div>
      )}
    </div>
  );
}
