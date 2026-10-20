import React from 'react';
import { Home, Users, Calendar, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  activeTab: 'home' | 'community' | 'events';
  setActiveTab: (tab: 'home' | 'community' | 'events') => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenLogin,
}) => {
  const { user } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E9E7F1] px-4 py-2 flex items-center justify-around shadow-lg">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
          activeTab === 'home'
            ? 'text-[#7565F7] font-bold'
            : 'text-[#77778A] hover:text-[#191827] font-medium'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[11px]">Home</span>
      </button>

      <button
        onClick={() => setActiveTab('community')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
          activeTab === 'community'
            ? 'text-[#7565F7] font-bold'
            : 'text-[#77778A] hover:text-[#191827] font-medium'
        }`}
      >
        <Users className={`w-5 h-5 ${activeTab === 'community' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[11px]">Community</span>
      </button>

      <button
        onClick={() => setActiveTab('events')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
          activeTab === 'events'
            ? 'text-[#7565F7] font-bold'
            : 'text-[#77778A] hover:text-[#191827] font-medium'
        }`}
      >
        <Calendar className={`w-5 h-5 ${activeTab === 'events' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[11px]">Events</span>
      </button>

      <button
        onClick={() => {
          if (user) {
            onOpenProfile();
          } else {
            onOpenLogin();
          }
        }}
        className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all text-[#77778A] hover:text-[#191827] font-medium"
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[11px]">{user ? 'Profile' : 'Sign In'}</span>
      </button>
    </div>
  );
};
