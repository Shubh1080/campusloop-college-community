import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_CONFIG } from '../../types';
import { Modal } from '../common/Modal';
import { GraduationCap, BookOpen, User, CheckCircle2 } from 'lucide-react';

interface ProfileSetupModalProps {
  isOpen: boolean;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen }) => {
  const { user, profile, completeInitialProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [branch, setBranch] = useState(COLLEGE_CONFIG.defaultBranches[0]);
  const [academicYear, setAcademicYear] = useState(COLLEGE_CONFIG.academicYears[0]);
  const [customBranch, setCustomBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please provide your name.');
      return;
    }

    const selectedBranch = branch === 'Other' && customBranch.trim() ? customBranch.trim() : branch;
    if (!selectedBranch) {
      setError('Please select or specify your branch.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await completeInitialProfile({
        displayName: displayName.trim(),
        branch: selectedBranch,
        academicYear,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} maxWidth="md">
      <div className="py-1">
        <div className="w-12 h-12 rounded-2xl bg-[#D5F36B] flex items-center justify-center text-[#191827] mx-auto mb-3 shadow-xs">
          <GraduationCap className="w-6 h-6" />
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-[#191827]">
            Welcome to {COLLEGE_CONFIG.shortName} CampusLoop!
          </h3>
          <p className="text-xs text-[#77778A] mt-1">
            Let your classmates know who you are. This takes less than 30 seconds.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#191827] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#7565F7]" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Shubh Aggarwal"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] focus:outline-hidden focus:border-[#7565F7] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white transition-colors"
            />
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-bold text-[#191827] mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#7565F7]" />
              <span>Academic Year</span>
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] focus:outline-hidden focus:border-[#7565F7] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white transition-colors"
            >
              {COLLEGE_CONFIG.academicYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Branch / Department */}
          <div>
            <label className="block text-xs font-bold text-[#191827] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#7565F7]" />
              <span>Department / Branch</span>
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] focus:outline-hidden focus:border-[#7565F7] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white transition-colors"
            >
              {COLLEGE_CONFIG.defaultBranches.map((br) => (
                <option key={br} value={br}>
                  {br}
                </option>
              ))}
            </select>

            {branch === 'Other' && (
              <input
                type="text"
                placeholder="Enter your department name"
                value={customBranch}
                onChange={(e) => setCustomBranch(e.target.value)}
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-[#E9E7F1] text-xs text-[#191827] bg-[#F8F7FC] focus:bg-white"
              />
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#7565F7] hover:bg-[#6352E8] text-white font-bold text-sm shadow-md shadow-[#7565F7]/30 transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Join CampusLoop</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
