import React, { useState, useMemo } from 'react';
import { Post, PostCategory } from '../../types';
import { PostCard } from './PostCard';
import { PlusCircle, HelpCircle, MessageSquare, Sparkles, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CommunityPageProps {
  posts: Post[];
  userVotes: Record<string, boolean>;
  onSelectPost: (post: Post) => void;
  onOpenCreatePost: () => void;
  onOpenLogin: () => void;
  onEditPost: (post: Post) => void;
}

const CATEGORIES: ('All' | PostCategory)[] = [
  'All',
  'Academics',
  'Programming',
  'Projects',
  'General',
];

export const CommunityPage: React.FC<CommunityPageProps> = ({
  posts,
  userVotes,
  onSelectPost,
  onOpenCreatePost,
  onOpenLogin,
  onEditPost,
}) => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'questions'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'All' | PostCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Filter by type: "questions" only vs "all" (which is latest)
      if (filterType === 'questions' && post.type !== 'question') {
        return false;
      }
      // Filter by category
      if (selectedCategory !== 'All' && post.category !== selectedCategory) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(query);
        const matchContent = post.content.toLowerCase().includes(query);
        const matchAuthor = post.authorName.toLowerCase().includes(query);
        return matchTitle || matchContent || matchAuthor;
      }
      return true;
    });
  }, [posts, filterType, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E9E7F1] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7565F7]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7565F7]">
              Campus Social Feed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#191827] mt-1 tracking-tight">
            Community Discussions
          </h1>
          <p className="text-xs sm:text-sm text-[#77778A] mt-0.5">
            Ask homework doubts, exchange notes, discover teammates, and share campus insights.
          </p>
        </div>

        <button
          onClick={onOpenCreatePost}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#7565F7] hover:bg-[#6352E8] text-white font-extrabold text-sm shadow-md shadow-[#7565F7]/30 transition-all hover:scale-102 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Filter Bar: Two filters ("Latest" vs "Questions") + Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Latest vs Questions Switcher */}
          <div className="flex items-center bg-[#F0EEF9] p-1 rounded-2xl border border-[#E9E7F1] self-start">
            <button
              onClick={() => setFilterType('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-white text-[#191827] shadow-xs'
                  : 'text-[#77778A] hover:text-[#191827]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#7565F7]" />
              <span>Latest</span>
            </button>

            <button
              onClick={() => setFilterType('questions')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                filterType === 'questions'
                  ? 'bg-white text-[#191827] shadow-xs'
                  : 'text-[#77778A] hover:text-[#191827]'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-[#7565F7]" />
              <span>Questions</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts or topics..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E9E7F1] text-xs text-[#191827] bg-white focus:outline-hidden focus:border-[#7565F7]"
            />
          </div>
        </div>

        {/* 4 Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                selectedCategory === cat
                  ? 'bg-[#191827] text-white border-[#191827] shadow-xs'
                  : 'bg-white text-[#77778A] border-[#E9E7F1] hover:text-[#191827] hover:border-[#CBD5E1]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3.5">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E9E7F1] p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F0EEF9] text-[#7565F7] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-[#191827]">
              Nothing here yet. Start the conversation.
            </h3>
            <p className="text-xs sm:text-sm text-[#77778A] mt-1 max-w-sm mx-auto">
              Be the first student to start a thread in this category or ask a question to your peers.
            </p>
            <button
              onClick={onOpenCreatePost}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#7565F7] text-white font-bold text-xs hover:bg-[#6352E8] shadow-sm shadow-[#7565F7]/30 transition-all inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Post</span>
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isUpvoted={!!userVotes[post.id]}
              onOpenDetail={onSelectPost}
              onOpenLogin={onOpenLogin}
              onEditPost={onEditPost}
            />
          ))
        )}
      </div>
    </div>
  );
};
