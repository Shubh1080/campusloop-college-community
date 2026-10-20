import React, { useState, useEffect } from 'react';
import { Post, PostComment } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  ThumbsUp,
  MessageSquare,
  Trash2,
  Edit2,
  Send,
  HelpCircle,
  Clock,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import {
  subscribeComments,
  createComment,
  deleteComment,
  deletePost,
  toggleUpvote
} from '../../services/campusService';

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  isUpvoted: boolean;
  onOpenLogin: () => void;
  onEditPost?: (post: Post) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  isUpvoted,
  onOpenLogin,
  onEditPost,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!post || !isOpen) {
      setComments([]);
      return;
    }

    const unsub = subscribeComments(post.id, (loadedComments) => {
      setComments(loadedComments);
    });

    return () => unsub();
  }, [post, isOpen]);

  if (!post) return null;

  const isAuthor = user && user.uid === post.authorId;
  const canDelete = isAuthor || isAdmin;

  const handleVote = async () => {
    if (!user) {
      onOpenLogin();
      return;
    }
    setLoadingVote(true);
    try {
      await toggleUpvote(post.id, user.uid, isUpvoted);
    } catch (err: any) {
      setError(err?.message || 'Vote failed');
    } finally {
      setLoadingVote(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user || !profile) {
      onOpenLogin();
      return;
    }

    setLoadingComment(true);
    setError(null);
    try {
      await createComment({
        postId: post.id,
        authorId: user.uid,
        authorName: profile.displayName || user.displayName || 'Campus Student',
        authorPhotoURL: user.photoURL || '',
        content: commentText.trim(),
      });
      setCommentText('');
    } catch (err: any) {
      setError(err?.message || 'Failed to post reply.');
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(post.id);
      onClose();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Delete this comment?')) {
      await deleteComment(commentId, post.id);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        {/* Header Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9E7F1] pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="primary">
              {post.type === 'question' ? (
                <HelpCircle className="w-3.5 h-3.5" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
              <span className="capitalize">{post.type}</span>
            </Badge>

            <Badge variant="secondary">{post.category}</Badge>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#77778A]">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeAgo(post.createdAt)}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-[#191827] leading-tight">
          {post.title}
        </h2>

        {/* Author row */}
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F8F7FC] border border-[#E9E7F1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#7565F7]/10 text-[#7565F7] flex items-center justify-center font-bold text-xs">
              {post.authorName.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-xs text-[#191827] block">
                {post.authorName}
              </span>
              <span className="text-[11px] text-[#77778A] block">
                {post.authorBranch || 'Student'}
              </span>
            </div>
          </div>

          {/* Action buttons for owner / admin */}
          <div className="flex items-center gap-1.5">
            {isAuthor && onEditPost && (
              <button
                onClick={() => {
                  onClose();
                  onEditPost(post);
                }}
                className="p-1.5 rounded-lg text-[#77778A] hover:text-[#191827] hover:bg-black/5 transition-colors"
                title="Edit post"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDeletePost}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Post Full Body */}
        <div className="text-sm text-[#191827] leading-relaxed whitespace-pre-line py-2">
          {post.content}
        </div>

        {/* Interactions Row: Upvote & Comments Count */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#E9E7F1]">
          <button
            onClick={handleVote}
            disabled={loadingVote}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              isUpvoted
                ? 'bg-[#7565F7] text-white border-[#7565F7] shadow-xs'
                : 'bg-white hover:bg-[#F8F7FC] text-[#191827] border-[#E9E7F1]'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-white' : ''}`} />
            <span>{isUpvoted ? 'Upvoted' : 'Upvote'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/10 text-xs">
              {post.upvotesCount || 0}
            </span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#77778A]">
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length} Comments</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-4 border-t border-[#E9E7F1]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#77778A] mb-3">
            Discussion & Answers ({comments.length})
          </h4>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                user
                  ? "Write an answer or helpful perspective..."
                  : "Sign in to join the conversation..."
              }
              disabled={loadingComment}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E9E7F1] text-xs sm:text-sm text-[#191827] bg-[#F8F7FC] focus:bg-white focus:border-[#7565F7] focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={loadingComment || !commentText.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#7565F7] hover:bg-[#6352E8] text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-[#77778A] text-center py-4 bg-[#F8F7FC] rounded-xl border border-dashed border-[#E9E7F1]">
                No replies yet. Be the first to chime in!
              </p>
            ) : (
              comments.map((c) => {
                const canDeleteComment = (user && user.uid === c.authorId) || isAdmin;
                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E9E7F1] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {c.authorPhotoURL ? (
                          <img
                            src={c.authorPhotoURL}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#7565F7]/10 text-[#7565F7] flex items-center justify-center font-bold text-[10px]">
                            {c.authorName.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-[#191827]">{c.authorName}</span>
                        <span className="text-[10px] text-[#77778A]">• {timeAgo(c.createdAt)}</span>
                      </div>

                      {canDeleteComment && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-[#77778A] hover:text-rose-600 p-1"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#191827] leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
