import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { Post, PostCategory, PostType } from '../../types';
import { createPost, updatePost } from '../../services/campusService';
import { HelpCircle, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit?: Post | null;
  defaultType?: PostType;
}

const CATEGORIES: PostCategory[] = ['Academics', 'Programming', 'Projects', 'General'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  postToEdit,
  defaultType = 'question',
}) => {
  const { user, profile } = useAuth();
  const [type, setType] = useState<PostType>(defaultType);
  const [category, setCategory] = useState<PostCategory>('Academics');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postToEdit) {
      setType(postToEdit.type);
      setCategory(postToEdit.category);
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
    } else {
      setType(defaultType);
      setCategory('Academics');
      setTitle('');
      setContent('');
    }
    setError(null);
  }, [postToEdit, defaultType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a post title.');
      return;
    }
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (!content.trim()) {
      setError('Please provide the post content or details.');
      return;
    }

    if (!user || !profile) {
      setError('You must be signed in to post.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (postToEdit) {
        await updatePost(postToEdit.id, {
          title: title.trim(),
          content: content.trim(),
          type,
          category,
        });
      } else {
        await createPost({
          title,
          content,
          type,
          category,
          authorId: user.uid,
          authorName: profile.displayName || user.displayName || 'Campus Student',
          authorBranch: profile.branch || 'Student',
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="font-extrabold text-[#191827]">
          {postToEdit ? 'Edit Post' : 'Create Community Post'}
        </span>
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
        {/* Post Type Selector (Question vs Discussion) */}
        <div>
          <label className="block text-xs font-bold text-[#191827] mb-1.5">
            Post Type
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setType('question')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                type === 'question'
                  ? 'bg-[#7565F7] text-white border-[#7565F7] shadow-xs'
                  : 'bg-[#F8F7FC] text-[#77778A] border-[#E9E7F1] hover:text-[#191827]'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Question</span>
            </button>

            <button
              type="button"
              onClick={() => setType('discussion')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                type === 'discussion'
                  ? 'bg-[#7565F7] text-white border-[#7565F7] shadow-xs'
                  : 'bg-[#F8F7FC] text-[#77778A] border-[#E9E7F1] hover:text-[#191827]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discussion</span>
            </button>
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold text-[#191827] mb-1.5">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  category === cat
                    ? 'bg-[#191827] text-white border-[#191827]'
                    : 'bg-[#F8F7FC] text-[#77778A] border-[#E9E7F1] hover:text-[#191827]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-[#191827] mb-1.5">
            Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === 'question'
                ? "e.g. How do I prepare for 3rd semester Operating Systems lab exam?"
                : "e.g. Guide: Best resources for React & TypeScript beginners on campus"
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-[#191827] mb-1.5">
            Description & Details *
          </label>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Elaborate on your question or idea. Provide relevant context or links..."
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
                <CheckCircle2 className="w-4 h-4" />
                <span>{postToEdit ? 'Save Changes' : 'Publish Post'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
