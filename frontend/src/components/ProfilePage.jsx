import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import AccountSecurityCard from "./AccountSecurityCard";
import PersonalInfoCard from "./PersonalInfoCard";
import PreferencesCard from "./PreferencesCard";
import ProfileCard from "./ProfileCard";

export default function ProfilePage() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileData = async () => {
    console.log("🔍 START: Fetching profile data...");
    try {
      setLoading(true);
      setError(null);
      console.log("📡 Making API call to /user/profile");
      const response = await api.get("/user/profile");
      console.log("✅ SUCCESS: Profile data received:", response.data);
      console.log("📦 User data:", response.data.data);
      setProfileData(response.data.data);
      console.log("💾 Profile data set in state successfully");
    } catch (err) {
      console.error("❌ ERROR: Failed to fetch profile:", err);
      console.error("Error response:", err.response);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        console.log("🔒 Authentication error, logging out...");
        logout();
        navigate("/");
      } else {
        // Check if it's a network error or server error
        const isNetworkError = !err.response;
        const isServerError = err.response?.status >= 500;
        
        if (isNetworkError) {
          setError("Network error. Please check your connection and try again.");
        } else if (isServerError) {
          setError("Server error. Please try again later.");
        } else {
          setError(err.response?.data?.message || "Failed to load profile data");
        }
      }
    } finally {
      setLoading(false);
      console.log("🏁 COMPLETE: Profile fetch finished");
    }
  };

  useEffect(() => {
    console.log("🎯 ProfilePage mounted/updated");
    console.log("Token present:", !!token);
    
    // Redirect to login if not authenticated
    if (!token) {
      console.log("⚠️ No token found, redirecting to home");
      navigate("/");
      return;
    }

    console.log("✅ Token found, fetching profile data");
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle retry
  const handleRetry = () => {
    fetchProfileData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Left Column Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-gray-200 w-32 h-32 mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-24 mb-6"></div>
                  <div className="w-full space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column Skeleton */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-8"
          >
            <div className="text-center py-12">
              <div className="text-red-400 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Error Loading Profile</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={handleRetry} 
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Handle profile data updates from child components
  const handleProfileUpdate = (updatedData) => {
    console.log("📝 Profile data updated:", updatedData);
    setProfileData(updatedData);
  };

  console.log("🎨 RENDER: ProfilePage rendering, loading:", loading, "error:", !!error, "profileData:", !!profileData);
  
  if (!profileData) {
    console.log("⚠️ No profileData, showing fallback message");
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">No profile data available</p>
            <button 
              onClick={fetchProfileData}
              className="mt-4 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Reload Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log("✅ ProfileData exists, rendering components");
  console.log("User name:", profileData.name);
  console.log("User email:", profileData.email);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            {console.log("🎨 Rendering ProfileCard component")}
            <ProfileCard user={profileData} />
          </div>
          
          {/* Right Column - 2 column grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              {console.log("🎨 Rendering PersonalInfoCard component")}
              <PersonalInfoCard 
                user={profileData} 
                onUpdate={handleProfileUpdate}
              />
            </div>
            
            <div className="md:col-span-2">
              {console.log("🎨 Rendering PreferencesCard component")}
              <PreferencesCard 
                user={profileData} 
                onUpdate={handleProfileUpdate}
              />
            </div>
            
            <div className="md:col-span-2">
              {console.log("🎨 Rendering AccountSecurityCard component")}
              <AccountSecurityCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
