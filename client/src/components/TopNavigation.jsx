import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, ChevronDown, LayoutDashboard, LogOut, Heart, User, Bell, Globe, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNavigation() {
  const { user, logout, isAdmin, isPackager } = useAuth();
  const { currency, setCurrency, language, setLanguage, t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  
  const menuRef = useRef(null);
  const notifyRef = useRef(null);
  const langRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifyRef.current && !notifyRef.current.contains(e.target)) setNotifyOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const dashPath = isAdmin ? '/admin' : isPackager ? '/packager' : '/dashboard';

  const notifications = [
    { id: 1, title: 'Maldives packages dropped 15%', desc: 'Special summer discount applied to all tropical resorts.', time: '2h ago', unread: true },
    { id: 2, title: 'Booking Confirmed!', desc: 'Your trip to Goa Beachside Escape is verified.', time: '1d ago', unread: false },
    { id: 3, title: 'AI Recommendations Ready', desc: 'Customized winter itineraries generated for you.', time: '3d ago', unread: false }
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/70 dark:bg-[#080B11]/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ rotate: 18, scale: 1.05 }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-md shadow-blue-500/20"
          >
            <Compass size={22} className="group-hover:animate-pulse" />
          </motion.div>
          <span className="text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white">
            Pack<span className="bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">Ngo</span>
          </span>
        </Link>

        {/* Animated Navigation */}
        <div className="hidden items-center gap-1 rounded-full bg-slate-100/80 dark:bg-slate-800/40 p-1 lg:flex">
          {[
            { name: t('explore'), path: '/explore' },
            { name: t('trending'), path: '/explore?filter=Trending' },
            { name: t('verifiedStay'), path: '/explore?filter=Verified' }
          ].map(l => {
            const isActive = pathname === l.path || (l.path.includes('filter') && pathname === '/explore');
            return (
              <Link 
                key={l.path} 
                to={l.path}
                className="relative rounded-full px-6 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
              >
                {isActive && (
                  <motion.span 
                    layoutId="activeNav" 
                    className="absolute inset-0 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{l.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/50 bg-white/40 dark:bg-[#0F172A]/40 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Globe size={18} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-36 rounded-3xl border border-slate-200/80 bg-white/95 dark:bg-[#0F172A]/95 p-2 shadow-2xl backdrop-blur-xl dark:border-white/5"
                >
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase">{t('language')}</div>
                  {['EN', 'TA'].map(lang => (
                    <button 
                      key={lang}
                      onClick={() => { setLanguage(lang); setLangOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${language === lang ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {lang === 'EN' ? 'English' : 'Tamil'}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-white/5 my-1" />
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase">{t('currency')}</div>
                  {['INR', 'USD', 'EUR'].map(curr => (
                    <button 
                      key={curr}
                      onClick={() => { setCurrency(curr); setLangOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${currency === curr ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {curr}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />

          {/* Notifications Icon */}
          {user && (
            <div className="relative" ref={notifyRef}>
              <button 
                onClick={() => setNotifyOpen(!notifyOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/50 bg-white/40 dark:bg-[#0F172A]/40 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
              </button>
              <AnimatePresence>
                {notifyOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 rounded-3xl border border-slate-200/80 bg-white/95 dark:bg-[#0F172A]/95 p-3 shadow-2xl backdrop-blur-xl dark:border-white/5"
                  >
                    <div className="mb-2 px-3 py-1 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">1 New</span>
                    </div>
                    <div className="space-y-1 max-h-72 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-3 rounded-2xl transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${n.unread ? 'bg-blue-500/5' : ''}`}>
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                            <span className="text-[9px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Profile Avatar */}
          {!user ? (
            <div className="flex gap-2">
              <Link to="/auth" className="btn-premium-secondary py-2 px-5 text-sm h-10 flex items-center rounded-2xl">{t('signIn')}</Link>
              <Link to="/auth" className="btn-premium py-2 px-5 text-sm h-10 flex items-center rounded-2xl">{t('join')}</Link>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-2xl border border-slate-200/50 bg-white/40 p-1.5 pr-3 text-sm font-semibold transition hover:bg-slate-50 dark:border-white/5 dark:bg-[#0F172A]/40 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden lg:block text-slate-700 dark:text-slate-300 font-medium">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className={`transition-transform text-slate-400 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 rounded-3xl border border-slate-200/80 bg-white/95 dark:bg-[#0F172A]/95 p-2 shadow-2xl backdrop-blur-xl dark:border-white/5"
                  >
                    <div className="mb-2 border-b border-slate-100 dark:border-white/5 px-3 py-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <div className="space-y-0.5">
                      <DropItem to={dashPath} icon={<LayoutDashboard size={15} />} label="Dashboard" onClick={() => setMenuOpen(false)} />
                      {!isAdmin && !isPackager && (
                        <>
                          <DropItem to="/profile" icon={<User size={15} />} label={t('profile')} onClick={() => setMenuOpen(false)} />
                          <DropItem to="/wishlist" icon={<Heart size={15} />} label={t('wishlist')} onClick={() => setMenuOpen(false)} />
                        </>
                      )}
                    </div>
                    <div className="border-t border-slate-100 dark:border-white/5 mt-2 pt-1.5">
                      <button 
                        onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut size={15} /> {t('signOut')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function DropItem({ to, icon, label, onClick }) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
    >
      <span className="text-slate-400">{icon}</span>{label}
    </Link>
  );
}
