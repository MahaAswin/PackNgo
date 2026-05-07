import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Heart, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import TopNavigation from '../components/TopNavigation';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

export default function ExplorePage() {
  const { wishlist, toggleWishlist } = useAuth();
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/packages').then(r => setPackages(r.data || [])).catch(() => setPackages([])).finally(() => setLoading(false));
  }, []);

  const filtered = packages.filter(p => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'FEATURED' && p.status === 'FEATURED') ||
      (filter === 'Verified' && p.verified) ||
      (filter === 'Trending' && p.isTrending);

    return matchesFilter &&
      (p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopNavigation />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-20 text-center text-white">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black md:text-6xl">
          Explore the World
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-blue-100">
          Handpicked travel packages from verified partners.
        </motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search destinations..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full py-4 pl-12 pr-4 text-slate-800 outline-none" />
          </div>
          <button className="bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700">Search</button>
        </motion.div>
      </section>

      {/* Packages */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Featured Journeys</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Handpicked adventures for the modern traveler.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Verified', 'Trending', 'FEATURED'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition ${filter === f ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white text-slate-500 shadow-sm hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Compass className="mx-auto mb-4 text-slate-300" size={48} />
            <p className="text-slate-500">No packages found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((pkg, i) => (
                <motion.div key={pkg.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                  className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
                    {pkg.images?.[0]
                      ? <img src={pkg.images[0]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                      : <div className="flex h-full items-center justify-center text-slate-400"><Compass size={40} /></div>
                    }
                    <button onClick={() => toggleWishlist(pkg.id)}
                      className={`absolute right-3 top-3 rounded-full p-2.5 backdrop-blur-md transition hover:scale-110 ${wishlist.includes(String(pkg.id)) ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-600 hover:text-rose-500'}`}>
                      <Heart size={17} fill={wishlist.includes(String(pkg.id)) ? 'currentColor' : 'none'} />
                    </button>
                    {pkg.isTrending && <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold text-white">Trending</span>}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                      <Star size={11} className="fill-yellow-400 text-yellow-400" /> {pkg.rating?.toFixed(1) || '4.8'}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-500">{pkg.status || 'ACTIVE'}</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">₹{pkg.price?.toLocaleString()}</span>
                    </div>
                    <h3 className="mb-1 font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white">{pkg.title}</h3>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{pkg.vendorName || 'Verified Host'}</span>
                      {pkg.customizablePackage && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">Customizable</span>
                      )}
                      {pkg.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                          <ShieldCheck size={12} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} />{pkg.location}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-xs text-slate-400">{pkg.durationDays}D / {pkg.durationNights}N</span>
                      <Link to={`/package/${pkg.id}`} className="btn-primary rounded-full px-4 py-2 text-sm font-bold">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
