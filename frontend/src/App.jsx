
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import BreathingSession from './components/BreathingSession';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

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
