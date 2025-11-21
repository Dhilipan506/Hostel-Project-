
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ComplaintForm from './components/ComplaintForm';
import ComplaintList from './components/ComplaintList';
import DashboardStats from './components/DashboardStats';
import AdminDashboard from './components/AdminDashboard';
import Announcements from './components/Announcements';
import Attendance from './components/Attendance';
import LeavePortal from './components/LeavePortal';
import UserManagement from './components/UserManagement';
import { User, Complaint, ComplaintStatus, Category, Urgency, Announcement, WorkerStatus, LeaveRequest, UserRequest, UserRole } from './types';
import { LayoutDashboard, ClipboardList, Plus, Bell, LogOut, User as UserIcon, Home, X, Camera, MapPin, Phone, Calendar, Heart, CreditCard, Users, PenTool, Shield, Key, Lock, CheckCircle2, AlertCircle, Briefcase, Menu } from 'lucide-react';

// --- MOCK DATA INITIALIZATION ---

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: '123456789-302A-1',
    studentId: '123456789',
    studentName: 'Arjun Reddy',
    studentRoom: '302-A',
    title: 'BROKEN REGULATOR',
    description: 'The fan regulator in room 101 is not working at all.',
    cleanDescription: 'The ceiling fan regulator in Room 101 is unresponsive and needs replacement.',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    category: Category.ELECTRICAL,
    urgency: Urgency.MEDIUM,
    status: ComplaintStatus.COMPLETED,
    workerStatus: WorkerStatus.COMPLETED,
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    review: { rating: 4, comment: 'Fixed quickly, thanks.' },
    assignedWorker: 'Ramesh (Electrician)',
    startDate: '2023-10-20',
    estimatedCompletion: '2023-10-21T14:00',
    proofImages: { reached: 'base64mock', working: 'base64mock', completed: 'base64mock' }
  },
  {
    id: '123456789-302A-2',
    studentId: '123456789',
    studentName: 'Arjun Reddy',
    studentRoom: '302-A',
    title: 'LEAKING TAP',
    description: 'Water is dripping continuously.',
    cleanDescription: 'Persistent water leakage observed from the main tap in the shared bathroom.',
    imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80',
    category: Category.PLUMBING,
    urgency: Urgency.HIGH,
    status: ComplaintStatus.ASSIGNED,
    workerStatus: WorkerStatus.ASSIGNED,
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    estimatedCompletion: new Date(Date.now() - 86400000).toISOString(), // OVERDUE
    assignedWorker: 'Suresh (Plumber)'
  },
  {
    id: '123456789-302A-3',
    studentId: '123456789',
    studentName: 'Arjun Reddy',
    studentRoom: '302-A',
    title: 'BROKEN CHAIR',
    description: 'My study chair is broken.',
    cleanDescription: 'Wooden study chair in Room 302 has a fractured leg and is unstable.',
    imageUrl: 'https://images.unsplash.com/photo-1503602642458-23211144584b?w=800&q=80',
    category: Category.FURNITURE,
    urgency: Urgency.LOW,
    status: ComplaintStatus.SUBMITTED,
    submittedAt: new Date().toISOString(),
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'WATER TANK MAINTENANCE',
    content: 'The main water tank cleaning is scheduled for this Saturday, 10 AM to 2 PM. Water supply will be interrupted during these hours. Please store water accordingly.',
    date: 'Oct 24, 2023',
    author: 'CHIEF WARDEN',
    targetAudience: 'student',
    reactions: { thumbsUp: 12, thumbsDown: 1 },
    userReaction: null
  },
  {
    id: '2',
    title: 'DIWALI LEAVE APPLICATIONS',
    content: 'All students planning to go home for Diwali must submit their leave requests by Wednesday. Late applications will not be approved.',
    date: 'Oct 22, 2023',
    author: 'ADMIN',
    targetAudience: 'student',
    reactions: { thumbsUp: 45, thumbsDown: 0 },
    userReaction: null
  },
  {
    id: '3',
    title: 'STAFF MEETING',
    content: 'Mandatory meeting for all maintenance staff (Electricians & Plumbers) at the Warden Office at 5 PM today.',
    date: 'Oct 25, 2023',
    author: 'CHIEF WARDEN',
    targetAudience: 'worker',
    reactions: { thumbsUp: 5, thumbsDown: 0 },
    userReaction: null
  }
];

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'L-001',
    userId: '123456789',
    userName: 'Arjun Reddy',
    userRole: 'student',
    fromDate: '2023-11-10',
    toDate: '2023-11-15',
    reason: 'Going home for Diwali festival.',
    status: 'Pending',
    roomNumber: '302-A'
  },
  {
    id: 'L-002',
    userId: 'WORKER-01',
    userName: 'Ramesh Kumar',
    userRole: 'worker',
    fromDate: '2023-11-01',
    toDate: '2023-11-02',
    reason: 'Personal medical checkup.',
    status: 'Approved',
    roomNumber: 'MAINTENANCE'
  }
];

