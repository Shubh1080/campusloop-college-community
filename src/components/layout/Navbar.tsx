import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_CONFIG } from '../../types';
import { Badge } from '../common/Badge';
import {
  LogOut,
  User as UserIcon,
  Shield,
  ChevronDown,
  Sparkles,
  MapPin,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenEditProfile: () => void;
  onOpenLogin: () => void;
  activeTab: 'home' | 'community' | 'events';
  setActiveTab: (tab: 'home' | 'community' | 'events') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenProfile,
  onOpenEditProfile,
  onOpenLogin,
  activeTab,
  setActiveTab,
}) => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E9E7F1] px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Campus Info */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7565F7] flex items-center justify-center text-white font-extrabold text-xl shadow-sm shadow-[#7565F7]/30 group-hover:scale-105 transition-transform">
              <span className="relative">CL</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#191827]">
                  {COLLEGE_CONFIG.appName}
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#7565F7]"></span>
                <span className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-[#7565F7] bg-[#7565F7]/10 px-2 py-0.5 rounded-md">
                  <MapPin className="w-3 h-3" />
                  {COLLEGE_CONFIG.name}
                </span>
              </div>
              <p className="text-[11px] text-[#77778A] font-medium hidden sm:block">
                {COLLEGE_CONFIG.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Center Navigation for Desktop */}
        <nav className="hidden md:flex items-center bg-[#F8F7FC] p-1 rounded-xl border border-[#E9E7F1]">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-white text-[#7565F7] shadow-xs'
                : 'text-[#77778A] hover:text-[#191827]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'community'
                ? 'bg-white text-[#7565F7] shadow-xs'
                : 'text-[#77778A] hover:text-[#191827]'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'events'
                ? 'bg-white text-[#7565F7] shadow-xs'
                : 'text-[#77778A] hover:text-[#191827]'
            }`}
          >
            Events
          </button>
        </nav>

        {/* User Profile / Auth Area */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#E9E7F1] hover:bg-[#F8F7FC] transition-colors focus:outline-hidden"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-lg object-cover border border-[#E9E7F1]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#7565F7]/10 text-[#7565F7] flex items-center justify-center font-bold text-sm">
                    {profile?.displayName?.charAt(0) || user.displayName?.charAt(0) || 'U'}
                  </div>
                )}

                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#191827] max-w-[120px] truncate leading-tight">
                    {profile?.displayName || user.displayName || 'Student'}
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin ? (
                      <span className="text-[10px] font-bold text-[#7565F7] flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5 fill-[#7565F7]" /> Admin
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-[#77778A]">
                        {profile?.branch ? profile.branch.split(' ')[0] : 'Student'}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronDown className="w-4 h-4 text-[#77778A] hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E9E7F1] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-[#E9E7F1] bg-[#F8F7FC]/50">
                    <p className="text-xs font-medium text-[#77778A]">Signed in as</p>
                    <p className="text-sm font-bold text-[#191827] truncate">
                      {profile?.displayName || user.displayName}
                    </p>
                    <p className="text-xs text-[#77778A] truncate">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={isAdmin ? 'primary' : 'secondary'}>
                        {isAdmin ? 'College Admin' : 'Student'}
                      </Badge>
                      {profile?.academicYear && (
                        <span className="text-[11px] text-[#77778A] font-medium">
                          {profile.academicYear.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#191827] hover:bg-[#F8F7FC] rounded-xl transition-colors text-left"
                    >
                      <UserIcon className="w-4 h-4 text-[#7565F7]" />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenEditProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#191827] hover:bg-[#F8F7FC] rounded-xl transition-colors text-left"
                    >
                      <Sparkles className="w-4 h-4 text-[#77778A]" />
                      <span>Edit Profile</span>
                    </button>
                  </div>

                  <div className="border-t border-[#E9E7F1] p-1.5">
                    <button
                      onClick={async () => {
                        setMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7565F7] text-white text-sm font-semibold hover:bg-[#6352E8] shadow-sm shadow-[#7565F7]/30 transition-all hover:scale-102"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
