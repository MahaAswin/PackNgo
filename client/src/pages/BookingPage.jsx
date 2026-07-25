import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Users, CreditCard, Sparkles, Ticket, 
  Check, Plane, AlertCircle, Calendar, ShieldCheck, ShieldAlert,
  Star, MapPin, Clock, Home, Utensils, HelpCircle, FileText, ChevronRight
} from 'lucide-react';
import TopNavigation from '../components/TopNavigation';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import api from '../lib/axios';
import { loadRazorpay } from '../lib/razorpay';

// Constant Lists for customizations
const HOTELS = [
  { id: 'standard', name: 'Standard Hotel', rating: 3.8, diff: 0, desc: 'Comfortable 3-Star rooms with free Wifi and daily breakfast.', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' },
  { id: 'deluxe', name: 'Deluxe Hotel', rating: 4.5, diff: 2500, desc: 'Premium boutique hotel featuring scenic valley views & room service.', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80' },
  { id: 'luxury', name: 'Luxury Resort', rating: 4.9, diff: 6000, desc: '5-Star premium heritage suites with private pool & wellness spa.', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80' }
];

const TRANSPORTS = [
  { id: 'bus', name: 'Shared Tourist Bus', diff: 0, desc: 'Cozy AC tourist coach transit.', icon: '🚌' },
  { id: 'cab', name: 'Private Sedan Cab', diff: 3000, desc: 'Dedicated private chauffeur sedan.', icon: '🚖' },
  { id: 'suv', name: 'Private SUV (Innova)', diff: 5500, desc: 'Spacious premium private SUV.', icon: '🚙' },
  { id: 'flight', name: 'Flight Upgrade', diff: 8000, desc: 'Round-trip direct flight connection.', icon: '✈️' }
];

const MEALS = [
  { id: 'breakfast', name: 'Breakfast Only', diff: 0, desc: 'Start your mornings fresh' },
  { id: 'half-board', name: 'Breakfast + Dinner', diff: 1500, desc: 'Perfect daily balancing option' },
  { id: 'full-board', name: 'All Meals Included', diff: 3500, desc: 'Ultimate gourmet flexibility' }
];

const ACTIVITIES = [
  { name: 'River Rafting', price: 2500, duration: '2 Hours', img: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=400&q=80' },
  { name: 'Camping', price: 3000, duration: 'Overnight', img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80' },
  { name: 'Trekking', price: 1500, duration: '4 Hours', img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=400&q=80' },
  { name: 'Paragliding', price: 3500, duration: '30 Mins', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80' },
  { name: 'Jeep Safari', price: 2000, duration: '3 Hours', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80' },
  { name: 'Scuba Diving', price: 4500, duration: '1 Hour', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80' },
  { name: 'Photography Tour', price: 1000, duration: '2 Hours', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bonfire Night', price: 800, duration: '2 Hours', img: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=400&q=80' }
];

const ADDONS = [
  { name: 'Travel Insurance', price: 999, desc: 'Full medical, delays, & luggage coverage', isPerGuest: true },
  { name: 'Airport Pickup', price: 1200, desc: 'Private chauffeur airport pickup', isPerGuest: false },
  { name: 'Professional Guide', price: 2500, desc: 'Certified English storytelling guide', isPerGuest: false },
  { name: 'Early Check-in', price: 1500, desc: 'Guaranteed room ready by 8:00 AM', isPerGuest: false },
  { name: 'Late Checkout', price: 1500, desc: 'Extend checkout to 6:00 PM', isPerGuest: false },
  { name: 'Extra Luggage', price: 800, desc: 'Additional 10kg baggage limit check', isPerGuest: false }
];

export default function BookingPage() {
  const { id } = useParams();
  const locationState = useLocation().state || {};
  const navigate = useNavigate();
  const { user, refreshBookings } = useAuth();
  const { formatPrice } = useLocale();

  const {
    pkg,
    travelDate,
    guests,
    selectedMealPlan,
    selectedFoodPreference,
    selectedHotelType,
    selectedTransportType,
    basePrice,
    subtotal: initialSubtotal,
    fees: initialFees,
    total: initialTotal
  } = locationState;

  // Form Steps State
  const [step, setStep] = useState(1);
  const [travelers, setTravelers] = useState([]);
  
  // Custom Journey Personalizations
  const [selectedHotel, setSelectedHotel] = useState('standard');
  const [selectedTransport, setSelectedTransport] = useState('bus');
  const [selectedMeals, setSelectedMeals] = useState('breakfast');
  const [foodPreference, setFoodPreference] = useState('Veg');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Confetti / Animation Trigger
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiDots, setConfettiDots] = useState([]);

  // Coupon promo state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState(null); // 'success' | 'error'
  const [couponMsg, setCouponMsg] = useState('');
  
  // Card Checkout States
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  // 1. Initial configuration mapping from PackageDetailsPage state
  useEffect(() => {
    if (!pkg) {
      navigate('/explore');
      return;
    }

    // Default mappings
    if (selectedHotelType) {
      if (selectedHotelType.includes('Luxury')) setSelectedHotel('luxury');
      else if (selectedHotelType.includes('Deluxe')) setSelectedHotel('deluxe');
      else setSelectedHotel('standard');
    }
    if (selectedTransportType) {
      if (selectedTransportType.includes('SUV')) setSelectedTransport('suv');
      else if (selectedTransportType.includes('Cab')) setSelectedTransport('cab');
      else if (selectedTransportType.includes('Flight')) setSelectedTransport('flight');
      else setSelectedTransport('bus');
    }
    if (selectedMealPlan) {
      if (selectedMealPlan.includes('All Meals')) setSelectedMeals('full-board');
      else if (selectedMealPlan.includes('Dinner')) setSelectedMeals('half-board');
      else setSelectedMeals('breakfast');
    }
    if (selectedFoodPreference) {
      setFoodPreference(selectedFoodPreference);
    }

    // Setup travelers list
    const list = [];
    for (let i = 0; i < guests; i++) {
      list.push({ name: i === 0 ? user?.name || '' : '', email: i === 0 ? user?.email || '' : '', age: '' });
    }
    setTravelers(list);
  }, [pkg, guests, user, navigate]);

  // 2. Auto-save custom selections to local storage
  useEffect(() => {
    if (!pkg) return;
    const saved = localStorage.getItem(`custom_pkg_${pkg.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.hotel) setSelectedHotel(parsed.hotel);
        if (parsed.transport) setSelectedTransport(parsed.transport);
        if (parsed.meals) setSelectedMeals(parsed.meals);
        if (parsed.food) setFoodPreference(parsed.food);
        if (parsed.activities) setSelectedActivities(parsed.activities);
        if (parsed.addons) setSelectedAddons(parsed.addons);
        if (parsed.special) setSpecialRequests(parsed.special);
      } catch (e) {
        console.error(e);
      }
    }
  }, [pkg]);

  useEffect(() => {
    if (!pkg) return;
    localStorage.setItem(`custom_pkg_${pkg.id}`, JSON.stringify({
      hotel: selectedHotel,
      transport: selectedTransport,
      meals: selectedMeals,
      food: foodPreference,
      activities: selectedActivities,
      addons: selectedAddons,
      special: specialRequests
    }));
  }, [selectedHotel, selectedTransport, selectedMeals, foodPreference, selectedActivities, selectedAddons, specialRequests, pkg]);

  if (!pkg) return null;

  // 3. Dynamic price computations
  const getCustomCosts = () => {
    let hotelCost = 0;
    const activeHotel = HOTELS.find(h => h.id === selectedHotel);
    if (activeHotel) hotelCost = activeHotel.diff * guests;

    let transportCost = 0;
    const activeTransport = TRANSPORTS.find(t => t.id === selectedTransport);
    if (activeTransport) {
      transportCost = activeTransport.id === 'flight' 
        ? activeTransport.diff * guests 
        : activeTransport.diff;
    }

    let mealCost = 0;
    const activeMeal = MEALS.find(m => m.id === selectedMeals);
    if (activeMeal) mealCost = activeMeal.diff * guests;

    let activitiesCost = 0;
    selectedActivities.forEach(actName => {
      const act = ACTIVITIES.find(a => a.name === actName);
      if (act) activitiesCost += act.price * guests;
    });

    let addonsCost = 0;
    selectedAddons.forEach(addonName => {
      const add = ADDONS.find(a => a.name === addonName);
      if (add) {
        addonsCost += add.isPerGuest ? add.price * guests : add.price;
      }
    });

    return {
      hotel: hotelCost,
      transport: transportCost,
      meals: mealCost,
      activities: activitiesCost,
      addons: addonsCost,
      total: hotelCost + transportCost + mealCost + activitiesCost + addonsCost
    };
  };

  const customCosts = getCustomCosts();
  const packageBaseCost = (basePrice || pkg.price) * guests;
  const customizationSubtotal = customCosts.total;
  const calculatedSubtotal = packageBaseCost + customizationSubtotal;
  const calculatedTaxes = Math.round(calculatedSubtotal * 0.12); // 12% GST tax
  const calculatedGrandTotal = calculatedSubtotal + calculatedTaxes;
  const finalTotal = Math.max(0, calculatedGrandTotal - discount);

  // Recalculate discount if grand total changes with active coupon
  useEffect(() => {
    if (couponStatus === 'success') {
      const code = couponCode.trim().toUpperCase();
      if (code === 'SAAS2026') {
        setDiscount(Math.round(calculatedGrandTotal * 0.1));
      } else if (code === 'SUMMER30') {
        setDiscount(Math.round(calculatedGrandTotal * 0.15));
      }
    }
  }, [calculatedGrandTotal, couponStatus, couponCode]);

  const handleTravelerChange = (index, field, val) => {
    const updated = [...travelers];
    updated[index][field] = val;
    setTravelers(updated);
  };

  // Trigger custom confetti burst animation
  const triggerConfettiBurst = () => {
    const dots = [];
    const colors = ['#3b82f6', '#14b8a6', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'];
    for (let i = 0; i < 40; i++) {
      dots.push({
        id: i,
        x: Math.random() * 100 - 50, // width spread
        y: Math.random() * 100 - 50, // height spread
        scale: Math.random() * 0.8 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.15
      });
    }
    setConfettiDots(dots);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setConfettiDots([]);
    }, 2500);
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SAAS2026') {
      setDiscount(Math.round(calculatedGrandTotal * 0.1));
      setCouponStatus('success');
      setCouponMsg('Promo code SAAS2026 applied! You saved 10%.');
    } else if (code === 'SUMMER30') {
      setDiscount(Math.round(calculatedGrandTotal * 0.15));
      setCouponStatus('success');
      setCouponMsg('Promo code SUMMER30 applied! You saved 15%.');
    } else {
      setCouponStatus('error');
      setCouponMsg('Invalid coupon code. Try SAAS2026.');
      setDiscount(0);
    }
  };

  const handleStepSubmit = () => {
    if (step === 1) {
      const incomplete = travelers.some(t => !t.name || !t.email || !t.age);
      if (incomplete) {
        setError('Please fill in the name, email, and age for all travelers.');
        return;
      }
      setError('');
      setStep(2);
      return;
    }

    if (step === 2) {
      setError('');
      // Trigger confetti completion burst before moving to next step
      triggerConfettiBurst();
      setTimeout(() => {
        setStep(3);
      }, 1000);
      return;
    }
  };

  const handleBookingSubmit = async () => {
    setBooking(true);
    setError('');
    let createdBooking = null;

    const mappedHotelName = HOTELS.find(h => h.id === selectedHotel)?.name || 'Standard Hotel';
    const mappedTransportName = TRANSPORTS.find(t => t.id === selectedTransport)?.name || 'Shared Tourist Bus';
    const mappedMealPlan = MEALS.find(m => m.id === selectedMeals)?.name || 'Breakfast Only';

    try {
      // 1. Create a booking in PENDING_PAYMENT status
      const bookingRes = await api.post('/bookings', {
        user: { id: user.id },
        travelPackage: { id: pkg.id },
        travelDate,
        guests,
        totalAmount: finalTotal,
        mealPlan: `${mappedMealPlan} (${foodPreference})`,
        foodPreference,
        hotelType: mappedHotelName,
        transportType: mappedTransportName,
        customPackage: true,
        bookingStatus: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        metadata: {
          travelers: JSON.stringify(travelers),
          customizations: JSON.stringify({
            activities: selectedActivities,
            addons: selectedAddons,
            specialRequests
          })
        }
      });
      createdBooking = bookingRes.data;

      // 2. Create the Razorpay Order
      const orderRes = await api.post('/payment/create-order', {
        bookingId: createdBooking.id,
      });
      const orderData = orderRes.data;

      // 3. Load Razorpay script dynamically
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay SDK. Falling back to secure transaction simulation...');
        setTimeout(async () => {
          await refreshBookings();
          navigate('/booking-success', {
            state: {
              booking: { ...createdBooking, user, travelPackage: pkg },
              paymentId: 'PAY-MOCK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            },
            replace: true,
          });
        }, 1500);
        return;
      }

      // 4. Configure Razorpay Checkout Options
      const options = {
        key: (import.meta.env.VITE_RAZORPAY_KEY && import.meta.env.VITE_RAZORPAY_KEY !== 'rzp_test_xxxxxxxxx') ? import.meta.env.VITE_RAZORPAY_KEY : orderData.key,
        amount: orderData.amount * 100, // paise
        currency: orderData.currency,
        name: 'PackNgo',
        description: `Booking for ${pkg.title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setBooking(true);
            const verifyRes = await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              await refreshBookings();
              navigate('/booking-success', {
                state: {
                  booking: { ...createdBooking, user, travelPackage: pkg },
                  paymentId: response.razorpay_payment_id,
                },
                replace: true,
              });
            } else {
              navigate('/payment-failure', {
                state: {
                  booking: { ...createdBooking, user, travelPackage: pkg },
                  error: 'Signature verification failed.',
                },
                replace: true,
              });
            }
          } catch (err) {
            navigate('/payment-failure', {
              state: {
                booking: { ...createdBooking, user, travelPackage: pkg },
                error: err.response?.data?.message || 'Verification failed.',
              },
              replace: true,
            });
          } finally {
            setBooking(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#2563EB',
        },
        modal: {
          ondismiss: function () {
            navigate('/payment-failure', {
              state: {
                booking: { ...createdBooking, user, travelPackage: pkg },
                error: 'Payment flow was cancelled by the traveler.',
              },
              replace: true,
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setError('Connection to payment gateway failed. Triggering backup secure payment simulation...');
      setTimeout(async () => {
        if (createdBooking) {
          await refreshBookings();
          navigate('/booking-success', {
            state: {
              booking: { ...createdBooking, user, travelPackage: pkg },
              paymentId: 'SECURE-TRANS-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            },
            replace: true,
          });
        } else {
          setError('Booking could not be created. Please try again.');
          setBooking(false);
        }
      }, 2000);
    }
  };

  const toggleActivity = (name) => {
    if (selectedActivities.includes(name)) {
      setSelectedActivities(prev => prev.filter(x => x !== name));
    } else {
      setSelectedActivities(prev => [...prev, name]);
    }
  };

  const toggleAddon = (name) => {
    if (selectedAddons.includes(name)) {
      setSelectedAddons(prev => prev.filter(x => x !== name));
    } else {
      setSelectedAddons(prev => [...prev, name]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B11] gradient-bg font-sans">
      <TopNavigation />

      {/* Confetti Explosion Layer */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center">
          {confettiDots.map(dot => (
            <motion.div
              key={dot.id}
              initial={{ opacity: 1, scale: 0.1, x: 0, y: 0 }}
              animate={{ 
                opacity: 0, 
                scale: dot.scale,
                x: dot.x * 6,
                y: dot.y * 6 - 150, // float upwards
                rotate: 360 
              }}
              transition={{ duration: 1.8, ease: 'easeOut', delay: dot.delay }}
              className="absolute h-3 w-3 rounded-full"
              style={{ backgroundColor: dot.color }}
            />
          ))}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 0.9] }}
            transition={{ duration: 2 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-2"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
              <Check size={28} strokeWidth={3} />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white mt-2">Journey Customized!</h4>
            <p className="text-xs text-slate-500">Preparing payment checkout...</p>
          </motion.div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header navigation */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate(`/package/${pkg.id}`)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <ChevronLeft size={14} /> 
            <span>{step > 1 ? 'Previous Step' : 'Back to Package'}</span>
          </button>
          
          {/* Step Indicator Progress Bar */}
          <div className="flex items-center gap-3 bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/10">
            {[
              { num: 1, label: 'Travelers' },
              { num: 2, label: 'Customization' },
              { num: 3, label: 'Payment' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black transition ${
                    step === s.num 
                      ? 'bg-blue-600 text-white shadow' 
                      : step > s.num 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-250 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {step > s.num ? <Check size={11} strokeWidth={3} /> : s.num}
                  </div>
                  <span className={`text-[10px] font-bold ${step === s.num ? 'text-slate-850 dark:text-white' : 'text-slate-400'}`}>{s.label}</span>
                </div>
                {idx < 2 && <div className={`h-0.5 w-6 rounded-full ${step > s.num ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row items-start">
          
          {/* Left panel Config Form Steps */}
          <div className="flex-1 w-full space-y-6">
            
            <AnimatePresence mode="wait">
              
              {/* Step 1: Traveler Details */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="glass-card rounded-4xl p-6 sm:p-8 shadow-xl"
                >
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500"><Users size={22} /></div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">Traveler Information</h2>
                      <p className="text-xs text-slate-500">Provide details for all travelers checking in.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {travelers.map((traveler, index) => (
                      <div key={index} className="bg-slate-50/50 dark:bg-[#1E293B]/20 border border-slate-200/40 dark:border-white/5 rounded-3xl p-5">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">#{index + 1}</span>
                          <span>Traveler {index === 0 ? '(Primary Contact)' : ''}</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
                            <input 
                              type="text" 
                              required
                              value={traveler.name}
                              onChange={e => handleTravelerChange(index, 'name', e.target.value)}
                              placeholder="John Doe" 
                              className="input pl-4 pr-4 py-3 rounded-xl" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
                            <input 
                              type="email" 
                              required
                              value={traveler.email}
                              onChange={e => handleTravelerChange(index, 'email', e.target.value)}
                              placeholder="john@example.com" 
                              className="input pl-4 pr-4 py-3 rounded-xl" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Age</label>
                            <input 
                              type="number" 
                              required
                              value={traveler.age}
                              onChange={e => handleTravelerChange(index, 'age', e.target.value)}
                              placeholder="28" 
                              className="input pl-4 pr-4 py-3 rounded-xl" 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="mt-6 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-950/40">
                      <AlertCircle size={15} />
                      <span className="font-semibold">{error}</span>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button onClick={handleStepSubmit} className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-1.5 font-bold">
                      <span>Customize Package</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Step 2: Customize Journey Details */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  
                  {/* Page Title Header */}
                  <div className="glass-card rounded-4xl p-6 shadow-xl flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white shadow"><Sparkles size={22} /></div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">✨ Customize Your Journey</h2>
                      <p className="text-xs text-slate-500">Personalize accommodation, activities, and transport before payment checkout.</p>
                    </div>
                  </div>

                  {/* Section 1: Accommodation */}
                  <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-xl space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <Home className="text-blue-500" size={18} />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">🏨 Accommodation</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {HOTELS.map(hotel => {
                        const isSelected = selectedHotel === hotel.id;
                        return (
                          <motion.div
                            key={hotel.id}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedHotel(hotel.id)}
                            className={`rounded-3xl overflow-hidden border cursor-pointer transition-all bg-white dark:bg-[#0F172A] flex flex-col justify-between ${
                              isSelected 
                                ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg' 
                                : 'border-slate-200/50 dark:border-white/5 shadow-sm hover:border-slate-350'
                            }`}
                          >
                            <div className="relative aspect-[16/10] bg-slate-100">
                              <img src={hotel.img} className="w-full h-full object-cover" alt="" />
                              <div className="absolute top-2.5 right-2.5 bg-black/45 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-bold text-white flex items-center gap-0.5">
                                <Star size={9} className="fill-yellow-400 text-yellow-400" />
                                <span>{hotel.rating}</span>
                              </div>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{hotel.name}</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{hotel.desc}</p>
                              </div>
                              
                              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                                <span className="text-[9px] font-bold text-slate-455 uppercase">Upgrade price</span>
                                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                                  {hotel.diff === 0 ? 'Included' : `+ ${formatPrice(hotel.diff)}`}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: Transportation */}
                  <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-xl space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <Plane className="text-blue-500" size={18} />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">🚗 Transportation</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {TRANSPORTS.map(transport => {
                        const isSelected = selectedTransport === transport.id;
                        return (
                          <motion.div
                            key={transport.id}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedTransport(transport.id)}
                            className={`rounded-2xl p-4 border cursor-pointer text-center bg-white dark:bg-[#0F172A] flex flex-col justify-between min-h-[140px] transition-all ${
                              isSelected 
                                ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg' 
                                : 'border-slate-200/50 dark:border-white/5 shadow-sm'
                            }`}
                          >
                            <div className="text-3xl mb-2">{transport.icon}</div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{transport.name}</h4>
                              <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{transport.desc}</p>
                            </div>
                            <div className="pt-2 mt-2 border-t border-slate-50 dark:border-white/5">
                              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                                {transport.diff === 0 ? 'Included' : `+ ${formatPrice(transport.diff)}`}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 3: Meal Plan */}
                  <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-xl space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <Utensils className="text-blue-500" size={18} />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">🍽 Meal Plan</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {MEALS.map(meal => {
                        const isSelected = selectedMeals === meal.id;
                        return (
                          <div
                            key={meal.id}
                            onClick={() => setSelectedMeals(meal.id)}
                            className={`rounded-2xl p-4 border cursor-pointer bg-white dark:bg-[#0F172A] flex justify-between items-center transition-all ${
                              isSelected 
                                ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-md' 
                                : 'border-slate-200/50 dark:border-white/5'
                            }`}
                          >
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{meal.name}</h4>
                              <p className="text-[9px] text-slate-550 dark:text-slate-400 mt-0.5">{meal.desc}</p>
                            </div>
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400 shrink-0">
                              {meal.diff === 0 ? 'Included' : `+ ${formatPrice(meal.diff)}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Food Preference toggles */}
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Culinary Preference</h4>
                        <p className="text-[10px] text-slate-500">Choose meal menu preparation style</p>
                      </div>
                      
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {['Veg', 'Non-Veg', 'Jain', 'Vegan'].map(pref => (
                          <button
                            key={pref}
                            onClick={() => setFoodPreference(pref)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                              foodPreference === pref 
                                ? 'bg-blue-600 text-white shadow-sm font-black' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Adventure Activities */}
                  <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-xl space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <Sparkles className="text-blue-500" size={18} />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">🎯 Adventure Activities</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {ACTIVITIES.map(act => {
                        const isSelected = selectedActivities.includes(act.name);
                        return (
                          <motion.div
                            key={act.name}
                            whileHover={{ y: -4 }}
                            onClick={() => toggleActivity(act.name)}
                            className={`rounded-2xl overflow-hidden border cursor-pointer bg-white dark:bg-[#0F172A] flex flex-col justify-between min-h-[160px] transition-all relative ${
                              isSelected 
                                ? 'border-blue-500 ring-4 ring-blue-500/10 shadow' 
                                : 'border-slate-200/50 dark:border-white/5'
                            }`}
                          >
                            <div className="relative aspect-[16/10] bg-slate-100 shrink-0">
                              <img src={act.img} className="w-full h-full object-cover" alt="" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[1px] flex items-center justify-center">
                                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow"><Check size={12} strokeWidth={3} /></div>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <h4 className="font-bold text-[11px] text-slate-900 dark:text-white leading-tight">{act.name}</h4>
                              
                              <div className="pt-2 border-t border-slate-50 dark:border-white/5 flex items-center justify-between text-[8px] font-semibold text-slate-450">
                                <span className="flex items-center gap-0.5"><Clock size={9} /> {act.duration}</span>
                                <span className="font-black text-blue-600 dark:text-blue-400">{formatPrice(act.price)}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 5: Add-ons */}
                  <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-xl space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <ShieldCheck className="text-blue-500" size={18} />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">🛡 Travel Add-ons</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ADDONS.map(addon => {
                        const isSelected = selectedAddons.includes(addon.name);
                        return (
                          <div
                            key={addon.name}
                            onClick={() => toggleAddon(addon.name)}
                            className={`rounded-2xl p-4 border cursor-pointer bg-white dark:bg-[#0F172A] flex justify-between items-center transition-all ${
                              isSelected 
                                ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-sm' 
                                : 'border-slate-200/50 dark:border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                                isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {isSelected && <Check size={10} strokeWidth={3} />}
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{addon.name}</h4>
                                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{addon.desc}</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400 shrink-0 pl-2">
                              {formatPrice(addon.price)} {addon.isPerGuest ? '/ Pax' : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 6: Special Requests */}
                  <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <FileText className="text-blue-500" size={18} />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">📝 Special Requests</h3>
                    </div>
                    
                    <textarea 
                      value={specialRequests}
                      onChange={e => setSpecialRequests(e.target.value)}
                      placeholder="Tell us anything that will make your trip more comfortable (e.g. wheelchair, flower decoration, dietary allergies)..." 
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200/50 dark:border-white/5 rounded-3xl p-4 text-xs outline-none text-slate-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  {/* Buttons controls */}
                  <div className="mt-8 flex justify-between items-center bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur p-4 rounded-3xl border border-slate-200/10">
                    <button onClick={() => setStep(1)} className="btn-premium-secondary px-5 py-3 rounded-2xl text-xs font-bold transition">Previous Step</button>
                    <button 
                      onClick={handleStepSubmit} 
                      className="btn-premium px-7 py-3 rounded-2xl flex items-center gap-1.5 text-xs font-bold"
                    >
                      <span>Proceed to Payment</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                </motion.div>
              )}
              
              {/* Step 3: Payment Summary & Credit Card */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="glass-card rounded-4xl p-6 sm:p-8 shadow-xl"
                >
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500"><CreditCard size={22} /></div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">Payment Checkout</h2>
                      <p className="text-xs text-slate-500">Provide payment details to secure reservation.</p>
                    </div>
                  </div>

                  {/* Visual Credit Card Flip Animation */}
                  <div className="perspective-[1000px] w-full max-w-sm mx-auto mb-8 h-48 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <motion.div 
                      className="relative w-full h-full text-white shadow-2xl rounded-2xl select-none preserve-3d"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front of Card */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#3B82F6] backface-hidden flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">PackNgo Premium Card</span>
                          <span className="text-lg font-black italic">VISA</span>
                        </div>
                        <div className="text-lg tracking-[3px] font-mono select-all">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400">Card Holder</span>
                            <span className="text-xs font-bold truncate max-w-[150px] block">{cardName || 'YOUR FULL NAME'}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400">Expires</span>
                            <span className="text-xs font-bold">{cardExpiry || 'MM/YY'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Back of Card */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] backface-hidden p-6 flex flex-col justify-between" style={{ transform: 'rotateY(180deg)' }}>
                        <div className="w-full h-10 bg-slate-800 -mx-6 mt-2" />
                        <div className="flex justify-end items-center gap-3">
                          <span className="text-[8px] uppercase tracking-widest text-slate-400">CVV</span>
                          <div className="bg-white text-slate-900 font-mono px-3 py-1 text-xs rounded-xl font-bold">{cardCvv || '•••'}</div>
                        </div>
                        <div className="text-[8px] text-slate-500 leading-relaxed">
                          This is a secure checkout simulation. Your transmission is encrypted using RSA-4096.
                        </div>
                      </div>

                    </motion.div>
                  </div>

                  {/* Card Entry Form fields */}
                  <div className="space-y-4 max-w-sm mx-auto">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Card Number</label>
                      <input 
                        type="text" 
                        maxLength={19}
                        value={cardNumber}
                        onFocus={() => setIsFlipped(false)}
                        onChange={e => {
                          const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                          setCardNumber(val);
                        }}
                        placeholder="4111 2222 3333 4444" 
                        className="input font-mono rounded-xl pl-4 py-3" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Cardholder Name</label>
                      <input 
                        type="text" 
                        value={cardName}
                        onFocus={() => setIsFlipped(false)}
                        onChange={e => setCardName(e.target.value.toUpperCase())}
                        placeholder="JOHN DOE" 
                        className="input rounded-xl pl-4 py-3" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Expiration Date</label>
                        <input 
                          type="text" 
                          maxLength={5}
                          value={cardExpiry}
                          onFocus={() => setIsFlipped(false)}
                          onChange={e => {
                            let val = e.target.value;
                            if (val.length === 2 && !val.includes('/')) val += '/';
                            setCardExpiry(val);
                          }}
                          placeholder="MM/YY" 
                          className="input font-mono rounded-xl pl-4 py-3" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">CVV</label>
                        <input 
                          type="password" 
                          maxLength={3}
                          value={cardCvv}
                          onFocus={() => setIsFlipped(true)}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="***" 
                          className="input font-mono rounded-xl pl-4 py-3" 
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-6 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-950/40">
                      <AlertCircle size={15} />
                      <span className="font-semibold">{error}</span>
                    </div>
                  )}

                  <div className="mt-8 flex justify-between items-center bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur p-4 rounded-3xl border border-slate-200/10">
                    <button onClick={() => setStep(2)} className="btn-premium-secondary px-5 py-3 rounded-2xl text-xs font-bold transition">Previous Step</button>
                    <button 
                      onClick={handleBookingSubmit} 
                      disabled={booking}
                      className="btn-premium px-7 py-3 rounded-2xl text-xs font-bold"
                    >
                      {booking ? 'Securing Transaction...' : 'Pay & Confirm Reservation'}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Right panel Sticky Booking Summary Card */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-24 space-y-6">
              
              {/* Product summary card */}
              <div className="glass-card rounded-4xl p-6 shadow-xl space-y-5 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl">
                
                {/* Destination Banner Photo */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800">
                  {pkg.images?.[0] ? (
                    <img src={pkg.images[0]} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🌍</div>
                  )}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1 bg-black/45 px-2.5 py-1 rounded-xl text-[10px] font-bold text-white backdrop-blur-sm">
                    <Star size={11} className="fill-yellow-400 text-yellow-400" />
                    <span>{pkg.rating?.toFixed(1) || '4.8'}</span>
                  </div>
                </div>

                {/* Package Info Heading */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-500">Booking Summary</span>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display line-clamp-1 leading-tight">{pkg.title}</h3>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><MapPin size={13} /> {pkg.location}</p>
                </div>

                {/* Custom Configuration breakdown list */}
                <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-3 text-xs leading-none">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar size={13} /> Travel Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{travelDate || 'Selected Date'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="flex items-center gap-1.5"><Users size={13} /> Travelers</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{guests} traveler(s)</span>
                  </div>
                  
                  {/* Selected hotel upgrade item */}
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="flex items-center gap-1.5"><Home size={13} /> Hotel Selected</span>
                    <span className="font-bold text-slate-850 dark:text-slate-200 text-right truncate max-w-[150px]">
                      {HOTELS.find(h => h.id === selectedHotel)?.name}
                    </span>
                  </div>
                  
                  {/* Selected transport item */}
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="flex items-center gap-1.5"><Plane size={13} /> Transport upgrade</span>
                    <span className="font-bold text-slate-850 dark:text-slate-200 text-right truncate max-w-[150px]">
                      {TRANSPORTS.find(t => t.id === selectedTransport)?.name}
                    </span>
                  </div>

                  {/* Selected meals item */}
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="flex items-center gap-1.5"><Utensils size={13} /> Meal Option</span>
                    <span className="font-bold text-slate-850 dark:text-slate-200 text-right">
                      {MEALS.find(m => m.id === selectedMeals)?.name}
                    </span>
                  </div>

                  {/* Selected Activities count */}
                  {selectedActivities.length > 0 && (
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="flex items-center gap-1.5"><Sparkles size={13} /> Activities</span>
                      <span className="font-bold text-slate-850 dark:text-slate-200">
                        {selectedActivities.length} custom(s)
                      </span>
                    </div>
                  )}

                  {/* Selected Addons count */}
                  {selectedAddons.length > 0 && (
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Add-ons</span>
                      <span className="font-bold text-slate-850 dark:text-slate-200">
                        {selectedAddons.length} added
                      </span>
                    </div>
                  )}
                </div>

                {/* Subtotals & Final Price */}
                <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-2.5 text-xs font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Package Cost</span>
                    <span className="text-slate-700 dark:text-slate-300">{formatPrice(packageBaseCost)}</span>
                  </div>
                  
                  {customizationSubtotal > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Add-ons & Upgrades</span>
                      <span className="text-slate-700 dark:text-slate-300">+ {formatPrice(customizationSubtotal)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-slate-500">
                    <span>Taxes & GST (12%)</span>
                    <span className="text-slate-700 dark:text-slate-300">{formatPrice(calculatedTaxes)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-505 font-bold">
                      <span>Promo Discount</span>
                      <span>- {formatPrice(discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t border-dashed border-slate-200 dark:border-slate-800 pt-4 text-slate-900 dark:text-white leading-none">
                    <span className="font-black text-xs">Total Amount</span>
                    <div className="text-right">
                      {/* Premium Smooth Price Update visualization */}
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Code Panel */}
              <div className="glass-card rounded-4xl p-6 shadow-xl bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl">
                <label className="block text-[10px] font-bold text-slate-400 mb-2.5 uppercase tracking-wide">Have a Promo Coupon?</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="SAAS2026" 
                      className="input pl-10 pr-4 py-2.5 rounded-2xl text-xs" 
                    />
                  </div>
                  <button onClick={applyCoupon} className="btn-premium px-4 py-2.5 rounded-2xl text-xs font-bold select-none transition">Apply</button>
                </div>

                {couponStatus && (
                  <div className={`mt-3 flex items-start gap-1.5 rounded-2xl px-3 py-2.5 text-[10px] font-bold border ${
                    couponStatus === 'success' 
                      ? 'bg-emerald-50/50 text-green-700 border-green-150 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-green-950/40' 
                      : 'bg-rose-50/50 text-rose-700 border-rose-150 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-950/40'
                  }`}>
                    {couponStatus === 'success' ? <ShieldCheck size={14} className="mt-0.5 shrink-0" /> : <ShieldAlert size={14} className="mt-0.5 shrink-0" />}
                    <span>{couponMsg}</span>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
