import { motion } from "framer-motion";
import { useMemo } from "react";

export default function ProfileCard({ user }) {
  // Generate initials from user name
  const initials = useMemo(() => {
    if (!user?.name) return "?";
    
    const nameParts = user.name.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  }, [user?.name]);

  // Format member since date
  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "Unknown";
    
    const date = new Date(user.createdAt);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      year: "numeric" 
    });
  }, [user?.createdAt]);

  // Get statistics with defaults
  const stats = useMemo(() => ({
    totalSessions: user?.stats?.totalSessions || 0,
    streak: user?.stats?.streak || 0,
  }), [user?.stats]);

  // Get achievements count
  const achievementsCount = useMemo(() => {
    return user?.achievements?.length || 0;
  }, [user?.achievements]);

  if (!user) {
    return (
      <div className="card p-6 flex flex-col items-center">
        <p className="text-gray-500">No user data available</p>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl border-2 border-primary p-8 flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Avatar with edit icon */}
      <motion.div 
        className="relative mb-6"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {user.profile?.avatar ? (
          <img 
            src={user.profile.avatar} 
            alt={user.name}
            className="rounded-full w-32 h-32 object-cover"
          />
        ) : (
          <div className="rounded-full bg-primary w-32 h-32 flex items-center justify-center text-6xl text-white font-semibold">
            {initials}
          </div>
        )}
        {/* Edit icon */}
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="absolute bottom-0 right-0 bg-gray-900 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-lg"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </motion.div>
      </motion.div>

      {/* User name */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{user.name}</h2>
      
      {/* User email */}
      <p className="text-gray-500 text-sm mb-4 text-center break-all px-2">
        {user.email}
      </p>

      {/* Premium badge
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-heading font-semibold mb-6 cursor-default"
      >
        Premium Member
      </motion.div> */}

      {/* Statistics */}
      <div className="w-full space-y-3 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Member Since</span>
          <span className="font-bold text-gray-900">{memberSince}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Total Sessions</span>
          <span className="font-bold text-primary">{stats.totalSessions}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Current Streak</span>
          <span className="font-bold text-primary">{stats.streak} days</span>
        </div>
      </div>

      {/* Achievements section */}
      <div className="w-full bg-gray-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h4 className="font-bold text-gray-900">Achievements</h4>
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          {achievementsCount > 0 ? (
            user.achievements.slice(0, 3).map((achievement, index) => (
              <motion.div
                key={achievement._id || index}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="bg-primary rounded-2xl w-16 h-16 flex items-center justify-center text-3xl cursor-pointer shadow-md"
                title={achievement.name || "Achievement"}
              >
                {achievement.icon || "🏆"}
              </motion.div>
            ))
          ) : (
            // Show placeholder locked achievements
            [1, 2, 3].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="bg-primary rounded-2xl w-16 h-16 flex items-center justify-center text-3xl cursor-pointer shadow-md"
                title="Locked achievement"
              >
                🏆
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
