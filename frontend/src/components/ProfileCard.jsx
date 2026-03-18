import { AnimatePresence, motion } from "framer-motion";
import { useContext, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

// Resize image on a canvas and return base64 data URI
function resizeImage(file, maxSize = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        // Scale down keeping aspect ratio
        if (w > h) {
          if (w > maxSize) {
            h = Math.round((h * maxSize) / w);
            w = maxSize;
          }
        } else {
          if (h > maxSize) {
            w = Math.round((w * maxSize) / h);
            h = maxSize;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        // Export as JPEG for smaller file size (quality 0.85)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function ProfileCard({ user, onUpdate }) {
  const { reloadUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

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
      year: "numeric",
    });
  }, [user?.createdAt]);

  // Get statistics with defaults
  const stats = useMemo(
    () => ({
      totalSessions: user?.stats?.totalSessions || 0,
      streak: user?.stats?.streak || 0,
    }),
    [user?.stats]
  );

  // Get achievements count
  const achievementsCount = useMemo(() => {
    return user?.achievements?.length || 0;
  }, [user?.achievements]);

  const hasAvatar = !!user?.profile?.avatar;

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image (PNG, JPG, GIF, or WEBP)");
      return;
    }

    // Validate file size (max 5MB raw)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 5MB");
      return;
    }

    try {
      const resized = await resizeImage(file, 200);
      setPreview(resized);
      setShowMenu(false);
    } catch {
      toast.error("Failed to process image");
    }

    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  // Upload the previewed image
  const handleUpload = async () => {
    if (!preview) return;

    setUploading(true);
    try {
      const res = await api.post("/user/avatar", { avatar: preview });
      if (res.data.success) {
        toast.success("Profile picture updated!");
        setPreview(null);
        if (onUpdate) onUpdate(res.data.data);
        await reloadUser();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to upload picture";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  // Remove avatar
  const handleRemove = async () => {
    setUploading(true);
    try {
      const res = await api.delete("/user/avatar");
      if (res.data.success) {
        toast.success("Profile picture removed");
        setPreview(null);
        setShowMenu(false);
        if (onUpdate) onUpdate(res.data.data);
        await reloadUser();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to remove picture";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  // Cancel preview
  const handleCancelPreview = () => {
    setPreview(null);
  };

  // Handle edit icon click
  const handleEditClick = () => {
    if (hasAvatar) {
      // Show menu with options: Change / Remove
      setShowMenu((prev) => !prev);
    } else {
      // No avatar — go directly to file picker
      fileInputRef.current?.click();
    }
  };

  if (!user) {
    return (
      <div className="card p-6 flex flex-col items-center">
        <p className="text-gray-500">No user data available</p>
      </div>
    );
  }

  // Determine what to show as the avatar image
  const displaySrc = preview || user.profile?.avatar;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-primary p-8 flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Avatar with edit icon */}
      <div className="relative mb-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {displaySrc ? (
            <img
              src={displaySrc}
              alt={user.name}
              className="rounded-full w-32 h-32 object-cover border-4 border-primary/20"
            />
          ) : (
            <div className="rounded-full bg-primary w-32 h-32 flex items-center justify-center text-6xl text-white font-semibold">
              {initials}
            </div>
          )}
        </motion.div>

        {/* Edit icon button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          onClick={handleEditClick}
          disabled={uploading}
          className="absolute bottom-0 right-0 bg-gray-900 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </motion.button>

        {/* Dropdown menu (Change / Remove) */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute -bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden w-44 z-10"
            >
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Change Photo
              </button>
              <button
                onClick={handleRemove}
                disabled={uploading}
                className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Photo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview action buttons (Confirm / Cancel) */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 mb-4"
          >
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-1.5 bg-primary text-white text-sm rounded-full font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </>
              )}
            </button>
            <button
              onClick={handleCancelPreview}
              disabled={uploading}
              className="px-4 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-full font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User name */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        {user.name}
      </h2>

      {/* User email */}
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 text-center break-all px-2">
        {user.email}
      </p>

      {/* Statistics */}
      <div className="w-full space-y-3 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Member Since</span>
          <span className="font-bold text-gray-900 dark:text-white">{memberSince}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Total Sessions</span>
          <span className="font-bold text-primary">{stats.totalSessions}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Current Streak</span>
          <span className="font-bold text-primary">{stats.streak} days</span>
        </div>
      </div>

      {/* Achievements section */}
      <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-5 h-5 text-primary"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h4 className="font-bold text-gray-900 dark:text-white">Achievements</h4>
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          {achievementsCount > 0
            ? user.achievements.slice(0, 3).map((achievement, index) => (
                <motion.div
                  key={achievement._id || index}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  className="bg-primary rounded-2xl w-16 h-16 flex items-center justify-center text-3xl cursor-pointer shadow-md"
                  title={achievement.name || "Achievement"}
                >
                  {achievement.icon || "🏆"}
                </motion.div>
              ))
            : // Show placeholder locked achievements
              [1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  className="bg-primary rounded-2xl w-16 h-16 flex items-center justify-center text-3xl cursor-pointer shadow-md"
                  title="Locked achievement"
                >
                  🏆
                </motion.div>
              ))}
        </div>
      </div>

      {/* Click-away overlay to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );
}
