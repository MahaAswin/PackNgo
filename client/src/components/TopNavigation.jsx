import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, ChevronDown, LayoutDashboard, LogOut, Heart, User, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function TopNavigation() {
  const { user, logout, isAdmin, isPackager } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const dashPath = isAdmin ? '/admin' : isPackager ? '/packager' : '/dashboard';

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><Compass size={20} /></div>
          <span className="text-xl font-black text-slate-900 dark:text-white">PackNgo</span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800 lg:flex">
          {[{ name: 'Explore', path: '/explore' }].map(l => (
            <Link key={l.path} to={l.path}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${pathname === l.path ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
              {l.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!user ? (
            <div className="flex gap-2">
              <Link to="/auth" className="btn-secondary py-2 px-4 text-sm">Sign In</Link>
              <Link to="/auth" className="btn-primary py-2 px-4 text-sm">Join</Link>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                <span className="hidden lg:block">{user.name?.split(' ')[0]}</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="space-y-0.5 py-1">
                    <DropItem to={dashPath} icon={<LayoutDashboard size={15} />} label="Dashboard" onClick={() => setOpen(false)} />
                    {!isAdmin && !isPackager && (
                      <>
                        <DropItem to="/profile" icon={<User size={15} />} label="Profile" onClick={() => setOpen(false)} />
                        <DropItem to="/wishlist" icon={<Heart size={15} />} label="Wishlist" onClick={() => setOpen(false)} />
                      </>
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                    <button onClick={() => { logout(); navigate('/'); setOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function DropItem({ to, icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
      <span className="text-slate-400">{icon}</span>{label}
    </Link>
  );
}
