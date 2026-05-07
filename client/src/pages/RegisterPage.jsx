import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Compass, ArrowRight, Briefcase } from 'lucide-react';

const RegisterPage = () => {
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-blue-600 text-white mb-4">
            <Compass size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-2">Join the world's most curated travel community.</p>
        </div>

        <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-2xl">
          <button 
            onClick={() => setRole('customer')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'customer' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
          >
            <User size={18} /> Traveler
          </button>
          <button 
            onClick={() => setRole('packager')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'packager' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
          >
            <Briefcase size={18} /> Agency
          </button>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
            <input className="w-full px-4 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-600 outline-none transition-all text-sm font-bold" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
            <input className="w-full px-4 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-600 outline-none transition-all text-sm font-bold" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
            <input type="password" className="w-full px-4 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-600 outline-none transition-all text-sm font-bold" placeholder="••••••••" />
          </div>

          <button className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold transition-all hover:bg-black mt-6">
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
