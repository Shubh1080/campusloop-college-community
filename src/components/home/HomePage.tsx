import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_CONFIG, Notice, CampusEvent, Post } from '../../types';
import { Badge } from '../common/Badge';
import { PostCard } from '../community/PostCard';
import {
  Sparkles,
  Calendar,
  Bell,
  HelpCircle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Building,
  Users
} from 'lucide-react';
import { seedCampusStarterData } from '../../services/campusService';

interface HomePageProps {
  notices: Notice[];
  events: CampusEvent[];
  posts: Post[];
  userVotes: Record<string, boolean>;
  onSelectNotice: (notice: Notice) => void;
  onSelectEvent: (event: CampusEvent) => void;
  onSelectPost: (post: Post) => void;
  onOpenCreatePost: (defaultType?: 'question' | 'discussion') => void;
  onOpenCreateNotice: () => void;
  onOpenCreateEvent: () => void;
  onOpenLogin: () => void;
  onNavigateTab: (tab: 'home' | 'community' | 'events') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  notices,
  events,
  posts,
  userVotes,
  onSelectNotice,
  onSelectEvent,
  onSelectPost,
  onOpenCreatePost,
  onOpenCreateNotice,
  onOpenCreateEvent,
  onOpenLogin,
  onNavigateTab,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const [seeding, setSeeding] = React.useState(false);

  // Personalized name greeting
  const getFirstName = () => {
    if (profile?.displayName) {
      return profile.displayName.split(' ')[0];
    }
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'Student';
  };

  const activeNotices = notices.filter((n) => n.status !== 'archived').slice(0, 3);
  const upcomingEvents = events.filter((e) => e.status !== 'cancelled').slice(0, 3);
  const recentPosts = posts.slice(0, 3);

