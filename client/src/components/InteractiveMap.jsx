import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, MapPin, Search, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// List of all supported destinations with metadata & coordinates
const DESTINATIONS = [
  {
    name: 'Manali',
    title: 'Alpine Manali Retreat',
    rating: 4.8,
    duration: '3 Nights / 4 Days',
    price: 8999,
    desc: 'Snowy summits, riverside cottage stays, and paragliding hikes in the Solang Valley.',
    img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    coords: [32.2396, 77.1887]
  },
  {
    name: 'Shimla',
    title: 'Winter Shimla Wonderland',
    rating: 4.9,
    duration: '4 Nights / 5 Days',
    price: 10999,
    desc: 'Scenic Mall Road walks, historic toy train excursions, and cosy snow-capped cottage stays.',
    img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    coords: [31.1048, 77.1734]
  },
  {
    name: 'Goa',
    title: 'Beachside Goa Palms',
    rating: 4.9,
    duration: '4 Nights / 5 Days',
    price: 12999,
    desc: 'Sunset luxury cruises, beachfront villas, seafood dining, and historic Portuguese quarter walks.',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    coords: [15.2993, 74.1240]
  },
  {
    name: 'Ooty',
    title: 'Ooty Tea Hills Escape',
    rating: 4.7,
    duration: '2 Nights / 3 Days',
    price: 7999,
    desc: 'Winding green tea estates, rose gardens, boating on Ooty lake, and peaceful botanical gardens.',
    img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    coords: [11.4102, 76.6950]
  },
  {
    name: 'Munnar',
    title: 'Munnar Misty Meadows',
    rating: 4.8,
    duration: '3 Nights / 4 Days',
    price: 9499,
    desc: 'Expansive cardamon and tea fields, misty Eravikulam National Park, and luxury treehouse stays.',
    img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    coords: [10.0889, 77.0595]
  },
  {
    name: 'Coorg',
    title: 'Coorg Coffee Plantation Haven',
    rating: 4.7,
    duration: '3 Nights / 4 Days',
    price: 8499,
    desc: 'Lush coffee estates walks, Abbey waterfalls hiking, and traditional Kodava homestays.',
    img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    coords: [12.3375, 75.8069]
  },
  {
    name: 'Andaman',
    title: 'Andaman Corals & Horizons',
    rating: 4.9,
    duration: '5 Nights / 6 Days',
    price: 24999,
    desc: 'Deep-sea scuba diving at Radhanagar Beach, glass-bottom boat tour, and private island dinners.',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    coords: [11.7401, 92.6586]
  },
  {
    name: 'Kashmir',
    title: 'Kashmir Luxury Houseboats',
    rating: 5.0,
    duration: '5 Nights / 6 Days',
    price: 18999,
    desc: 'Dal lake Shikara rowing, snowy Gulmarg cable cars, and beautiful saffron garden walks.',
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
    coords: [34.0837, 74.7973]
  },
  {
    name: 'Ladakh',
    title: 'Ladakh High Passes Adventure',
    rating: 4.9,
    duration: '6 Nights / 7 Days',
    price: 21999,
    desc: 'Breathtaking Pangong Lake camps, Leh Palace heritage walks, and high-altitude mountain motorcycling.',
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
    coords: [34.1526, 77.5771]
  },
  {
    name: 'Jaipur',
    title: 'Jaipur Maharaja Heritage',
    rating: 4.8,
    duration: '3 Nights / 4 Days',
    price: 9999,
    desc: 'Royal Amer Fort elephant rides, historic City Palace guided tour, and luxury Rajasthani suites.',
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
    coords: [26.9124, 75.7873]
  },
  {
    name: 'Udaipur',
    title: 'Udaipur Romantic Lake Palaces',
    rating: 4.9,
    duration: '3 Nights / 4 Days',
    price: 13499,
    desc: 'Scenic sunset boat cruise on Lake Pichola, fine-dining palace terrace, and heritage stays.',
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
    coords: [24.5854, 73.7125]
  },
  {
    name: 'Rishikesh',
    title: 'Rishikesh Yoga & Ganga Rafting',
    rating: 4.7,
    duration: '2 Nights / 3 Days',
    price: 6999,
    desc: 'Ganga river white water rafting, evening religious Aarti ceremony, and spiritual yoga retreats.',
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
    coords: [30.0869, 78.2676]
  },
  {
    name: 'Darjeeling',
    title: 'Darjeeling Sunrise & Tea Estates',
    rating: 4.8,
    duration: '3 Nights / 4 Days',
    price: 8999,
    desc: 'Mt. Kanchenjunga peak views, colonial steam toy-train, and fresh tea garden organic harvesting.',
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
    coords: [27.0410, 88.2627]
  },
  {
    name: 'Kerala',
    title: 'Kerala Lazy Houseboats',
    rating: 4.9,
    duration: '4 Nights / 5 Days',
    price: 14999,
    desc: 'Overnight luxury houseboat cruise along palm-fringed Alleppey backwater canals and spice walks.',
    img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    coords: [10.8505, 76.2711]
  },
  {
    name: 'Pondicherry',
    title: 'Pondicherry French Quarters',
    rating: 4.6,
    duration: '3 Nights / 4 Days',
    price: 9999,
    desc: 'Yellow-walled French villas, beach boulevard cycling, organic dining, and Auroville ashram visits.',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    coords: [11.9416, 79.8083]
  }
];

