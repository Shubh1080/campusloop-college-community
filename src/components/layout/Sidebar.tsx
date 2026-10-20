import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_CONFIG } from '../../types';
import { Home, Users, Calendar, Shield, Sparkles, PlusCircle } from 'lucide-react';

interface SidebarProps {
  activeTab: 'home' | 'community' | 'events';
  setActiveTab: (tab: 'home' | 'community' | 'events') => void;
  onOpenCreatePost: () => void;
  onOpenCreateEvent?: () => void;
  onOpenCreateNotice?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreatePost,
  onOpenCreateEvent,
  onOpenCreateNotice,
}) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
      description: 'Campus notices & pulse',
    },
    {
      id: 'community' as const,
      label: 'Community',
      icon: Users,
      description: 'Questions & discussions',
    },
    {
      id: 'events' as const,
      label: 'Events',
      icon: Calendar,
      description: 'Hackathons & fests',
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-[#E9E7F1] min-h-[calc(100vh-65px)] p-4 sticky top-[65px]">
      {/* College Mini Badge */}
      <div className="p-3.5 mb-5 rounded-2xl bg-[#F8F7FC] border border-[#E9E7F1]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D5F36B] animate-pulse"></div>
          <span className="text-xs font-bold text-[#191827] uppercase tracking-wider">
            Campus Network
          </span>
        </div>
        <p className="text-sm font-extrabold text-[#191827] mt-1 truncate">
          {COLLEGE_CONFIG.name}
        </p>
        <p className="text-[11px] text-[#77778A] font-medium truncate">
          {COLLEGE_CONFIG.location}
        </p>
      </div>

      {/* Main Navigation */}
      <div className="space-y-1.5 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#77778A] px-3 mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all text-left group ${
                isActive
                  ? 'bg-[#7565F7] text-white shadow-sm shadow-[#7565F7]/30'
                  : 'text-[#191827] hover:bg-[#F8F7FC]'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-[#77778A]'
                }`}
              />
              <div className="flex-1 truncate">
                <div className="leading-snug">{item.label}</div>
              </div>
            </button>
          );
        })}

        {/* Quick Action */}
        <div className="pt-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#77778A] px-3 mb-2">
            Quick Action
          </p>
          <button
            onClick={onOpenCreatePost}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#D5F36B] hover:bg-[#c9eb5a] text-[#191827] font-bold text-sm transition-all shadow-xs hover:scale-102"
          >
            <PlusCircle className="w-4 h-4 text-[#191827]" />
            <span>Ask / Share Post</span>
          </button>
        </div>

        {/* Admin Quick Panel */}
        {isAdmin && (
          <div className="pt-6">
            <div className="flex items-center gap-1.5 px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#7565F7]">
              <Shield className="w-3.5 h-3.5 fill-[#7565F7]" />
              <span>Admin Desk</span>
            </div>
            <div className="space-y-1.5 bg-[#7565F7]/5 p-2 rounded-2xl border border-[#7565F7]/15">
              {onOpenCreateNotice && (
                <button
                  onClick={onOpenCreateNotice}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#191827] hover:bg-white rounded-lg transition-colors text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7565F7]" />
                  <span>+ Official Notice</span>
                </button>
              )}
              {onOpenCreateEvent && (
                <button
                  onClick={onOpenCreateEvent}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#191827] hover:bg-white rounded-lg transition-colors text-left"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#7565F7]" />
                  <span>+ Create Event</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#E9E7F1] text-[11px] text-[#77778A]">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#191827]">CampusLoop v1.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
        <p className="mt-0.5">Independent student community.</p>
      </div>
    </aside>
  );
};
