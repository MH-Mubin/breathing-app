import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import BreathingSession from "./components/BreathingSession";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="min-h-screen bg-light pt-6 pb-12 px-2 md:px-0">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/practice" element={<BreathingSession />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
