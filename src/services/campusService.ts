import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  getDocs,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  Notice,
  CampusEvent,
  EventRegistration,
  Post,
  PostComment,
  UserProfile,
} from '../types';

// ==========================================
// NOTICES
// ==========================================

export function subscribeNotices(callback: (notices: Notice[]) => void) {
  const q = query(collection(db, 'notices'), orderBy('publishedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const notices: Notice[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Notice, 'id'>),
      }));
      callback(notices);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notices');
    }
  );
}

export async function createNotice(data: {
  title: string;
  summary: string;
  content: string;
  publisherId: string;
  publisherName: string;
}): Promise<string> {
  const noticeRef = doc(collection(db, 'notices'));
  const noticeData: Omit<Notice, 'id'> = {
    title: data.title.trim(),
    summary: data.summary.trim(),
    content: data.content.trim(),
    publisherId: data.publisherId,
    publisherName: data.publisherName,
    status: 'active',
    publishedAt: new Date().toISOString(),
  };

  try {
    await setDoc(noticeRef, noticeData);
    return noticeRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `notices/${noticeRef.id}`);
  }
}

export async function updateNotice(id: string, updates: Partial<Notice>): Promise<void> {
  try {
    const noticeRef = doc(db, 'notices', id);
    await updateDoc(noticeRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notices/${id}`);
  }
}

export async function deleteNotice(id: string): Promise<void> {
  try {
    const noticeRef = doc(db, 'notices', id);
    await deleteDoc(noticeRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
  }
}

// ==========================================
// EVENTS
// ==========================================

export function subscribeEvents(callback: (events: CampusEvent[]) => void) {
  const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const events: CampusEvent[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<CampusEvent, 'id'>),
      }));
      callback(events);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    }
  );
}

export async function createEvent(data: {
  title: string;
  description: string;
  category: CampusEvent['category'];
  organizer: string;
  startAt: string;
  venue: string;
  createdBy: string;
}): Promise<string> {
  const eventRef = doc(collection(db, 'events'));
  const eventData: Omit<CampusEvent, 'id'> = {
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    organizer: data.organizer.trim(),
    startAt: data.startAt.trim(),
    venue: data.venue.trim(),
    status: 'upcoming',
    registrationCount: 0,
    createdBy: data.createdBy,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(eventRef, eventData);
    return eventRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `events/${eventRef.id}`);
  }
}

export async function updateEvent(id: string, updates: Partial<CampusEvent>): Promise<void> {
  try {
    const eventRef = doc(db, 'events', id);
    await updateDoc(eventRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `events/${id}`);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    const eventRef = doc(db, 'events', id);
    await deleteDoc(eventRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
  }
}

// ==========================================
// EVENT REGISTRATIONS (RSVP)
// ==========================================

export function subscribeUserRegistrations(
  userId: string,
  callback: (registrations: Record<string, boolean>) => void
) {
  if (!userId) {
    callback({});
    return () => {};
  }

  const q = query(
    collection(db, 'eventRegistrations'),
    where('userId', '==', userId),
    where('status', '==', 'registered')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const regMap: Record<string, boolean> = {};
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as EventRegistration;
        regMap[data.eventId] = true;
      });
      callback(regMap);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'eventRegistrations');
    }
  );
}

export async function registerForEvent(
  eventId: string,
  profile: UserProfile
): Promise<void> {
  const regId = `${eventId}_${profile.uid}`;
  const regRef = doc(db, 'eventRegistrations', regId);
  const eventRef = doc(db, 'events', eventId);

  const regData: EventRegistration = {
    id: regId,
    eventId,
    userId: profile.uid,
    userName: profile.displayName,
    userEmail: profile.email,
    status: 'registered',
    createdAt: new Date().toISOString(),
  };

  try {
    const batch = writeBatch(db);
    batch.set(regRef, regData);
    batch.update(eventRef, {
      registrationCount: increment(1),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `eventRegistrations/${regId}`);
  }
}

export async function cancelEventRegistration(
  eventId: string,
  userId: string
): Promise<void> {
  const regId = `${eventId}_${userId}`;
  const regRef = doc(db, 'eventRegistrations', regId);
  const eventRef = doc(db, 'events', eventId);

  try {
    const batch = writeBatch(db);
    batch.delete(regRef);
    batch.update(eventRef, {
      registrationCount: increment(-1),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `eventRegistrations/${regId}`);
  }
}

// ==========================================
// COMMUNITY POSTS
// ==========================================

export function subscribePosts(callback: (posts: Post[]) => void) {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const posts: Post[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Post, 'id'>),
      }));
      callback(posts);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    }
  );
}

export async function createPost(data: {
  title: string;
  content: string;
  type: Post['type'];
  category: Post['category'];
  authorId: string;
  authorName: string;
  authorBranch?: string;
}): Promise<string> {
  const postRef = doc(collection(db, 'posts'));
  const postData: Omit<Post, 'id'> = {
    title: data.title.trim(),
    content: data.content.trim(),
    type: data.type,
    category: data.category,
    authorId: data.authorId,
    authorName: data.authorName,
    authorBranch: data.authorBranch || 'Student',
    upvotesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(postRef, postData);
    return postRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${postRef.id}`);
  }
}

export async function updatePost(
  postId: string,
  updates: Partial<Post>
): Promise<void> {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
  }
}

// ==========================================
// VOTES
// ==========================================

export function subscribeUserVotes(
  userId: string,
  callback: (votes: Record<string, boolean>) => void
) {
  if (!userId) {
    callback({});
    return () => {};
  }

  const q = query(collection(db, 'votes'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const voteMap: Record<string, boolean> = {};
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.postId) {
          voteMap[data.postId] = true;
        }
      });
      callback(voteMap);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'votes');
    }
  );
}

