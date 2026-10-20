import React, { useState } from 'react';
import { CampusEvent } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Building,
  Sparkles,
  Ban
} from 'lucide-react';
import {
  registerForEvent,
  cancelEventRegistration,
  deleteEvent,
  updateEvent
} from '../../services/campusService';

interface EventDetailModalProps {
  event: CampusEvent | null;
  isOpen: boolean;
  onClose: () => void;
  isRegistered: boolean;
  onOpenLogin: () => void;
  onEditEvent?: (event: CampusEvent) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  isRegistered,
  onOpenLogin,
  onEditEvent,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!event) return null;

  const isCancelled = event.status === 'cancelled';
  const isPast = event.status === 'completed';

  const handleToggleRSVP = async () => {
    if (!user || !profile) {
      onOpenLogin();
      return;
    }

    if (isCancelled || isPast) return;

    setLoading(true);
    setError(null);
    try {
      if (isRegistered) {
        await cancelEventRegistration(event.id, user.uid);
      } else {
        await registerForEvent(event.id, profile);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to update RSVP.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(event.id);
      onClose();
    }
  };

  const handleToggleCancelEvent = async () => {
    const nextStatus = isCancelled ? 'upcoming' : 'cancelled';
    if (
      window.confirm(
        isCancelled
          ? 'Restore this event to upcoming?'
          : 'Are you sure you want to mark this event as cancelled?'
      )
    ) {
      await updateEvent(event.id, { status: nextStatus });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        {/* Category & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9E7F1] pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="accent">{event.category}</Badge>
            {isCancelled && (
              <Badge variant="danger">
                <Ban className="w-3 h-3" /> Event Cancelled
              </Badge>
            )}
            {isPast && <Badge variant="secondary">Completed</Badge>}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7565F7] bg-[#7565F7]/10 px-2.5 py-1 rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span>{event.registrationCount || 0} Attending</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-[#191827] leading-tight">
          {event.title}
        </h2>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8F7FC] border border-[#E9E7F1]">
            <Calendar className="w-4 h-4 text-[#7565F7] shrink-0" />
            <div className="min-w-0">
              <span className="text-[#77778A] block">Date & Time</span>
              <span className="font-bold text-[#191827] truncate block">{event.startAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8F7FC] border border-[#E9E7F1]">
            <MapPin className="w-4 h-4 text-[#7565F7] shrink-0" />
            <div className="min-w-0">
              <span className="text-[#77778A] block">Venue</span>
              <span className="font-bold text-[#191827] truncate block">{event.venue}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8F7FC] border border-[#E9E7F1] sm:col-span-2">
            <Building className="w-4 h-4 text-[#7565F7] shrink-0" />
            <div className="min-w-0">
              <span className="text-[#77778A] block">Organized by</span>
              <span className="font-bold text-[#191827] truncate block">{event.organizer}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#77778A] mb-2">
            About this Event
          </h4>
          <p className="text-sm text-[#191827] leading-relaxed whitespace-pre-line bg-[#F8F7FC] p-4 rounded-xl border border-[#E9E7F1]">
            {event.description}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* RSVP Action Banner */}
        <div className="pt-2">
          {isCancelled ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-center">
              This event has been cancelled by the organizers. Registrations are disabled.
            </div>
          ) : isPast ? (
            <div className="p-3 rounded-xl bg-[#F0EEF9] text-[#77778A] text-xs font-medium text-center">
              This event has concluded.
            </div>
          ) : (
            <button
              onClick={handleToggleRSVP}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-60 ${
                isRegistered
                  ? 'bg-emerald-50 hover:bg-rose-50 text-emerald-700 hover:text-rose-600 border border-emerald-200 hover:border-rose-200 group'
                  : 'bg-[#7565F7] hover:bg-[#6352E8] text-white shadow-[#7565F7]/30'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : isRegistered ? (
                <>
                  <CheckCircle2 className="w-4 h-4 group-hover:hidden" />
                  <span className="group-hover:hidden">You're Registered! (Click to Cancel)</span>
                  <Ban className="w-4 h-4 hidden group-hover:inline" />
                  <span className="hidden group-hover:inline">Cancel My Registration</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>RSVP for this Event</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="pt-3 border-t border-[#E9E7F1] flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#7565F7]">Admin Actions</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleCancelEvent}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                {isCancelled ? 'Unmark Cancelled' : 'Mark as Cancelled'}
              </button>
              {onEditEvent && (
                <button
                  onClick={() => {
                    onClose();
                    onEditEvent(event);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#191827] bg-[#F8F7FC] hover:bg-[#E9E7F1] transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
