
import React, { useState } from 'react';
import { UserRole, User, UserRequest, ProfileChangeRequest } from '../types';
import { UserPlus, Trash2, CheckCircle, User as UserIcon, Users, Briefcase, Shield } from 'lucide-react';

interface UserManagementProps {
  userRole: UserRole;
  users: User[];
  requests: UserRequest[];
  profileRequests?: ProfileChangeRequest[];
  onAddRequest: (req: UserRequest) => void;
  onApproveRequest: (reqId: string, userDetails: User) => void;
  onDeleteUser: (regNo: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ userRole, users, requests, profileRequests = [], onAddRequest, onApproveRequest, onDeleteUser }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'changes'>('new');
  
  const [userType, setUserType] = useState<'student' | 'worker'>('student');
  const [formData, setFormData] = useState({
    name: '', id: '', phone: '', dob: '', fatherName: '', bloodGroup: '', address: '', hostelValidUpto: '', roomNumber: '', workCategory: ''
  });

  const [viewingReq, setViewingReq] = useState<UserRequest | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const existingUsers = users.filter(u => u.role !== 'admin');
  const pendingProfileRequests = profileRequests.filter(r => r.status === 'Pending');

  // Count Stats
  const studentCount = users.filter(u => u.role === 'student').length;
  const workerCount = users.filter(u => u.role === 'worker').length;
  const wardenCount = users.filter(u => u.role === 'warden').length;

