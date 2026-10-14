import { useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthRequiredModal from "./AuthRequiredModal";
import Icon from "./Icon";

export default function Navbar() {
  const location = useLocation();
  const { token } = useContext(AuthContext);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Handle navigation click
  const handleNavClick = (e, item) => {
    // If user is not logged in and trying to access protected route
    if (!token && item.requiresAuth) {
      e.preventDefault();
      setShowAuthModal(true);
    }
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="w-full bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/30 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Respira Logo" className="h-8 w-8" />
            <div className="text-xl font-bold tracking-tight dark:text-white">Respira</div>
          </NavLink>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-2">
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
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all ml-2"
              >
                Login
              </NavLink>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="md:hidden p-2 -mr-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <Icon name={menuOpen ? "close" : "menu"} className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile navigation */}
        {menuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-gray-100 dark:border-slate-700 px-4 py-3 flex flex-col gap-1"
        >
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={({ isActive }) =>
                `block w-full text-center ${isActive ? "nav-active" : "nav-link"}`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {!token && (
            <NavLink
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full font-semibold text-center hover:shadow-lg transition-all"
            >
              Login
            </NavLink>
          )}
        </div>
        )}
      </nav>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
