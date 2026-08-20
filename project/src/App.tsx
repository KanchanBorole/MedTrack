import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import AppLayout from '@/components/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import BrowsePage from '@/pages/BrowsePage';
import AddMedicinePage from '@/pages/AddMedicinePage';
import MapPage from '@/pages/MapPage';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnly><AuthPage mode="login" /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><AuthPage mode="signup" /></PublicOnly>} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/dashboard/browse" element={<ProtectedRoute><AppLayout><BrowsePage /></AppLayout></ProtectedRoute>} />
      <Route path="/dashboard/add" element={<ProtectedRoute><AppLayout><AddMedicinePage /></AppLayout></ProtectedRoute>} />
      <Route path="/dashboard/edit/:id" element={<ProtectedRoute><AppLayout><AddMedicinePage /></AppLayout></ProtectedRoute>} />
      <Route path="/dashboard/map" element={<ProtectedRoute><AppLayout><MapPage /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
