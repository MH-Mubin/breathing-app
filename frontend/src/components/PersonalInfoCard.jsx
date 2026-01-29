import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

export default function PersonalInfoCard({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    location: user?.profile?.location || "",
  });

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else {
          delete newErrors.name;
        }
        break;
        
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Invalid email format";
        } else {
          delete newErrors.email;
        }
        break;
        
      case "phone":
        // Phone is optional, but validate format if provided
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          newErrors.phone = "Invalid phone number format";
        } else {
          delete newErrors.phone;
        }
        break;
        
      case "location":
        // Location is optional, no validation needed
        delete newErrors.location;
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Handle edit mode toggle
  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.profile?.phone || "",
      location: user?.profile?.location || "",
    });
    setErrors({});
  };

  // Handle save
  const handleSave = async () => {
    // Validate all fields before submission
    const isNameValid = validateField("name", formData.name);
    const isEmailValid = validateField("email", formData.email);
    const isPhoneValid = validateField("phone", formData.phone);
    
    if (!isNameValid || !isEmailValid || !isPhoneValid) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    try {
      setLoading(true);
      
      // Make API call to update profile
      const response = await api.put("/user/profile", {
        name: formData.name,
        email: formData.email,
        profile: {
          phone: formData.phone,
          location: formData.location,
          avatar: user?.profile?.avatar || "",
        },
      });

      // Call parent callback with updated data
      if (onUpdate) {
        onUpdate(response.data.data);
      }

      setIsEditing(false);
      setErrors({});
      
      // Show success toast
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      
      // Check if it's a network error
      if (!err.response) {
        const errorMsg = "Network error. Please check your connection and try again.";
        setErrors({ general: errorMsg });
        toast.error(errorMsg);
        return;
      }
      
      // If it's a 401 error, the global interceptor will handle it
      // Just show a generic error message
      if (err.response?.status === 401) {
        toast.error("Authentication error. Please log in again.");
        setErrors({ 
          general: "Authentication error. Please log in again." 
        });
        return;
      }
      
      // Check for server errors (5xx)
      if (err.response?.status >= 500) {
        const errorMsg = "Server error. Please try again later.";
        setErrors({ general: errorMsg });
        toast.error(errorMsg);
        return;
      }
      
      // Handle validation errors from server
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        toast.error("Validation errors occurred. Please check the form.");
      } else {
        const errorMessage = err.response?.data?.message || "Failed to update profile";
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card p-6">
        <h4 className="font-semibold mb-2">Personal Information</h4>
        <p className="text-sm text-gray-500">No user data available</p>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
        </div>
        {!isEditing && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 border-2 border-orange-400 text-orange-400 rounded-lg font-medium hover:bg-orange-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </motion.button>
        )}
      </div>

      {/* General error message */}
      <AnimatePresence>
        {errors.general && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
          >
            {errors.general}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isEditing ? (
          // Edit mode
          <motion.div 
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* 2x2 Grid for form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name 
                      ? "focus:ring-red-500" 
                      : "focus:ring-orange-400"
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email 
                      ? "focus:ring-red-500" 
                      : "focus:ring-orange-400"
                  }`}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className={`w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.phone 
                      ? "focus:ring-red-500" 
                      : "focus:ring-orange-400"
                  }`}
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Location field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={loading || Object.keys(errors).length > 0}
                className="bg-orange-400 text-white px-6 py-3 rounded-lg font-medium flex-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-500 transition-all"
              >
                {loading ? "Saving..." : "Save Changes"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                disabled={loading}
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium flex-1 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // View mode - 2x2 Grid
          <motion.div 
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Full Name */}
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">Full Name</div>
              <div className="font-semibold text-gray-900">{user.name}</div>
            </div>

            {/* Email Address */}
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">Email Address</div>
              <div className="font-semibold text-gray-900 break-all">{user.email}</div>
            </div>

            {/* Phone Number */}
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">Phone Number</div>
              <div className="font-semibold text-gray-900">
                {user.profile?.phone || "Not provided"}
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">Location</div>
              <div className="font-semibold text-gray-900">
                {user.profile?.location || "Not provided"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