const INITIAL_USERS: User[] = [
  {
    registerNumber: 'ADMIN',
    name: 'System Admin',
    role: 'admin',
    roomNumber: 'SERVER ROOM',
    phoneNumber: '0000000000'
  },
  {
    registerNumber: 'WARDEN-01',
    name: 'Mr. Sharma',
    role: 'warden',
    roomNumber: 'OFFICE',
    phoneNumber: '9876543210'
  },
  {
    registerNumber: '123456789',
    name: 'Arjun Reddy',
    role: 'student',
    roomNumber: '302-A',
    phoneNumber: '9988776655',
    fatherName: 'Rajesh Reddy',
    address: 'Hyderabad, India',
    hostelValidUpto: '2025-05-20'
  },
  {
    registerNumber: '123456790',
    name: 'Vikram Singh',
    role: 'student',
    roomNumber: '302-B',
    phoneNumber: '9988776644'
  },
  {
    registerNumber: 'WORKER-01',
    name: 'Ramesh (Electrician)',
    role: 'worker',
    roomNumber: 'MAINTENANCE',
    phoneNumber: '8877665544',
    workCategory: 'Electrical',
    currentStatus: 'Free'
  },
  {
    registerNumber: 'WORKER-02',
    name: 'Suresh (Plumber)',
    role: 'worker',
    roomNumber: 'MAINTENANCE',
    phoneNumber: '8877665533',
    workCategory: 'Plumbing',
    currentStatus: 'Busy'
  }
];

