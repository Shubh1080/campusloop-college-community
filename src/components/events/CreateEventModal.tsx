import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { CampusEvent, EventCategory } from '../../types';
import { createEvent, updateEvent } from '../../services/campusService';
import { Calendar, AlertCircle, Sparkles } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CampusEvent | null;
}

const CATEGORIES: EventCategory[] = [
  'Hackathon',
  'Workshop',
  'Competition',
  'Cultural Event',
  'Other',
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Hackathon');
  const [organizer, setOrganizer] = useState('');
  const [startAt, setStartAt] = useState('');
  const [venue, setVenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      setCategory(eventToEdit.category);
      setOrganizer(eventToEdit.organizer);
      setStartAt(eventToEdit.startAt);
      setVenue(eventToEdit.venue);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Hackathon');
      setOrganizer('');
      setStartAt('');
      setVenue('');
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !organizer.trim() || !startAt.trim() || !venue.trim()) {
      setError('Please fill in all event fields.');
      return;
    }

    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      if (eventToEdit) {
        await updateEvent(eventToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          category,
          organizer: organizer.trim(),
          startAt: startAt.trim(),
          venue: venue.trim(),
        });
      } else {
        await createEvent({
          title,
          description,
          category,
          organizer,
          startAt,
          venue,
          createdBy: user.uid,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-base font-bold text-[#191827]">
          <Calendar className="w-5 h-5 text-[#7565F7]" />
          <span>{eventToEdit ? 'Edit Event' : 'Create Campus Event'}</span>
        </div>
      }
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#191827] mb-1.5">
            Event Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. HackLoop 2026: 24-Hour Collegiate Hackathon"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#191827] mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191827] mb-1.5">
              Organizer / Club *
            </label>
            <input
              type="text"
              required
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="e.g. Coding Club / Tech Council"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#191827] mb-1.5">
              Date & Time *
            </label>
            <input
              type="text"
              required
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              placeholder="e.g. Sat, Nov 14, 2026 • 09:00 AM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191827] mb-1.5">
              Venue / Location *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Main Auditorium Block A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#191827] mb-1.5">
            Full Description & Agenda *
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the schedule, prizes, eligibility, prerequisites, and what students will gain..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden resize-none"
          ></textarea>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E7F1]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E9E7F1] text-sm font-semibold text-[#77778A] hover:bg-[#F8F7FC]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7565F7] hover:bg-[#6352E8] text-white text-sm font-bold shadow-sm shadow-[#7565F7]/30 transition-all disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{eventToEdit ? 'Update Event' : 'Publish Event'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