  const handleSeedStarterData = async () => {
    if (!profile) return;
    setSeeding(true);
    try {
      await seedCampusStarterData(profile);
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Personalized Welcome Banner */}
      <section className="bg-gradient-to-br from-[#7565F7] to-[#5C4BD8] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-[#7565F7]/25">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white mb-3">
            <span className="w-2 h-2 rounded-full bg-[#D5F36B] animate-ping"></span>
            <span>{COLLEGE_CONFIG.name} Community</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Hey, {getFirstName()}! 👋
          </h1>
          <p className="text-white/80 text-xs sm:text-base mt-2 font-medium leading-relaxed">
            Welcome to CampusLoop. Stay informed with official university circulars, discover active student projects, and never miss upcoming campus events.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onOpenCreatePost('question')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D5F36B] hover:bg-[#c6eb49] text-[#191827] text-xs sm:text-sm font-extrabold shadow-sm hover:scale-102 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#191827]" />
              <span>Ask a Question</span>
            </button>

            <button
              onClick={() => onNavigateTab('events')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Explore Events</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </section>

      {/* Admin Seed Helper (if campus has no announcements or events yet) */}
      {isAdmin && notices.length === 0 && events.length === 0 && (
        <div className="p-4 rounded-2xl bg-white border border-[#E9E7F1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#7565F7] uppercase tracking-wider block">
              Admin Quick Setup
            </span>
            <p className="text-sm font-semibold text-[#191827]">
              CampusLoop is currently fresh and empty.
            </p>
            <p className="text-xs text-[#77778A]">
              Load starter official notices and campus events for JECRC Foundation with one click.
            </p>
          </div>
          <button
            onClick={handleSeedStarterData}
            disabled={seeding}
            className="px-4 py-2 rounded-xl bg-[#7565F7] text-white text-xs font-bold hover:bg-[#6352E8] transition-colors shrink-0 disabled:opacity-50"
          >
            {seeding ? 'Populating...' : 'Seed Starter Campus Data'}
          </button>
        </div>
      )}

      {/* 2. Important Notices Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#7565F7]/10 flex items-center justify-center text-[#7565F7]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#191827]">
                Important Notices
              </h2>
              <p className="text-[11px] text-[#77778A]">
                Official college communications from campus administration
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenCreateNotice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7565F7]/10 hover:bg-[#7565F7]/20 text-[#7565F7] text-xs font-bold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ New Notice</span>
            </button>
          )}
        </div>

        {activeNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E9E7F1] p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F0EEF9] text-[#7565F7] flex items-center justify-center mx-auto mb-2">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-[#191827]">You're all caught up!</p>
            <p className="text-xs text-[#77778A] mt-0.5">
              No new circulars have been published today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => onSelectNotice(notice)}
                className="bg-white rounded-2xl border border-[#E9E7F1] hover:border-[#7565F7]/40 p-5 cursor-pointer hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="official">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Official Notice</span>
                    </Badge>
                    <span className="text-[11px] text-[#77778A] font-medium">
                      {new Date(notice.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-[#191827] group-hover:text-[#7565F7] transition-colors line-clamp-2 leading-snug">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-[#77778A] mt-2 line-clamp-3 leading-relaxed">
                    {notice.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E9E7F1]/60 flex items-center justify-between text-xs">
                  <span className="text-[#77778A] font-medium truncate max-w-[150px]">
                    {notice.publisherName}
                  </span>
                  <span className="text-[#7565F7] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read notice <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Upcoming Events Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#D5F36B]/50 flex items-center justify-center text-[#191827]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#191827]">
                Upcoming Events
              </h2>
              <p className="text-[11px] text-[#77778A]">
                Hackathons, tech workshops, and college festivals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onOpenCreateEvent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7565F7]/10 hover:bg-[#7565F7]/20 text-[#7565F7] text-xs font-bold transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Event</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs font-bold text-[#7565F7] hover:underline flex items-center gap-1"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E9E7F1] p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F0EEF9] text-[#7565F7] flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-[#191827]">No upcoming events. Check back soon.</p>
            <p className="text-xs text-[#77778A] mt-0.5">
              Campus club activities will be scheduled here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-[#E9E7F1] p-5 hover:border-[#7565F7]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <Badge variant="accent">{event.category}</Badge>
                    <span className="text-[11px] font-semibold text-[#7565F7] flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.registrationCount || 0} attending
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#191827] line-clamp-2 leading-snug">
                    {event.title}
                  </h3>

                  <p className="text-xs text-[#77778A] mt-2 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 mt-3 pt-3 border-t border-[#E9E7F1]/60 text-xs text-[#77778A]">
                    <div className="flex items-center gap-2 truncate">
                      <Clock className="w-3.5 h-3.5 text-[#7565F7] shrink-0" />
                      <span className="truncate">{event.startAt}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#7565F7] shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3">
                  <button
                    onClick={() => onSelectEvent(event)}
                    className="w-full py-2.5 rounded-xl bg-[#F8F7FC] hover:bg-[#7565F7] text-[#191827] hover:text-white font-bold text-xs transition-colors"
                  >
                    View Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Recent Community Posts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#7565F7]/10 flex items-center justify-center text-[#7565F7]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#191827]">
                Recent Community Posts
              </h2>
              <p className="text-[11px] text-[#77778A]">
                Questions and discussions trending among students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCreatePost('question')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D5F36B] hover:bg-[#c9eb5a] text-[#191827] text-xs font-bold transition-all shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ask a Question</span>
            </button>
            <button
              onClick={() => onNavigateTab('community')}
              className="text-xs font-bold text-[#7565F7] hover:underline flex items-center gap-1 hidden sm:flex"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E9E7F1] p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F0EEF9] text-[#7565F7] flex items-center justify-center mx-auto mb-2">
              <HelpCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-[#191827]">Nothing here yet. Start the conversation.</p>
            <p className="text-xs text-[#77778A] mt-0.5">
              Ask about semester exams, lab assignments, or project ideas.
            </p>
            <button
              onClick={() => onOpenCreatePost('question')}
              className="mt-4 px-4 py-2 rounded-xl bg-[#7565F7] text-white text-xs font-bold hover:bg-[#6352E8] transition-colors"
            >
              Post First Question
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isUpvoted={!!userVotes[post.id]}
                onOpenDetail={onSelectPost}
                onOpenLogin={onOpenLogin}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
