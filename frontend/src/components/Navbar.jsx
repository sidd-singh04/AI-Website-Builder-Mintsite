import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Zap,
  Settings,
  Menu,
  X,
  LogOut,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/authContext.jsx";
import { Logo } from "../assets/UI.jsx";
import s from "../styles/Navbar.module.css";

// Standard navigation links
const links = [
  { label: "Home", to: "/", notProtected: true },
  { label: "Community", to: "/community", notProtected: true },
  { label: "Pricing", to: "/pricing", notProtected: true },
];

// Account links shown in mobile view for authenticated users
const accountLinks = [
  { label: "Dashboard", to: "/dashboard", icon: Plus },
  { label: "Buy Credits", to: "/pricing", icon: Zap },
  { label: "Settings", to: "/settings", icon: Settings },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const isAuth = Boolean(user);

  const visibleLinks = links.filter(
    (link) => link.notProtected || isAuth
  );

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Dropdown menu for logged-in users
  const userMenu = () => {
    return (
      <div className={s.userMenu} ref={menuRef}>
        <button
          className={s.userMenuTrigger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className={s.avatar}>
            {user?.name ? user.name.toUpperCase() : "U"}
          </div>

          <span className={s.userName}>
            {user?.name}
          </span>

          <ChevronDown
            size={16}
            className={s.chevronIcon}
          />
        </button>

        {menuOpen && (
          <div className={s.userDropdown}>
            <div className={s.dropdownHeader}>
              <div className={s.dropdownName}>
                {user?.name}
              </div>

              <div className={s.dropdownEmail}>
                {user?.email}
              </div>
            </div>

            <div className={s.creditsBadge}>
              <Zap
                size={14}
                className={s.zapIcon}
              />

              <span>
                {user?.credits ?? 0} Credits
              </span>
            </div>

            <hr className={s.dropdownDivider} />

            <Link
              to="/dashboard"
              className={s.dropdownLink}
              onClick={() => setMenuOpen(false)}
            >
              <Plus
                size={16}
                className={s.dropdownIcon}
              />

              <span>Dashboard</span>
            </Link>

            <Link
              to="/pricing"
              className={s.dropdownLink}
              onClick={() => setMenuOpen(false)}
            >
              <Zap
                size={16}
                className={s.dropdownIcon}
              />

              <span>Buy Credits</span>
            </Link>

            <Link
              to="/settings"
              className={s.dropdownLink}
              onClick={() => setMenuOpen(false)}
            >
              <Settings
                size={16}
                className={s.dropdownIcon}
              />

              <span>Settings</span>
            </Link>

            <hr className={s.dropdownDivider} />

            <button
              className={s.dropdownLogout}
              onClick={() => {
                logoutUser();
                setMenuOpen(false);
                navigate("/");
              }}
            >
              <LogOut
                size={16}
                className={s.dropdownIcon}
              />

              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={s.root}>
      <div className={s.tContainer}>

        {/* Logo and Brand */}
        {/* IMPORTANT:
            Logo already contains a Link,
            so do NOT wrap Logo inside another Link.
        */}
        <Logo className={s.logoWrapper} />

        {/* Center links - Desktop */}
        <div className={s.centerLinks}>
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `${s.navLinkBase} ${
                  isActive
                    ? s.navLinkActive
                    : s.navLinkInactive
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side links - Desktop */}
        <div className={s.desktopRight}>
          {isAuth ? (
            userMenu()
          ) : (
            <>
              <Link
                to="/login"
                className={s.signInLink}
              >
                Sign In
              </Link>

              <button
                className={`${s.buttonPrimary} px-4 py-2 text-[13px]`}
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Hamburger menu - Mobile */}
        <button
          className={s.hamburger}
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X className={s.hamburgerIcon} />
          ) : (
            <Menu className={s.hamburgerIcon} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className={s.mobileMenu}>

          {visibleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={s.mobileLink}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className={s.mobileDivider}>

            {isAuth ? (
              <>
                {accountLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={s.mobileAccountLink}
                      onClick={() => setOpen(false)}
                    >
                      <Icon className={s.iconSM} />

                      <span>
                        {link.label}
                      </span>
                    </Link>
                  );
                })}

                <button
                  className={s.mobileSignOutButton}
                  onClick={() => {
                    logoutUser();
                    setOpen(false);
                    navigate("/");
                  }}
                >
                  <LogOut className={s.iconSM} />

                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={s.mobileLink}
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Link>

                <button
                  className={`${s.buttonPrimary} ${s.mobileGetStarted}`}
                  onClick={() => {
                    navigate("/register");
                    setOpen(false);
                  }}
                >
                  Get Started
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </nav>
  );
}