import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Star, Compass, ArrowRight } from 'lucide-react';
import TopNavigation from '../components/TopNavigation';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/packages').then(r => setPackages(r.data || [])).catch(() => setPackages([])).finally(() => setLoading(false));
  }, []);

  const saved = packages.filter(p => wishlist.includes(String(p.id)));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopNavigation />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Your Wishlist</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {saved.length > 0 ? `${saved.length} saved ${saved.length === 1 ? 'package' : 'packages'}` : 'Packages you save will appear here.'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
          </div>
        ) : saved.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-24 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30">
              <Heart className="text-rose-400" size={36} strokeWidth={1.5} />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">Nothing saved yet</p>
            <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Browse packages and tap the heart icon to save them here for later.
            </p>
            <Link to="/explore" className="btn-primary mt-8">Explore Packages</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {saved.map((pkg, i) => (
                <motion.div key={pkg.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                  className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
                    {pkg.images?.[0]
                      ? <img src={pkg.images[0]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                      : <div className="flex h-full items-center justify-center"><Compass className="text-slate-400" size={40} /></div>
                    }
                    {/* Remove from wishlist */}
                    <button onClick={() => toggleWishlist(pkg.id)}
                      className="absolute right-3 top-3 rounded-full bg-rose-500 p-2.5 text-white shadow-lg transition hover:bg-rose-600 hover:scale-110">
                      <Heart size={16} fill="currentColor" />
                    </button>
                    {pkg.isTrending && (
                      <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold text-white">Trending</span>
                    )}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                      <Star size={11} className="fill-yellow-400 text-yellow-400" /> {pkg.rating?.toFixed(1) || '4.8'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-500">{pkg.status || 'ACTIVE'}</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">₹{pkg.price?.toLocaleString()}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white">{pkg.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} />{pkg.location}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-xs text-slate-400">{pkg.durationDays}D / {pkg.durationNights}N</span>
                      <Link to={`/package/${pkg.id}`}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700">
                        View <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
