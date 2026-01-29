import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
    useLocation,
} from "react-router-dom";
import BreathingSession from "./components/BreathingSession";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import ProfilePage from "./components/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import { AuthProvider } from "./context/AuthContext";

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isProfilePage = location.pathname === '/profile';

  // Add/remove overflow-hidden class on body for auth pages
  useEffect(() => {
    // Allow scrolling on auth pages now
    document.body.style.overflow = 'auto';
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isAuthPage]);

  return (
    <>
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#fb923c',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className={isAuthPage || isProfilePage ? "" : "min-h-screen bg-gray-100 pt-6 pb-12 px-2 md:px-0"}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/practice" element={<BreathingSession />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
