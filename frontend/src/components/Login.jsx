import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { getBackendOrigin } from "../utils/api";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Load Lottie animation
  useEffect(() => {
    fetch("/lottie-animation/login_page_Breathing Exercise.json")
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error("Error loading animation:", error));
  }, []);

  // Handle Google OAuth Redirect Token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const authError = params.get("error");

    if (urlToken) {
      login(urlToken);
      toast.success("Google Login Success!");
      navigate("/", { replace: true });
    } else if (authError) {
      toast.error("Google Authentication Failed");
    }
  }, [login, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      if (response.data.success) {
        const { token } = response.data.data;
        login(token);
        toast.success("Login Success!");
        navigate("/");
        // Scroll to top after navigation
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message,
      );
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full flex items-start justify-center relative overflow-hidden px-4 md:px-6 pt-5 pb-3 lg:pt-6 lg:pb-4 bg-[#f7f9fb] dark:bg-slate-900 transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute w-[1200px] h-[1200px] -top-1/4 -right-1/4 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #98f2f0 0%, transparent 70%)",
            opacity: 0.15,
          }}
        ></div>
        <div
          className="absolute w-[800px] h-[800px] -bottom-1/4 -left-1/4 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #98f2f0 0%, transparent 70%)",
            opacity: 0.15,
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-[1140px] mx-auto flex flex-col lg:flex-row items-center justify-center gap-5 lg:gap-7 lg:px-4 h-full">
        {/* Left Column: Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2 flex justify-center lg:justify-end relative order-1"
        >
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 lg:p-7 shadow-[0_20px_40px_rgba(15,23,42,0.04)] dark:shadow-slate-900/50 border border-[#bdc9c8]/15 dark:border-slate-700 w-full max-w-[440px] mx-auto lg:mx-0 min-h-[520px] lg:min-h-[535px] flex flex-col justify-between">
            {/* Header */}
            <div className="flex flex-col space-y-1.5 mb-4 text-center lg:text-left">
              <h2 className="text-xl lg:text-2xl font-heading font-bold text-[#191c1e] dark:text-white leading-tight">
                Welcome to Respira
              </h2>
              <div className="flex items-center justify-center lg:justify-start space-x-1">
                <span className="text-[#3e4948] dark:text-gray-400">
                  Don't have an account?
                </span>
                <Link
                  to="/register"
                  className="text-primary font-bold hover:underline underline-offset-4 decoration-primary/30"
                >
                  Sign up
                </Link>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email Input */}
              <div className="relative">
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 z-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-6 py-3 border border-gray-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm lg:text-base bg-white dark:bg-slate-700 text-gray-900 placeholder-gray-500 dark:text-white dark:placeholder-gray-400 relative z-0"
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 z-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-14 py-3 border border-gray-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm lg:text-base bg-white dark:bg-slate-700 text-gray-900 placeholder-gray-500 dark:text-white dark:placeholder-gray-400 relative z-0"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="text-right -mt-1">
                <button
                  type="button"
                  className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base hover:bg-gray-900 hover:shadow-xl hover:scale-[1.01]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Google Login Divider */}
            <div className="mt-3 flex items-center justify-between">
              <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/4"></span>
              <span className="text-xs text-center text-gray-500 uppercase dark:text-gray-400">
                or login with
              </span>
              <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/4"></span>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={() =>
                (window.location.href = `${getBackendOrigin()}/api/auth/google`)
              }
              className="w-full mt-3 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 py-2.5 rounded-full font-semibold transition-all duration-200 text-sm lg:text-base hover:bg-gray-50 dark:hover:bg-slate-600 shadow-sm flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Register Link */}
            <div className="mt-4 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-base">
                Not a member?{" "}
                <Link
                  to="/register"
                  className="text-primary font-semibold hover:text-primary-dark transition-colors"
                >
                  Register now
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Visuals & Lottie */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center lg:justify-start space-y-2.5 order-2"
        >
          <div className="space-y-2 w-full max-w-[560px] mx-auto lg:mx-0 pr-0 lg:pr-1">
            <h1
              className="text-2xl lg:text-[2.15rem] font-heading font-extrabold text-gray-950 dark:text-white leading-[1.05]"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.10)" }}
            >
              Breathe deep, sharpen your{" "}
              <span className="text-primary italic">focus.</span>
            </h1>
            <p
              className="text-gray-700 dark:text-slate-100 text-xs lg:text-sm max-w-md leading-relaxed font-medium"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
            >
              Join our community of practitioners who prioritize mental clarity
              through rhythmic breathing.
            </p>
          </div>

          <div className="relative group w-full max-w-[620px] mx-auto lg:mx-0">
            <div className="absolute -inset-4 bg-[#7bd5d4] opacity-20 rounded-[2.5rem] blur-2xl transition duration-1000 group-hover:duration-200 group-hover:opacity-40"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden bg-[#eceef0] dark:bg-slate-800 shadow-2xl aspect-[16/11] max-h-[350px] flex flex-col justify-center items-center p-2 lg:p-3">
              {/* Lottie Animation */}
              <div className="flex items-center justify-center z-10 w-full h-full">
                {animationData ? (
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    style={{ width: "130%", height: "130%" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
