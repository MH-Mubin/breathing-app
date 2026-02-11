import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import FeedbackModal from "./FeedbackModal";

export default function LandingPage() {
  const { user } = useContext(AuthContext);
  const [animationData, setAnimationData] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Load Lottie animation
  useEffect(() => {
    fetch('/lottie-animation/login_page_Breathing Exercise.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  // Load public feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await api.get("/feedback/public");
        if (response.data.success && response.data.data) {
          setFeedbacks(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch feedbacks:", error);
        // Set empty array on error so page still renders
        setFeedbacks([]);
      }
    };

    fetchFeedbacks();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-6"
              >
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  ✨ Welcome to Respira
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 bg-clip-text text-transparent">
                  Master Your Breath,
                </span>
                <br />
                <span className="text-gray-900">Transform Your Life</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Discover the power of rhythmic breathing. Reduce stress, improve focus, and boost your energy with guided exercises designed for your well-being.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
                  >
                    Get Started Free
                  </motion.button>
                </Link>
                <Link to="/practice">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all border-2 border-gray-200"
                  >
                    Try Demo
                  </motion.button>
                </Link>
              </motion.div>
              
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-8"
              >
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-br from-orange-500 to-orange-900 bg-clip-text text-transparent">10k+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-br from-orange-500 to-orange-900 bg-clip-text text-transparent">50k+</div>
                  <div className="text-sm text-gray-600">Sessions Today</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-br from-orange-500 to-orange-900 bg-clip-text text-transparent">4.9★</div>
                  <div className="text-sm text-gray-600">User Rating</div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Visual - Lottie Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-full max-w-lg">
                {/* Background glow effects */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.15, 0.3],
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300 blur-3xl"
                />
                
                {/* Lottie Animation Container */}
                <div className="relative z-10 flex items-center justify-center">
                  {animationData ? (
                    <Lottie 
                      animationData={animationData} 
                      loop={true}
                      style={{ width: '100%', maxWidth: 450, height: 'auto' }}
                    />
                  ) : (
                    <div className="w-full h-96 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-400"></div>
                    </div>
                  )}
                </div>
                
                {/* Floating decorative elements */}
                {[
                  { delay: 0, x: -60, y: -60, emoji: '✨', size: 'text-3xl' },
                  { delay: 1, x: 60, y: -50, emoji: '💫', size: 'text-2xl' },
                  { delay: 2, x: -50, y: 60, emoji: '🌟', size: 'text-2xl' },
                  { delay: 1.5, x: 55, y: 55, emoji: '⭐', size: 'text-3xl' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.4, 0.9, 0.4],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: item.delay,
                      ease: "easeInOut",
                    }}
                    className={`absolute ${item.size}`}
                    style={{
                      left: `calc(50% + ${item.x}px)`,
                      top: `calc(50% + ${item.y}px)`,
                    }}
                  >
                    {item.emoji}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">Benefits of Regular Practice</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience transformative changes in your physical and mental well-being
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "😌", title: "Reduce Stress", desc: "Lower cortisol levels and activate your body's natural relaxation response", color: "from-blue-400 to-blue-500" },
              { icon: "🧠", title: "Improve Focus", desc: "Enhance mental clarity and concentration through mindful breathing", color: "from-purple-400 to-purple-500" },
              { icon: "⚡", title: "Boost Energy", desc: "Increase oxygen flow and vitality with energizing breath patterns", color: "from-orange-400 to-orange-500" },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100 relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${benefit.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
                <div className="relative z-10">
                  <div className="text-6xl mb-4">{benefit.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">How It Works</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />
            
            {[
              { num: "1", title: "Choose Goal & Pattern", desc: "Select from various breathing patterns designed for different goals", icon: "🎯" },
              { num: "2", title: "Select Session Time", desc: "Customize duration to fit your schedule, from a quick pause to a deep session", icon: "⏱️" },
              { num: "3", title: "Follow the ball movement", desc: "Sync your breath with the visual guide to maintain the perfect rhythm", icon: "👁️" },
              { num: "4", title: "Track the progress", desc: "Monitor your journey and build consistency with detailed analytics", icon: "📊" },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-xl mb-6 relative z-10"
                  >
                    {step.num}
                  </motion.div>
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-3 leading-tight">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Experts Say */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Expert Insights</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">What Experts Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leading health professionals on the science of breathwork
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: "Dr. Andrew Weil", 
                role: "Integrative Medicine Pioneer", 
                credential: "MD, Harvard Medical School",
                quote: "Breathing techniques are among the most powerful tools for reducing stress and anxiety. Regular practice can significantly improve both mental and physical health.",
                icon: "🩺"
              },
              { 
                name: "Dr. Herbert Benson", 
                role: "Mind-Body Medicine Expert", 
                credential: "MD, Harvard Medical School",
                quote: "The relaxation response triggered by controlled breathing counteracts the harmful effects of stress, lowering blood pressure and heart rate naturally.",
                icon: "🧬"
              },
              { 
                name: "Dr. James Nestor", 
                role: "Breathing Science Author", 
                credential: "Journalist & Researcher",
                quote: "How we breathe matters. Proper breathing techniques can enhance athletic performance, improve sleep quality, and boost overall well-being.",
                icon: "📚"
              },
            ].map((expert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-orange-100 relative overflow-hidden group"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 opacity-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-5xl mb-4">{expert.icon}</div>
                  
                  {/* Quote */}
                  <p className="text-gray-700 mb-6 italic leading-relaxed text-lg">
                    "{expert.quote}"
                  </p>
                  
                  {/* Expert Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="font-bold text-gray-900 text-lg">{expert.name}</div>
                    <div className="text-orange-600 font-semibold text-sm mt-1">{expert.role}</div>
                    <div className="text-gray-500 text-xs mt-1">{expert.credential}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 mb-6">Join thousands who transformed their lives</p>
            
            {/* Share Feedback Button */}
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFeedbackModal(true)}
                className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                ✨ Share Your Experience
              </motion.button>
            ) : (
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  ✨ Login to Share Your Experience
                </motion.button>
              </Link>
            )}
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {feedbacks.length > 0 ? (
              feedbacks.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-2xl ${i < testimonial.rating ? 'text-orange-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.feedback}"</p>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-900 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                      {testimonial.name[0]}
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">Respira User</div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Fallback testimonials if no feedbacks yet
              [
                { name: "Sarah Johnson", role: "Yoga Instructor", quote: "This app has completely transformed my daily routine. The breathing exercises are simple yet incredibly effective!", rating: 5 },
                { name: "Michael Chen", role: "Software Engineer", quote: "Perfect for managing work stress. I use it every day during my breaks and feel so much more focused.", rating: 5 },
                { name: "Emma Davis", role: "Student", quote: "The guided sessions help me stay calm during exams. Highly recommend to anyone dealing with anxiety!", rating: 5 },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-orange-400 text-2xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-900 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                      {testimonial.name[0]}
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-orange-500 to-orange-900 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -ml-32 -mb-32" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join our community and experience the transformative power of breathwork
              </p>
              <Link to="/practice">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-orange-600 px-10 py-5 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl transition-all"
                >
                  Begin Your Practice →
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
