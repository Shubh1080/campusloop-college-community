import React from 'react';
import { Notice } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { ShieldCheck, Calendar, Trash2, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deleteNotice } from '../../services/campusService';

interface NoticeDetailModalProps {
  notice: Notice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  notice,
  isOpen,
  onClose,
}) => {
  const { isAdmin } = useAuth();

  if (!notice) return null;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to remove this official notice?')) {
      await deleteNotice(notice.id);
      onClose();
    }
  };

  const formattedDate = new Date(notice.publishedAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9E7F1] pb-3">
          <Badge variant="official">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official College Notice</span>
          </Badge>

          <div className="flex items-center gap-1.5 text-xs text-[#77778A]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-[#191827] leading-tight">
          {notice.title}
        </h2>

        {/* Publisher */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F8F7FC] border border-[#E9E7F1] text-xs">
          <Building2 className="w-4 h-4 text-[#7565F7]" />
          <div>
            <span className="text-[#77778A]">Issued by: </span>
            <span className="font-bold text-[#191827]">{notice.publisherName}</span>
          </div>
        </div>

        {/* Summary Callout */}
        <div className="p-3.5 rounded-xl bg-[#7565F7]/5 border-l-4 border-[#7565F7] text-xs sm:text-sm text-[#191827] font-medium leading-relaxed">
          {notice.summary}
        </div>

        {/* Full Content */}
        <div className="text-sm text-[#191827] leading-relaxed whitespace-pre-line pt-2">
          {notice.content}
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="pt-4 border-t border-[#E9E7F1] flex justify-end">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Notice</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
