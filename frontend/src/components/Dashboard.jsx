import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Area,
    AreaChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

// Tooltip component for activity heatmap
const ActivityTooltip = ({ day, position }) => {
  if (!day) return null;
  
  // Format date as "30 January, 2026"
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  return (
    <div 
      className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px',
      }}
    >
      <div className="font-semibold">{formatDate(day.date)}</div>
      <div className="text-gray-300">
        {day.sessions} session{day.sessions !== 1 ? 's' : ''} • {day.minutes} min
      </div>
      {/* Arrow */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45"
      />
    </div>
  );
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [patternUsage, setPatternUsage] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes, patternsRes, insightsRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/weekly-activity"),
        api.get("/dashboard/pattern-usage"),
        api.get("/dashboard/insights"),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (activityRes.data.success) setWeeklyActivity(activityRes.data.data);
      if (patternsRes.data.success) setPatternUsage(patternsRes.data.data);
      if (insightsRes.data.success) setInsights(insightsRes.data.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-light flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 font-medium"
          >
            Loading your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Chart colors for Recharts library (requires hex values)
  // These values match the Tailwind config primary color palette
  const COLORS = ['#0EA5A4', '#14B8B7', '#2DD4D4', '#5FDEDE', '#99E9E9'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-light to-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-gray-900 to-primary-dark bg-clip-text text-transparent mb-2">
            Welcome back, {user?.name || "Friend"}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your breathing journey at a glance
          </p>
        </motion.div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="🔥"
            value={stats?.today.streak || 0}
            label="Day Streak"
            subtitle={`Best: ${stats?.allTime.longestStreak || 0} days`}
            color="teal"
            delay={0.1}
          />
          <StatCard
            icon="🧘"
            value={stats?.allTime.totalSessions || 0}
            label="Total Sessions"
            subtitle={`+${stats?.thisWeek.sessions || 0} this week`}
            color="blue"
            delay={0.2}
          />
          <StatCard
            icon="⏱️"
            value={stats?.allTime.totalMinutes || 0}
            label="Total Minutes"
            subtitle={`${stats?.allTime.avgDuration || 0} min avg`}
            color="green"
            delay={0.3}
          />
          <StatCard
            icon="📈"
            value={stats?.allTime.weeklyAvg || 0}
            label="Weekly Average"
            subtitle="Sessions per week"
            color="purple"
            delay={0.4}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">📊</span>
              Today's Overview
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-primary-light to-primary-light rounded-xl p-5 border border-primary"
              >
                <div className="text-4xl font-bold text-primary-dark mb-1">
                  {stats?.today.sessions || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Sessions Today</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200"
              >
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {stats?.today.minutes || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Minutes Today</div>
              </motion.div>
            </div>

            {/* Weekly Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200"
            >
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                This Week vs Last Week
              </h3>
              <div className="space-y-4">
                <ComparisonBar
                  label="Sessions"
                  current={stats?.thisWeek.sessions || 0}
                  previous={stats?.lastWeek.sessions || 0}
                  change={stats?.comparison.sessionsChange || 0}
                />
                <ComparisonBar
                  label="Minutes"
                  current={stats?.thisWeek.minutes || 0}
                  previous={stats?.lastWeek.minutes || 0}
                  change={stats?.comparison.minutesChange || 0}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Insights Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
            className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Insights
              </h2>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-30 cursor-pointer"
                  >
                    <div className="text-3xl mb-2">{insight.icon}</div>
                    <p className="text-sm leading-relaxed">{insight.message}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 relative"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-3xl mr-3">📅</span>
            1-Year Activity
          </h2>
          
          {/* GitHub-style contribution graph */}
          <div className="w-full">
            <div className="flex gap-1 w-full justify-between">
              {/* Group by weeks */}
              {(() => {
                const weeks = [];
                for (let i = 0; i < weeklyActivity.length; i += 7) {
                  weeks.push(weeklyActivity.slice(i, i + 7));
                }
                
                return weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <motion.div
                        key={dayIndex}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9 + (weekIndex * 7 + dayIndex) * 0.001 }}
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay(day);
                          setTooltipPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-[15px] h-[15px] rounded-sm cursor-pointer transition-shadow border ${
                          day.active
                            ? day.sessions >= 3
                              ? "bg-primary-dark border-primary-dark"
                              : day.sessions >= 2
                              ? "bg-primary border-primary"
                              : "bg-primary-light border-primary"
                            : "bg-muted border-muted"
                        }`}
                      />
                    ))}
                  </div>
                ));
              })()}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {weeklyActivity.filter(d => d.active).length} days active in the last year
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-[15px] h-[15px] bg-muted border border-muted rounded-sm"></div>
                <div className="w-[15px] h-[15px] bg-primary-light border border-primary rounded-sm"></div>
                <div className="w-[15px] h-[15px] bg-primary border border-primary rounded-sm"></div>
                <div className="w-[15px] h-[15px] bg-primary-dark border border-primary-dark rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
          </div>
          
          {/* Tooltip */}
          {hoveredDay && (
            <ActivityTooltip day={hoveredDay} position={tooltipPosition} />
          )}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pattern Usage */}
          {patternUsage.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-3xl mr-3">🎯</span>
                Breathing Patterns
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={patternUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#0EA5A4" /* Recharts default - matches Tailwind primary */
                    dataKey="count"
                  >
                    {patternUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {patternUsage.slice(0, 3).map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index] }}
                      ></div>
                      <span className="text-gray-700">{pattern.name}</span>
                    </div>
                    <span className="text-gray-500">{pattern.count} sessions</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-3xl mr-3">📈</span>
              Weekly Trend
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyActivity.slice(-7)}>
                <defs>
                  {/* Gradient for Recharts - requires hex values from Tailwind config */}
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5A4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0EA5A4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`${value} sessions`, 'Sessions']}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="#0EA5A4" /* Recharts requires hex - matches Tailwind primary */
                  fillOpacity={1}
                  fill="url(#colorSessions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-3xl mr-3">🏆</span>
            Achievements
          </h2>
          <AchievementsGrid stats={stats} />
        </motion.div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, value, label, subtitle, color, delay }) {
  const colorClasses = {
    teal: "from-primary to-primary-dark shadow-primary/20",
    blue: "from-blue-400 to-blue-500 shadow-blue-200",
    green: "from-green-400 to-green-500 shadow-green-200",
    purple: "from-purple-400 to-purple-500 shadow-purple-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl shadow-lg p-6 text-white relative overflow-hidden cursor-pointer`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
      
      <div className="relative z-10">
        <div className="text-5xl mb-3">{icon}</div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: "spring", stiffness: 200 }}
          className="text-4xl font-bold mb-2"
        >
          {value}
        </motion.div>
        <div className="text-sm font-semibold opacity-90 mb-1">{label}</div>
        <div className="text-xs opacity-75">{subtitle}</div>
      </div>
    </motion.div>
  );
}

// Comparison Bar Component
function ComparisonBar({ label, current, previous, change }) {
  const maxValue = Math.max(current, previous, 1);
  const currentPercent = (current / maxValue) * 100;
  const previousPercent = (previous / maxValue) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">This week</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${currentPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-semibold text-gray-700 w-8">{current}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">Last week</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-400 h-2 rounded-full transition-all"
              style={{ width: `${previousPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-semibold text-gray-700 w-8">{previous}</span>
        </div>
      </div>
    </div>
  );
}

// Achievements Grid Component
function AchievementsGrid({ stats }) {
  const achievements = [
    { name: 'First Breath', icon: '🌱', requirement: 1, current: stats?.allTime.totalSessions || 0, type: 'sessions' },
    { name: 'Getting Started', icon: '🌿', requirement: 5, current: stats?.allTime.totalSessions || 0, type: 'sessions' },
    { name: 'Dedicated', icon: '🌳', requirement: 10, current: stats?.allTime.totalSessions || 0, type: 'sessions' },
    { name: 'Committed', icon: '🏆', requirement: 25, current: stats?.allTime.totalSessions || 0, type: 'sessions' },
    { name: '3-Day Streak', icon: '🔥', requirement: 3, current: stats?.allTime.longestStreak || 0, type: 'streak' },
    { name: 'Week Warrior', icon: '💪', requirement: 7, current: stats?.allTime.longestStreak || 0, type: 'streak' },
    { name: 'Hour of Peace', icon: '⏰', requirement: 60, current: stats?.allTime.totalMinutes || 0, type: 'minutes' },
    { name: 'Time Investment', icon: '⌛', requirement: 300, current: stats?.allTime.totalMinutes || 0, type: 'minutes' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {achievements.map((achievement, index) => {
        const unlocked = achievement.current >= achievement.requirement;
        const progress = Math.min((achievement.current / achievement.requirement) * 100, 100);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 + index * 0.05 }}
            whileHover={{ scale: unlocked ? 1.1 : 1.05, rotate: unlocked ? 5 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className={`relative rounded-xl p-4 text-center cursor-pointer ${
              unlocked
                ? 'bg-gradient-to-br from-primary to-primary-dark text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <div className="text-4xl mb-2">{achievement.icon}</div>
            <div className="text-sm font-semibold mb-1">{achievement.name}</div>
            {!unlocked && (
              <div className="text-xs">
                {achievement.current}/{achievement.requirement}
              </div>
            )}
            {unlocked && (
              <div className="absolute top-2 right-2 text-xl">✓</div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
