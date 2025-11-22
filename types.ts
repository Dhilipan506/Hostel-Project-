
export enum ComplaintStatus {
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected'
}

export enum WorkerStatus {
  ASSIGNED = 'Assigned',
  ACCEPTED = 'Accepted',
  REJECTED_BY_WORKER = 'Rejected by Worker',
  REACHED = 'Reached Location',
  CHECKING = 'Checking Issue',
  REPAIRING = 'Repairing',
  WAITING = 'Waiting for Parts',
  COMPLETED = 'Job Completed'
}

export enum Category {
  AC = 'AC',
  ELECTRICAL = 'Electrical',
  FURNITURE = 'Furniture',
  CLEANING = 'Cleaning',
  WIFI = 'Wifi',
  PLUMBING = 'Plumbing',
  WATERSUPPLY = 'Water Supply',
  OTHER = 'Other'
}

export enum Urgency {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Complaint {
  id: string;
  studentId: string; 
  studentName?: string; 
  studentRoom?: string; 
  title: string; 
  description: string;
  cleanDescription: string;
  imageUrl: string; 
  images?: string[]; 
  category: Category;
  urgency: Urgency;
  status: ComplaintStatus;
  workerStatus?: WorkerStatus; 
  workerAccepted?: boolean; 
  submittedAt: string;
  estimatedCompletion?: string; 
  startDate?: string; 
  completionTime?: string; 
  wardenNote?: string;
  assignedWorker?: string;
  assignedWorkerId?: string; // For fetching worker image
  rejectionReason?: string;
  
  isDelayed?: boolean;
  delayReason?: string; 
  wardenDelayResponse?: string; 
  extensionReason?: string; 
  adminFlagged?: boolean; 
  
  proofImages?: {
    reached?: string;
    working?: string;
    completed?: string;
  };
  partsNeeded?: boolean;
  partsDetails?: {
    description: string;
    imageUrl?: string;
    status: 'requested' | 'ordered' | 'received';
    requestedAt: string;
  };

  review?: {
    rating: number;
    comment: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  targetAudience: 'all' | 'student' | 'worker';
  reactions: {
    thumbsUp: number;
    thumbsDown: number;
  };
  userReaction?: 'thumbsUp' | 'thumbsDown' | null;
  feedback?: { userId: string; userName: string; reason: string }[]; 
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'worker' | 'warden';
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  
  // Student Specific
  mentorProofUrl?: string;
  timeOut?: string;
  timeIn?: string;
  
  // Gate Pass Data
  gatePassGenerated?: boolean;
  roomNumber?: string;
  phone?: string;
  address?: string;
  fatherName?: string;
}

export type UserRole = 'student' | 'warden' | 'worker' | 'admin';

export type WorkerAvailability = 'Free' | 'Busy' | 'Unavailable' | 'Working';

export interface User {
  registerNumber: string;
  name: string;
  role: UserRole;
  roomNumber: string;
  phoneNumber: string;
  password?: string;
  profileImage?: string;
  address?: string;
  details?: string;
  bloodGroup?: string;
  dob?: string;
  fatherName?: string;
  hostelValidUpto?: string;
  
  // Worker Specific
  workCategory?: string;
  currentStatus?: WorkerAvailability;

  // Blocking logic
  isBlocked?: boolean;
  blockedUntil?: string;
}

export interface UserRequest {
  id: string;
  requestedBy: string;
  userType: 'student' | 'worker';
  name: string;
  identifier: string; 
  status: 'Pending' | 'Approved' | 'Rejected';
  phoneNumber: string;
  dob: string;
  fatherName?: string;
  bloodGroup?: string;
  address?: string;
  hostelValidUpto?: string;
  roomNumber?: string;
  workCategory?: string; 
}

export interface ProfileChangeRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  type: 'Password Change' | 'Details Update';
  reason: string;
  requestedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DisciplinaryAction {
  id: string;
  studentName: string;
  studentId: string;
  reason: string;
  date: string;
  reportedBy: string;
  status: 'Reported' | 'Action Taken' | 'Dismissed';
  actionTaken?: string;
  blockDurationDays?: number;
  proofImage?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRole: UserRole | 'all';
}
