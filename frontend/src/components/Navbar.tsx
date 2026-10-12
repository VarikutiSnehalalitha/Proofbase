import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FolderKanban,
  Compass,
  Layers,
  BarChart3,
  Plus,
  User as UserIcon,
  LogOut,
  Settings,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: 'Dashboard', path: '/', authOnly: true, icon: FolderKanban },
    { label: 'Projects', path: '/projects', authOnly: true, icon: FolderKanban },
    { label: 'Collections', path: '/collections', authOnly: true, icon: Layers },
    { label: 'Discover', path: '/discover', authOnly: false, icon: Compass },
    { label: 'Analytics', path: '/analytics', authOnly: true, icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                Proofbase
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                Verified Proof
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((link) => !link.authOnly || !!user)
              .map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      active
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {link.label}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* Right CTA / User Dropdown */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/projects/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>New Project</span>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold overflow-hidden">
                    {user.profile?.avatarUrl ? (
                      <img
                        src={user.profile.avatarUrl}
                        alt={user.profile.name || user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user.profile?.name?.[0] || user.username[0] || 'U').toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                    {user.profile?.name || user.username}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-slideDown">
                      <div className="px-3.5 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user.profile?.name || user.username}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={`/p/${user.username}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          Public Portfolio
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          Profile Settings
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          Account Settings
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{ color: '#ffffff' }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              to="/projects/new"
              className="p-1.5 rounded-lg bg-slate-900 text-white"
            >
              <Plus className="w-4 h-4 text-white" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navLinks
            .filter((link) => !link.authOnly || !!user)
            .map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive(link.path)
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {link.label}
                </Link>
              );
            })}

          {user ? (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <Link
                to={`/p/${user.username}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                View Public Portfolio
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold border border-slate-200 rounded-lg text-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
