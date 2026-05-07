import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass, Eye, EyeOff, Building2, ShieldCheck, Upload,
  UserCircle2, Briefcase, CheckCircle2, X, FileText, Image
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
    // packager fields
    companyName: '', ownerName: '', phone: '', website: '',
    companyAddress: '', gstNumber: '', licenseNumber: '', panNumber: '',
  });

  // documents: { regCert, gstCert, travelLicense, idProof, companyLogo }
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

    // Register
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }

    if (isPackager) {
      // Validate required packager fields
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

    // Save full registration + documents to dedicated store
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left branding */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-5/12">
        <div className={`absolute inset-0 bg-gradient-to-br ${isPackager ? 'from-indigo-600 to-purple-700' : 'from-blue-600 to-cyan-600'}`} />
        <div className="relative z-10 flex h-full flex-col justify-between p-14 text-white">
          <Link to="/" className="flex items-center gap-3 text-2xl font-black"><Compass size={30} /> PackNgo</Link>
          <div>
            <h2 className="text-4xl font-black leading-tight">
              {isPackager ? 'Partner with the Best' : 'Explore the World'}
            </h2>
            <p className="mt-4 text-white/80">
              {isPackager ? 'Join our marketplace and reach thousands of travelers.' : 'Book premium travel packages from verified partners.'}
            </p>
          </div>
          <p className="text-sm text-white/40">&copy; 2025 PackNgo</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full flex-col items-center justify-start overflow-y-auto px-5 py-10 lg:w-7/12">
        <div className="w-full max-w-2xl">
          <h1 className="mb-6 text-center text-3xl font-black text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>

          {/* Mode tabs */}
          <div className="mb-5 flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            {['signin','register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === m ? 'bg-white shadow dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>
                {m === 'signin' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Role tabs */}
          <div className="mb-6 flex gap-3">
            {[
              { key: 'customer', label: 'Traveler',    icon: <UserCircle2 size={18} /> },
              { key: 'packager', label: 'Trip Partner', icon: <Briefcase size={18} /> },
            ].map(r => (
              <button key={r.key} onClick={() => setRole(r.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-3 text-sm font-bold transition
                  ${role === r.key
                    ? r.key === 'packager' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'}`}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* ── REGISTER FIELDS ── */}
            {mode === 'register' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {isPackager ? (
                  <>
                    {/* ── Company Details ── */}
                    <Section icon={<Building2 size={18} className="text-indigo-500" />} title="Company Details">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Company Name"  value={form.companyName}    onChange={v => set('companyName', v)} />
                        <Field label="Owner Name"    value={form.ownerName}      onChange={v => set('ownerName', v)} />
                        <Field label="Email"         type="email" value={form.email} onChange={v => set('email', v)} />
                        <Field label="Phone Number"  value={form.phone}          onChange={v => set('phone', v)} />
                        <Field label="Office Address" value={form.companyAddress} onChange={v => set('companyAddress', v)} />
                        <Field label="Website"       value={form.website}        onChange={v => set('website', v)} required={false} />
                      </div>
                    </Section>

                    {/* ── Verification Details ── */}
                    <Section icon={<ShieldCheck size={18} className="text-indigo-500" />} title="Verification Details">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Field label="GST Number"     value={form.gstNumber}     onChange={v => set('gstNumber', v)} />
                        <Field label="License Number" value={form.licenseNumber} onChange={v => set('licenseNumber', v)} />
                        <Field label="PAN Number"     value={form.panNumber}     onChange={v => set('panNumber', v)} />
                      </div>
                    </Section>

                    {/* ── Upload Documents ── */}
                    <Section icon={<Upload size={18} className="text-indigo-500" />} title="Upload Documents">
                      <p className="mb-3 text-xs text-slate-500">Images (JPG/PNG) or PDF accepted for each document.</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  /* ── Traveler fields ── */
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Full Name" value={form.name} onChange={v => set('name', v)} />
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Gender</label>
                      <div className="flex gap-2">
                        {['male','female','other'].map(g => (
                          <button key={g} type="button" onClick={() => set('gender', g)}
                            className={`flex-1 rounded-xl border-2 py-2 text-xs font-bold capitalize transition
                              ${form.gender === g ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'}`}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Email (sign-in or traveler register) */}
            {!(isPackager && mode === 'register') && (
              <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} />
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.password} onChange={e => set('password', e.target.value)}
                  className="input pr-12" placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function Section({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800 dark:text-white">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, required = true }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</label>
      <input
        type={type} required={required} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={label} className="input"
      />
    </div>
  );
}

function DocUpload({ label, accept, file, inputRef, onChange, onRemove }) {
  const isPdf  = file?.type === 'application/pdf';
  const isImg  = file?.type?.startsWith('image/');

  return (
    <div className={`relative rounded-xl border-2 transition ${file ? 'border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20' : 'border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}>
      {!file ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center">
          <Upload size={20} className="text-slate-400" />
          <span className="text-[11px] font-semibold leading-tight text-slate-500">{label}</span>
          <span className="text-[10px] text-slate-400">Image or PDF</span>
          <input
            type="file" accept={accept} className="hidden"
            ref={inputRef}
            onChange={e => onChange(e.target.files?.[0])}
          />
        </label>
      ) : (
        <div className="flex items-center gap-3 p-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isPdf ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {isPdf ? <FileText size={18} /> : <Image size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-slate-700 dark:text-slate-200">{file.name}</p>
            <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB • {isPdf ? 'PDF' : 'Image'}</p>
          </div>
          <button type="button" onClick={onRemove} className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500">
            <X size={14} />
          </button>
        </div>
      )}
      {file && (
        <div className="absolute right-2 top-2">
          <CheckCircle2 size={14} className="text-indigo-500" />
        </div>
      )}
    </div>
  );
}