const INITIAL_USER_REQUESTS: UserRequest[] = [
  {
    id: 'REQ-001',
    requestedBy: 'WARDEN',
    userType: 'student',
    name: 'Rahul Dravid',
    identifier: '123450000',
    status: 'Pending',
    phoneNumber: '9090909090',
    dob: '2001-01-01',
    fatherName: 'Sharad Dravid',
    roomNumber: '101-A'
  }
];

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data States
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [userRequests, setUserRequests] = useState<UserRequest[]>(INITIAL_USER_REQUESTS);
  
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Reset to dashboard on login
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowComplaintForm(false);
  };

  // --- HANDLERS ---

  const addComplaint = (complaint: Complaint) => {
    const newId = `${currentUser?.registerNumber}-${Date.now()}`;
    setComplaints([{
      ...complaint, 
      id: newId, 
      studentId: currentUser!.registerNumber,
      studentName: currentUser!.name,
      studentRoom: currentUser!.roomNumber
    }, ...complaints]);
    setShowComplaintForm(false);
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus, updates?: Partial<Complaint>) => {
    setComplaints(complaints.map(c => 
      c.id === id ? { ...c, status, ...updates } : c
    ));
  };

  const addAnnouncement = (announcement: Announcement) => {
    setAnnouncements([announcement, ...announcements]);
  };

  const handleReaction = (id: string, type: 'thumbsUp' | 'thumbsDown', feedback?: string) => {
    setAnnouncements(announcements.map(a => {
      if (a.id === id) {
        const newReactions = { ...a.reactions };
        
        // Remove previous reaction if exists
        if (a.userReaction === 'thumbsUp') newReactions.thumbsUp--;
        if (a.userReaction === 'thumbsDown') newReactions.thumbsDown--;
        
        // Add new reaction if different
        if (a.userReaction !== type) {
           newReactions[type]++;
           return { ...a, reactions: newReactions, userReaction: type, feedback: feedback ? [...(a.feedback || []), { userId: currentUser!.registerNumber, userName: currentUser!.name, reason: feedback }] : a.feedback };
        } else {
           // Toggle off
           return { ...a, reactions: newReactions, userReaction: null };
        }
      }
      return a;
    }));
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const handleAddLeaveRequest = (req: LeaveRequest) => {
    setLeaveRequests([req, ...leaveRequests]);
  };

  const handleUpdateLeaveStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setLeaveRequests(leaveRequests.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleAddUserRequest = (req: UserRequest) => {
    setUserRequests([req, ...userRequests]);
  };

  const handleApproveUser = (reqId: string, newUser: User) => {
    setUsers([...users, newUser]);
    setUserRequests(userRequests.filter(r => r.id !== reqId));
  };

  const handleDeleteUser = (regNo: string) => {
    setUsers(users.filter(u => u.registerNumber !== regNo));
  };

  // --- RENDER CONTENT ---

  const renderContent = () => {
    if (showComplaintForm) {
      return <ComplaintForm onComplaintAdded={addComplaint} onCancel={() => setShowComplaintForm(false)} />;
    }

    switch (activeTab) {
      case 'dashboard':
        if (currentUser?.role === 'admin') {
          return (
            <AdminDashboard 
              users={users}
              complaints={complaints}
              leaveRequests={leaveRequests}
            />
          );
        }
        return <DashboardStats complaints={complaints} userRole={currentUser!.role} />;
      
      case 'complaints':
        return (
          <ComplaintList 
            complaints={
              currentUser?.role === 'student' 
              ? complaints.filter(c => c.studentId === currentUser.registerNumber)
              : currentUser?.role === 'worker'
                ? complaints.filter(c => c.assignedWorker?.includes(currentUser.name))
                : complaints // Admin/Warden see all
            }
            userRole={currentUser!.role}
            availableWorkers={users.filter(u => u.role === 'worker')}
            onReviewSubmit={(id, r, c) => {
               setComplaints(complaints.map(comp => comp.id === id ? { ...comp, review: { rating: r, comment: c } } : comp));
            }}
            onUpdateStatus={updateComplaintStatus}
            onDelete={currentUser?.role === 'admin' ? (id) => setComplaints(complaints.filter(c => c.id !== id)) : undefined}
          />
        );
      
      case 'announcements':
        return (
          <Announcements 
            announcements={announcements} 
            userRole={currentUser!.role} 
            onReact={handleReaction}
            onCreate={handleAddAnnouncement}
            onDelete={deleteAnnouncement}
          />
        );

      case 'attendance':
        return <Attendance userRole={currentUser!.role} currentUser={currentUser!} />;

      case 'leaves':
        return (
          <LeavePortal 
            requests={leaveRequests}
            userRole={currentUser!.role}
            currentUser={currentUser!}
            onAddRequest={handleAddLeaveRequest}
            onUpdateStatus={handleUpdateLeaveStatus}
          />
        );

      case 'users':
        if (currentUser?.role !== 'warden' && currentUser?.role !== 'admin') return null;
        return (
          <UserManagement 
            userRole={currentUser.role}
            users={users}
            requests={userRequests}
            onAddRequest={handleAddUserRequest}
            onApproveRequest={handleApproveUser}
            onDeleteUser={handleDeleteUser}
          />
        );

      default:
        return <DashboardStats complaints={complaints} userRole={currentUser!.role} />;
    }
  };

  const handleAddAnnouncement = (announcement: Announcement) => {
    setAnnouncements([announcement, ...announcements]);
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const MenuButton = ({ id, icon: Icon, label, count }: { id: string, icon: any, label: string, count?: number }) => (
    <button 
      onClick={() => { setActiveTab(id); setShowComplaintForm(false); }}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all duration-200 group ${
        activeTab === id 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={`${activeTab === id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          activeTab === id ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-6 flex flex-col items-center border-b border-slate-800">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl mb-4 text-white">
             <Shield size={32} />
           </div>
           <h1 className="text-lg font-extrabold text-white uppercase tracking-wider">Krishna Hostel</h1>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Management System</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="px-4 text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-3">Main Menu</p>
          
          <MenuButton id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <MenuButton 
             id="complaints" 
             icon={ClipboardList} 
             label="Complaints" 
             count={currentUser.role !== 'student' ? complaints.filter(c => c.status !== 'Completed').length : undefined}
          />
          <MenuButton id="announcements" icon={Bell} label="Announcements" />
          <MenuButton id="attendance" icon={Calendar} label="Attendance" />
          <MenuButton id="leaves" icon={LogOut} label="Leaves & Outing" count={currentUser.role !== 'student' ? leaveRequests.filter(r => r.status === 'Pending').length : undefined} />
          
          {(currentUser.role === 'warden' || currentUser.role === 'admin') && (
             <>
               <p className="px-4 text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mt-6 mb-3">Admin Tools</p>
               <MenuButton id="users" icon={Users} label="User Management" count={currentUser.role === 'admin' ? userRequests.length : undefined}/>
             </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3 mb-3">
             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {currentUser.name.charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 uppercase truncate">{currentUser.role}</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 py-2 rounded-lg transition-colors text-xs font-bold uppercase"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar Mobile */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between md:hidden shadow-sm z-40">
           <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-600">
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <span className="font-bold uppercase text-slate-800 text-sm">Krishna Hostel</span>
           </div>
           <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <UserIcon size={16} className="text-slate-500"/>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
           <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                 <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">
                       {activeTab === 'dashboard' && currentUser.role === 'admin' ? 'Admin Control Center' : 
                        activeTab.replace(/([A-Z])/g, ' $1').trim()}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                       Welcome back, {currentUser.name}
                    </p>
                 </div>
                 
                 {activeTab === 'complaints' && currentUser.role === 'student' && !showComplaintForm && (
                    <button 
                      onClick={() => setShowComplaintForm(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 font-bold uppercase text-xs tracking-wide"
                    >
                      <Plus size={18} /> New Complaint
                    </button>
                 )}
              </div>

              {/* Dynamic Content */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {renderContent()}
              </div>
           </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;
