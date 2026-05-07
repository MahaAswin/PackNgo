import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ExplorePage from './pages/ExplorePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import PackageDetailsPage from './pages/PackageDetailsPage';
import PackagerDashboardPage from './pages/PackagerDashboardPage';
import AddPackagePage from './pages/AddPackagePage';
import AdminDashboard from './pages/AdminDashboard';
import { RequireAuth, CustomerOnly, AdminOnly, PackagerOnly } from './components/RouteGuards';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/package/:id" element={<PackageDetailsPage />} />
            <Route path="/dashboard" element={<CustomerOnly><DashboardPage /></CustomerOnly>} />
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
  );
}

export default App;