export default function InteractiveMap({ isOpen, onClose, setSearch }) {
  const { dark } = useTheme();
  
  // States
  const [selectedDest, setSelectedDest] = useState(DESTINATIONS[0]);
  const [mapSearch, setMapSearch] = useState('');
  
  // Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // Clean tile URL
  const tileUrl = dark 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  // Custom HTML Pin Icons styled with Tailwind
  const createHtmlIcon = (name, isSelected) => {
    return L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div class="relative flex flex-col items-center">
          <span class="absolute h-9 w-9 rounded-full bg-blue-500/40 animate-ping -top-2 pointer-events-none"></span>
          <div class="flex h-7 w-7 items-center justify-center rounded-full shadow-lg border-2 border-white dark:border-slate-900 transition-all duration-300 ${
            isSelected ? 'bg-emerald-500 scale-110' : 'bg-blue-600 hover:bg-teal-500'
          }">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="mt-1.5 px-2 py-0.5 rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-md border border-slate-200/20 text-[9px] font-black text-slate-800 dark:text-white whitespace-nowrap leading-none select-none">
            ${name}
          </div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 30]
    });
  };

  const handleMarkerClick = (dest) => {
    setSelectedDest(dest);
  };

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Create Leaflet Map Instance
    const map = L.map(mapContainerRef.current, {
      center: [21.0000, 78.9629], // India Center
      zoom: 5,
      zoomControl: false
    });
    mapInstanceRef.current = map;

    // Tile Layer
    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
    }).addTo(map);

    // Render Markers
    DESTINATIONS.forEach(dest => {
      const isSelected = selectedDest?.name === dest.name;
      const icon = createHtmlIcon(dest.name, isSelected);
      const marker = L.marker(dest.coords, { icon }).addTo(map);
      
      marker.on('click', () => {
        handleMarkerClick(dest);
      });
      
      markersRef.current[dest.name] = marker;
    });

    // Fit map bounds slightly on startup
    if (selectedDest) {
      map.setView(selectedDest.coords, 6);
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    };
  }, [isOpen]);

  // Handle dark mode tile switching dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
    }).addTo(map);
  }, [tileUrl]);

  // Control map camera pan & markers state highlight
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedDest) return;

    map.setView(selectedDest.coords, 8, { animate: true, duration: 1.2 });

    // Update highlights
    DESTINATIONS.forEach(dest => {
      const marker = markersRef.current[dest.name];
      if (marker) {
        const isSelected = dest.name === selectedDest.name;
        marker.setIcon(createHtmlIcon(dest.name, isSelected));
      }
    });
  }, [selectedDest]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!mapSearch.trim()) return;
    const found = DESTINATIONS.find(
      d => d.name.toLowerCase().includes(mapSearch.toLowerCase())
    );
    if (found) {
      setSelectedDest(found);
      setMapSearch('');
    }
  };

  const handleViewPackages = () => {
    if (!selectedDest) return;
    setSearch(selectedDest.name);
    onClose();
    setTimeout(() => {
      document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-6xl rounded-4xl bg-white dark:bg-[#0F172A] border border-slate-250/20 dark:border-white/5 p-6 sm:p-8 shadow-2xl flex flex-col h-[85vh] overflow-hidden"
        >
          
          {/* Header controls & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Live Interactive Map View</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-display">Explore Destinations</h3>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Local Map Search bar */}
              <form onSubmit={handleSearchSubmit} className="relative w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input 
                  type="text" 
                  value={mapSearch}
                  onChange={e => setMapSearch(e.target.value)}
                  placeholder="Goa, Manali, Jaipur..." 
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200/50 dark:border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none text-slate-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                />
              </form>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Map layout Split screen */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 relative">
            
            {/* Real Map Canvas */}
            <div className="flex-1 rounded-3xl overflow-hidden border border-slate-200/60 dark:border-white/5 relative z-0">
              
              {/* Pure Leaflet Map Container ref element */}
              <div 
                ref={mapContainerRef} 
                style={{ height: '100%', width: '100%', borderRadius: '24px' }} 
              />

              {/* Floating Instructions tag overlay */}
              <div className="absolute top-4 left-4 bg-white/80 dark:bg-[#0F172A]/80 border border-slate-200/50 dark:border-white/5 backdrop-blur-md px-3.5 py-2 rounded-2xl text-[10px] font-bold text-slate-550 dark:text-slate-355 shadow pointer-events-none select-none z-10">
                ⭐ Zoom and drag map to navigate pins
              </div>
            </div>

            {/* Float glassmorphic information card */}
            <AnimatePresence mode="wait">
              {selectedDest && (
                <motion.div 
                  key={selectedDest.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="w-full lg:w-80 shrink-0 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    
                    {/* Destination Photo */}
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <img src={selectedDest.img} className="w-full h-full object-cover" alt={selectedDest.name} />
                      <div className="absolute top-3 left-3 bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[9px] font-bold text-white flex items-center gap-1.5">
                        <MapPin size={10} className="text-blue-400" />
                        <span>{selectedDest.name}</span>
                      </div>
                    </div>

                    {/* Metadata specs details */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-500">Premium Stay Package</span>
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                          <Star size={11} className="fill-yellow-400 text-yellow-400" />
                          <span>{selectedDest.rating}</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white font-display leading-tight">{selectedDest.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Clock size={11} /> {selectedDest.duration}</p>
                    </div>

                    {/* Description details */}
                    <p className="text-xs text-slate-500 dark:text-slate-455 leading-relaxed font-semibold">
                      {selectedDest.desc}
                    </p>

                  </div>

                  {/* Actions details */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[8px] font-bold text-slate-455 uppercase block">Starting from</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400 block leading-none mt-1">₹{selectedDest.price?.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={handleViewPackages}
                      className="btn-premium px-5 py-3 text-xs font-bold rounded-2xl flex items-center gap-1.5"
                    >
                      <span>View Packages</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
