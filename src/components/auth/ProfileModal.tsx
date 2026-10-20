import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_CONFIG } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  User,
  BookOpen,
  GraduationCap,
  Shield,
  Mail,
  Edit2,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEditMode?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  initialEditMode = false,
}) => {
  const { user, profile, isAdmin, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [branch, setBranch] = useState(profile?.branch || COLLEGE_CONFIG.defaultBranches[0]);
  const [academicYear, setAcademicYear] = useState(profile?.academicYear || COLLEGE_CONFIG.academicYears[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBranch(profile.branch || COLLEGE_CONFIG.defaultBranches[0]);
      setAcademicYear(profile.academicYear || COLLEGE_CONFIG.academicYears[0]);
    }
    setIsEditing(initialEditMode);
    setSuccess(false);
    setError(null);
  }, [profile, initialEditMode, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        branch,
        academicYear,
      });
      setSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Profile' : 'Student Profile'}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8F7FC] border border-[#E9E7F1]">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={profile?.displayName || 'Avatar'}
              className="w-16 h-16 rounded-2xl object-cover border border-[#E9E7F1] shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#7565F7] text-white flex items-center justify-center font-extrabold text-2xl shadow-xs">
              {profile?.displayName?.charAt(0) || 'U'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#191827] truncate">
                {profile?.displayName || user?.displayName}
              </h3>
              <Badge variant={isAdmin ? 'primary' : 'secondary'}>
                {isAdmin ? 'Campus Admin' : 'Student'}
              </Badge>
            </div>
            <p className="text-xs text-[#77778A] truncate mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </p>
            <p className="text-xs font-semibold text-[#7565F7] mt-1">
              {COLLEGE_CONFIG.name}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile successfully updated!</span>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#191827] mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191827] mb-1.5">
                Department / Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
              >
                {COLLEGE_CONFIG.defaultBranches.map((br) => (
                  <option key={br} value={br}>
                    {br}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191827] mb-1.5">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
              >
                {COLLEGE_CONFIG.academicYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E9E7F1] text-sm font-semibold text-[#77778A] hover:bg-[#F8F7FC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#7565F7] hover:bg-[#6352E8] text-white text-sm font-bold shadow-sm shadow-[#7565F7]/30 transition-all disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E9E7F1]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#77778A] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#7565F7]" />
                  <span>Branch</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#191827] mt-1">
                  {profile?.branch || 'Not specified'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E9E7F1]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#77778A] flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#7565F7]" />
                  <span>Year</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#191827] mt-1">
                  {profile?.academicYear || 'Not specified'}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="p-3.5 rounded-xl bg-[#7565F7]/5 border border-[#7565F7]/20 flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#7565F7] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-[#191827] block">
                    Administrator Privileges Active
                  </span>
                  <span className="text-[#77778A] block mt-0.5">
                    You can publish official campus notices, create events, and moderate community posts.
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E9E7F1] hover:bg-[#F8F7FC] text-sm font-bold text-[#191827] transition-colors mt-3"
            >
              <Edit2 className="w-4 h-4 text-[#7565F7]" />
              <span>Edit Details</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