export async function toggleUpvote(
  postId: string,
  userId: string,
  isCurrentlyUpvoted: boolean
): Promise<void> {
  const voteId = `${postId}_${userId}`;
  const voteRef = doc(db, 'votes', voteId);
  const postRef = doc(db, 'posts', postId);

  try {
    const batch = writeBatch(db);
    if (isCurrentlyUpvoted) {
      batch.delete(voteRef);
      batch.update(postRef, {
        upvotesCount: increment(-1),
      });
    } else {
      batch.set(voteRef, {
        id: voteId,
        postId,
        userId,
        createdAt: new Date().toISOString(),
      });
      batch.update(postRef, {
        upvotesCount: increment(1),
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `votes/${voteId}`);
  }
}

// ==========================================
// COMMENTS
// ==========================================

export function subscribeComments(
  postId: string,
  callback: (comments: PostComment[]) => void
) {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: PostComment[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<PostComment, 'id'>),
      }));
      callback(comments);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    }
  );
}

export async function createComment(data: {
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
}): Promise<string> {
  const commentRef = doc(collection(db, 'comments'));
  const postRef = doc(db, 'posts', data.postId);

  const commentData: Omit<PostComment, 'id'> = {
    postId: data.postId,
    authorId: data.authorId,
    authorName: data.authorName,
    authorPhotoURL: data.authorPhotoURL || '',
    content: data.content.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    const batch = writeBatch(db);
    batch.set(commentRef, commentData);
    batch.update(postRef, {
      commentsCount: increment(1),
    });
    await batch.commit();
    return commentRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `comments/${commentRef.id}`);
  }
}

export async function deleteComment(commentId: string, postId: string): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  const postRef = doc(db, 'posts', postId);

  try {
    const batch = writeBatch(db);
    batch.delete(commentRef);
    batch.update(postRef, {
      commentsCount: increment(-1),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
  }
}

// ==========================================
// OPTIONAL STARTER SEED (ADMIN ONLY)
// ==========================================

export async function seedCampusStarterData(adminProfile: UserProfile): Promise<void> {
  const noticesSnapshot = await getDocs(collection(db, 'notices'));
  const eventsSnapshot = await getDocs(collection(db, 'events'));

  const batch = writeBatch(db);

  if (noticesSnapshot.empty) {
    const notice1 = doc(collection(db, 'notices'));
    batch.set(notice1, {
      title: 'End-Term Examination Schedule Released for Autumn 2026',
      summary: 'Detailed timetable and seating arrangements for 2nd, 3rd, and 4th-year engineering batches have been published.',
      content: 'All undergraduate students are advised to download the official examination date-sheet from the college portal. Examination admit cards will be issued starting Monday from the respective Department Offices. Ensure zero pending dues in the Central Library.',
      publisherId: adminProfile.uid,
      publisherName: 'Dean of Academic Affairs',
      status: 'active',
      publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    });

    const notice2 = doc(collection(db, 'notices'));
    batch.set(notice2, {
      title: 'Library Hours Extended for Mid-Semester Preparation',
      summary: 'Central Library will remain open until 11:00 PM on weekdays with high-speed Wi-Fi and discussion pods.',
      content: 'In response to student council recommendations, the JECRC Central Library will extend operational hours up to 11:00 PM Monday through Saturday throughout the preparation leave period. Please carry your valid student RFID ID card for entry.',
      publisherId: adminProfile.uid,
      publisherName: 'Head Librarian',
      status: 'active',
      publishedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    });
  }

  if (eventsSnapshot.empty) {
    const event1 = doc(collection(db, 'events'));
    batch.set(event1, {
      title: 'HackLoop 2026: 24-Hour National Collegiate Hackathon',
      description: 'Join over 400 developers building AI, Web3, and sustainability solutions. Cash prizes, direct interview fast-tracks, industry mentorship, free food, and exclusive swag kits for every participant!',
      category: 'Hackathon',
      organizer: 'Coding & Algorithms Club (C&A)',
      startAt: 'Saturday, Nov 14, 2026 • 09:00 AM',
      venue: 'Auditorium Block A, JECRC Campus',
      status: 'upcoming',
      registrationCount: 42,
      createdBy: adminProfile.uid,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    });

    const event2 = doc(collection(db, 'events'));
    batch.set(event2, {
      title: 'Hands-on Workshop: Production TypeScript & Next.js Architecture',
      description: 'Interactive deep-dive with industry staff engineers on designing scalable micro-frontends, typed full-stack APIs, and deploying serverless applications on cloud runtimes.',
      category: 'Workshop',
      organizer: 'Department of Computer Science',
      startAt: 'Wednesday, Nov 04, 2026 • 02:00 PM',
      venue: 'Seminar Hall 3, Tech Tower',
      status: 'upcoming',
      registrationCount: 28,
      createdBy: adminProfile.uid,
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    });

    const event3 = doc(collection(db, 'events'));
    batch.set(event3, {
      title: 'Renaissance 2026: Annual Inter-College Cultural Fest',
      description: 'Battle of the bands, choreography battles, street theatre, EDM night, and art installations. Registrations now open for all stage and literary competitions.',
      category: 'Cultural Event',
      organizer: 'Student Cultural Committee',
      startAt: 'Friday, Dec 05, 2026 • 05:00 PM',
      venue: 'Main Sports Complex & Open Air Theatre',
      status: 'upcoming',
      registrationCount: 115,
      createdBy: adminProfile.uid,
      createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    });
  }

  await batch.commit();
}
