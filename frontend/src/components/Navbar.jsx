import { useContext, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthRequiredModal from "./AuthRequiredModal";

export default function Navbar() {
  const location = useLocation();
  const { token } = useContext(AuthContext);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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

  // Handle navigation click
  const handleNavClick = (e, item) => {
    // If user is not logged in and trying to access protected route
    if (!token && item.requiresAuth) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };
  
  return (
    <>
      <nav className="w-full bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">Respira</div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </nav>

      {/* Auth Required Modal */}
      <AuthRequiredModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
