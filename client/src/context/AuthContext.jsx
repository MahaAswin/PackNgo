import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);
const SESSION_KEY = 'pn_user';
const WISHLIST_KEY = 'pn_wishlist';

function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(readSession);
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    let active = true;
    if (user?.id) {
      api.get(`/users/${user.id}`)
        .then(res => {
          if (!active) return;
          const u = res.data;
          if (u) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(u));
            setUser(u);
          }
        })
        .catch(() => {});

      api.get(`/bookings/user/${user.id}`)
        .then(r => {
          if (!active) return;
          setBookings(r.data || []);
        })
        .catch(() => {
          if (!active) return;
          setBookings([]);
        });
    } else {
      setBookings([]);
    }
    return () => {
      active = false;
    };
  }, [user?.id]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/users/login', { email, password });
      const u = res.data;
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      setUser(u);
      return { user: u };
    } catch (err) {
      return { error: err.response?.status === 401 ? 'Invalid email or password.' : 'Login failed. Is the backend running?' };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const res = await api.post('/users/register', payload);
      const u = res.data;
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      setUser(u);
      return { user: u };
    } catch (err) {
      return { error: err.response?.data?.message || 'Registration failed.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setBookings([]);
  }, []);

  const toggleWishlist = useCallback((pkgId) => {
    setWishlist(prev => {
      const next = prev.includes(String(pkgId))
        ? prev.filter(x => x !== String(pkgId))
        : [...prev, String(pkgId)];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const refreshBookings = useCallback(async () => {
    if (!user?.id) return;
    api.get(`/bookings/user/${user.id}`).then(r => setBookings(r.data || [])).catch(() => {});
  }, [user?.id]);

  const refreshUser = useCallback(async () => {
    if (!user?.id) return null;
    try {
      const res = await api.get(`/users/${user.id}`);
      const u = res.data;
      if (u) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setUser(u);
        return u;
      }
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
    return null;
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{
      user, bookings, wishlist,
      isAuthenticated: !!user,
      isAdmin:    user?.role?.toUpperCase() === 'ADMIN',
      isPackager: user?.role?.toUpperCase() === 'PACKAGER',
      isCustomer: user?.role?.toUpperCase() === 'USER',
      login, register, logout, toggleWishlist, refreshBookings, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
