
import React, { useState } from 'react';
import { UserRole, User, UserRequest } from '../types';
import { UserPlus, Trash2, CheckCircle, XCircle, Shield, Briefcase, User as UserIcon, AlertCircle } from 'lucide-react';

interface UserManagementProps {
  userRole: UserRole;
  users: User[];
  requests: UserRequest[];
  onAddRequest: (req: UserRequest) => void;
  onApproveRequest: (reqId: string, userDetails: User) => void;
  onDeleteUser: (regNo: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ userRole, users, requests, onAddRequest, onApproveRequest, onDeleteUser }) => {
  // Warden Detailed Request State
  const [userType, setUserType] = useState<'student' | 'worker'>('student');
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    phone: '',
    dob: '',
    // Student
    fatherName: '',
    bloodGroup: '',
    address: '',
    hostelValidUpto: '',
    roomNumber: '',
    // Worker
    workCategory: ''
  });

  // Admin Approval State
  const [viewingReq, setViewingReq] = useState<UserRequest | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const existingUsers = users.filter(u => u.role !== 'admin');

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
            // Spread specific fields
            fatherName: userType === 'student' ? formData.fatherName : undefined,
            bloodGroup: userType === 'student' ? formData.bloodGroup : undefined,
            address: userType === 'student' ? formData.address : undefined,
            hostelValidUpto: userType === 'student' ? formData.hostelValidUpto : undefined,
            roomNumber: userType === 'student' ? formData.roomNumber : undefined,
            workCategory: userType === 'worker' ? formData.workCategory : undefined,
        };
        onAddRequest(newReq);
        // Reset
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
          password: 'password123', // Default
          address: req.address || '',
          bloodGroup: req.bloodGroup,
          dob: req.dob,
          fatherName: req.fatherName,
          hostelValidUpto: req.hostelValidUpto,
          workCategory: req.workCategory,
          currentStatus: 'Free' // Default for worker
      };
      onApproveRequest(req.id, newUser);
      setViewingReq(null);
  };

  return (
    <div className="space-y-8">
        
        {/* WARDEN VIEW: Request New Users (Detailed Form) */}
        {userRole === 'warden' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <h3 className="text-sm font-bold uppercase text-slate-800 mb-4 flex items-center gap-2">
                    <UserPlus size={16} className="text-blue-600"/> Request New User
                </h3>
                
                <div className="flex gap-4 mb-4">
                    <label className={`cursor-pointer px-4 py-2 rounded text-xs font-bold uppercase border transition-colors ${userType === 'student' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                        <input type="radio" className="hidden" checked={userType === 'student'} onChange={() => setUserType('student')} /> Student
                    </label>
                    <label className={`cursor-pointer px-4 py-2 rounded text-xs font-bold uppercase border transition-colors ${userType === 'worker' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                        <input type="radio" className="hidden" checked={userType === 'worker'} onChange={() => setUserType('worker')} /> Worker
                    </label>
                </div>

                <form onSubmit={handleWardenSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Common Fields */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded text-sm outline-none bg-slate-50 focus:bg-white"/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">{userType === 'student' ? 'Register Number' : 'Worker ID'}</label>
                        <input required type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full border p-2 rounded text-sm outline-none bg-slate-50 focus:bg-white"/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                        <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded text-sm outline-none bg-slate-50 focus:bg-white"/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date of Birth</label>
                        <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full border p-2 rounded text-sm outline-none bg-slate-50 focus:bg-white"/>
                    </div>

                    {/* Student Specific */}
                    {userType === 'student' && (
                        <>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Father's Name</label>
                                <input required type="text" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full border p-2 rounded text-sm outline-none bg-slate-50 focus:bg-white"/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Blood Group</label>
                                <input required type="text" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="w-full border p-2 rounded text-sm outline-none bg-slate-50 focus:bg-white"/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Room Number</label>
                                <input required type="text" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} className="w-full border p-2 rounded text-sm outline-none bg-slate-50 focus:bg-white"/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Hostel Valid Upto</label>
                                <input required type="date" value={formData.hostelValidUpto} onChange={e => setFormData({...formData, hostelValidUpto: e.target.value})} className="w-full border p-2 rounded text-sm outline-none bg-slate-50 focus:bg-white"/>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Permanent Address</label>
                                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} className="w-full border p-2 rounded text-sm outline-none bg-slate-50 focus:bg-white"/>
                            </div>
                        </>
                    )}

                    {/* Worker Specific */}
                    {userType === 'worker' && (
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Work Category (Typing Format)</label>
                            <input required type="text" placeholder="e.g. Electrical, Plumbing, Cleaning" value={formData.workCategory} onChange={e => setFormData({...formData, workCategory: e.target.value})} className="w-full border p-2 rounded text-sm outline-none bg-slate-50 focus:bg-white"/>
                        </div>
                    )}

                    <div className="md:col-span-3 pt-4">
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold uppercase text-xs hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                            Submit Request to Admin
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* ADMIN VIEW: Approve Requests */}
        {userRole === 'admin' && (
            <div className="space-y-6">
                {viewingReq ? (
                    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100 animate-in fade-in">
                        <div className="flex justify-between mb-6 border-b pb-4">
                            <h3 className="text-sm font-bold uppercase text-blue-800">Verify & Approve: {viewingReq.name}</h3>
                            <button onClick={() => setViewingReq(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-6">
                            <div><span className="text-[10px] font-bold text-slate-400 uppercase block">ID</span> {viewingReq.identifier}</div>
                            <div><span className="text-[10px] font-bold text-slate-400 uppercase block">Role</span> {viewingReq.userType}</div>
                            <div><span className="text-[10px] font-bold text-slate-400 uppercase block">Phone</span> {viewingReq.phoneNumber}</div>
                            <div><span className="text-[10px] font-bold text-slate-400 uppercase block">DOB</span> {viewingReq.dob}</div>
                            
                            {viewingReq.userType === 'student' && (
                                <>
                                    <div><span className="text-[10px] font-bold text-slate-400 uppercase block">Father</span> {viewingReq.fatherName}</div>
                                    <div><span className="text-[10px] font-bold text-slate-400 uppercase block">Room</span> {viewingReq.roomNumber}</div>
                                    <div><span className="text-[10px] font-bold text-slate-400 uppercase block">Valid Upto</span> {viewingReq.hostelValidUpto}</div>
                                    <div className="col-span-2"><span className="text-[10px] font-bold text-slate-400 uppercase block">Address</span> {viewingReq.address}</div>
                                </>
                            )}
                            {viewingReq.userType === 'worker' && (
                                <div className="col-span-2"><span className="text-[10px] font-bold text-slate-400 uppercase block">Work Type</span> {viewingReq.workCategory}</div>
                            )}
                        </div>
                        <button 
                            onClick={() => handleAdminApprove(viewingReq)}
                            className="w-full bg-green-600 text-white py-3 rounded font-bold uppercase text-xs hover:bg-green-700 flex items-center justify-center"
                        >
                            <CheckCircle size={16} className="mr-2"/> Confirm & Create Account
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100">
                            <h3 className="text-xs font-bold uppercase text-slate-500">Pending User Requests</h3>
                        </div>
                        {pendingRequests.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase">No pending requests</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-slate-800">{req.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-mono">{req.identifier} • {req.userType}</p>
                                        </div>
                                        <button 
                                            onClick={() => setViewingReq(req)}
                                            className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-blue-100"
                                        >
                                            Review
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* USER LIST VIEW (Shared) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase text-slate-500">Registered Users</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {existingUsers.map(u => (
                    <div key={u.registerNumber} className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <UserIcon size={14}/>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-800">{u.name}</h4>
                                <p className="text-[10px] text-slate-400 font-mono">{u.registerNumber} • {u.role}</p>
                            </div>
                        </div>
                        {userRole === 'admin' && (
                            <button onClick={() => onDeleteUser(u.registerNumber)} className="text-slate-300 hover:text-red-500">
                                <Trash2 size={16}/>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default UserManagement;
