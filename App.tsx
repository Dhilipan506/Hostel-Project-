
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
import UserProfileModal from './components/UserProfileModal';
import Disciplinary from './components/Disciplinary';
import { User, Complaint, ComplaintStatus, Category, Urgency, Announcement, WorkerStatus, LeaveRequest, UserRequest, UserRole, DisciplinaryAction, Notification, WorkerAvailability, ProfileChangeRequest } from './types';
import { LayoutDashboard, ClipboardList, Plus, Bell, LogOut, User as UserIcon, Home, X, Camera, MapPin, Phone, Calendar, Heart, CreditCard, Users, PenTool, Shield, Key, Lock, CheckCircle2, AlertCircle, Briefcase, Menu, ChevronDown, ShieldAlert } from 'lucide-react';

// Mock Data
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
    assignedWorker: 'Ramesh (Electrician)',
    assignedWorkerId: 'WORKER-01',
  }
];

const INITIAL_USERS: User[] = [
    { registerNumber: 'ADMIN', name: 'System Admin', role: 'admin', roomNumber: 'SERVER', phoneNumber: '000', dob: '1990-01-01' },
    { registerNumber: 'WARDEN-01', name: 'Mr. Sharma', role: 'warden', roomNumber: 'OFFICE', phoneNumber: '999', dob: '1980-01-01' },
    { registerNumber: 'WORKER-01', name: 'Ramesh', role: 'worker', roomNumber: 'MAINT', phoneNumber: '888', dob: '1985-01-01', workCategory: 'Electrical' },
    { registerNumber: '123456789', name: 'Arjun Reddy', role: 'student', roomNumber: '302-A', phoneNumber: '777', dob: '2000-01-01' }
];

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false); // For Dropdown
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Data States
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profileRequests, setProfileRequests] = useState<ProfileChangeRequest[]>([]);
  const [disciplinaryReports, setDisciplinaryReports] = useState<DisciplinaryAction[]>([]);
  
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  // NOTIFICATION HELPER
  const addNotification = (title: string, message: string, targetRole: UserRole | 'all') => {
     const newNotif: Notification = {
        id: crypto.randomUUID(),
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        targetRole
     };
     setNotifications(prev => [newNotif, ...prev]);
  };

  // HANDLERS
  const handleLogin = (user: User) => { setCurrentUser(user); setActiveTab('dashboard'); };
  const handleLogout = () => { setCurrentUser(null); setShowProfileMenu(false); };

  const updateComplaintStatus = (id: string, status: ComplaintStatus, updates?: Partial<Complaint>) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
          if (updates?.workerStatus) {
              if (updates.workerStatus === WorkerStatus.REPAIRING) {
                  addNotification('Work Started', `Worker started repair for ${c.title}`, 'student');
                  addNotification('Work Update', `Worker started ${c.title} in ${c.studentRoom}`, 'warden');
              }
              if (updates.workerStatus === WorkerStatus.COMPLETED) {
                  addNotification('Work Completed', `Repair for ${c.title} marked done by worker.`, 'student');
                  addNotification('Task Done', `Worker completed ${c.title}.`, 'warden');
              }
          }
          return { ...c, status, ...updates };
      }
      return c;
    }));
  };

  const handleAttendanceSave = () => {
      addNotification('Attendance Closed', 'Warden has finalized today\'s attendance.', 'student');
      addNotification('Attendance Closed', 'Daily attendance registry closed.', 'worker');
  };

  const handleProfileRequest = (req: ProfileChangeRequest) => {
      setProfileRequests(prev => [req, ...prev]);
      addNotification('Profile Request', `New Change Request from ${req.userName}`, 'admin');
      // Notify the user themselves for confirmation
      addNotification('Request Sent', 'Your profile update request has been sent to Admin.', currentUser?.role || 'student');
  };

  // Theme Helper
  const getThemeColor = () => {
      switch(currentUser?.role) {
          case 'student': return 'blue';
          case 'warden': return 'teal';
          case 'worker': return 'orange';
          case 'admin': return 'purple';
          default: return 'slate';
      }
  };
  const theme = getThemeColor();

  const activeIconColor = theme === 'blue' ? 'bg-blue-600' : theme === 'teal' ? 'bg-teal-600' : theme === 'orange' ? 'bg-orange-600' : 'bg-purple-600';
  const activeShadow = theme === 'blue' ? 'shadow-blue-600/30' : theme === 'teal' ? 'shadow-teal-600/30' : theme === 'orange' ? 'shadow-orange-600/30' : 'shadow-purple-600/30';

  if (!currentUser) return <Auth onLogin={handleLogin} blockedUsers={[]} />;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col shadow-2xl`}>
        <div className="p-6 flex flex-col items-center border-b border-slate-800">
           <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl mb-4 text-white bg-gradient-to-br from-${theme}-500 to-${theme}-700`}>
             <Shield size={32} />
           </div>
           <h1 className="text-lg font-extrabold text-white uppercase tracking-wider">Krishna Hostel</h1>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {['Dashboard', 'Complaints', 'Announcements', 'Attendance', 'Leaves'].map(item => {
              const id = item.toLowerCase();
              return (
                <button 
                    key={id}
                    onClick={() => { setActiveTab(id); setShowComplaintForm(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all group ${
                        activeTab === id ? `${activeIconColor} text-white ${activeShadow}` : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <span className="text-xs font-bold uppercase">{item}</span>
                </button>
              );
          })}
          
          {(currentUser.role === 'warden' || currentUser.role === 'admin') && (
             <>
               <p className="px-4 text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mt-6 mb-3">Admin Tools</p>
               <button onClick={() => setActiveTab('disciplinary')} className={`w-full flex items-center px-4 py-3 rounded-xl mb-1 ${activeTab === 'disciplinary' ? `${activeIconColor} text-white` : 'text-slate-400 hover:bg-slate-800'}`}>
                   <span className="text-xs font-bold uppercase">Disciplinary</span>
               </button>
               <button onClick={() => setActiveTab('users')} className={`w-full flex items-center px-4 py-3 rounded-xl mb-1 ${activeTab === 'users' ? `${activeIconColor} text-white` : 'text-slate-400 hover:bg-slate-800'}`}>
                   <span className="text-xs font-bold uppercase">Users</span>
               </button>
             </>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between shadow-sm z-40 relative">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden"><Menu size={24}/></button>
              <h2 className="text-lg font-extrabold text-slate-800 uppercase">{activeTab === 'users' ? 'Users' : activeTab}</h2>
           </div>
           <div className="flex items-center gap-6">
               <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-slate-500 hover:text-slate-800">
                  <Bell size={20}/>
                  {notifications.filter(n => !n.read && (n.targetRole === 'all' || n.targetRole === currentUser.role)).length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
               </button>
               {showNotifications && (
                   <div className="absolute top-16 right-16 w-72 bg-white shadow-2xl rounded-xl border border-slate-100 p-2 z-50">
                       {notifications.filter(n => n.targetRole === 'all' || n.targetRole === currentUser.role).length === 0 ? (
                           <div className="p-4 text-center text-xs text-slate-400 font-bold uppercase">No New Notifications</div>
                       ) : (
                           notifications.filter(n => n.targetRole === 'all' || n.targetRole === currentUser.role).map(n => (
                               <div key={n.id} className="p-3 border-b border-slate-50 text-xs hover:bg-slate-50">
                                   <p className="font-bold text-slate-800 mb-1">{n.title}</p>
                                   <p className="text-slate-500">{n.message}</p>
                               </div>
                           ))
                       )}
                   </div>
               )}
               
               <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 uppercase leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{currentUser.registerNumber}</p>
               </div>
               
               {/* Profile Dropdown */}
               <div className="relative">
                   <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 focus:outline-none">
                       <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                           {currentUser.profileImage ? <img src={currentUser.profileImage} className="w-full h-full object-cover"/> : <UserIcon className="p-1 text-slate-500"/>}
                       </div>
                       <ChevronDown size={14} className="text-slate-400"/>
                   </button>
                   
                   {showProfileMenu && (
                       <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
                           <button 
                                onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }}
                                className="w-full text-left px-4 py-3 text-xs font-bold uppercase text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                           >
                               <UserIcon size={14}/> My Profile
                           </button>
                           <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 text-xs font-bold uppercase text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
                           >
                               <LogOut size={14}/> Logout
                           </button>
                       </div>
                   )}
               </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
           {showComplaintForm ? (
               <ComplaintForm 
                   currentUser={currentUser}
                   onComplaintAdded={(c) => { setComplaints([c, ...complaints]); setShowComplaintForm(false); }} 
                   onCancel={() => setShowComplaintForm(false)} 
               />
           ) : (
               <>
                  {activeTab === 'dashboard' && <DashboardStats complaints={complaints} userRole={currentUser.role} currentUser={currentUser} onStatusChange={() => {}} />}
                  {activeTab === 'complaints' && (
                      <div className="space-y-4">
                          {currentUser.role === 'student' && (
                              <button onClick={() => setShowComplaintForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded uppercase text-xs font-bold">
                                  + New Complaint
                              </button>
                          )}
                          <ComplaintList 
                            complaints={
                                currentUser.role === 'student' ? complaints.filter(c => c.studentId === currentUser.registerNumber) :
                                currentUser.role === 'worker' ? complaints.filter(c => c.assignedWorkerId === currentUser.registerNumber) :
                                complaints
                            }
                            userRole={currentUser.role}
                            availableWorkers={users.filter(u => u.role === 'worker')}
                            currentUser={currentUser}
                            onUpdateStatus={updateComplaintStatus}
                            onReviewSubmit={() => {}}
                          />
                      </div>
                  )}
                  {activeTab === 'attendance' && <Attendance userRole={currentUser.role} currentUser={currentUser} onSaveAttendance={handleAttendanceSave} />}
                  {activeTab === 'leaves' && <LeavePortal requests={leaveRequests} userRole={currentUser.role} currentUser={currentUser} onAddRequest={req => setLeaveRequests([req, ...leaveRequests])} onUpdateStatus={() => {}} />}
                  {activeTab === 'disciplinary' && <Disciplinary userRole={currentUser.role} reports={disciplinaryReports} onReport={r => setDisciplinaryReports([r, ...disciplinaryReports])} onAction={() => {}} />}
                  {activeTab === 'users' && <UserManagement userRole={currentUser.role} users={users} requests={[]} profileRequests={profileRequests} onAddRequest={() => {}} onApproveRequest={() => {}} onDeleteUser={() => {}} />}
                  {activeTab === 'announcements' && <Announcements announcements={announcements} userRole={currentUser.role} onReact={() => {}} />}
               </>
           )}
        </main>

        <UserProfileModal 
            isOpen={showProfileModal} 
            onClose={() => setShowProfileModal(false)} 
            user={currentUser} 
            onUpdateUser={setCurrentUser} 
            onRequestChange={handleProfileRequest}
        />
      </div>
    </div>
  );
};

export default App;
