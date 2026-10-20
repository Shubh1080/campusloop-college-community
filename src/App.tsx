import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Notice, CampusEvent, Post, PostType } from './types';
import {
  subscribeNotices,
  subscribeEvents,
  subscribePosts,
  subscribeUserVotes,
  subscribeUserRegistrations,
} from './services/campusService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { HomePage } from './components/home/HomePage';
import { CommunityPage } from './components/community/CommunityPage';
import { EventsPage } from './components/events/EventsPage';

import { LoginModal } from './components/auth/LoginModal';
import { ProfileSetupModal } from './components/auth/ProfileSetupModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { NoticeDetailModal } from './components/notices/NoticeDetailModal';
import { CreateNoticeModal } from './components/notices/CreateNoticeModal';
import { EventDetailModal } from './components/events/EventDetailModal';
import { CreateEventModal } from './components/events/CreateEventModal';
import { PostDetailModal } from './components/community/PostDetailModal';
import { CreatePostModal } from './components/community/CreatePostModal';

function CampusLoopMain() {
  const { user, needsProfileSetup, loading: authLoading, isAdmin } = useAuth();

  // Navigation tab: 'home' | 'community' | 'events'
  const [activeTab, setActiveTab] = useState<'home' | 'community' | 'events'>('home');

  // Firestore Reactive Data States
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [userRegistrations, setUserRegistrations] = useState<Record<string, boolean>>({});

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);

  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isCreateNoticeOpen, setIsCreateNoticeOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CampusEvent | null>(null);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [postDefaultType, setPostDefaultType] = useState<PostType>('question');

  // Subscriptions to public campus streams
  useEffect(() => {
    const unsubNotices = subscribeNotices((data) => setNotices(data));
    const unsubEvents = subscribeEvents((data) => setEvents(data));
    const unsubPosts = subscribePosts((data) => setPosts(data));

    return () => {
      unsubNotices();
      unsubEvents();
      unsubPosts();
    };
  }, []);

  // Subscriptions to user-specific data (Votes & RSVPs)
  useEffect(() => {
    if (!user) {
      setUserVotes({});
      setUserRegistrations({});
      return;
    }

    const unsubVotes = subscribeUserVotes(user.uid, (votes) => {
      setUserVotes(votes);
    });

    const unsubRegs = subscribeUserRegistrations(user.uid, (regs) => {
      setUserRegistrations(regs);
    });

    return () => {
      unsubVotes();
      unsubRegs();
    };
  }, [user]);

  // Keep selectedPost / selectedEvent synchronized with real-time updates
  useEffect(() => {
    if (selectedPost) {
      const updated = posts.find((p) => p.id === selectedPost.id);
      if (updated) setSelectedPost(updated);
    }
  }, [posts, selectedPost?.id]);

  useEffect(() => {
    if (selectedEvent) {
      const updated = events.find((e) => e.id === selectedEvent.id);
      if (updated) setSelectedEvent(updated);
    }
  }, [events, selectedEvent?.id]);

  // Handlers for modal triggers with auth guards
  const handleOpenCreatePost = (defaultType: PostType = 'question') => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setPostToEdit(null);
    setPostDefaultType(defaultType);
    setIsCreatePostOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setPostToEdit(post);
    setIsCreatePostOpen(true);
  };

  const handleOpenCreateEvent = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setEventToEdit(null);
    setIsCreateEventOpen(true);
  };

  const handleEditEvent = (event: CampusEvent) => {
    setEventToEdit(event);
    setIsCreateEventOpen(true);
  };

  const handleOpenCreateNotice = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setIsCreateNoticeOpen(true);
  };

  const handleOpenProfile = () => {
    setProfileEditMode(false);
    setIsProfileOpen(true);
  };

  const handleOpenEditProfile = () => {
    setProfileEditMode(true);
    setIsProfileOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenProfile={handleOpenProfile}
        onOpenEditProfile={handleOpenEditProfile}
        onOpenLogin={() => setIsLoginOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCreatePost={() => handleOpenCreatePost('question')}
          onOpenCreateEvent={isAdmin ? handleOpenCreateEvent : undefined}
          onOpenCreateNotice={isAdmin ? handleOpenCreateNotice : undefined}
        />

        {/* Dynamic Center Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 max-w-5xl mx-auto w-full">
          {activeTab === 'home' && (
            <HomePage
              notices={notices}
              events={events}
              posts={posts}
              userVotes={userVotes}
              onSelectNotice={(n) => setSelectedNotice(n)}
              onSelectEvent={(e) => setSelectedEvent(e)}
              onSelectPost={(p) => setSelectedPost(p)}
              onOpenCreatePost={handleOpenCreatePost}
              onOpenCreateNotice={handleOpenCreateNotice}
              onOpenCreateEvent={handleOpenCreateEvent}
              onOpenLogin={() => setIsLoginOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'community' && (
            <CommunityPage
              posts={posts}
              userVotes={userVotes}
              onSelectPost={(p) => setSelectedPost(p)}
              onOpenCreatePost={() => handleOpenCreatePost('question')}
              onOpenLogin={() => setIsLoginOpen(true)}
              onEditPost={handleEditPost}
            />
          )}

          {activeTab === 'events' && (
            <EventsPage
              events={events}
              userRegistrations={userRegistrations}
              onSelectEvent={(e) => setSelectedEvent(e)}
              onOpenCreateEvent={handleOpenCreateEvent}
              onOpenLogin={() => setIsLoginOpen(true)}
              onEditEvent={handleEditEvent}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={handleOpenProfile}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Modals & Dialogs */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {user && needsProfileSetup && (
        <ProfileSetupModal isOpen={needsProfileSetup} />
      )}

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        initialEditMode={profileEditMode}
      />

      <NoticeDetailModal
        notice={selectedNotice}
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />

      {isAdmin && (
        <CreateNoticeModal
          isOpen={isCreateNoticeOpen}
          onClose={() => setIsCreateNoticeOpen(false)}
        />
      )}

      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isRegistered={selectedEvent ? !!userRegistrations[selectedEvent.id] : false}
        onOpenLogin={() => setIsLoginOpen(true)}
        onEditEvent={handleEditEvent}
      />

      {isAdmin && (
        <CreateEventModal
          isOpen={isCreateEventOpen}
          onClose={() => {
            setIsCreateEventOpen(false);
            setEventToEdit(null);
          }}
          eventToEdit={eventToEdit}
        />
      )}

      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        isUpvoted={selectedPost ? !!userVotes[selectedPost.id] : false}
        onOpenLogin={() => setIsLoginOpen(true)}
        onEditPost={handleEditPost}
      />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => {
          setIsCreatePostOpen(false);
          setPostToEdit(null);
        }}
        postToEdit={postToEdit}
        defaultType={postDefaultType}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CampusLoopMain />
    </AuthProvider>
  );
}
