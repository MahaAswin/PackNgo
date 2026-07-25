import React, { createContext, useContext, useState } from 'react';

const LocaleContext = createContext();

// Simple translation dictionary for key UI components
const TRANSLATIONS = {
  EN: {
    explore: 'Explore',
    trending: 'Trending',
    verifiedStay: 'Verified Stay',
    signIn: 'Sign In',
    join: 'Join',
    language: 'Language',
    currency: 'Currency',
    myBookings: 'My Bookings',
    wishlist: 'Wishlist',
    profile: 'Profile',
    signOut: 'Sign Out',
    activePackages: 'Active Packages',
    recentFeedback: 'Recent Customer Feedback',
    incidentLog: 'Incident Log',
    controlCenter: 'Control Center'
  },
  TA: {
    explore: 'ஆராய்வு',
    trending: 'பிரபலமானவை',
    verifiedStay: 'சரிபார்க்கப்பட்ட தங்குமிடம்',
    signIn: 'உள்நுழைக',
    join: 'இணையுங்கள்',
    language: 'மொழி',
    currency: 'நாணயம்',
    myBookings: 'எனது பதிவுகள்',
    wishlist: 'விருப்பப்பட்டியல்',
    profile: 'விவரக்குறிப்பு',
    signOut: 'வெளியேறு',
    activePackages: 'செயலில் உள்ள தொகுப்புகள்',
    recentFeedback: 'சமீபத்திய கருத்துகள்',
    incidentLog: 'சம்பவ பதிவு',
    controlCenter: 'கட்டுப்பாட்டு மையம்'
  }
};

export function LocaleProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('packngo_currency') || 'INR';
  });
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('packngo_language') || 'EN';
  });

  const setCurrency = (curr) => {
    setCurrencyState(curr);
    localStorage.setItem('packngo_currency', curr);
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('packngo_language', lang);
  };

  const convertPrice = (priceInINR) => {
    if (!priceInINR) return 0;
    if (currency === 'USD') return Math.round(priceInINR / 83);
    if (currency === 'EUR') return Math.round(priceInINR / 90);
    return priceInINR;
  };

  const formatPrice = (priceInINR) => {
    const converted = convertPrice(priceInINR);
    if (currency === 'USD') return `$${converted.toLocaleString('en-US')}`;
    if (currency === 'EUR') return `€${converted.toLocaleString('en-DE')}`;
    return `₹${converted.toLocaleString('en-IN')}`;
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['EN'][key] || key;
  };

  return (
    <LocaleContext.Provider value={{ currency, setCurrency, language, setLanguage, formatPrice, convertPrice, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
