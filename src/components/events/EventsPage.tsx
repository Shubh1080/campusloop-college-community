import React, { useState, useMemo } from 'react';
import { CampusEvent, EventCategory } from '../../types';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  Building,
  Ban
} from 'lucide-react';
import {
  registerForEvent,
  cancelEventRegistration
} from '../../services/campusService';

interface EventsPageProps {
  events: CampusEvent[];
  userRegistrations: Record<string, boolean>;
  onSelectEvent: (event: CampusEvent) => void;
  onOpenCreateEvent: () => void;
  onOpenLogin: () => void;
  onEditEvent?: (event: CampusEvent) => void;
}

const CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Hackathon',
  'Workshop',
  'Competition',
  'Cultural Event',
  'Other',
];

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  userRegistrations,
  onSelectEvent,
  onOpenCreateEvent,
  onOpenLogin,
  onEditEvent,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [events, selectedCategory]);

  const handleToggleRSVP = async (e: React.MouseEvent, event: CampusEvent) => {
    e.stopPropagation();
    if (!user || !profile) {
      onOpenLogin();
      return;
    }

    if (event.status === 'cancelled' || event.status === 'completed') {
      return;
    }

    const isRegistered = !!userRegistrations[event.id];
    setLoadingEventId(event.id);
    try {
      if (isRegistered) {
        await cancelEventRegistration(event.id, user.uid);
      } else {
        await registerForEvent(event.id, profile);
      }
    } catch (err) {
      console.error('RSVP action failed:', err);
    } finally {
      setLoadingEventId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E9E7F1] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D5F36B]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#191827]">
              Campus Calendar & Happenings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#191827] mt-1 tracking-tight">
            Campus Events & Workshops
          </h1>
          <p className="text-xs sm:text-sm text-[#77778A] mt-0.5">
            RSVP for upcoming hackathons, tech talks, coding contests, and cultural festivals.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenCreateEvent}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#7565F7] hover:bg-[#6352E8] text-white font-extrabold text-sm shadow-md shadow-[#7565F7]/30 transition-all hover:scale-102 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
              selectedCategory === cat
                ? 'bg-[#191827] text-white border-[#191827] shadow-xs'
                : 'bg-white text-[#77778A] border-[#E9E7F1] hover:text-[#191827] hover:border-[#CBD5E1]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E9E7F1] p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F0EEF9] text-[#7565F7] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-[#191827]">
            No upcoming events. Check back soon.
          </h3>
          <p className="text-xs sm:text-sm text-[#77778A] mt-1 max-w-sm mx-auto">
            There are currently no events listed in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const isRegistered = !!userRegistrations[event.id];
            const isCancelled = event.status === 'cancelled';
            const isPast = event.status === 'completed';
            const isLoading = loadingEventId === event.id;

            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className={`group bg-white rounded-3xl border border-[#E9E7F1] hover:border-[#7565F7]/40 p-5 sm:p-6 transition-all hover:shadow-lg flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                  isCancelled ? 'opacity-80 bg-neutral-50/50' : ''
                }`}
              >
                <div>
                  {/* Category & Attendees */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="accent">{event.category}</Badge>
                      {isCancelled && (
                        <Badge variant="danger">
                          <Ban className="w-3 h-3" /> Cancelled
                        </Badge>
                      )}
                    </div>

                    <span className="text-xs font-bold text-[#7565F7] flex items-center gap-1 bg-[#7565F7]/10 px-2.5 py-0.5 rounded-full">
                      <Users className="w-3 h-3" />
                      {event.registrationCount || 0}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-base sm:text-lg text-[#191827] group-hover:text-[#7565F7] transition-colors line-clamp-2 leading-snug">
                    {event.title}
                  </h3>

                  {/* Description preview */}
                  <p className="text-xs text-[#77778A] mt-2 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Details Block */}
                  <div className="mt-4 pt-3 border-t border-[#E9E7F1]/70 space-y-2 text-xs text-[#77778A]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#7565F7] shrink-0" />
                      <span className="font-semibold text-[#191827] truncate">
                        {event.startAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#7565F7] shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#7565F7] shrink-0" />
                      <span className="truncate font-medium">{event.organizer}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: View details & RSVP */}
                <div className="pt-4 mt-4 border-t border-[#E9E7F1]/70 flex items-center gap-2">
                  <button
                    onClick={() => onSelectEvent(event)}
                    className="flex-1 py-2.5 rounded-xl bg-[#F8F7FC] hover:bg-[#E9E7F1] text-xs font-bold text-[#191827] transition-colors"
                  >
                    View Details
                  </button>

                  {!isCancelled && !isPast && (
                    <button
                      onClick={(e) => handleToggleRSVP(e, event)}
                      disabled={isLoading}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60 ${
                        isRegistered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                          : 'bg-[#7565F7] hover:bg-[#6352E8] text-white shadow-xs'
                      }`}
                    >
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : isRegistered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Registered</span>
                        </>
                      ) : (
                        <span>RSVP</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
