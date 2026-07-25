import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocaleProvider } from './context/LocaleContext';
import ExplorePage from './pages/ExplorePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import PackageDetailsPage from './pages/PackageDetailsPage';
import PackagerDashboardPage from './pages/PackagerDashboardPage';
import AddPackagePage from './pages/AddPackagePage';
import AdminDashboard from './pages/AdminDashboard';
import BookingSuccessPage from './pages/BookingSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import BookingPage from './pages/BookingPage';
import { RequireAuth, CustomerOnly, AdminOnly, PackagerOnly } from './components/RouteGuards';

function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<ExplorePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/package/:id" element={<PackageDetailsPage />} />
            <Route path="/book/:id" element={<CustomerOnly><BookingPage /></CustomerOnly>} />
            <Route path="/dashboard" element={<CustomerOnly><DashboardPage /></CustomerOnly>} />
            <Route path="/booking-success" element={<CustomerOnly><BookingSuccessPage /></CustomerOnly>} />
            <Route path="/payment-failure" element={<CustomerOnly><PaymentFailurePage /></CustomerOnly>} />
            <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
            <Route path="/profile" element={<CustomerOnly><ProfilePage /></CustomerOnly>} />
            <Route path="/packager" element={<PackagerOnly><PackagerDashboardPage /></PackagerOnly>} />
            <Route path="/packager/new" element={<PackagerOnly><AddPackagePage /></PackagerOnly>} />
            <Route path="/admin" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}

export default App;
