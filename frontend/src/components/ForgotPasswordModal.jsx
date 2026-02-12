import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/forgot-password", { email });

      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      console.error("Send OTP error:", err);
      const message = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/verify-otp", { email, otp });

      toast.success("OTP verified!");
      setStep(3);
    } catch (err) {
      console.error("Verify OTP error:", err);
      const message = err.response?.data?.message || "Invalid OTP. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!passwords.password) {
      setError("Please enter a new password");
      return;
    }

    if (passwords.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        password: passwords.password,
      });

      if (response.data.success) {
        toast.success("Password reset successful! Please login with your new password.");
        
        // Close modal and redirect to login
        handleClose();
        setTimeout(() => {
          navigate("/login");
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      const message = err.response?.data?.message || "Failed to reset password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStep(1);
      setEmail("");
      setOtp("");
      setPasswords({ password: "", confirmPassword: "" });
      setError("");
      onClose();
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 2) {
      setOtp("");
      setStep(1);
    } else if (step === 3) {
      setPasswords({ password: "", confirmPassword: "" });
      setStep(2);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold">Reset Password</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Step {step} of 3
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {/* Step 1: Email */}
                {step === 1 && (
                  <motion.form 
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSendOTP}
                  >
                    <p className="text-gray-600 mb-4">
                      Enter your email address and we'll send you a 6-digit OTP to reset your password.
                    </p>

                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        disabled={loading}
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-4 py-2 flex-1 cursor-pointer"
                      >
                        {loading ? "Sending..." : "Send OTP"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="btn-outline px-4 py-2 flex-1 cursor-pointer"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                  <motion.form 
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleVerifyOTP}
                  >
                    <p className="text-gray-600 mb-4">
                      We've sent a 6-digit OTP to <strong>{email}</strong>
                    </p>

                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Enter OTP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                          setError("");
                        }}
                        placeholder="000000"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-center text-2xl font-mono tracking-widest"
                        disabled={loading}
                        autoFocus
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        OTP expires in 10 minutes
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        type="button"
                        onClick={handleBack}
                        disabled={loading}
                        className="btn-outline px-4 py-2 cursor-pointer"
                      >
                        ← Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="btn-primary px-4 py-2 flex-1 cursor-pointer"
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </motion.button>
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setOtp("");
                          setError("");
                        }}
                        className="text-sm text-primary hover:text-primary-dark"
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                  <motion.form 
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleResetPassword}
                    autoComplete="off"
                  >
                    <p className="text-gray-600 mb-4">
                      Enter your new password below
                    </p>

                    {/* New Password */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.password ? "text" : "password"}
                          value={passwords.password}
                          onChange={(e) => {
                            setPasswords(prev => ({ ...prev, password: e.target.value }));
                            setError("");
                          }}
                          placeholder="Create a new password"
                          className="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                          disabled={loading}
                          autoFocus
                          autoComplete="new-password"
                          name="new-password"
                          id="reset-new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, password: !prev.password }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.password ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 6 characters
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwords.confirmPassword}
                          onChange={(e) => {
                            setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }));
                            setError("");
                          }}
                          placeholder="Re-enter your new password"
                          className="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                          disabled={loading}
                          autoComplete="new-password"
                          name="confirm-new-password"
                          id="reset-confirm-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        type="button"
                        onClick={handleBack}
                        disabled={loading}
                        className="btn-outline px-4 py-2 cursor-pointer"
                      >
                        ← Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-4 py-2 flex-1 cursor-pointer"
                      >
                        {loading ? "Resetting..." : "Reset Password"}
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
