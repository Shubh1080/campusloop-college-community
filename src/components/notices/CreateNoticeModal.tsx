import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { createNotice } from '../../services/campusService';
import { Shield, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [publisherName, setPublisherName] = useState(
    profile?.displayName ? `${profile.displayName} (Office of Administration)` : 'Dean of Academic Affairs'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) {
      setError('Please fill in all notice fields.');
      return;
    }

    if (!user) {
      setError('You must be signed in as administrator.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createNotice({
        title,
        summary,
        content,
        publisherId: user.uid,
        publisherName: publisherName.trim(),
      });
      setTitle('');
      setSummary('');
      setContent('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to publish notice.');
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
          <Shield className="w-5 h-5 text-[#7565F7]" />
          <span>Publish Official Campus Notice</span>
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
            Notice Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. End-Term Examination Schedule Released for Autumn 2026"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#191827] mb-1.5">
            Brief Summary (appears on dashboard cards) *
          </label>
          <input
            type="text"
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g. Detailed timetable and seating arrangements published. Check department office."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#191827] mb-1.5">
            Publisher Designation / Department *
          </label>
          <input
            type="text"
            required
            value={publisherName}
            onChange={(e) => setPublisherName(e.target.value)}
            placeholder="e.g. Office of the Registrar / Academic Council"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#191827] mb-1.5">
            Full Announcement Content *
          </label>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the full announcement details, instructions, links, or criteria..."
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
                <span>Publish Notice</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
