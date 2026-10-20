import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_CONFIG } from '../../types';
import { Modal } from '../common/Modal';
import { Sparkles, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unable to complete sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center py-2">
        {/* Brand Logo */}
        <div className="w-16 h-16 rounded-2xl bg-[#7565F7] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#7565F7]/30 mx-auto mb-4">
          CL
        </div>

        <h2 className="text-2xl font-black text-[#191827] tracking-tight">
          Welcome to {COLLEGE_CONFIG.appName}
        </h2>
        <p className="text-sm font-semibold text-[#7565F7] mt-0.5">
          {COLLEGE_CONFIG.tagline}
        </p>

        {/* College Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EEF9] text-xs font-semibold text-[#191827] mt-3">
          <MapPin className="w-3.5 h-3.5 text-[#7565F7]" />
          <span>{COLLEGE_CONFIG.name} • {COLLEGE_CONFIG.location.split(',')[0]}</span>
        </div>

        {/* Benefits List */}
        <div className="mt-6 text-left space-y-2.5 bg-[#F8F7FC] p-4 rounded-xl border border-[#E9E7F1]">
          <div className="flex items-start gap-2.5 text-xs text-[#191827]">
            <CheckCircle2 className="w-4 h-4 text-[#7565F7] shrink-0 mt-0.5" />
            <span>Official notices and academic deadlines in real-time</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-[#191827]">
            <CheckCircle2 className="w-4 h-4 text-[#7565F7] shrink-0 mt-0.5" />
            <span>Ask questions, share projects, and upvote peer answers</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-[#191827]">
            <CheckCircle2 className="w-4 h-4 text-[#7565F7] shrink-0 mt-0.5" />
            <span>Discover campus hackathons, workshops, and RSVP with 1-click</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="mt-6">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-[#E9E7F1] hover:border-[#7565F7]/40 bg-white hover:bg-[#F8F7FC] text-[#191827] font-bold text-sm transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#7565F7] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-[11px] text-[#77778A]">
          By continuing, you agree to student community conduct guidelines.
        </p>
      </div>
    </Modal>
  );
};
