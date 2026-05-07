import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Heart, Calendar, Users, ChevronLeft, ShieldCheck, Home, Plane, Utensils, MessageCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import TopNavigation from '../components/TopNavigation';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

export default function PackageDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, wishlist, toggleWishlist, refreshBookings } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelDate, setTravelDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');
  const [selectedMealPlan, setSelectedMealPlan] = useState('');
  const [selectedFoodPreference, setSelectedFoodPreference] = useState('');
  const [selectedHotelType, setSelectedHotelType] = useState('');
  const [selectedTransportType, setSelectedTransportType] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState('');

  useEffect(() => {
    api.get(`/packages/${id}`).then(r => setPkg(r.data)).catch(() => navigate('/explore')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!pkg) return;
    setSelectedMealPlan(pkg.mealOptions?.[0] || 'Breakfast Included');
    setSelectedFoodPreference(pkg.foodPreferences?.[0] || 'Veg');
    setSelectedHotelType(pkg.hotelTypes?.[0] || '3-Star');
    setSelectedTransportType(pkg.transportTypes?.[0] || 'Private SUV');
  }, [pkg]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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
    'Luxury Sedan': 2500,
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

  const handleBook = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!travelDate) { setError('Please select a travel date.'); return; }
    setBooking(true); setError('');
    try {
      await api.post('/bookings', {
        user: { id: user.id },
        travelPackage: { id: pkg.id },
        travelDate,
        guests,
        totalAmount: total,
        mealPlan: selectedMealPlan,
        foodPreference: selectedFoodPreference,
        hotelType: selectedHotelType,
        transportType: selectedTransportType,
        customPackage: !!pkg.customizablePackage,
        status: 'PENDING',
      });
      await refreshBookings();
      setBooked(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch {
      setError('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopNavigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/explore" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600">
          <ChevronLeft size={16} /> Back to Explore
        </Link>

        {/* Hero Image */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="mb-8 overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800" style={{ height: 420 }}>
          {pkg.images?.[0]
            ? <img src={pkg.images[0]} className="h-full w-full object-cover" alt="" />
            : <div className="flex h-full items-center justify-center text-slate-400 text-6xl">🌍</div>
          }
        </motion.div>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Left — Details */}
          <div className="flex-1 space-y-8">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {pkg.isTrending && <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">Trending</span>}
                <div className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  {pkg.rating?.toFixed(1)} <span className="font-normal text-slate-400">({pkg.reviewsCount || 0} reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">{pkg.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{pkg.vendorName || 'Travel Partner'}</span>
                {pkg.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <ShieldCheck size={12} /> Verified Vendor
                  </span>
                )}
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-3 text-slate-500">
                <span className="flex items-center gap-1"><MapPin size={15} className="text-blue-500" />{pkg.location}</span>
                <span className="flex items-center gap-1"><Clock size={15} />{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
              </p>
            </div>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {pkg.description || `Discover the beauty of ${pkg.location} with this curated travel experience. Every detail is crafted to give you the perfect journey.`}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 dark:text-white">Included Meals</h2>
                  {pkg.customizablePackage && <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600 dark:bg-blue-950/30 dark:text-blue-300">Customizable</span>}
                </div>
                <div className="space-y-2">
                  {(pkg.mealOptions || ['Breakfast Included']).map(option => (
                    <div key={option} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{option}</div>
                  ))}
                </div>
                {pkg.restaurantDetails && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{pkg.restaurantDetails}</p>}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-3 font-bold text-slate-900 dark:text-white">Meal & Upgrade Options</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Meal Plan</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(pkg.mealOptions || ['Breakfast Included']).map(option => (
                        <button key={option} type="button" onClick={() => setSelectedMealPlan(option)}
                          className={`rounded-2xl border px-3 py-2 text-sm ${selectedMealPlan === option ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Food Preference</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(pkg.foodPreferences || ['Veg']).map(option => (
                        <button key={option} type="button" onClick={() => setSelectedFoodPreference(option)}
                          className={`rounded-2xl border px-3 py-2 text-sm ${selectedFoodPreference === option ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {pkg.customizablePackage && (
                  <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hotel Type</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(pkg.hotelTypes || ['3-Star']).map(option => (
                          <button key={option} type="button" onClick={() => setSelectedHotelType(option)}
                            className={`rounded-2xl border px-3 py-2 text-sm ${selectedHotelType === option ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Transport Type</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(pkg.transportTypes || ['Private SUV']).map(option => (
                          <button key={option} type="button" onClick={() => setSelectedTransportType(option)}
                            className={`rounded-2xl border px-3 py-2 text-sm ${selectedTransportType === option ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inclusions */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Accommodation', val: '5★ Hotels', icon: <Home size={20} /> },
                { label: 'Transport', val: 'Private SUV', icon: <Plane size={20} /> },
                { label: 'Meals', val: 'Full Board', icon: <Utensils size={20} /> },
                { label: 'Support', val: '24/7 Expert', icon: <ShieldCheck size={20} /> },
              ].map(item => (
                <div key={item.label} className="card p-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">{item.icon}</div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Booking Card */}
          <div className="lg:w-80">
            <div className="sticky top-24 card p-6 shadow-xl">
              <div className="mb-5 flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">From</p>
                  <p className="text-3xl font-black text-blue-600 dark:text-blue-400">₹{pkg.price?.toLocaleString()}</p>
                </div>
                <span className="text-sm text-slate-400">/ person</span>
              </div>

              <div className="mb-5 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Travel Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="date" min={minDate} value={travelDate} onChange={e => setTravelDate(e.target.value)} className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Travelers</label>
                  <div className="flex items-center justify-between rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                    <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="h-9 w-9 rounded-lg bg-white text-lg font-bold shadow-sm dark:bg-slate-700">-</button>
                    <span className="font-bold">{guests}</span>
                    <button onClick={() => setGuests(g => g + 1)} className="h-9 w-9 rounded-lg bg-white text-lg font-bold shadow-sm dark:bg-slate-700">+</button>
                  </div>
                </div>
              </div>

              <div className="mb-5 space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
                <div className="flex justify-between"><span className="text-slate-500">Base ({guests}×)</span><span className="font-bold">₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Service fee (5%)</span><span className="font-bold">₹{fees.toLocaleString()}</span></div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {error && <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 dark:bg-rose-950/30">{error}</p>}

              <button onClick={handleBook} disabled={booking || booked}
                className={`btn-primary w-full py-3.5 ${booked ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}>
                {booked ? '✓ Booking Confirmed!' : booking ? 'Booking...' : 'Book Now'}
              </button>

              <button onClick={() => toggleWishlist(pkg.id)}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-2.5 text-sm font-bold transition ${wishlist.includes(String(pkg.id)) ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/30' : 'border-slate-200 text-slate-600 hover:border-rose-300 dark:border-slate-700'}`}>
                <Heart size={16} fill={wishlist.includes(String(pkg.id)) ? 'currentColor' : 'none'} />
                {wishlist.includes(String(pkg.id)) ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>

              {(feedbackSuccess || complaintSuccess || error) && (
                <div className="mt-4 space-y-2 text-sm">
                  {feedbackSuccess && <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-green-700 dark:bg-emerald-900/20 dark:text-emerald-300">{feedbackSuccess}</p>}
                  {complaintSuccess && <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-green-700 dark:bg-emerald-900/20 dark:text-emerald-300">{complaintSuccess}</p>}
                  {error && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300">{error}</p>}
                </div>
              )}

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-3">
                  <MessageCircle size={20} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Give feedback to the packager</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Rating</label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map(value => (
                        <button key={value} type="button" onClick={() => setFeedbackRating(value)}
                          className={`rounded-full border px-3 py-2 text-sm ${feedbackRating === value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
                          {value} ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Comment</label>
                    <textarea value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} rows={3}
                      className="input h-28 resize-none" placeholder="Share what you liked or what we can improve." />
                  </div>
                  <button onClick={handleSubmitFeedback} disabled={feedbackLoading}
                    className="btn-primary w-full py-3.5">
                    {feedbackLoading ? 'Sending feedback...' : 'Send Feedback'}
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-3">
                  <AlertTriangle size={20} className="text-rose-600" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Report an issue to admin</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Subject</label>
                    <input value={complaintSubject} onChange={e => setComplaintSubject(e.target.value)} placeholder="Brief summary" className="input w-full" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Details</label>
                    <textarea value={complaintMessage} onChange={e => setComplaintMessage(e.target.value)} rows={4}
                      className="input h-28 resize-none" placeholder="Explain the issue and why you want admin support." />
                  </div>
                  <button onClick={handleSubmitComplaint} disabled={complaintLoading}
                    className="bg-rose-600 w-full rounded-2xl py-3.5 text-sm font-bold text-white transition hover:bg-rose-700">
                    {complaintLoading ? 'Sending complaint...' : 'Submit Complaint'}
                  </button>
                </div>
              </div>

              <p className="mt-4 text-center text-[10px] text-slate-400">Free cancellation within 48 hours of booking</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
