
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
  submittedAt: string;
  estimatedCompletion?: string; 
  startDate?: string; 
  completionTime?: string; // kept for legacy, but mostly date focused now
  wardenNote?: string;
  assignedWorker?: string;
  rejectionReason?: string;
  
  // Delay & Extension Logic
  isDelayed?: boolean;
  delayReason?: string; // Reason provided by Student
  wardenDelayResponse?: string; // Reply from Warden regarding delay
  extensionReason?: string; // Reason provided by Warden for extending date
  adminFlagged?: boolean; // If extension reason was invalid
  
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
  reactions: {
    thumbsUp: number;
    thumbsDown: number;
  };
  userReaction?: 'thumbsUp' | 'thumbsDown' | null;
  feedback?: { userId: string; userName: string; reason: string }[]; // Store negative feedback with user details
}

export type UserRole = 'student' | 'warden' | 'worker' | 'admin';

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
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  markedBy: string;
}
