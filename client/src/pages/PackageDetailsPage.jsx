import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, Star, Heart, Calendar, Users, ChevronLeft, ShieldCheck, 
  Home, Plane, Utensils, MessageCircle, AlertTriangle, CloudSun, Map, Info, HelpCircle, Compass, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TopNavigation from '../components/TopNavigation';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import api from '../lib/axios';

export default function PackageDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, wishlist, toggleWishlist } = useAuth();
  const { formatPrice } = useLocale();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelDate, setTravelDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState('');
  
  // Customizations
  const [selectedMealPlan, setSelectedMealPlan] = useState('');
  const [selectedFoodPreference, setSelectedFoodPreference] = useState('');
  const [selectedHotelType, setSelectedHotelType] = useState('');
  const [selectedTransportType, setSelectedTransportType] = useState('');
  
  // Feedback & Complaints
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState('');

  // Related Packages state
  const [relatedPkgs, setRelatedPkgs] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get(`/packages/${id}`)
      .then(r => {
        setPkg(r.data);
        // Load related packages
        api.get('/packages').then(res => {
          const list = res.data || [];
          setRelatedPkgs(list.filter(p => String(p.id) !== String(id)).slice(0, 2));
        });
      })
      .catch(() => navigate('/explore'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!pkg) return;
    setSelectedMealPlan(pkg.mealOptions?.[0] || 'Breakfast Included');
    setSelectedFoodPreference(pkg.foodPreferences?.[0] || 'Veg');
    setSelectedHotelType(pkg.hotelTypes?.[0] || '3-Star');
    setSelectedTransportType(pkg.transportTypes?.[0] || 'Private SUV');
  }, [pkg]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080B11]">
      <Compass className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );
  if (!pkg) return null;

  const packagePrice = Number(pkg.price || 0);
  const mealPrices = {
    'Breakfast Included': 0,
    'Lunch Included': 500,
    'Dinner Included': 500,
    'All Meals Included': 1500,
  };
  const hotelPrices = {
    '3-Star': 0,
    '4-Star': 2000,
    '5-Star': 4000,
    'Boutique': 3500,
  };
  const transportPrices = {
    'Shared Coach': 0,
    'Private SUV': 1500,
    'Luxury Sedan': 2500,
    'Flight': 5000,
  };

  const mealCharge = mealPrices[selectedMealPlan] ?? 0;
  const hotelCharge = hotelPrices[selectedHotelType] ?? 0;
  const transportCharge = transportPrices[selectedTransportType] ?? 0;
  const subtotal = (packagePrice + mealCharge + hotelCharge + transportCharge) * guests;
  const fees = Math.round(subtotal * 0.05);
  const total = subtotal + fees;
  const minDate = new Date().toISOString().slice(0, 10);

  const handleBookRedirect = () => {
    if (!user) { navigate('/auth'); return; }
    if (!travelDate) { setError('Please select a travel date.'); return; }
    setError('');

    // Redirect to the newly created Booking Page
    navigate(`/book/${pkg.id}`, {
      state: {
        pkg,
        travelDate,
        guests,
        selectedMealPlan,
        selectedFoodPreference,
        selectedHotelType,
        selectedTransportType,
        basePrice: packagePrice,
        subtotal,
        fees,
        total
      }
    });
  };

  const handleSubmitFeedback = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!feedbackComment.trim()) {
      setError('Please add a comment for feedback.');
      return;
    }
    setFeedbackLoading(true);
    setError('');
    try {
      await api.post('/feedback', {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        packageId: pkg.id,
        packageTitle: pkg.title,
        packagerId: pkg.createdById,
        rating: feedbackRating,
        comment: feedbackComment,
      });
      setFeedbackSuccess('Feedback sent to the packager.');
      setFeedbackComment('');
      setTimeout(() => setFeedbackSuccess(''), 3000);
    } catch {
      setError('Could not submit feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!complaintSubject.trim() || !complaintMessage.trim()) {
      setError('Please complete the complaint subject and message.');
      return;
    }
    setComplaintLoading(true);
    setError('');
    try {
      await api.post('/complaints', {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        packageId: pkg.id,
        packageTitle: pkg.title,
        packagerId: pkg.createdById,
        subject: complaintSubject,
        message: complaintMessage,
        status: 'OPEN',
      });
      setComplaintSuccess('Your complaint has been sent to admin.');
      setComplaintSubject('');
      setComplaintMessage('');
      setTimeout(() => setComplaintSuccess(''), 3000);
    } catch {
      setError('Unable to send complaint. Please try again.');
    } finally {
      setComplaintLoading(false);
    }
  };

  let customDetails = null;
  try {
    if (pkg.description && pkg.description.startsWith('{')) {
      customDetails = JSON.parse(pkg.description);
    }
  } catch (e) {
    console.error('Failed to parse custom package description JSON', e);
  }

  const getItineraryDays = () => {
    if (customDetails?.itinerary && customDetails.itinerary.length > 0) {
      return customDetails.itinerary.map(day => ({
        day: day.day,
        title: day.title || `Day ${day.day}`,
        desc: `${day.morning ? `🌄 Morning: ${day.morning}. ` : ''}${day.afternoon ? `☀️ Afternoon: ${day.afternoon}. ` : ''}${day.evening ? `🌇 Evening: ${day.evening}. ` : ''}${day.night ? `🌙 Night: ${day.night}. ` : ''}(Location: ${day.location || 'Local area'})`
      }));
    }
    return [
      { day: 1, title: 'Arrival & Welcome Dinner', desc: 'Arrive at the destination airport. Private pick up and drop off at your luxury resort. Enjoy a custom welcome drink and beachfront dinner.' },
      { day: 2, title: 'Guided Sightseeing & Heritage Walk', desc: 'Breakfast at the resort. Head out with a certified bilingual guide to explore major monuments, historical quarters, and local markets.' },
      { day: 3, title: 'Leisure Day & Adventure Sports', desc: 'A free day for self-exploration. Alternatively, take part in optional speed-boating, paragliding, or deep-sea diving activities.' },
      { day: 4, title: 'Nature Safari & Sunset Cruise', desc: 'Embark on a private morning wildlife sanctuary/hill drive. Spend the evening cruising along the coast with snacks and music.' },
      { day: 5, title: 'Departure with Souvenirs', desc: 'Morning spa session followed by breakfast. Transfer to the terminal with packaged memories and local souvenirs.' }
    ];
  };

  const itineraryDays = getItineraryDays();

  const getHighlights = () => {
    if (customDetails?.activities && customDetails.activities.length > 0) {
      return customDetails.activities.slice(0, 4).map(act => ({
        title: act.name,
        desc: act.desc || `Experience custom-organized ${act.name} during this trip.`
      }));
    }
    return [
      { title: 'Luxury Stays', desc: '4★ and 5★ premium resort bookings included.' },
      { title: 'Bilingual Guide', desc: 'Expert historical storytelling at every stop.' },
      { title: 'Yacht Cruise', desc: 'Complimentary yacht cruise during sunsets.' },
      { title: 'Local Cuisine', desc: 'Gourmet dinner tastings at top-tier bistros.' }
    ];
  };

  const highlights = getHighlights();

  const getPoliciesFaqs = () => {
    if (customDetails?.policies) {
      return [
        { q: 'What is the package cancellation policy?', a: customDetails.policies.cancellation },
        { q: 'Is there a child/infant rule policy?', a: customDetails.policies.child },
        { q: 'What is included in the package price?', a: customDetails.policies.inclusions },
        { q: 'What is excluded from the package price?', a: customDetails.policies.exclusions },
        { q: 'What are the main travel gear requirements?', a: customDetails.policies.requirements }
      ];
    }
    return [
      { q: 'Is international airfare included in the price?', a: 'No, airfare is not included. However, local airport transfers via private SUV are fully integrated.' },
      { q: 'Can I customize the day itinerary after booking?', a: 'Yes! Our partners allow custom scheduling for day tours. Contact support to adjust timings.' },
      { q: 'What is the refund policy for cancellations?', a: 'Get a 100% refund if you cancel up to 48 hours prior to the scheduled travel date.' }
    ];
  };

  const faqs = getPoliciesFaqs();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B11] gradient-bg font-sans">
      <TopNavigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/explore" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">
          <ChevronLeft size={16} /> 
          <span>Back to Explore Journeys</span>
        </Link>

        {/* Dynamic Premium Image Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-2 overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800 h-[350px] sm:h-[450px]"
          >
            {pkg.images?.[0] ? (
              <img src={pkg.images[0]} className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" alt="" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-6xl">🌍</div>
            )}
          </motion.div>
          
          <div className="hidden md:flex flex-col gap-4 h-[450px]">
            <div className="flex-1 overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800">
              <img 
                src={pkg.images?.[1] || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"} 
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" 
                alt="" 
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800">
              <img 
                src={pkg.images?.[2] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"} 
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" 
                alt="" 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          
          {/* Left Side: Package Information details */}
          <div className="flex-1 space-y-10">
            
            {/* Header info */}
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {pkg.isTrending && (
                  <span className="rounded-xl bg-orange-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-500 border border-orange-200/20">
                    Trending
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span>{pkg.rating?.toFixed(1) || '4.8'}</span>
                  <span className="font-normal text-slate-400">({pkg.reviewsCount || 89} guest reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-display leading-[1.1]">{pkg.title}</h1>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="font-bold text-slate-700 dark:text-slate-200">Hosted by {pkg.vendorName || 'Travel Partner'}</span>
                {pkg.verified && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <ShieldCheck size={12} /> Verified Host
                  </span>
                )}
              </div>
              
              <p className="mt-4 flex flex-wrap items-center gap-5 text-slate-500 text-sm">
                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-500" /> {pkg.location}</span>
                <span className="flex items-center gap-1.5"><Clock size={16} /> {pkg.durationDays} Days / {pkg.durationNights} Nights</span>
              </p>
            </div>

            {/* Description */}
            <div className="border-t border-slate-200/50 dark:border-white/5 pt-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Package Overview</h2>
              <p className="text-base leading-relaxed text-slate-650 dark:text-slate-355">
                {(customDetails ? customDetails.intro : pkg.description) || `Discover the ultimate travel luxury in ${pkg.location}. This custom tour is designed for travelers wishing to immerse themselves in unique sights and sounds, comfortable stays, and private transportation.`}
              </p>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Trip Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((h, i) => (
                  <div key={i} className="flex gap-3 bg-white/40 dark:bg-[#0F172A]/40 border border-slate-200/10 rounded-2xl p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><Sparkles size={16} /></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{h.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade Options Details */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="glass-card rounded-3xl p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Meal Preferences</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Meal Plan</label>
                    <div className="flex flex-wrap gap-2">
                      {(pkg.mealOptions || ['Breakfast Included']).map(opt => (
                        <button key={opt} onClick={() => setSelectedMealPlan(opt)}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${selectedMealPlan === opt ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-white/5 text-slate-650'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Diet Preference</label>
                    <div className="flex flex-wrap gap-2">
                      {(pkg.foodPreferences || ['Veg']).map(opt => (
                        <button key={opt} onClick={() => setSelectedFoodPreference(opt)}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${selectedFoodPreference === opt ? 'border-teal-600 bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'border-slate-200 dark:border-white/5 text-slate-650'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Hotel & Transport</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Hotel Tier</label>
                    <div className="flex flex-wrap gap-2">
                      {(pkg.hotelTypes || ['3-Star']).map(opt => (
                        <button key={opt} onClick={() => setSelectedHotelType(opt)}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${selectedHotelType === opt ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-white/5 text-slate-650'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Transport Mode</label>
                    <div className="flex flex-wrap gap-2">
                      {(pkg.transportTypes || ['Private SUV']).map(opt => (
                        <button key={opt} onClick={() => setSelectedTransportType(opt)}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${selectedTransportType === opt ? 'border-sky-600 bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'border-slate-200 dark:border-white/5 text-slate-650'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Day Wise Itinerary */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Detailed Day-Wise Itinerary</h2>
              <div className="relative border-l border-slate-200 dark:border-white/5 pl-6 ml-3 space-y-8">
                {itineraryDays.map((d, i) => (
                  <div key={d.day} className="relative">
                    <span className="absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow">
                      {d.day}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{d.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Interactive Map Mock */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Location Route Map</h2>
              <div className="relative overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 p-6 flex flex-col justify-between items-center text-center h-48 border border-slate-200/10">
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600"><Map size={24} /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Visual route map for {pkg.location}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Showing 5 key itinerary locations including hotel stays, beach attractions, and airport routes.</p>
                </div>
                <button className="btn-premium py-1.5 px-4 text-[10px] font-bold rounded-xl">View Route Coordinates</button>
              </div>
            </div>

            {/* Guest Reviews */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Traveler Reviews</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { name: 'Karthik Rao', date: 'June 2026', rating: 5, comment: 'Exceptional hosting! The meal upgrades were delicious and the support from the vendor was available 24/7.' },
                  { name: 'Aparna Sen', date: 'May 2026', rating: 4, comment: 'We had a lovely time. The transport was clean and spacious. The hotel room view could have been slightly better.' }
                ].map((rev, idx) => (
                  <div key={idx} className="bg-white/40 dark:bg-[#0F172A]/40 border border-slate-200/10 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rev.name}</h4>
                        <span className="text-[9px] text-slate-400">{rev.date}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Panel */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white/40 dark:bg-[#0F172A]/40 border border-slate-200/10 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-blue-500" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side: Sticky Booking Card & Admin Support Actions */}
          <div className="lg:w-96">
            <div className="sticky top-24 space-y-6">
              
              {/* Main Booking Form Card */}
              <div className="glass-card rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="mb-5 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</span>
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{formatPrice(pkg.price)}</p>
                  </div>
                  <span className="text-xs text-slate-400">/ traveler</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Travel Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="date" 
                        min={minDate} 
                        value={travelDate} 
                        onChange={e => setTravelDate(e.target.value)} 
                        className="input pl-10 py-3 rounded-2xl" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Guests</label>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5">
                      <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="h-9 w-9 rounded-xl bg-white dark:bg-slate-700 text-sm font-bold shadow-sm">-</button>
                      <span className="font-bold text-sm">{guests}</span>
                      <button onClick={() => setGuests(g => g + 1)} className="h-9 w-9 rounded-xl bg-white dark:bg-slate-700 text-sm font-bold shadow-sm">+</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-4 text-xs mb-6">
                  <div className="flex justify-between text-slate-500">
                    <span>Base Fare ({guests}×)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>SaaS Booking Fee (5%)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(fees)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 text-slate-900 dark:text-white">
                    <span className="font-bold">Estimated Total</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">{formatPrice(total)}</span>
                  </div>
                </div>

                {error && (
                  <p className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 px-3 py-2 text-[10px] font-bold text-rose-600 dark:text-rose-400">{error}</p>
                )}

                <button onClick={handleBookRedirect} className="btn-premium w-full py-4 text-sm font-bold rounded-2xl shadow-xl">
                  <span>Reserve Spot Now</span>
                </button>

                <button 
                  onClick={() => toggleWishlist(pkg.id)}
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3 text-xs font-bold transition-all ${wishlist.includes(String(pkg.id)) ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/20' : 'border-slate-200 text-slate-600 hover:border-rose-300 dark:border-slate-700 dark:text-slate-300'}`}
                >
                  <Heart size={14} fill={wishlist.includes(String(pkg.id)) ? 'currentColor' : 'none'} />
                  <span>{wishlist.includes(String(pkg.id)) ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <p className="mt-4 text-center text-[10px] text-slate-400 font-semibold">Free cancellation up to 48 hours of departure</p>
              </div>

              {/* Feedback Form Section */}
              <div className="glass-card rounded-3xl p-6">
                <div className="mb-4 flex items-center gap-2">
                  <MessageCircle size={18} className="text-blue-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Submit Package Feedback</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => setFeedbackRating(v)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${feedbackRating === v ? 'bg-blue-500 text-white' : 'border-slate-250 text-slate-500'}`}>
                          {v} ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <textarea 
                      value={feedbackComment} 
                      onChange={e => setFeedbackComment(e.target.value)}
                      placeholder="Comment on your experience with this partner..." 
                      className="input h-20 text-xs py-2 rounded-xl resize-none" 
                    />
                  </div>
                  {feedbackSuccess && <p className="text-[10px] font-bold text-emerald-500">{feedbackSuccess}</p>}
                  <button onClick={handleSubmitFeedback} disabled={feedbackLoading} className="btn-premium w-full py-2.5 text-xs font-bold rounded-xl">
                    {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </div>

              {/* Issue Complaint Section */}
              <div className="glass-card rounded-3xl p-6">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-rose-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Report Issue to Support</h3>
                </div>
                <div className="space-y-3">
                  <input 
                    value={complaintSubject} 
                    onChange={e => setComplaintSubject(e.target.value)}
                    placeholder="Brief subject" 
                    className="input py-2 text-xs rounded-xl" 
                  />
                  <textarea 
                    value={complaintMessage} 
                    onChange={e => setComplaintMessage(e.target.value)}
                    placeholder="Describe issue (billing, guide conduct etc.)" 
                    className="input h-20 text-xs py-2 rounded-xl resize-none" 
                  />
                  {complaintSuccess && <p className="text-[10px] font-bold text-emerald-500">{complaintSuccess}</p>}
                  <button onClick={handleSubmitComplaint} disabled={complaintLoading} className="bg-rose-600 hover:bg-rose-700 w-full py-2.5 text-xs font-bold text-white transition rounded-xl">
                    {complaintLoading ? 'Reporting...' : 'Report Issue'}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Related Packages section */}
        {relatedPkgs.length > 0 && (
          <div className="mt-16 border-t border-slate-200/50 dark:border-white/5 pt-16">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display mb-8">Related Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPkgs.map(p => (
                <div key={p.id} className="glass-card rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-5">
                  <img src={p.images?.[0]} className="h-32 w-44 rounded-2xl object-cover shrink-0" alt="" />
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">{p.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {p.location}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">₹{p.price?.toLocaleString()}</span>
                      <Link to={`/package/${p.id}`} className="btn-premium px-4 py-1.5 text-[10px] rounded-xl">View Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