  const handleWardenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.id) {
        const newReq: UserRequest = {
            id: crypto.randomUUID(),
            requestedBy: 'WARDEN',
            userType: userType,
            name: formData.name,
            identifier: formData.id,
            status: 'Pending',
            phoneNumber: formData.phone,
            dob: formData.dob,
            fatherName: userType === 'student' ? formData.fatherName : undefined,
            bloodGroup: userType === 'student' ? formData.bloodGroup : undefined,
            address: userType === 'student' ? formData.address : undefined,
            hostelValidUpto: userType === 'student' ? formData.hostelValidUpto : undefined,
            roomNumber: userType === 'student' ? formData.roomNumber : undefined,
            workCategory: userType === 'worker' ? formData.workCategory : undefined,
        };
        onAddRequest(newReq);
        setFormData({
            name: '', id: '', phone: '', dob: '', fatherName: '', bloodGroup: '', address: '', hostelValidUpto: '', roomNumber: '', workCategory: ''
        });
    }
  };

  const handleAdminApprove = (req: UserRequest) => {
      const newUser: User = {
          registerNumber: req.identifier,
          name: req.name,
          role: req.userType,
          roomNumber: req.roomNumber || (req.userType === 'worker' ? 'MAINTENANCE' : 'N/A'),
          phoneNumber: req.phoneNumber,
          password: 'password123', 
          address: req.address || '',
          bloodGroup: req.bloodGroup,
          dob: req.dob,
          fatherName: req.fatherName,
          hostelValidUpto: req.hostelValidUpto,
          workCategory: req.workCategory,
          currentStatus: 'Free'
      };
      onApproveRequest(req.id, newUser);
      setViewingReq(null);
  };

  const handleResolveProfileRequest = (id: string) => {
      alert("Request Marked Resolved. Notification sent.");
  };

  return (
    <div className="space-y-8">
        
        {/* STATS HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {userRole === 'admin' && (
             <div className="bg-purple-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
               <div>
                 <p className="text-[10px] uppercase font-bold opacity-80">Total Wardens</p>
                 <p className="text-2xl font-extrabold">{wardenCount}</p>
               </div>
               <Shield size={24} className="opacity-50"/>
             </div>
           )}
           <div className={`text-white p-4 rounded-xl shadow-md flex items-center justify-between ${userRole === 'warden' ? 'bg-teal-600' : 'bg-blue-600'}`}>
               <div>
                 <p className="text-[10px] uppercase font-bold opacity-80">Total Students</p>
                 <p className="text-2xl font-extrabold">{studentCount}</p>
               </div>
               <Users size={24} className="opacity-50"/>
           </div>
           <div className="bg-orange-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
               <div>
                 <p className="text-[10px] uppercase font-bold opacity-80">Total Workers</p>
                 <p className="text-2xl font-extrabold">{workerCount}</p>
               </div>
               <Briefcase size={24} className="opacity-50"/>
           </div>
        </div>

        {/* WARDEN VIEW */}
        {userRole === 'warden' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
                <h3 className="text-sm font-bold uppercase text-teal-800 mb-4 flex items-center gap-2">
                    <UserPlus size={16} className="text-teal-600"/> Request New User
                </h3>
                
                <div className="flex gap-4 mb-4">
                    <label className={`cursor-pointer px-4 py-2 rounded text-xs font-bold uppercase border transition-colors ${userType === 'student' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                        <input type="radio" className="hidden" checked={userType === 'student'} onChange={() => setUserType('student')} /> Student
                    </label>
                    <label className={`cursor-pointer px-4 py-2 rounded text-xs font-bold uppercase border transition-colors ${userType === 'worker' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                        <input type="radio" className="hidden" checked={userType === 'worker'} onChange={() => setUserType('worker')} /> Worker
                    </label>
                </div>

                <form onSubmit={handleWardenSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {/* Inputs with bg-white */}
                     <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Name</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 p-2 rounded text-sm"/></div>
                     <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">ID</label><input required type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-white border border-slate-200 p-2 rounded text-sm"/></div>
                     <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Phone</label><input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white border border-slate-200 p-2 rounded text-sm"/></div>
                     <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">DOB</label><input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-white border border-slate-200 p-2 rounded text-sm"/></div>
                     
                     {userType === 'student' && (
                       <>
                        <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Father Name</label><input required type="text" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full bg-white border border-slate-200 p-2 rounded text-sm"/></div>
                        <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Room</label><input required type="text" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} className="w-full bg-white border border-slate-200 p-2 rounded text-sm"/></div>
                       </>
                     )}

                    <div className="md:col-span-3 pt-4">
                        <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold uppercase text-xs hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">
                            Submit Request to Admin
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* ADMIN VIEW */}
        {userRole === 'admin' && (
            <div className="space-y-6">
                <div className="flex gap-4 border-b border-slate-200">
                    <button onClick={() => setActiveTab('new')} className={`pb-3 text-xs font-bold uppercase ${activeTab === 'new' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-slate-400'}`}>New Accounts</button>
                    <button onClick={() => setActiveTab('changes')} className={`pb-3 text-xs font-bold uppercase ${activeTab === 'changes' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-slate-400'}`}>Profile Updates</button>
                </div>

                {activeTab === 'new' && (
                    viewingReq ? (
                        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100">
                            <div className="flex justify-between mb-6 border-b pb-4">
                                <h3 className="text-sm font-bold uppercase text-purple-800">Verify: {viewingReq.name}</h3>
                                <button onClick={() => setViewingReq(null)} className="text-xs text-slate-400">Close</button>
                            </div>
                            <button onClick={() => handleAdminApprove(viewingReq)} className="w-full bg-green-600 text-white py-3 rounded font-bold uppercase text-xs flex items-center justify-center"><CheckCircle size={16} className="mr-2"/> Approve</button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                             {pendingRequests.length === 0 && <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase">No pending requests</div>}
                             {pendingRequests.map(req => (
                                <div key={req.id} className="p-4 flex justify-between items-center hover:bg-slate-50 border-b border-slate-50 last:border-0">
                                    <div><h4 className="text-xs font-bold uppercase">{req.name}</h4><p className="text-[10px] text-slate-400">{req.identifier}</p></div>
                                    <button onClick={() => setViewingReq(req)} className="bg-purple-50 text-purple-600 px-3 py-1 rounded text-[10px] font-bold uppercase">Review</button>
                                </div>
                             ))}
                        </div>
                    )
                )}

                {activeTab === 'changes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* All Pending Profile Requests displayed here */}
                         <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 col-span-2">
                            <h4 className="text-xs font-bold uppercase text-purple-600 mb-3">Pending Change Requests</h4>
                            {pendingProfileRequests.length === 0 ? <p className="text-xs text-slate-400">No requests found.</p> : (
                                pendingProfileRequests.map(req => (
                                    <div key={req.id} className="bg-slate-50 p-3 rounded mb-2 border border-slate-100 flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-xs">{req.userName} ({req.userRole})</span>
                                            <span className="text-[9px] font-mono text-slate-400">{req.userId}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-600"><span className="font-bold">Request:</span> {req.type}</div>
                                        <div className="text-[10px] text-slate-600"><span className="font-bold">Details:</span> "{req.reason}"</div>
                                        <div className="text-[10px] text-slate-600"><span className="font-bold">Date Required:</span> {req.requestedDate}</div>
                                        <button onClick={() => handleResolveProfileRequest(req.id)} className="mt-2 bg-green-100 text-green-700 py-1 rounded text-[10px] font-bold uppercase">Mark Resolved</button>
                                    </div>
                                ))
                            )}
                         </div>
                    </div>
                )}
            </div>
        )}

        {/* USER LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-white border-b border-slate-100"><h3 className="text-xs font-bold uppercase text-slate-500">Registered Users</h3></div>
            <div className="divide-y divide-slate-100">
                {existingUsers.map(u => (
                    <div key={u.registerNumber} className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><UserIcon size={14}/></div>
                            <div><h4 className="text-xs font-bold uppercase text-slate-800">{u.name}</h4><p className="text-[10px] text-slate-400 font-mono">{u.registerNumber} • {u.role}</p></div>
                        </div>
                        {userRole === 'admin' && <button onClick={() => onDeleteUser(u.registerNumber)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default UserManagement;
