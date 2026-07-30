import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthRequiredModal from "./AuthRequiredModal";

export default function Navbar() {
  const location = useLocation();
  const { token } = useContext(AuthContext);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if we're on login or register page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Define navigation items with authentication requirements
  const navItems = [
    { name: "Home", path: "/", requiresAuth: false },
    { name: "Practice", path: "/practice", requiresAuth: false },
    { name: "Dashboard", path: "/dashboard", requiresAuth: true },
    { name: "Profile", path: "/profile", requiresAuth: true },
  ];

  // Determine which nav items to show
  const getVisibleNavItems = () => {
    if (isAuthPage) {
      // On login/register pages: show only Home and Practice
      return navItems.filter(item => !item.requiresAuth);
    }
    // On all other pages: show all 4 buttons
    return navItems;
  };

  const visibleNavItems = getVisibleNavItems();

  // Close the mobile menu whenever we land on a new route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close the mobile menu on Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // Handle navigation click
  const handleNavClick = (e, item) => {
    // If user is not logged in and trying to access protected route
    if (!token && item.requiresAuth) {
      e.preventDefault();
      setShowAuthModal(true);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="w-full bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/30 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Respira Logo" className="h-7 w-7 sm:h-8 sm:w-8" />
            <div className="text-lg sm:text-xl font-bold tracking-tight dark:text-white">Respira</div>
          </NavLink>

          {/* Desktop / tablet navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={({ isActive }) =>
                  isActive ? "nav-active" : "nav-link"
                }
              >
                {item.name}
              </NavLink>
            ))}

            {/* Login Button - Only show when user is NOT logged in */}
            {!token && (
              <NavLink
                to="/login"
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 lg:px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all ml-1 lg:ml-2 whitespace-nowrap"
              >
                Login
              </NavLink>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-primary dark:text-white hover:bg-secondary dark:hover:bg-slate-700 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex"
                >
                  <X className="h-6 w-6" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex"
                >
                  <Menu className="h-6 w-6" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile navigation panel */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg"
            >
              <motion.div
                initial={{ y: -8 }}
                animate={{ y: 0 }}
                exit={{ y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col gap-1 px-4 py-3"
              >
                {visibleNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item)}
                    className={({ isActive }) =>
                      isActive ? "nav-active-mobile" : "nav-link-mobile"
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}

                {/* Login Button - Only show when user is NOT logged in */}
                {!token && (
                  <NavLink
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-2 bg-gradient-to-r from-primary to-primary-dark text-white text-center px-6 py-3 rounded-full font-semibold"
                  >
                    Login
                  </NavLink>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop closes the mobile menu when tapping the page behind it */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-10 bg-slate-900/20"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
