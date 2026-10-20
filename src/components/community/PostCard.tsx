import React, { useState } from 'react';
import { Post } from '../../types';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  ThumbsUp,
  MessageSquare,
  HelpCircle,
  Clock,
  Trash2,
  Edit2
} from 'lucide-react';
import { toggleUpvote, deletePost } from '../../services/campusService';

interface PostCardProps {
  post: Post;
  isUpvoted: boolean;
  onOpenDetail: (post: Post) => void;
  onOpenLogin: () => void;
  onEditPost?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isUpvoted,
  onOpenDetail,
  onOpenLogin,
  onEditPost,
}) => {
  const { user, isAdmin } = useAuth();
  const [loadingVote, setLoadingVote] = useState(false);

  const isAuthor = user && user.uid === post.authorId;
  const canDelete = isAuthor || isAdmin;

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onOpenLogin();
      return;
    }
    setLoadingVote(true);
    try {
      await toggleUpvote(post.id, user.uid, isUpvoted);
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setLoadingVote(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(post.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditPost) {
      onEditPost(post);
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
    <div
      onClick={() => onOpenDetail(post)}
      className="group bg-white rounded-2xl border border-[#E9E7F1] hover:border-[#7565F7]/40 p-4 sm:p-5 transition-all hover:shadow-md cursor-pointer relative"
    >
      {/* Top Meta */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            {post.type === 'question' ? (
              <HelpCircle className="w-3 h-3" />
            ) : (
              <MessageSquare className="w-3 h-3" />
            )}
            <span className="capitalize">{post.type}</span>
          </Badge>

          <Badge variant="secondary" size="sm">
            {post.category}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#77778A]">
          <Clock className="w-3 h-3" />
          <span>{timeAgo(post.createdAt)}</span>

          {canDelete && (
            <div className="flex items-center ml-2 border-l border-[#E9E7F1] pl-2 gap-1">
              {isAuthor && onEditPost && (
                <button
                  onClick={handleEdit}
                  className="p-1 text-[#77778A] hover:text-[#191827] rounded-md hover:bg-black/5"
                  title="Edit post"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1 text-[#77778A] hover:text-rose-600 rounded-md hover:bg-rose-50"
                title="Delete post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Title */}
      <h3 className="text-base sm:text-lg font-bold text-[#191827] group-hover:text-[#7565F7] transition-colors line-clamp-2 leading-snug">
        {post.title}
      </h3>

      {/* Preview excerpt */}
      <p className="text-xs sm:text-sm text-[#77778A] line-clamp-2 mt-1.5 leading-relaxed">
        {post.content}
      </p>

      {/* Bottom Bar: Author & Stats */}
      <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-[#E9E7F1]/70">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-[#7565F7]/10 text-[#7565F7] flex items-center justify-center font-bold text-[11px] shrink-0">
            {post.authorName.charAt(0)}
          </div>
          <div className="truncate text-xs">
            <span className="font-bold text-[#191827]">{post.authorName}</span>
            {post.authorBranch && (
              <span className="text-[#77778A] ml-1.5 font-medium hidden sm:inline">
                ({post.authorBranch})
              </span>
            )}
          </div>
        </div>

        {/* Counts & Upvote Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleVote}
            disabled={loadingVote}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
              isUpvoted
                ? 'bg-[#7565F7] text-white border-[#7565F7]'
                : 'bg-[#F8F7FC] hover:bg-white text-[#191827] border-[#E9E7F1]'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-white' : ''}`} />
            <span>{post.upvotesCount || 0}</span>
          </button>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#F8F7FC] border border-[#E9E7F1] text-xs font-semibold text-[#77778A]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post.commentsCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
