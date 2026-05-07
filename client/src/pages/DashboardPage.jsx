import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Compass, Star, TrendingUp, Gift, Clock, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function DashboardPage() {
  const { user, bookings } = useAuth();
  const [packages, setPackages] = useState([]);

  const upcomingBookings = bookings.filter(b => b.status !== 'CANCELLED');
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const recommendedPackages = packages.filter(p => p.isTrending || p.verified).slice(0, 3);

  useEffect(() => {
    api.get('/packages').then(r => setPackages(r.data || [])).catch(() => setPackages([]));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">My Dashboard</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.level || 'Explorer'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-5xl space-y-8">

            {/* Welcome Banner */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-500/20">
              <div className="relative z-10">
                <p className="text-sm font-semibold text-blue-200">Welcome back,</p>
                <h2 className="mt-1 text-3xl font-black">{user?.name?.split(' ')[0]} 👋</h2>
                <p className="mt-2 text-blue-100">You have {upcomingBookings.length} upcoming {upcomingBookings.length === 1 ? 'trip' : 'trips'} planned.</p>
                <Link to="/explore" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white/20 px-5 py-2.5 text-sm font-bold backdrop-blur-md transition hover:bg-white/30">
                  <Compass size={16} /> Explore More
                </Link>
              </div>
              <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-12 -right-4 h-64 w-64 rounded-full bg-white/5" />
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Trips', value: bookings.length, icon: <Compass size={20} />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
                { label: 'Upcoming', value: upcomingBookings.length, icon: <Clock size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
                { label: 'Travel Points', value: user?.travelPoints ?? 250, icon: <Gift size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
                { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="card p-5">
                  <div className={`mb-3 inline-flex rounded-xl p-2 ${s.bg} ${s.color}`}>{s.icon}</div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</p>
                  <p className={`mt-1 text-xl font-black ${s.color}`}>{s.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                { title: 'Instant Booking', desc: 'Browse deals and book the perfect itinerary in a few clicks.', icon: <Calendar size={20} className="text-blue-600" /> },
                { title: 'Verified Experiences', desc: 'All packages are curated from trusted partners and verified hosts.', icon: <ShieldCheck size={20} className="text-emerald-600" /> },
                { title: 'Travel Rewards', desc: 'Earn points every time you book and unlock premium upgrades.', icon: <Gift size={20} className="text-orange-600" /> },
              ].map(card => (
                <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">{card.icon}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.desc}</p>
                </motion.div>
              ))}
            </div>

            {recommendedPackages.length > 0 && (
              <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Recommended</p>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Trips you might love</h3>
                  </div>
                  <Link to="/explore" className="text-sm font-semibold text-blue-600 hover:underline">Browse all</Link>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  {recommendedPackages.map(pkg => (
                    <div key={pkg.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="mb-4 h-40 overflow-hidden rounded-3xl bg-slate-200">
                        {pkg.images?.[0] ? <img src={pkg.images[0]} alt={pkg.title} className="h-full w-full object-cover" /> : null}
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{pkg.verified ? 'Verified' : 'Popular'}</p>
                      <h4 className="mt-2 text-lg font-black text-slate-900 dark:text-white">{pkg.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">{pkg.location}</p>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                        <span>{pkg.durationDays}D/{pkg.durationNights}N</span>
                        <span>₹{pkg.price?.toLocaleString()}</span>
                      </div>
                      <Link to={`/package/${pkg.id}`} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 py-2 text-sm font-black text-white hover:bg-blue-700">
                        View deal
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Bookings</h2>
                <Link to="/explore" className="text-sm font-semibold text-blue-600 hover:underline">+ Book New Trip</Link>
              </div>

              {bookings.length === 0 ? (
                <div className="card flex flex-col items-center justify-center border-2 border-dashed py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <Compass className="text-slate-400" size={32} />
                  </div>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">No trips booked yet</p>
                  <p className="mt-1 text-sm text-slate-500">Explore packages and book your first adventure!</p>
                  <Link to="/explore" className="btn-primary mt-6">Browse Packages</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b, i) => (
                    <motion.div key={b.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="card overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        <div className="h-40 w-full shrink-0 bg-slate-200 dark:bg-slate-800 sm:h-auto sm:w-48">
                          {b.travelPackage?.images?.[0]
                            ? <img src={b.travelPackage.images[0]} className="h-full w-full object-cover" alt="" />
                            : <div className="flex h-full items-center justify-center"><Compass className="text-slate-400" size={32} /></div>
                          }
                        </div>
                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between p-5">
                          <div>
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{b.travelPackage?.title || 'Travel Package'}</h3>
                                <p className="mt-2 text-sm text-slate-500">Booked by {b.user?.name || 'Guest'}</p>
                                <p className="text-sm text-slate-500">{b.user?.email || 'No email available'}</p>
                              </div>
                              <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : b.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              }`}>{b.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
