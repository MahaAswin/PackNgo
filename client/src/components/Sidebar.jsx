import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, CalendarDays, Heart, User, LogOut, Package, PlusCircle, Shield, MapPinned } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ isAdmin = false, isPackager = false }) {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  const links = isAdmin
    ? [{ name: 'Overview', path: '/admin', icon: <Shield size={18} /> }]
    : isPackager
    ? [
        { name: 'My Packages', path: '/packager', icon: <Package size={18} /> },
        { name: 'Add Package', path: '/packager/new', icon: <PlusCircle size={18} /> },
        { name: 'Explore', path: '/explore', icon: <Compass size={18} /> },
      ]
    : [
        { name: 'My Bookings', path: '/dashboard', icon: <CalendarDays size={18} /> },
        { name: 'Wishlist', path: '/wishlist', icon: <Heart size={18} /> },
        { name: 'Profile', path: '/profile', icon: <User size={18} /> },
      ];

  return (
    <aside className="sticky top-0 hidden min-h-screen w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white"><Compass size={18} /></div>
          <span className="text-lg font-black text-slate-900 dark:text-white">PackNgo</span>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              pathname === link.path
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {link.icon}{link.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
