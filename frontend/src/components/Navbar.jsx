import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Practice", path: "/practice" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Profile", path: "/profile" },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tight">Breathing App</div>
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
  );
}
