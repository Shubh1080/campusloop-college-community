export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  branch: string;
  academicYear: string;
  role: UserRole;
  createdAt: string;
}

export type PostType = 'question' | 'discussion';
export type PostCategory = 'Academics' | 'Programming' | 'Projects' | 'General';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorBranch?: string;
  title: string;
  content: string;
  type: PostType;
  category: PostCategory;
  upvotesCount: number;
  commentsCount: number;
  createdAt: string; // ISO string or timestamp string
  updatedAt?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: string;
}

export interface Vote {
  id: string; // postId_userId
  postId: string;
  userId: string;
  createdAt: string;
}

export type NoticeStatus = 'active' | 'archived';

export interface Notice {
  id: string;
  title: string;
  summary: string;
  content: string;
  publisherId: string;
  publisherName: string;
  status: NoticeStatus;
  publishedAt: string;
}

export type EventCategory = 'Hackathon' | 'Workshop' | 'Competition' | 'Cultural Event' | 'Other';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizer: string;
  startAt: string;
  venue: string;
  status: EventStatus;
  registrationCount: number;
  createdBy: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string; // eventId_userId
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'registered' | 'cancelled';
  createdAt: string;
}

export const COLLEGE_CONFIG = {
  name: 'JECRC Foundation',
  shortName: 'JECRC',
  location: 'Jaipur, Rajasthan, India',
  appName: 'CampusLoop',
  tagline: 'Your campus. Your community.',
  defaultBranches: [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'AI & Data Science',
    'Other'
  ],
  academicYears: [
    '1st Year (Freshman)',
    '2nd Year (Sophomore)',
    '3rd Year (Junior)',
    '4th Year (Senior)',
    'Postgraduate / Alumni'
  ]
};
