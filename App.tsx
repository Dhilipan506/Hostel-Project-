
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ComplaintForm from './components/ComplaintForm';
import ComplaintList from './components/ComplaintList';
import DashboardStats from './components/DashboardStats';
import Announcements from './components/Announcements';
import Attendance from './components/Attendance';
import { User, Complaint, ComplaintStatus, Category, Urgency, Announcement, WorkerStatus } from './types';
import { LayoutDashboard, ClipboardList, Plus, Bell, LogOut, User as UserIcon, Home, X, Camera, MapPin, Phone, Calendar, Heart, CreditCard, Users, PenTool, Shield, Key, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { fileToGenerativePart } from './services/geminiService';

// MOCK DATA
const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: '123456789-302A-1',
    studentId: '123456789',
    studentName: 'Arjun Reddy',
    studentRoom: '302-A',
    title: 'BROKEN REGULATOR',
    description: 'The fan regulator in room 101 is not working at all.',
    cleanDescription: 'The ceiling fan regulator in Room 101 is unresponsive and needs replacement.',
    imageUrl: 'https://picsum.photos/400/300',
    category: Category.ELECTRICAL,
    urgency: Urgency.MEDIUM,
    status: ComplaintStatus.COMPLETED,
    workerStatus: WorkerStatus.COMPLETED,
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    review: { rating: 4, comment: 'Fixed quickly, thanks.' },
    assignedWorker: 'Ramesh (Electrician)',
    startDate: '2023-10-20',
    estimatedCompletion: '2023-10-21T14:00'
  },
  {
    id: '123456789-302A-2',
    studentId: '123456789',
    studentName: 'Arjun Reddy',
    studentRoom: '302-A',
    title: 'LEAKING TAP',
    description: 'Water is dripping continuously.',
    cleanDescription: 'Persistent water leakage observed from the main tap in the shared bathroom.',
    imageUrl: 'https://picsum.photos/400/301',
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
    imageUrl: 'https://picsum.photos/400/302',
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
    reactions: { thumbsUp: 12, thumbsDown: 2 },
    userReaction: null,
    feedback: [
      {userId: 'REG-23-002', userName: 'V. Singh', reason: 'During exam time?'}, 
      {userId: 'REG-23-008', userName: 'K. Rahul', reason: 'Please reschedule'}
    ]
  },
  {
    id: '2',
    title: 'QUIET HOURS POLICY',
    content: 'Students are reminded to observe quiet hours from 10 PM to 6 AM to ensure a conducive study environment for everyone during exam week.',
    date: 'Oct 20, 2023',
    author: 'WARDEN OFFICE',
    reactions: { thumbsUp: 45, thumbsDown: 1 },
    userReaction: 'thumbsUp',
    feedback: []
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  
  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);
  
  // Password Change State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [isPassVerified, setIsPassVerified] = useState(false);
  const [passMsg, setPassMsg] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('hostelmate_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('hostelmate_user', JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hostelmate_user');
    setIsProfileOpen(false);
  };

  const handleNewComplaint = (complaint: Complaint) => {
    if (!user) return;

    // Generate Custom ID: RegNo-RoomNo-Timestamp
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const customId = `${user.registerNumber}-${user.roomNumber}-${timestamp}`;

    const complaintWithUser = { 
      ...complaint, 
      id: customId,
      studentId: user.registerNumber,
      studentName: user.name,
      studentRoom: user.roomNumber
    };
    setComplaints([complaintWithUser, ...complaints]);
    setShowForm(false);
    setActiveTab('complaints');
  };

  const handleReviewSubmit = (id: string, rating: number, comment: string) => {
    setComplaints(complaints.map(c => 
      c.id === id ? { ...c, review: { rating, comment } } : c
    ));
  };

  const handleUpdateStatus = (id: string, status: ComplaintStatus, updates?: Partial<Complaint>) => {
    setComplaints(complaints.map(c => 
       c.id === id ? { ...c, status, ...updates } : c
    ));
  };

  const handleDeleteComplaint = (id: string) => {
    setComplaints(complaints.filter(c => c.id !== id));
  };

  const handleReaction = (id: string, type: 'thumbsUp' | 'thumbsDown', feedback?: string) => {
    setAnnouncements(announcements.map(a => {
      if (a.id !== id) return a;
      const newReactions = { ...a.reactions };
      
      // If clicking same reaction, remove it
      if (a.userReaction === type) {
        newReactions[type]--;
        return { ...a, reactions: newReactions, userReaction: null };
      } 
      
      // If clicking different reaction, remove old and add new
      if (a.userReaction) {
        newReactions[a.userReaction]--;
      }
      newReactions[type]++;

      // Handle Feedback Storage
      let newFeedback = a.feedback || [];
      if (type === 'thumbsDown' && feedback && user) {
        newFeedback = [...newFeedback, { userId: user.registerNumber, userName: user.name, reason: feedback }];
      }

      return { ...a, reactions: newReactions, userReaction: type, feedback: newFeedback };
    }));
  };

  const handleCreateAnnouncement = (announcement: Announcement) => {
     setAnnouncements([announcement, ...announcements]);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const openProfile = () => {
    setTempUser(user ? { ...user } : null);
    // Reset Password State
    setCurrentPassInput('');
    setNewPassInput('');
    setIsPassVerified(false);
    setPassMsg('');
    setIsProfileOpen(true);
  };

  const verifyPassword = () => {
    if (!user) return;
    if (currentPassInput === user.password) {
      setIsPassVerified(true);
      setPassMsg('');
    } else {
      setPassMsg('Incorrect password.');
      setIsPassVerified(false);
    }
  };

  const saveProfile = () => {
    if (tempUser) {
      const updatedUser = { ...tempUser };
      
      // Update password only if verified and new password is provided
      if (isPassVerified && newPassInput) {
        updatedUser.password = newPassInput;
      }

      setUser(updatedUser);
      localStorage.setItem('hostelmate_user', JSON.stringify(updatedUser));
      setIsProfileOpen(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && tempUser) {
      try {
        const part = await fileToGenerativePart(e.target.files[0]);
        setTempUser({
          ...tempUser,
          profileImage: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        });
      } catch (err) {
        console.error("Failed to load image", err);
      }
    }
  };

  // FILTER LOGIC
  const getFilteredComplaints = () => {
    if (!user) return [];
    switch (user.role) {
      case 'student':
        // Students only see their own
        return complaints.filter(c => c.studentId === user.registerNumber);
      case 'worker':
        // Workers see assigned tasks
        return complaints.filter(c => c.assignedWorker && user.name.includes(c.assignedWorker.split(' ')[0]));
      case 'warden':
      case 'admin':
        // Warden/Admin see everything
        return complaints;
      default:
        return [];
    }
  };

  const filteredComplaints = getFilteredComplaints();

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 border-r border-slate-200 h-screen sticky top-0 z-10 ${user.role === 'admin' || user.role === 'warden' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}>
        <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
          <div className={`p-2 rounded-md ${user.role === 'student' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}>
             {user.role === 'student' && <Home size={20} />}
             {user.role === 'warden' && <Shield size={20} />}
             {user.role === 'worker' && <PenTool size={20} />}
             {user.role === 'admin' && <LayoutDashboard size={20} />}
          </div>
          <div>
            <h1 className="text-lg font-extrabold uppercase tracking-tighter leading-none">Krishna Hostel</h1>
            <p className="text-[10px] uppercase font-bold mt-1 opacity-50">
              {user.role} Access
            </p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('dashboard'); setShowForm(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-xs font-bold uppercase tracking-wide ${activeTab === 'dashboard' ? (user.role === 'student' || user.role === 'worker' ? 'bg-blue-50 text-blue-700' : 'bg-white/10 text-white') : 'opacity-60 hover:opacity-100 hover:bg-black/5'}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('complaints'); setShowForm(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-xs font-bold uppercase tracking-wide ${activeTab === 'complaints' ? (user.role === 'student' || user.role === 'worker' ? 'bg-blue-50 text-blue-700' : 'bg-white/10 text-white') : 'opacity-60 hover:opacity-100 hover:bg-black/5'}`}
          >
            <ClipboardList size={18} />
            <span>
              {user.role === 'student' && 'My Complaints'}
              {user.role === 'warden' && 'All Complaints'}
              {user.role === 'worker' && 'My Tasks'}
              {user.role === 'admin' && 'All Issues'}
            </span>
          </button>

          {user.role !== 'worker' && (
             <button 
              onClick={() => { setActiveTab('attendance'); setShowForm(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-xs font-bold uppercase tracking-wide ${activeTab === 'attendance' ? (user.role === 'student' ? 'bg-blue-50 text-blue-700' : 'bg-white/10 text-white') : 'opacity-60 hover:opacity-100 hover:bg-black/5'}`}
            >
              <Calendar size={18} />
              <span>Attendance</span>
            </button>
          )}
          
          {user.role !== 'worker' && (
            <button 
              onClick={() => { setActiveTab('announcements'); setShowForm(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-xs font-bold uppercase tracking-wide ${activeTab === 'announcements' ? (user.role === 'student' ? 'bg-blue-50 text-blue-700' : 'bg-white/10 text-white') : 'opacity-60 hover:opacity-100 hover:bg-black/5'}`}
            >
              <Bell size={18} />
              <span>
                {user.role === 'warden' || user.role === 'admin' ? 'Post Notices' : 'Announcements'}
              </span>
            </button>
          )}

          {user.role === 'admin' && (
             <button 
              onClick={() => { setActiveTab('users'); setShowForm(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-xs font-bold uppercase tracking-wide ${activeTab === 'users' ? 'bg-white/10 text-white' : 'opacity-60 hover:opacity-100 hover:bg-black/5'}`}
            >
              <Users size={18} />
              <span>Users</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button onClick={handleLogout} className="w-full flex items-center justify-start space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wide text-red-400 hover:bg-red-900/10 hover:text-red-500 rounded-lg transition-colors">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4 md:px-8 flex justify-between items-center shadow-sm z-20">
          <div>
            <h2 className="text-xl font-extrabold uppercase text-slate-800 tracking-tight">
              {activeTab === 'dashboard' && 'Overview'}
              {activeTab === 'complaints' && (user.role === 'worker' ? 'Assigned Jobs' : 'Complaint Board')}
              {activeTab === 'announcements' && 'Notice Board'}
              {activeTab === 'attendance' && 'Attendance Register'}
              {activeTab === 'users' && 'User Registry'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
              {new Date().toDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold uppercase text-slate-800">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{user.role} | {user.roomNumber}</p>
            </div>
            <button 
              onClick={openProfile}
              className="relative w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-transparent hover:ring-blue-500 transition-all cursor-pointer"
            >
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                  <UserIcon size={18} />
                </div>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            
            {/* Role Specific Action Buttons */}
            {activeTab === 'complaints' && !showForm && user.role === 'student' && (
              <div className="mb-6 flex justify-end">
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 flex items-center transition-all text-xs font-bold uppercase tracking-wide transform hover:scale-[1.02] active:scale-95"
                >
                  <Plus size={18} className="mr-2" />
                  File Complaint
                </button>
              </div>
            )}

            {/* Views */}
            {showForm ? (
              <ComplaintForm onComplaintAdded={handleNewComplaint} onCancel={() => setShowForm(false)} />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DashboardStats complaints={filteredComplaints} userRole={user.role} />
                    
                    {/* Recent List for Dashboard */}
                    <div className="mt-8">
                      <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 flex items-center">
                        <ClipboardList size={16} className="mr-2" /> Recent Activity
                      </h3>
                      <ComplaintList 
                        complaints={filteredComplaints.slice(0, 3)} 
                        userRole={user.role}
                        onReviewSubmit={handleReviewSubmit}
                        onUpdateStatus={handleUpdateStatus}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'complaints' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <ComplaintList 
                      complaints={filteredComplaints} 
                      userRole={user.role}
                      onReviewSubmit={handleReviewSubmit}
                      onUpdateStatus={handleUpdateStatus}
                      onDelete={user.role === 'admin' ? handleDeleteComplaint : undefined}
                    />
                  </div>
                )}

                {activeTab === 'attendance' && (
                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <Attendance userRole={user.role} currentUser={user} />
                   </div>
                )}

                {activeTab === 'announcements' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Announcements 
                      announcements={announcements} 
                      userRole={user.role}
                      onReact={handleReaction}
                      onCreate={handleCreateAnnouncement}
                      onDelete={(user.role === 'warden' || user.role === 'admin') ? handleDeleteAnnouncement : undefined}
                    />
                  </div>
                )}

                {/* Admin Users View */}
                {activeTab === 'users' && user.role === 'admin' && (
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-100">
                        <h3 className="text-sm font-bold uppercase text-slate-800">System Users Directory</h3>
                      </div>
                      <div className="p-0">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                              <th className="px-6 py-4">User Profile</th>
                              <th className="px-6 py-4">Role</th>
                              <th className="px-6 py-4">Identifier</th>
                              <th className="px-6 py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr>
                              <td className="px-6 py-4 font-bold flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">AR</div>
                                Arjun Reddy
                              </td>
                              <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Student</span></td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-500">STU-2025-001</td>
                              <td className="px-6 py-4 text-green-600 font-bold uppercase text-xs">Active</td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 font-bold flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">CW</div>
                                Chief Warden
                              </td>
                              <td className="px-6 py-4"><span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Warden</span></td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-500">WARDEN-01</td>
                              <td className="px-6 py-4 text-green-600 font-bold uppercase text-xs">Active</td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 font-bold flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">RE</div>
                                Ramesh Electrician
                              </td>
                              <td className="px-6 py-4"><span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Worker</span></td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-500">WORKER-01</td>
                              <td className="px-6 py-4 text-slate-400 font-bold uppercase text-xs">Off Duty</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                   </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {isProfileOpen && tempUser && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className={`p-5 flex justify-between items-center text-white shrink-0 ${user.role === 'student' ? 'bg-blue-600' : 'bg-slate-800'}`}>
              <h3 className="font-bold uppercase text-sm flex items-center gap-2">
                <UserIcon size={16} />
                {tempUser.role} Profile
              </h3>
              <button onClick={() => setIsProfileOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Header Info */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                   <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                     {tempUser.profileImage ? (
                       <img src={tempUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                         <UserIcon size={40} />
                       </div>
                     )}
                   </div>
                   <label className="absolute bottom-0 right-0 bg-slate-800 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-black transition-all transform hover:scale-110">
                     <Camera size={14} />
                     <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                   </label>
                </div>
                <h3 className="mt-3 font-bold uppercase text-lg text-slate-800">{tempUser.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{tempUser.registerNumber}</p>
              </div>

              {/* Personal Details - White Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={tempUser.name} 
                      onChange={e => setTempUser({...tempUser, name: e.target.value})} 
                      className="w-full border border-slate-200 rounded p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={tempUser.dob || ''} 
                      onChange={e => setTempUser({...tempUser, dob: e.target.value})} 
                      className="w-full border border-slate-200 rounded p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                    />
                 </div>
                 {tempUser.role === 'student' && (
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Father's Name</label>
                      <input 
                        type="text" 
                        value={tempUser.fatherName || ''} 
                        onChange={e => setTempUser({...tempUser, fatherName: e.target.value})} 
                        className="w-full border border-slate-200 rounded p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                      />
                    </div>
                 )}
              </div>

              {/* Contact & Other */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Blood Group</label>
                    <div className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <Heart size={12} className="text-red-500" /> {tempUser.bloodGroup || 'N/A'}
                    </div>
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Valid Upto</label>
                      <div className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        <CreditCard size={12} className="text-blue-500" /> {tempUser.hostelValidUpto || 'N/A'}
                      </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="text" 
                      value={tempUser.phoneNumber} 
                      onChange={(e) => setTempUser({...tempUser, phoneNumber: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Separate Address Bar */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 flex items-center gap-1">
                  <MapPin size={12} /> Permanent Address
                </label>
                <textarea 
                  value={tempUser.address || ''} 
                  onChange={e => setTempUser({...tempUser, address: e.target.value})}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  placeholder="Enter full address here..."
                />
              </div>

              {/* Security / Password Section */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 flex items-center">
                  <Lock size={12} className="mr-1" /> Security Settings
                </h4>
                
                {!isPassVerified ? (
                  <div className="space-y-3">
                     <label className="block text-[10px] font-bold uppercase text-slate-500">Current Password</label>
                     <div className="flex gap-2">
                       <input 
                        type="password" 
                        value={currentPassInput}
                        onChange={e => setCurrentPassInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded p-2.5 text-sm outline-none focus:border-blue-500"
                        placeholder="Enter to unlock change"
                       />
                       <button 
                        onClick={verifyPassword}
                        className="bg-slate-800 text-white px-4 rounded text-xs font-bold uppercase hover:bg-black"
                       >
                         Verify
                       </button>
                     </div>
                     {passMsg && <p className="text-xs text-red-500 font-bold flex items-center"><AlertCircle size={12} className="mr-1"/> {passMsg}</p>}
                  </div>
                ) : (
                   <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-green-600 text-xs font-bold uppercase mb-2">
                        <CheckCircle2 size={14} /> Password Verified
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">New Password</label>
                        <div className="relative">
                          <Key size={14} className="absolute left-3 top-3 text-slate-400" />
                          <input 
                            type="password" 
                            value={newPassInput} 
                            onChange={(e) => setNewPassInput(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full bg-white border border-slate-200 rounded-lg pl-9 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium border-blue-300 ring-2 ring-blue-50"
                          />
                        </div>
                      </div>
                   </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveProfile}
                  className="px-6 py-2 text-xs bg-slate-900 text-white rounded-lg font-bold uppercase hover:bg-black shadow-lg shadow-slate-900/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => { setActiveTab('dashboard'); setShowForm(false); }}
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[9px] font-bold uppercase mt-1">Home</span>
        </button>
        <button 
          onClick={() => { setActiveTab('complaints'); setShowForm(false); }}
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors ${activeTab === 'complaints' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
        >
          <ClipboardList size={20} />
          <span className="text-[9px] font-bold uppercase mt-1">
             {user.role === 'worker' ? 'Jobs' : 'Issues'}
          </span>
        </button>
        {user.role !== 'worker' && (
          <button 
            onClick={() => { setActiveTab('announcements'); setShowForm(false); }}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors ${activeTab === 'announcements' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
          >
            <Bell size={20} />
            <span className="text-[9px] font-bold uppercase mt-1">Alerts</span>
          </button>
        )}
        <button 
          onClick={openProfile}
          className="flex flex-col items-center justify-center w-16 h-14 rounded-lg text-slate-400 hover:text-slate-600"
        >
          <UserIcon size={20} />
          <span className="text-[9px] font-bold uppercase mt-1">Me</span>
        </button>
      </div>

    </div>
  );
};

export default App;
