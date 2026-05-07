import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Mail, Lock, User, Briefcase, ArrowRight, 
  ShieldCheck, CheckCircle2, Building2, Phone, Globe, 
  MapPin, Upload, FileText, BadgeCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [mode, setMode] = useState('signin'); // 'signin' or 'register'
  const [role, setRole] = useState('customer'); // 'customer' or 'packager'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [agencyDetails, setAgencyDetails] = useState({
    companyName: '', ownerName: '', phone: '', website: '',
    companyAddress: '', gstNumber: '', licenseNumber: '', panNumber: '',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleAgencyChange = (field, value) => {
    setAgencyDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signin') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        const role = res.user?.role?.toUpperCase();
        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'PACKAGER') navigate('/packager');
        else navigate('/dashboard'); 
      } else {
        setError(res.error);
      }
    } else {
      const isPackager = role === 'packager';
      const payload = {
        email, password,
        name: isPackager ? agencyDetails.ownerName : (name || 'User'),
        role: role.toUpperCase(),
        ...(isPackager ? { ...agencyDetails, packagerStatus: 'pending' } : {}),
      };
      
      const res = await register(payload);
      setLoading(false);
      if (res.success) {
        if (isPackager) {
          setError('Registration successful! Pending admin approval.');
          setMode('signin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <div className="relative hidden w-1/2 overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-20 text-white">
          <Link to="/" className="flex items-center gap-3 text-3xl font-black tracking-tighter">
            <Compass size={40} className="text-white" /> PackNgo
          </Link>
          <div className="max-w-md">
            <h2 className="text-6xl font-black leading-[1.1] tracking-tight">Explore the <span className="text-blue-200">World</span></h2>
            <p className="mt-8 text-xl font-medium text-blue-100/80 leading-relaxed">Book premium travel packages from verified partners. Secure portal for your next journey.</p>
          </div>
          <div className="flex items-center gap-8 font-bold text-sm text-blue-100">
             <div className="flex items-center gap-3"><ShieldCheck size={20} className="text-blue-300" /> Verified Partners</div>
             <div className="flex items-center gap-3"><CheckCircle2 size={20} className="text-blue-300" /> Secure Portal</div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center overflow-y-auto px-10 py-12 lg:w-1/2 bg-white max-h-screen">
        <div className="w-full max-w-[520px]">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 font-medium mt-1">Access your travel portal account</p>
          </div>

          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1.5">
            {['signin', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-xl py-3 text-sm font-black transition-all ${mode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{m === 'signin' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`p-4 rounded-xl border flex items-center gap-3 font-bold text-sm ${error.includes('successful') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                {error.includes('successful') ? <CheckCircle2 size={18} /> : <BadgeCheck size={18} />} {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="flex gap-4">
                    <RoleButton active={role === 'customer'} onClick={() => setRole('customer')} icon={<User size={18} />} label="Traveler" />
                    <RoleButton active={role === 'packager'} onClick={() => setRole('packager')} icon={<Briefcase size={18} />} label="Trip Partner" />
                  </div>

                  {role === 'packager' ? (
                    <div className="space-y-8 pt-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-4">
                        <SectionHeader icon={<Building2 size={18} />} label="Company Details" />
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Company Name" value={agencyDetails.companyName} onChange={v => handleAgencyChange('companyName', v)} placeholder="Company" />
                          <Input label="Owner Name" value={agencyDetails.ownerName} onChange={v => handleAgencyChange('ownerName', v)} placeholder="Owner" />
                          <div className="col-span-2"><Input label="Office Address" value={agencyDetails.companyAddress} onChange={v => handleAgencyChange('companyAddress', v)} placeholder="Address" icon={<MapPin size={16} />} /></div>
                          <Input label="Phone" value={agencyDetails.phone} onChange={v => handleAgencyChange('phone', v)} placeholder="Phone" icon={<Phone size={16} />} />
                          <Input label="Website" value={agencyDetails.website} onChange={v => handleAgencyChange('website', v)} placeholder="Website" icon={<Globe size={16} />} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <SectionHeader icon={<ShieldCheck size={18} />} label="Verification" />
                        <div className="grid grid-cols-3 gap-3">
                          <Input label="GST" value={agencyDetails.gstNumber} onChange={v => handleAgencyChange('gstNumber', v)} placeholder="GST" />
                          <Input label="License" value={agencyDetails.licenseNumber} onChange={v => handleAgencyChange('licenseNumber', v)} placeholder="License" />
                          <Input label="PAN" value={agencyDetails.panNumber} onChange={v => handleAgencyChange('panNumber', v)} placeholder="PAN" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <SectionHeader icon={<Upload size={18} />} label="Upload Documents" />
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                           {['Business Cert', 'GST Cert', 'License', 'Owner ID', 'Logo'].map(l => <Uploader key={l} label={l} />)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Input label="Full Name" value={name} onChange={setName} placeholder="Full Name" icon={<User size={18} />} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
               <Input label="Email Address" type="email" value={email} onChange={setEmail} placeholder="mail@example.com" icon={<Mail size={18} />} />
               <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" icon={<Lock size={18} />} />
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-3 mt-8">
              {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')} <ArrowRight size={22} />
            </button>
          </form>

          {mode === 'signin' && (
             <div className="mt-8 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Demo Accounts</p>
                <div className="flex justify-center gap-2">
                   <CredentialTag label="Admin" text="admin@packngo.com / admin123" />
                   <CredentialTag label="Traveler" text="traveler@test.com / password" />
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RoleButton = ({ active, onClick, icon, label }) => (
  <button type="button" onClick={onClick} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all text-sm font-black ${active ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>{icon} {label}</button>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, icon }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input type={type} required value={value} onChange={e => onChange(e.target.value)} className={`w-full ${icon ? 'pl-14' : 'px-5'} py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300`} placeholder={placeholder} />
    </div>
  </div>
);

const SectionHeader = ({ icon, label }) => (
  <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-2">
    <div className="text-blue-600">{icon}</div>
    <h3 className="font-black text-xs uppercase tracking-tight">{label}</h3>
  </div>
);

const Uploader = ({ label }) => (
  <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all">
    <Upload size={16} className="text-slate-400 mb-1" />
    <span className="text-[8px] font-black uppercase text-slate-500 text-center leading-tight">{label}</span>
    <input type="file" className="hidden" />
  </label>
);

const CredentialTag = ({ label, text }) => (
  <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[8px] font-bold text-slate-500">
    <span className="text-blue-600 font-black mr-1">{label}:</span> {text}
  </div>
);

export default LoginPage;
