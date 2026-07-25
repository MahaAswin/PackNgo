import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, Sparkles, Plus, Trash2, Image, MapPin, 
  Clock, Star, Eye, Send, BarChart2, Lightbulb, Compass,
  CheckCircle, PlusCircle, Check, Info, FileText, HelpCircle,
  ShieldAlert, Settings, Map, Layout, ArrowRight, Home, Utensils, Plane
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

const STEPS = [
  { num: 1, label: 'Basic Info' },
  { num: 2, label: 'Images' },
  { num: 3, label: 'Lodging' },
  { num: 4, label: 'Transport' },
  { num: 5, label: 'Meals' },
  { num: 6, label: 'Activities' },
  { num: 7, label: 'Itinerary' },
  { num: 8, label: 'Pricing' },
  { num: 9, label: 'Policies' },
  { num: 10, label: 'Publish' }
];

export default function AddPackagePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Active steps Wizard state
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('preview'); // 'preview' | 'ai'

  useEffect(() => {
    if (user && user.packagerStatus?.toLowerCase() !== 'approved') {
      navigate('/packager');
    }
  }, [user, navigate]);

  // STEP 1: Basic Info States
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('Adventure');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [status, setStatus] = useState('ACTIVE'); // ACTIVE, FEATURED, DRAFT
  const [durationDays, setDurationDays] = useState(5);
  const [durationNights, setDurationNights] = useState(4);

  // STEP 2: Images States
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');
  const [galleryImages, setGalleryImages] = useState([
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80'
  ]);
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80');
  const [coverVideo, setCoverVideo] = useState('');
  
  // Drag & drop mockup states
  const [isDragOver, setIsDragOver] = useState(false);

  // STEP 3: Accommodation States
  const [hotels, setHotels] = useState([
    {
      name: 'Luxury Beach Resort',
      rating: 5,
      location: 'Beachfront Road',
      amenities: 'Infinity Pool, Private Spa, Beach Lounge, Gym',
      roomTypes: 'Ocean Suite, Garden Villa',
      checkIn: '14:00',
      checkOut: '11:00',
      desc: 'Beautiful premium shoreline suites with private decks.',
      img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'
    }
  ]);

  // STEP 4: Transportation States
  const [transports, setTransports] = useState({
    bus: true,
    cab: false,
    suv: true,
    coach: false,
    flight: false,
    train: false,
    pickupIncluded: true,
    dropIncluded: true,
    pickupLocation: 'Main Airport Terminal 1',
    pickupTime: '10:00 AM',
    vehicleImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80'
  });

  // STEP 5: Meals States
  const [meals, setMeals] = useState({
    breakfast: true,
    lunch: false,
    dinner: true,
    allMeals: false,
    veg: true,
    nonVeg: true,
    vegan: false,
    jain: false,
    halal: false,
    specialNotes: 'Buffet details are available daily at the resort lobby restaurant.',
    restaurantImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80'
  });

  // STEP 6: Activities States
  const [activities, setActivities] = useState([
    { name: 'River Rafting', desc: 'Whitewater speed rafting along the currents.', duration: '2 Hours', price: 2500, difficulty: 'Moderate', ageLimit: '12+', slot: 'Morning' },
    { name: 'Sunset Cruise', desc: 'Evening catamaran yacht cruise with local music.', duration: '3 Hours', price: 2000, difficulty: 'Easy', ageLimit: 'All Ages', slot: 'Evening' }
  ]);

  // STEP 7: Day-by-Day Itinerary States
  const [itinerary, setItinerary] = useState([
    { day: 1, title: 'Arrival & Welcome Drinks', morning: 'Airport pickup & hotel check-in', afternoon: 'Relax by the infinity pool', evening: 'Welcome sunset dinner', night: 'Leisure resort walk', location: 'Resort Beachfront' },
    { day: 2, title: 'Scenic Sightseeing', morning: 'Bilingual historical walk', afternoon: 'Visit local monuments & view points', evening: 'Local bistro cuisine tasting', night: 'Traditional market shopping', location: 'City Center' }
  ]);

  // STEP 8: Pricing States
  const [basePrice, setBasePrice] = useState(12999);
  const [offerPrice, setOfferPrice] = useState(9999);
  const [discountPercent, setDiscountPercent] = useState(23);
  const [taxesPercent, setTaxesPercent] = useState(12);
  const [extraCharges, setExtraCharges] = useState(0);
  const [hotelUpgradeCost, setHotelUpgradeCost] = useState(2500);
  const [transportUpgradeCost, setTransportUpgradeCost] = useState(1500);
  const [activityUpgradeCost, setActivityUpgradeCost] = useState(2000);

  // STEP 9: Policies States
  const [policies, setPolicies] = useState({
    cancellation: 'Cancel up to 48 hours prior to travel date for a 100% refund.',
    refund: 'Processed within 5-7 business days to primary card.',
    child: 'Children below 5 years are complimentary. 5-12 years pay 50%.',
    terms: 'Booking requires valid government identity proof.',
    requirements: 'Carry sunscreen, light walking shoes, and swimming gear.',
    inclusions: 'Resort lodging, Airport SUV transfers, Buffet Breakfasts, Entry tokens.',
    exclusions: 'Personal laundry, private yacht rentals, lunches, and flight tickets.'
  });

  // Calculate dynamic price values
  const discountAmount = basePrice - offerPrice;
  const taxAmount = Math.round(offerPrice * (taxesPercent / 100));
  const finalPriceCalculated = offerPrice + taxAmount + Number(extraCharges);

  const addHotel = () => {
    setHotels([...hotels, { name: '', rating: 4, location: '', amenities: '', roomTypes: '', checkIn: '12:00', checkOut: '11:00', desc: '', img: '' }]);
  };

  const removeHotel = (idx) => {
    setHotels(hotels.filter((_, i) => i !== idx));
  };

  const updateHotelField = (idx, field, val) => {
    const updated = [...hotels];
    updated[idx][field] = val;
    setHotels(updated);
  };

  const addActivity = () => {
    setActivities([...activities, { name: '', desc: '', duration: '', price: 0, difficulty: 'Easy', ageLimit: '', slot: 'Morning' }]);
  };

  const removeActivity = (idx) => {
    setActivities(activities.filter((_, i) => i !== idx));
  };

  const updateActivityField = (idx, field, val) => {
    const updated = [...activities];
    updated[idx][field] = val;
    setActivities(updated);
  };

  const addItineraryDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([...itinerary, { day: nextDay, title: '', morning: '', afternoon: '', evening: '', night: '', location: '' }]);
  };

  const removeItineraryDay = (idx) => {
    setItinerary(itinerary.filter((_, i) => i !== idx).map((day, i) => ({ ...day, day: i + 1 })));
  };

  const updateItineraryField = (idx, field, val) => {
    const updated = [...itinerary];
    updated[idx][field] = val;
    setItinerary(updated);
  };

  // Mock drag & drop files
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    // Simulating file uploading
    alert('Files uploaded successfully (mock). Image previews updated!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      setError('Trip title and destination name are required.');
      return;
    }
    setLoading(true);
    setError('');

    // Serialize custom dashboard details inside the description field!
    const serializedPayload = JSON.stringify({
      intro: longDesc || shortDesc,
      difficulty,
      city,
      state,
      country,
      hotels,
      transports,
      meals,
      activities,
      itinerary,
      policies,
      pricing: {
        basePrice,
        offerPrice,
        discountPercent,
        taxesPercent,
        extraCharges,
        hotelUpgradeCost,
        transportUpgradeCost,
        activityUpgradeCost
      }
    });

    // Form maps lists
    const mealOptionsList = [];
    if (meals.breakfast) mealOptionsList.push('Breakfast Included');
    if (meals.lunch) mealOptionsList.push('Lunch Included');
    if (meals.dinner) mealOptionsList.push('Dinner Included');
    if (meals.allMeals) mealOptionsList.push('All Meals Included');

    const foodPrefList = [];
    if (meals.veg) foodPrefList.push('Veg');
    if (meals.nonVeg) foodPrefList.push('Non-Veg');
    if (meals.vegan) foodPrefList.push('Vegan');
    if (meals.jain) foodPrefList.push('Jain Food');
    if (meals.halal) foodPrefList.push('Halal Food');

    const hotelTypeOptions = hotels.map(h => `${h.rating}-Star`);
    const transportTypeOptions = [];
    if (transports.bus) transportTypeOptions.push('Shared Coach');
    if (transports.cab) transportTypeOptions.push('Private Cab');
    if (transports.suv) transportTypeOptions.push('Private SUV');
    if (transports.flight) transportTypeOptions.push('Flight');

    try {
      await api.post('/packages', {
        title,
        location,
        durationDays,
        durationNights,
        price: offerPrice,
        imageUrl: heroImage,
        description: serializedPayload, // JSON serialized custom payload
        status,
        mealOptions: mealOptionsList.length > 0 ? mealOptionsList : ['Breakfast Included'],
        foodPreferences: foodPrefList.length > 0 ? foodPrefList : ['Veg'],
        restaurantDetails: meals.specialNotes || '',
        hotelTypes: hotelTypeOptions.length > 0 ? hotelTypeOptions : ['3-Star'],
        transportTypes: transportTypeOptions.length > 0 ? transportTypeOptions : ['Private SUV'],
        customizablePackage: true,
        createdById: user?.id,
        rating: 4.8,
        reviewsCount: 1,
        vendorName: user?.companyName || user?.name || 'Travel Partner',
        verified: user?.packagerStatus === 'approved',
        images: [heroImage, ...galleryImages]
      });

      navigate('/packager');
    } catch (err) {
      console.error(err);
      setError('Could not publish the package. Verify connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B11] flex flex-col font-sans">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-35 flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/80 dark:border-white/5 dark:bg-[#0F172A]/85 backdrop-blur px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/packager" className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-305 transition">
            <ChevronLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">Package Creation Console</h1>
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Vendor Management Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-slate-550 dark:text-slate-350">{user?.companyName || 'Verified Agency Partner'}</span>
        </div>
      </header>

      {/* Main dashboard grid layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        
        {/* LEFT COLUMN: 10-step wizard form */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 min-w-0">
          
          {/* Progress bar track */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/50 dark:border-white/5 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Step {activeStep} of 10</span>
              <span className="text-[10px] font-bold text-slate-400">{STEPS[activeStep - 1].label}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-300"
                style={{ width: `${(activeStep / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Wizard Containers */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/50 dark:border-white/5 rounded-4xl p-6 sm:p-8 shadow-xl">
            
            {/* Step 1: Basic Info */}
            {activeStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Compass className="text-blue-500" size={20} />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Step 1: Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Package Title</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder="e.g. Exotic Maldives Luxury Sunset Escape" 
                      className="input rounded-xl pl-4 py-3 text-xs" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Destination (Location Title)</label>
                    <input 
                      type="text" 
                      value={location} 
                      onChange={e => setLocation(e.target.value)} 
                      placeholder="e.g. Goa, Manali, Maldives" 
                      className="input rounded-xl pl-4 py-3 text-xs" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Country</label>
                    <input 
                      type="text" 
                      value={country} 
                      onChange={e => setCountry(e.target.value)} 
                      placeholder="e.g. India, Maldives" 
                      className="input rounded-xl pl-4 py-3 text-xs" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">State / Region</label>
                    <input 
                      type="text" 
                      value={state} 
                      onChange={e => setState(e.target.value)} 
                      placeholder="e.g. Himachal Pradesh, North Goa" 
                      className="input rounded-xl pl-4 py-3 text-xs" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">City</label>
                    <input 
                      type="text" 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      placeholder="e.g. Manali, Panaji" 
                      className="input rounded-xl pl-4 py-3 text-xs" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Trip Duration</label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} className="input rounded-xl text-center py-3 text-xs" placeholder="Days" />
                      <span className="text-xs text-slate-400 font-bold">D</span>
                      <input type="number" value={durationNights} onChange={e => setDurationNights(Number(e.target.value))} className="input rounded-xl text-center py-3 text-xs" placeholder="Nights" />
                      <span className="text-xs text-slate-400 font-bold">N</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="input rounded-xl py-3 text-xs">
                      {['Adventure', 'Family', 'Couple', 'Luxury', 'Honeymoon', 'Pilgrimage', 'Wildlife'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Difficulty Tier</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {['Easy', 'Moderate', 'Hard'].map(d => (
                        <button key={d} type="button" onClick={() => setDifficulty(d)} className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg transition ${difficulty === d ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>{d}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Publish Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="input rounded-xl py-3 text-xs">
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Published (Active)</option>
                      <option value="FEATURED">Featured Listing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Short Description (Sub-heading)</label>
                  <input type="text" value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="Brief one-line summary displayed on cards..." className="input rounded-xl pl-4 py-3 text-xs" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Detailed Description (Long Markdown Body)</label>
                  <textarea rows={4} value={longDesc} onChange={e => setLongDesc(e.target.value)} placeholder="Full trip overview highlighting experience details, safety, and landscapes..." className="input rounded-xl p-4 text-xs resize-none" />
                </div>
              </div>
            )}

            {/* Step 2: Images & Gallery */}
            {activeStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Image className="text-blue-500" size={20} />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Step 2: Media Gallery Upload</h3>
                </div>

                {/* Drag and Drop Mockup */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-slate-350 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/10 hover:border-slate-400'
                  }`}
                >
                  <UploadCloudIcon className={`mx-auto mb-3 ${isDragOver ? 'text-blue-500 animate-bounce' : 'text-slate-400'}`} size={36} />
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Drag and drop package images or videos here</h4>
                  <p className="text-[10px] text-slate-450 mt-1">Supports JPEG, PNG, MP4. Max file size: 50MB.</p>
                  <button type="button" onClick={() => alert('Opening file browser dialog...')} className="mt-4 btn-premium px-5 py-2 rounded-xl text-[10px] font-bold">Select Files</button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Hero Cover Image URL</label>
                  <input type="text" value={heroImage} onChange={e => setHeroImage(e.target.value)} className="input rounded-xl pl-4 py-3 text-xs" />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Gallery Image URLs</label>
                  {galleryImages.map((img, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        type="text" 
                        value={img} 
                        onChange={e => {
                          const updated = [...galleryImages];
                          updated[i] = e.target.value;
                          setGalleryImages(updated);
                        }} 
                        className="input rounded-xl pl-4 py-2.5 text-xs flex-1" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={() => setGalleryImages([...galleryImages, ''])}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 hover:text-blue-600 transition"
                  >
                    <Plus size={14} /> Add Gallery Image Link
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Card Thumbnail URL</label>
                    <input type="text" value={thumbnail} onChange={e => setThumbnail(e.target.value)} className="input rounded-xl pl-4 py-3 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Teaser Cover Video URL (Optional)</label>
                    <input type="text" value={coverVideo} onChange={e => setCoverVideo(e.target.value)} placeholder="https://youtube.com/..." className="input rounded-xl pl-4 py-3 text-xs" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Lodging/Accommodation */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <Home className="text-blue-500" size={20} />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Step 3: Accommodation Details</h3>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={addHotel}
                    className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-blue-500 hover:text-white transition"
                  >
                    <Plus size={12} /> Add Hotel
                  </button>
                </div>

                {hotels.map((hotel, idx) => (
                  <div key={idx} className="bg-slate-50/50 dark:bg-slate-800/10 border border-slate-200/50 dark:border-white/5 rounded-3xl p-5 space-y-4 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">#{idx+1}</span>
                      {hotels.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeHotel(idx)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Hotel Name</label>
                        <input 
                          type="text" 
                          value={hotel.name} 
                          onChange={e => updateHotelField(idx, 'name', e.target.value)} 
                          placeholder="e.g. Grand Plaza Resort" 
                          className="input rounded-xl pl-4 py-2.5 text-xs" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Star Rating</label>
                        <select value={hotel.rating} onChange={e => updateHotelField(idx, 'rating', Number(e.target.value))} className="input rounded-xl py-2.5 text-xs">
                          {[3, 4, 5].map(stars => (
                            <option key={stars} value={stars}>{stars} Star</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Location Description</label>
                        <input 
                          type="text" 
                          value={hotel.location} 
                          onChange={e => updateHotelField(idx, 'location', e.target.value)} 
                          placeholder="e.g. 500m from Beachfront" 
                          className="input rounded-xl pl-4 py-2.5 text-xs" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Lodging Preview Image Link</label>
                        <input 
                          type="text" 
                          value={hotel.img} 
                          onChange={e => updateHotelField(idx, 'img', e.target.value)} 
                          placeholder="https://" 
                          className="input rounded-xl pl-4 py-2.5 text-xs" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Amenities list (comma-separated)</label>
                      <input 
                        type="text" 
                        value={hotel.amenities} 
                        onChange={e => updateHotelField(idx, 'amenities', e.target.value)} 
                        placeholder="e.g. WiFi, Pool, Room Service, AC" 
                        className="input rounded-xl pl-4 py-2.5 text-xs" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Room Types (comma-separated)</label>
                        <input 
                          type="text" 
                          value={hotel.roomTypes} 
                          onChange={e => updateHotelField(idx, 'roomTypes', e.target.value)} 
                          placeholder="e.g. Ocean Suite, Premium Deluxe" 
                          className="input rounded-xl pl-4 py-2.5 text-xs" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Check-in</label>
                          <input type="text" value={hotel.checkIn} onChange={e => updateHotelField(idx, 'checkIn', e.target.value)} className="input rounded-xl py-2.5 text-center text-xs" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Check-out</label>
                          <input type="text" value={hotel.checkOut} onChange={e => updateHotelField(idx, 'checkOut', e.target.value)} className="input rounded-xl py-2.5 text-center text-xs" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Short Description</label>
                      <textarea rows={2} value={hotel.desc} onChange={e => updateHotelField(idx, 'desc', e.target.value)} className="input rounded-xl p-3 text-xs resize-none" />
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Transportation */}
            {activeStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Plane className="text-blue-500" size={20} />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Step 4: Transportation Options</h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Choose Allowed Transport Modes</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'bus', label: '🚌 Shared Bus' },
                      { key: 'cab', label: '🚖 Private Sedan' },
                      { key: 'suv', label: '🚙 Private SUV' },
                      { key: 'coach', label: '🚎 Luxury Coach' },
                      { key: 'flight', label: '✈️ Flight Upgrade' },
                      { key: 'train', label: '🚂 Train Journey' }
                    ].map(t => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTransports({ ...transports, [t.key]: !transports[t.key] })}
                        className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition text-left ${
                          transports[t.key] 
                            ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                            : 'border-slate-200 bg-white text-slate-655 dark:border-white/5 dark:bg-slate-900'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setTransports({ ...transports, pickupIncluded: !transports.pickupIncluded })}
                    className={`rounded-2xl p-4 border cursor-pointer flex items-center justify-between transition ${
                      transports.pickupIncluded ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200 dark:border-white/5'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Terminal Pick-Up</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Shuttle from terminal to resort</p>
                    </div>
                    <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center ${transports.pickupIncluded ? 'bg-blue-600 text-white' : 'border-slate-300'}`}>
                      {transports.pickupIncluded && <Check size={11} />}
                    </div>
                  </div>

                  <div 
                    onClick={() => setTransports({ ...transports, dropIncluded: !transports.dropIncluded })}
                    className={`rounded-2xl p-4 border cursor-pointer flex items-center justify-between transition ${
                      transports.dropIncluded ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200 dark:border-white/5'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Terminal Drop-Off</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Shuttle from resort back to terminal</p>
                    </div>
                    <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center ${transports.dropIncluded ? 'bg-blue-600 text-white' : 'border-slate-300'}`}>
                      {transports.dropIncluded && <Check size={11} />}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Pickup Location</label>
                    <input type="text" value={transports.pickupLocation} onChange={e => setTransports({ ...transports, pickupLocation: e.target.value })} className="input rounded-xl pl-4 py-3 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Scheduled Departure Time</label>
                    <input type="text" value={transports.pickupTime} onChange={e => setTransports({ ...transports, pickupTime: e.target.value })} className="input rounded-xl pl-4 py-3 text-xs" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Vehicle Preview Image Link</label>
                  <input type="text" value={transports.vehicleImage} onChange={e => setTransports({ ...transports, vehicleImage: e.target.value })} className="input rounded-xl pl-4 py-3 text-xs" />
                </div>
              </div>
            )}

            {/* Step 5: Meals */}
            {activeStep === 5 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Utensils className="text-blue-500" size={20} />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Step 5: Food & Restaurants</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Meal Plans Available</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'breakfast', label: '🍳 Breakfast Only' },
                        { key: 'lunch', label: '🥗 Lunch Included' },
                        { key: 'dinner', label: '🍲 Dinner Included' },
                        { key: 'allMeals', label: '🍱 All Meals' }
                      ].map(m => (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setMeals({ ...meals, [m.key]: !meals[m.key] })}
                          className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition text-left ${
                            meals[m.key] 
                              ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                              : 'border-slate-200 bg-white text-slate-655 dark:border-white/5 dark:bg-slate-900'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Dietary Kitchen Prep Types</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'veg', label: 'Veg' },
                        { key: 'nonVeg', label: 'Non-Veg' },
                        { key: 'vegan', label: 'Vegan' },
                        { key: 'jain', label: 'Jain' },
                        { key: 'halal', label: 'Halal' }
                      ].map(d => (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => setMeals({ ...meals, [d.key]: !meals[d.key] })}
                          className={`rounded-xl border py-2 text-[10px] font-bold transition ${
                            meals[d.key] 
                              ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600' 
                              : 'border-slate-200 bg-white text-slate-655 dark:border-white/5 dark:bg-slate-900'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Restaurant Details & Dining Notes</label>
                  <textarea rows={3} value={meals.specialNotes} onChange={e => setMeals({ ...meals, specialNotes: e.target.value })} placeholder="Buffet timings, private beach dinner schedules..." className="input rounded-xl p-4 text-xs resize-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Dining Room Preview Image Link</label>
                  <input type="text" value={meals.restaurantImage} onChange={e => setMeals({ ...meals, restaurantImage: e.target.value })} className="input rounded-xl pl-4 py-3 text-xs" />
                </div>
              </div>
            )}

            {/* Step 6: Activities */}
            {activeStep === 6 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-blue-500" size={20} />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Step 6: Adventure Activities</h3>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={addActivity}
                    className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-blue-500 hover:text-white transition"
                  >
                    <Plus size={12} /> Add Activity
                  </button>
                </div>

                {activities.map((act, idx) => (
                  <div key={idx} className="bg-slate-50/50 dark:bg-slate-800/10 border border-slate-200/50 dark:border-white/5 rounded-3xl p-5 space-y-4 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">#{idx+1}</span>
                      {activities.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeActivity(idx)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Activity Name</label>
                        <input 
                          type="text" 
                          value={act.name} 
                          onChange={e => updateActivityField(idx, 'name', e.target.value)} 
                          placeholder="e.g. Scuba Diving at Havelock Reef" 
                          className="input rounded-xl pl-4 py-2.5 text-xs" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Duration</label>
                        <input 
                          type="text" 
                          value={act.duration} 
                          onChange={e => updateActivityField(idx, 'duration', e.target.value)} 
                          placeholder="e.g. 2 Hours" 
                          className="input rounded-xl pl-4 py-2.5 text-xs" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Extra Cost (₹)</label>
                        <input 
                          type="number" 
                          value={act.price} 
                          onChange={e => updateActivityField(idx, 'price', Number(e.target.value))} 
                          className="input rounded-xl text-center py-2.5 text-xs" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Difficulty</label>
                        <select value={act.difficulty} onChange={e => updateActivityField(idx, 'difficulty', e.target.value)} className="input rounded-xl py-2.5 text-xs">
                          {['Easy', 'Moderate', 'Hard'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Age Restrictions</label>
                        <input type="text" value={act.ageLimit} onChange={e => updateActivityField(idx, 'ageLimit', e.target.value)} placeholder="10+" className="input rounded-xl text-center py-2.5 text-xs" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Preferred Time Slot</label>
                        <select value={act.slot} onChange={e => updateActivityField(idx, 'slot', e.target.value)} className="input rounded-xl py-2.5 text-xs">
                          {['Morning', 'Afternoon', 'Evening', 'Night'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Brief Itinerary Activity Description</label>
                      <textarea rows={2} value={act.desc} onChange={e => updateActivityField(idx, 'desc', e.target.value)} className="input rounded-xl p-3 text-xs resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 7: Day-by-Day Itinerary Timeline Builder */}
            {activeStep === 7 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-500" size={20} />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Step 7: Day-by-Day Itinerary Builder</h3>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={addItineraryDay}
                    className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-blue-500 hover:text-white transition"
                  >
                    <Plus size={12} /> Add Day
                  </button>
                </div>

                <div className="space-y-6 relative border-l border-slate-200 dark:border-white/5 pl-6 ml-3">
                  {itinerary.map((day, idx) => (
                    <div key={idx} className="relative space-y-4 bg-slate-50/50 dark:bg-slate-800/10 border border-slate-200/50 dark:border-white/5 rounded-3xl p-5">
                      
                      {/* Left circular timeline tag */}
                      <span className="absolute -left-[37px] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow">
                        {day.day}
                      </span>

                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Day {day.day} Timeline Details</h4>
                        
                        {itinerary.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeItineraryDay(idx)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Day Subject Title</label>
                          <input 
                            type="text" 
                            value={day.title} 
                            onChange={e => updateItineraryField(idx, 'title', e.target.value)} 
                            placeholder="e.g. Arrival & Beach Walk" 
                            className="input rounded-xl pl-4 py-2.5 text-xs" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Key Sightseeing Locations</label>
                          <input 
                            type="text" 
                            value={day.location} 
                            onChange={e => updateItineraryField(idx, 'location', e.target.value)} 
                            placeholder="e.g. Baga Beach, Fort Aguada" 
                            className="input rounded-xl pl-4 py-2.5 text-xs" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">🌄 Morning</label>
                          <input type="text" value={day.morning} onChange={e => updateItineraryField(idx, 'morning', e.target.value)} placeholder="Morning activity..." className="input rounded-xl pl-3 py-2 text-[11px]" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">☀️ Afternoon</label>
                          <input type="text" value={day.afternoon} onChange={e => updateItineraryField(idx, 'afternoon', e.target.value)} placeholder="Afternoon activity..." className="input rounded-xl pl-3 py-2 text-[11px]" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">🌇 Evening</label>
                          <input type="text" value={day.evening} onChange={e => updateItineraryField(idx, 'evening', e.target.value)} placeholder="Evening activity..." className="input rounded-xl pl-3 py-2 text-[11px]" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">🌙 Night</label>
                          <input type="text" value={day.night} onChange={e => updateItineraryField(idx, 'night', e.target.value)} placeholder="Night activity..." className="input rounded-xl pl-3 py-2 text-[11px]" />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 8: Pricing */}
            {activeStep === 8 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  <BarChart2 className="text-blue-500" size={20} />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Step 8: Pricing Settings</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Base Package Price (₹)</label>
                    <input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} className="input rounded-xl text-center py-3 text-xs" />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Discounted Offer Price (₹)</label>
                    <input type="number" value={offerPrice} onChange={e => setOfferPrice(Number(e.target.value))} className="input rounded-xl text-center py-3 text-xs" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Calculated Discount %</label>
                    <input type="number" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} className="input rounded-xl text-center py-3 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Taxes / GST Percent (%)</label>
                    <input type="number" value={taxesPercent} onChange={e => setTaxesPercent(Number(e.target.value))} className="input rounded-xl text-center py-3 text-xs" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Extra Convenience/Service Charges (₹)</label>
                    <input type="number" value={extraCharges} onChange={e => setExtraCharges(Number(e.target.value))} className="input rounded-xl text-center py-3 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Hotel upgrade charge (₹)</label>
                    <input type="number" value={hotelUpgradeCost} onChange={e => setHotelUpgradeCost(Number(e.target.value))} className="input rounded-xl text-center py-2.5 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Transport upgrade charge (₹)</label>
                    <input type="number" value={transportUpgradeCost} onChange={e => setTransportUpgradeCost(Number(e.target.value))} className="input rounded-xl text-center py-2.5 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Activities cost / Pax (₹)</label>
                    <input type="number" value={activityUpgradeCost} onChange={e => setActivityUpgradeCost(Number(e.target.value))} className="input rounded-xl text-center py-2.5 text-xs" />
                  </div>
                </div>

                {/* Live Price Calculator Display */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-3xl p-5 space-y-3 mt-6">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Live Price Simulator Breakdown</h4>
                  <div className="space-y-2 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Base Package Listing Price</span>
                      <span>₹{basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-500 font-semibold">
                      <span>Vendor Promo Reduction (-{discountPercent}%)</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated GST / Hotel Taxes ({taxesPercent}%)</span>
                      <span>+₹{taxAmount.toLocaleString()}</span>
                    </div>
                    {extraCharges > 0 && (
                      <div className="flex justify-between">
                        <span>Convenience Service Surcharges</span>
                        <span>+₹{extraCharges.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-900 dark:text-white font-bold">
                      <span>Final Est. Price displayed to travelers</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">₹{finalPriceCalculated.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 9: Policies */}
            {activeStep === 9 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  <FileText className="text-blue-500" size={20} />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Step 9: Booking Policies</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Cancellation Rules</label>
                    <textarea rows={3} value={policies.cancellation} onChange={e => setPolicies({ ...policies, cancellation: e.target.value })} className="input rounded-xl p-3 text-xs resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Refund Policy</label>
                    <textarea rows={3} value={policies.refund} onChange={e => setPolicies({ ...policies, refund: e.target.value })} className="input rounded-xl p-3 text-xs resize-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Child / Extra Pax Policy</label>
                    <textarea rows={3} value={policies.child} onChange={e => setPolicies({ ...policies, child: e.target.value })} className="input rounded-xl p-3 text-xs resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Booking Terms & General Guidelines</label>
                    <textarea rows={3} value={policies.terms} onChange={e => setPolicies({ ...policies, terms: e.target.value })} className="input rounded-xl p-3 text-xs resize-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Traveler Gear / Requirements List</label>
                  <input type="text" value={policies.requirements} onChange={e => setPolicies({ ...policies, requirements: e.target.value })} className="input rounded-xl pl-4 py-2.5 text-xs" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Inclusions (What is included)</label>
                    <textarea rows={2} value={policies.inclusions} onChange={e => setPolicies({ ...policies, inclusions: e.target.value })} className="input rounded-xl p-3 text-xs resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Exclusions (What is not included)</label>
                    <textarea rows={2} value={policies.exclusions} onChange={e => setPolicies({ ...policies, exclusions: e.target.value })} className="input rounded-xl p-3 text-xs resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 10: Preview & Publish */}
            {activeStep === 10 && (
              <div className="space-y-6 text-center py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
                  <CheckCircle size={36} />
                </div>
                
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">Confirm & Publish Listing</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                    Your package is configured and ready to be visible on the explorer maps. Travelers can dynamically personalize lodging, transport, and adventure activities based on these configurations.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-4 text-left max-w-sm mx-auto text-xs space-y-2 border border-slate-200/50 dark:border-white/5">
                  <div className="flex justify-between"><span className="text-slate-500">Package Title:</span><span className="font-bold">{title || 'Untitled Package'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Destination:</span><span className="font-bold">{location || 'None'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">SaaS Base Price:</span><span className="font-bold text-blue-600 dark:text-blue-400">₹{offerPrice?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Status:</span><span className="font-bold uppercase text-emerald-500">{status}</span></div>
                </div>

                {error && (
                  <div className="max-w-sm mx-auto flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-950/40">
                    <ShieldAlert size={15} />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                <div className="max-w-sm mx-auto pt-4">
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="btn-premium w-full py-4.5 rounded-3xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/20"
                  >
                    <Send size={15} />
                    <span>{loading ? 'Publishing package to database...' : 'Publish Experience Now'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step navigation buttons controls footer */}
            {activeStep < 10 && (
              <div className="mt-8 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-250/10">
                <button 
                  type="button" 
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep(activeStep - 1)}
                  className={`btn-premium-secondary px-5 py-3 rounded-2xl text-xs font-bold transition ${activeStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Back Step
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="btn-premium px-6 py-3 rounded-2xl flex items-center gap-1.5 text-xs font-bold"
                >
                  <span>Next Step</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Tabs (Live Preview vs AI Assistant) */}
        <div className="w-full lg:w-[480px] shrink-0 border-l border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur-xl flex flex-col min-h-0">
          
          {/* Tabs Selector headers */}
          <div className="flex border-b border-slate-200/50 dark:border-white/5 p-4 shrink-0 justify-around">
            <button 
              onClick={() => setRightPanelTab('preview')}
              className={`flex items-center gap-1.5 pb-2 border-b-2 text-xs font-bold transition ${
                rightPanelTab === 'preview' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-450 hover:text-slate-700'
              }`}
            >
              <Layout size={14} />
              <span>Live Customer Preview</span>
            </button>
            <button 
              onClick={() => setRightPanelTab('ai')}
              className={`flex items-center gap-1.5 pb-2 border-b-2 text-xs font-bold transition ${
                rightPanelTab === 'ai' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-450 hover:text-slate-700'
              }`}
            >
              <Lightbulb size={14} />
              <span>AI Partner Assistant</span>
            </button>
          </div>

          {/* Tab Content Canvas */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* TAB 1: Live Customer Details Page Preview */}
            {rightPanelTab === 'preview' && (
              <div className="space-y-6">
                <div className="bg-slate-100/50 dark:bg-slate-900/50 px-4 py-2.5 rounded-2xl text-[10px] font-bold text-slate-500 border border-slate-200/20 text-center">
                  ✨ Instant preview as rendered on the consumer site
                </div>

                <div className="glass-card rounded-4xl overflow-hidden shadow-2xl border border-slate-200/20 dark:border-white/5 bg-white dark:bg-[#0F172A] flex flex-col">
                  {/* Hero banner */}
                  <div className="relative aspect-[16/10] bg-slate-100">
                    <img src={heroImage} className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-4 left-4 bg-black/45 backdrop-blur-sm px-3 py-1 rounded-xl text-[10px] font-bold text-white flex items-center gap-1">
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <span>4.8 (Verified)</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Header titles */}
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black uppercase text-blue-500 tracking-wider">{category} Package</span>
                        <span className="text-[10px] font-bold text-slate-400">{durationDays} Days / {durationNights} Nights</span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white font-display mt-0.5">{title || 'Untitled Travel Experience'}</h3>
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1"><MapPin size={12} /> {location || 'Select Destination'}, {country || 'India'}</p>
                    </div>

                    {/* Summary Overview */}
                    <div className="border-t border-slate-100 dark:border-white/5 pt-3">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Trip Overview</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{shortDesc || 'No overview summary set yet.'}</p>
                    </div>

                    {/* Hotels and Inclusions preview */}
                    <div className="border-t border-slate-100 dark:border-white/5 pt-3 grid grid-cols-2 gap-3 text-[10px] leading-none text-slate-550">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">Accommodation</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mt-1.5 truncate">
                          🏨 {hotels[0]?.name || 'Standard Resort'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">Transport Mode</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mt-1.5">
                          🚗 Private SUV Pickup
                        </span>
                      </div>
                    </div>

                    {/* Daywise preview timeline preview */}
                    <div className="border-t border-slate-100 dark:border-white/5 pt-3 space-y-2">
                      <h4 className="font-bold text-xs text-slate-850 dark:text-slate-200">Trip Itinerary Progress</h4>
                      <div className="space-y-2 relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
                        {itinerary.slice(0, 3).map((day, idx) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-[21px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[8px] font-black text-white">
                              {day.day}
                            </span>
                            <span className="font-bold text-[10px] text-slate-800 dark:text-slate-250 block">{day.title || `Day ${day.day}`}</span>
                            <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">{day.location || 'Local sightseeing'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prices summary CTA */}
                    <div className="border-t border-slate-100 dark:border-white/5 pt-3.5 mt-3.5 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Starting from</span>
                        <span className="text-base font-black text-blue-600 dark:text-blue-400">₹{offerPrice?.toLocaleString()}</span>
                      </div>
                      <button type="button" disabled className="btn-premium px-4 py-2 text-[10px] font-bold rounded-xl pointer-events-none select-none opacity-85">Book Now</button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI Package Assistant insights */}
            {rightPanelTab === 'ai' && (
              <div className="space-y-6">
                
                {/* Circular Score ring */}
                <div className="bg-white dark:bg-[#0F172A] border border-slate-250/20 dark:border-white/5 rounded-4xl p-5 shadow-sm flex items-center gap-5">
                  <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="34" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" className="stroke-blue-600 fill-none" strokeWidth="6" strokeDasharray="213" strokeDashoffset={213 - (213 * 0.92)} strokeLinecap="round" />
                    </svg>
                    <span className="font-black text-lg text-slate-900 dark:text-white font-display">92</span>
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white font-display leading-tight">Package Quality Score</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Excellent configuration. Accommodation ratings and private transport upgrade links raise listing attractiveness by 35%.</p>
                  </div>
                </div>

                {/* Recommendations checklist */}
                <div className="space-y-4">
                  <h4 className="font-black text-xs text-slate-850 dark:text-slate-200 uppercase tracking-wider">AI SEO Suggestions</h4>
                  
                  {[
                    { label: 'Suggest Better Package Title', val: `Add "Luxury" or "Private Villa" to title. e.g. "Luxury Private Villa Sunset Escapade in ${location || 'Goa'}"` },
                    { label: 'Recommended Price', val: `Suggested price: ₹${Math.round(offerPrice * 1.08).toLocaleString()} based on current ${category} package demand metrics.` },
                    { label: 'Estimated Summer Demand', val: '🔥 Very High (Estimated 85% bookings rate in October)' },
                    { label: 'Trending Search Keywords', val: `#${location?.toLowerCase() || 'beach'}, #privateresort, #guidedhikes, #${category.toLowerCase()}` },
                    { label: 'Destination Weather Insights', val: `Sunny skies (Avg 27°C). Ideal for ${activities[0]?.name || 'outdoor sports'}.` }
                  ].map((s, idx) => (
                    <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/10 rounded-2xl p-4 space-y-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-blue-500">{s.label}</span>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-snug">{s.val}</p>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

// Simple helper icon
function UploadCloudIcon({ className, size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  );
}
