import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Star, Heart, ArrowRight, Compass, ShieldCheck, 
  Calendar, Users, Award, Sparkles, MessageSquare, ChevronRight, 
  ChevronLeft, ArrowUp, Send, CheckCircle, CloudSun, Map, X
} from 'lucide-react';
import TopNavigation from '../components/TopNavigation';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import api from '../lib/axios';
import InteractiveMap from '../components/InteractiveMap';

export default function ExplorePage() {
  const { wishlist, toggleWishlist } = useAuth();
  const { formatPrice } = useLocale();
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your AI Travel Assistant. Where are you planning to go next?' }
  ]);
  const [aiInput, setAiInput] = useState('');

  // Carousel State for Popular Destinations
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Weather Widget Mock State
  const [weatherCity, setWeatherCity] = useState('Goa');
  const [weatherData, setWeatherData] = useState({ temp: 28, cond: 'Sunny', humidity: 72 });

  useEffect(() => {
    api.get('/packages')
      .then(r => setPackages(r.data || []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));

    // Scroll tracker
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.pageYOffset / totalScroll) * 100);
      }
      setShowScrollTop(window.pageYOffset > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWeatherChange = (city) => {
    setWeatherCity(city);
    const mocks = {
      'Goa': { temp: 29, cond: 'Sunny & Humid', humidity: 75 },
      'Manali': { temp: 16, cond: 'Chilly, Clear', humidity: 45 },
      'Bangalore': { temp: 24, cond: 'Breezy & Cloudy', humidity: 60 },
      'Shimla': { temp: 14, cond: 'Rainy', humidity: 80 },
      'Mumbai': { temp: 30, cond: 'Thunderstorms', humidity: 85 }
    };
    setWeatherData(mocks[city] || { temp: 22, cond: 'Partly Cloudy', humidity: 55 });
  };

  const handleAiSend = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiInput('');

    // Mock AI responses based on keywords
    setTimeout(() => {
      let reply = "That sounds amazing! I can help you plan your travel budget, suggest stays, and coordinate transportation. Would you like to see our top-rated packages for that region?";
      const lower = userMsg.toLowerCase();
      if (lower.includes('goa')) {
        reply = "Goa is beautiful! I recommend our 'Goa Beachside Escape' (5 Days / 4 Nights) starting at ₹12,999. It features sunset cruises and boutique beachfront villas. Shall I show you the details?";
      } else if (lower.includes('manali') || lower.includes('mountain') || lower.includes('trek')) {
        reply = "For mountain retreats, 'Manali Alpine Retreat' is unmatched. It has a rating of 4.7 stars and covers private SUV drives, local cuisine tasting, and hiking guide. You can also customize it!";
      } else if (lower.includes('discount') || lower.includes('offer') || lower.includes('cheap')) {
        reply = "We currently have an exclusive Group Offer (up to 30% off for 6+ guests) and a 15% discount for Maldives retreats. Apply code SAAS2026 at checkout!";
      }
      setAiMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  const filtered = packages.filter(p => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'FEATURED' && p.status === 'FEATURED') ||
      (filter === 'Verified' && p.verified) ||
      (filter === 'Trending' && p.isTrending);

    return matchesFilter &&
      (p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase()));
  });

  const popularDestinations = [
    { name: 'Goa', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', count: '14+ Packages' },
    { name: 'Manali', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80', count: '8+ Packages' },
    { name: 'Shimla', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80', count: '10+ Packages' },
    { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80', count: '6+ Packages' },
    { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=600&q=80', count: '12+ Packages' },
    { name: 'Lonavala', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80', count: '5+ Packages' }
  ];

  const nextCarousel = () => {
    setCarouselIndex((prev) => (prev + 3 >= popularDestinations.length ? 0 : prev + 3));
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) => (prev - 3 < 0 ? popularDestinations.length - 3 : prev - 3));
  };

  const trustBadges = [
    { icon: <Award size={20} className="text-blue-500" />, title: 'Premium Quality', desc: 'Handpicked verified partners' },
    { icon: <ShieldCheck size={20} className="text-teal-500" />, title: 'Secure Checkout', desc: '100% safe transactions via Razorpay' },
    { icon: <Sparkles size={20} className="text-sky-500" />, title: 'AI Curated Trip Plans', desc: 'Smart itineraries designed for you' },
    { icon: <CloudSun size={20} className="text-amber-500" />, title: 'Flexible Booking', desc: 'Free cancellation up to 48 hours' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B11] gradient-bg relative overflow-hidden font-sans">
      
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-teal-400 z-50 transition-all duration-100" 
        style={{ width: `${scrollProgress}%` }}
      />

      <TopNavigation />

      {/* Hero Section */}
      <section className="relative min-h-[92svh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Background Image Container with Gradient Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover scale-105 filter brightness-[0.9] dark:brightness-[0.4] transition-all duration-700" 
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/70 to-slate-50 dark:via-[#080B11]/70 dark:to-[#080B11]" />
        </div>

        {/* Content Panel */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
          
          {/* Animated Rating Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 rounded-full bg-white/85 dark:bg-[#1E293B]/85 px-4 py-2 text-xs font-bold text-slate-800 dark:text-white backdrop-blur-md shadow-sm border border-white/20 dark:border-white/5"
          >
            <span className="flex items-center text-amber-500"><Star size={14} className="fill-current" /></span>
            <span>4.9 / 5 Rating</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-blue-500 font-semibold">12k+ Trusted Travelers</span>
          </motion.div>

          {/* Headline */}
          <div className="text-center max-w-4xl mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] font-display"
            >
              Discover Your Next <span className="gradient-text">Adventure</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium"
            >
              Luxury, handpicked, and fully customizable travel packages from our verified global partners.
            </motion.p>
          </div>

          {/* Floating Search Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-4xl rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-2xl border border-white/40 dark:border-white/5 p-6 shadow-2xl dark:shadow-none"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Destination */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Where to go?" 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white/80 dark:bg-[#1E293B]/80 border border-slate-200/60 dark:border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              {/* Check In */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check-In</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="date" 
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    className="w-full bg-white/80 dark:bg-[#1E293B]/80 border border-slate-200/60 dark:border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              {/* Check Out */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check-Out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="date" 
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    className="w-full bg-white/80 dark:bg-[#1E293B]/80 border border-slate-200/60 dark:border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              {/* Travelers */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Travelers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    min={1}
                    value={travelers}
                    onChange={e => setTravelers(e.target.value)}
                    className="w-full bg-white/80 dark:bg-[#1E293B]/80 border border-slate-200/60 dark:border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Bottom Panel & Search Action */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/30 dark:border-white/5 pt-5">
              
              {/* Special discount snippet */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 font-bold">%</span>
                <span>Exclusive Offer: Use code <strong className="text-slate-800 dark:text-white">SAAS2026</strong> for 10% off.</span>
              </div>

              <button 
                onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto btn-premium px-8 py-3.5 flex items-center justify-center gap-2"
              >
                <Search size={16} />
                <span>Search Destinations</span>
              </button>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Trust Badges */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-8">
          {trustBadges.map((badge, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/10">
                {badge.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{badge.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Destinations Carousel */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-display">Popular Destinations</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Discover where tourists love to fly most this year.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={prevCarousel}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 dark:border-white/5 dark:bg-[#0F172A] dark:text-white dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextCarousel}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 dark:border-white/5 dark:bg-[#0F172A] dark:text-white dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularDestinations.slice(carouselIndex, carouselIndex + 3).map((dest, i) => (
            <motion.div 
              key={dest.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => { setSearch(dest.name); handleWeatherChange(dest.name); }}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              <img 
                src={dest.image} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={dest.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                  <p className="text-xs text-slate-300 font-semibold">{dest.count}</p>
                </div>
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition group-hover:bg-blue-600">
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Packages Feed */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative z-10" id="packages">
        
        {/* Header & Filter Pill Buttons */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-display">Featured Journeys</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Handpicked adventures and curated itineraries for the modern traveler.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-slate-100/80 dark:bg-slate-800/40 p-1 rounded-2xl border border-slate-200/20">
            {['All', 'Verified', 'Trending', 'FEATURED'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`rounded-xl px-5 py-2 text-xs font-bold transition-all ${filter === f ? 'bg-white dark:bg-[#0F172A] text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Weather & Map Widget Integration */}
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white shadow-md">
                <CloudSun size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Weather Widget</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">Explore Weather in {weatherCity}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{weatherData.cond} • Humidity: {weatherData.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{weatherData.temp}°C</span>
              <div className="flex flex-col gap-1">
                {['Goa', 'Manali', 'Bangalore', 'Shimla'].map(city => (
                  <button 
                    key={city}
                    onClick={() => handleWeatherChange(city)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${weatherCity === city ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div onClick={() => setMapOpen(true)} className="bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-6 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-850/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-white shadow-md">
                <Map size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interactive Map View</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">Explore destinations on map</h3>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setMapOpen(true); }} className="btn-premium px-4 py-2 text-xs flex items-center gap-1 rounded-xl">
              <span>Open</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Loading state / Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center glass-card rounded-3xl max-w-xl mx-auto p-12">
            <Compass className="mx-auto mb-4 text-slate-300 dark:text-slate-700 animate-spin" size={48} />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No destinations found matching your filter. Try exploring all packages!</p>
            <button onClick={() => { setSearch(''); setFilter('All'); }} className="mt-4 btn-premium px-6 py-2 text-xs rounded-xl">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((pkg, i) => (
                <motion.div 
                  key={pkg.id} 
                  layout 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} 
                  transition={{ delay: i * 0.05 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 dark:bg-[#0F172A] dark:shadow-none dark:hover:bg-[#1E293B]/80 dark:border dark:border-white/5"
                >
                  
                  {/* Photo with zoom & heart */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {pkg.images?.[0] ? (
                      <img 
                        src={pkg.images[0]} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={pkg.title} 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400"><Compass size={40} /></div>
                    )}
                    
                    {/* Floating elements */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    
                    <button 
                      onClick={() => toggleWishlist(pkg.id)}
                      className={`absolute right-4 top-4 rounded-2xl p-2.5 backdrop-blur-md transition hover:scale-110 ${wishlist.includes(String(pkg.id)) ? 'bg-rose-500 text-white' : 'bg-white/80 dark:bg-[#0F172A]/80 text-slate-700 dark:text-slate-200 hover:text-rose-500'}`}
                    >
                      <Heart size={16} fill={wishlist.includes(String(pkg.id)) ? 'currentColor' : 'none'} />
                    </button>

                    {pkg.isTrending && (
                      <span className="absolute left-4 top-4 rounded-xl bg-orange-500 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                        Trending
                      </span>
                    )}

                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" /> 
                      <span>{pkg.rating?.toFixed(1) || '4.8'}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{pkg.status || 'ACTIVE'}</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">{formatPrice(pkg.price)}</span>
                      </div>
                      
                      <h3 className="mb-2 font-bold text-lg text-slate-900 group-hover:text-blue-600 dark:text-white transition-colors duration-200 line-clamp-1">
                        {pkg.title}
                      </h3>
                      
                      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{pkg.vendorName || 'Verified Host'}</span>
                        {pkg.customizablePackage && (
                          <span className="rounded-lg bg-blue-50 px-2 py-0.5 font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">Customizable</span>
                        )}
                        {pkg.verified && (
                          <span className="inline-flex items-center gap-0.5 rounded-lg bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <ShieldCheck size={11} /> Verified
                          </span>
                        )}
                      </div>

                      <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin size={14} className="text-blue-500" />
                        <span>{pkg.location}</span>
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/5">
                      <span className="text-xs font-semibold text-slate-400">{pkg.durationDays}D / {pkg.durationNights}N</span>
                      <Link to={`/package/${pkg.id}`} className="btn-premium px-5 py-2.5 text-xs font-bold rounded-2xl">
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

      {/* AI Trip Planner & Group Offer Banners (Stripe style) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* AI Banner */}
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 p-8 sm:p-10 text-white shadow-xl shadow-blue-500/10">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  <Sparkles size={12} /> AI Travel Assistant
                </span>
                <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl font-display">
                  Build Your Dream Itinerary Instantly
                </h2>
                <p className="mt-4 text-sm text-blue-100 max-w-md leading-relaxed">
                  Let our travel intelligence system draft custom hotels, local activities, and routes tailored entirely to your desires.
                </p>
              </div>
              <button 
                onClick={() => setAiChatOpen(true)}
                className="mt-8 self-start inline-flex items-center gap-2 rounded-3xl bg-white px-6 py-3.5 text-sm font-bold text-indigo-700 shadow-lg hover:shadow-xl transition active:scale-95"
              >
                <span>Ask AI Assistant</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="absolute right-0 bottom-0 top-0 opacity-15 translate-x-12 pointer-events-none">
              <Sparkles size={320} />
            </div>
          </div>

          {/* Group Offer Banner */}
          <div className="relative overflow-hidden rounded-4xl bg-[#0F172A] p-8 sm:p-10 text-white border border-white/5 shadow-xl">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-300">
                  % Exclusive Group Deals
                </span>
                <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl font-display">
                  Traveling in Groups? Save up to 30%!
                </h2>
                <p className="mt-4 text-sm text-slate-400 max-w-md leading-relaxed">
                  Get premium upgrades, custom meal planning, and dedicated private SUV transport for parties of 6 or more travelers.
                </p>
              </div>
              <a 
                href="#packages"
                className="mt-8 self-start inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:shadow-xl transition active:scale-95"
              >
                <span>Browse Group Packages</span>
                <ArrowRight size={16} />
              </a>
            </div>
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-10 translate-y-10">
              <Compass size={280} />
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white font-display">What Our Guests Say</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Join thousands of travelers who planned their dream trips with PackNgo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Aswin Kumar', role: 'Business Traveler', quote: 'The private SUV upgrades and seamless check-in experience at Goa were incredible. Truly premium!', rating: 5, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
            { name: 'Nina Dev', role: 'Adventurer', quote: 'I customized the Manali Alpine package for trekking. The AI suggestions were spot on. Strongly recommended!', rating: 5, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
            { name: 'Meera Shah', role: 'Family Trip Planner', quote: 'Booking the Bangalore city escape for my family was a breeze. Razorpay payment checkout was smooth and instant.', rating: 5, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' }
          ].map((item, idx) => (
            <div key={idx} className="glass-card rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={15} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed">"{item.quote}"</p>
              </div>
              <div className="flex items-center gap-3 mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                <img src={item.img} className="h-10 w-10 rounded-full object-cover shadow-inner" alt={item.name} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="relative overflow-hidden rounded-4xl bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl">
          <div className="relative z-10 max-w-xl mx-auto">
            <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Newsletter Subscription</span>
            <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white font-display">Get 15% Off Your Next Trip</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Subscribe to get secret deals, holiday announcements, and destination reviews directly in your inbox.
            </p>
            <form className="mt-6 flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                required 
                placeholder="Enter your email address" 
                className="flex-1 input bg-white border border-slate-200/80 rounded-2xl text-slate-800 dark:bg-slate-900 dark:text-white" 
              />
              <button type="submit" className="btn-premium px-6 py-3 flex items-center justify-center gap-2">
                <span>Subscribe</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Beautiful SaaS Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#080B11] pt-16 pb-12 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><Compass size={18} /></div>
                <span className="text-lg font-black text-slate-900 dark:text-white font-display">PackNgo</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                PackNgo is a premium multi-vendor travel booking platform. We specialize in providing verified destinations, luxury transport, and smart AI curated itineraries.
              </p>
              <div className="flex gap-3 pt-2">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map(social => (
                  <a 
                    key={social} 
                    href="#" 
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-blue-500 hover:text-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
                  >
                    <span className="capitalize text-[10px] font-bold">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Destinations</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-500">Goa beach villas</a></li>
                <li><a href="#" className="hover:text-blue-500">Himalayan treks</a></li>
                <li><a href="#" className="hover:text-blue-500">Bangalore weekend tours</a></li>
                <li><a href="#" className="hover:text-blue-500">Mumbai luxury suites</a></li>
              </ul>
            </div>

            {/* Column 3: Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Company</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-500">About PackNgo</a></li>
                <li><a href="#" className="hover:text-blue-500">Our Partners</a></li>
                <li><a href="#" className="hover:text-blue-500">Verified Badges</a></li>
                <li><a href="#" className="hover:text-blue-500">Careers</a></li>
              </ul>
            </div>

            {/* Column 4: Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Security & Trust</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-500">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-500">Razorpay Security</a></li>
                <li><a href="#" className="hover:text-blue-500">24/7 Premium Hotline</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-200/50 dark:border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-slate-400 font-semibold">© 2026 PackNgo Platform Inc. All rights reserved.</p>
            <div className="flex gap-4 text-[10px] text-slate-400 font-semibold">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Use</a>
              <a href="#" className="hover:underline">Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Chat Assistant Bubble */}
      <div className="fixed bottom-6 right-6 z-40">
        
        {/* Chat Toggle Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAiChatOpen(!aiChatOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:opacity-95"
        >
          {aiChatOpen ? <Compass className="animate-spin" size={24} /> : <MessageSquare size={24} />}
          {!aiChatOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-slate-50">
              1
            </span>
          )}
        </motion.button>

        {/* Chat Box Dialog */}
        <AnimatePresence>
          {aiChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 rounded-3xl border border-slate-200/80 bg-white/95 dark:bg-[#0F172A]/95 p-4 shadow-2xl backdrop-blur-xl dark:border-white/5 flex flex-col"
              style={{ height: 420 }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500 text-white"><Sparkles size={16} /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Travel Planner</h4>
                    <p className="text-[9px] text-emerald-500 font-bold">Online & Ready</p>
                  </div>
                </div>
                <button onClick={() => setAiChatOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs">Close</button>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleAiSend} className="flex gap-2 border-t border-slate-100 dark:border-white/5 pt-3">
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder="Ask about Goa, Manali, discounts..."
                  className="flex-1 bg-slate-50 dark:bg-[#1E293B] border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 dark:text-white"
                />
                <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 transition shrink-0">
                  <Send size={12} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Back To Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-white hover:bg-slate-50 text-slate-700 dark:bg-[#0F172A] dark:text-white dark:hover:bg-slate-800 shadow-xl border border-slate-200/50 dark:border-white/5"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Interactive Map Modal */}
      <InteractiveMap 
        isOpen={mapOpen} 
        onClose={() => setMapOpen(false)} 
        setSearch={setSearch} 
      />

    </div>
  );
}
