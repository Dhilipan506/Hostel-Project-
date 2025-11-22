
import React, { useState, useRef } from 'react';
import { User, ProfileChangeRequest } from '../types';
import { X, Camera, Trash2, User as UserIcon, Calendar, Phone, MapPin, Heart, Shield, FileEdit } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onRequestChange: (req: ProfileChangeRequest) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onUpdateUser, onRequestChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestType, setRequestType] = useState<'Password Change' | 'Details Update'>('Password Change');
  const [requestReason, setRequestReason] = useState('');
  const [requestDate, setRequestDate] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
         const base64 = reader.result as string;
         onUpdateUser({ ...user, profileImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    onUpdateUser({ ...user, profileImage: undefined });
  };

  const handleSubmitRequest = () => {
      if (!requestReason || !requestDate) return;
      onRequestChange({
          id: crypto.randomUUID(),
          userId: user.registerNumber,
          userName: user.name,
          userRole: user.role,
          type: requestType,
          reason: requestReason,
          requestedDate: requestDate,
          status: 'Pending'
      });
      setIsRequesting(false);
      setRequestReason('');
      setRequestDate('');
  };

  const Field = ({ label, value, icon: Icon, fullWidth = false }: { label: string, value?: string, icon: any, fullWidth?: boolean }) => (
    <div className={`bg-white p-3 rounded-lg border border-slate-200 shadow-sm ${fullWidth ? 'md:col-span-2' : ''}`}>
       <div className="flex items-center gap-2 mb-1">
         <Icon size={12} className="text-slate-400" />
         <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</span>
       </div>
       <p className="text-sm font-bold text-slate-800 truncate">{value || 'N/A'}</p>
    </div>
  );

  const headerColor = user.role === 'student' ? 'bg-blue-600' : user.role === 'worker' ? 'bg-orange-600' : user.role === 'warden' ? 'bg-teal-600' : 'bg-purple-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        <div className={`${headerColor} p-6 pb-16 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 z-20">
               <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all">
                  <X size={18} />
               </button>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent z-0"></div>
            <div className="relative z-10 text-center">
               <h2 className="text-xl font-extrabold uppercase tracking-widest text-white/90">{user.role} Profile</h2>
            </div>
        </div>

        <div className="relative px-6 -mt-12 mb-6 flex flex-col items-center">
            <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center relative z-10">
                    {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                    <span className="text-4xl font-bold text-white/50">{user.name.charAt(0)}</span>
                    )}
                </div>
                <div className="absolute bottom-0 right-0 z-20 flex gap-2 translate-x-2 translate-y-2">
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-800 p-2 rounded-full shadow-lg hover:bg-slate-50 transition-colors border border-slate-200">
                       <Camera size={14} />
                    </button>
                    {user.profileImage && (
                    <button onClick={handleRemovePhoto} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-400 transition-colors border-2 border-white">
                        <Trash2 size={14} />
                    </button>
                    )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload}/>
            </div>
            <div className="text-center mt-4">
                <p className="text-xs font-bold text-slate-500 font-mono bg-slate-50 inline-block px-2 py-1 rounded uppercase tracking-wide border border-slate-200">
                  ID: {user.registerNumber}
                </p>
            </div>
        </div>

        {!isRequesting ? (
            <div className="px-6 pb-8 max-h-[40vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.role === 'student' && (
                        <>
                            <Field label="Name" value={user.name} icon={UserIcon} />
                            <Field label="Blood Group" value={user.bloodGroup} icon={Heart} />
                            <Field label="Phone Number" value={user.phoneNumber} icon={Phone} />
                            <Field label="Date of Birth" value={user.dob} icon={Calendar} />
                            <Field label="Father Name" value={user.fatherName} icon={UserIcon} />
                            <Field label="Hostel Valid Upto" value={user.hostelValidUpto} icon={Shield} />
                            <Field label="Address" value={user.address} icon={MapPin} fullWidth />
                        </>
                    )}
                    {(user.role === 'warden' || user.role === 'worker' || user.role === 'admin') && (
                        <>
                            <Field label="Name" value={user.name} icon={UserIcon} />
                            <Field label="Date of Birth" value={user.dob} icon={Calendar} />
                            <Field label="Phone Number" value={user.phoneNumber} icon={Phone} />
                            <Field label="Address" value={user.address} icon={MapPin} />
                        </>
                    )}
                </div>
            </div>
        ) : (
            <div className="px-6 pb-8">
                <h3 className="text-sm font-bold uppercase text-slate-800 mb-4 border-b pb-2">Request Profile Update</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Request Type</label>
                        <select 
                            value={requestType} 
                            onChange={(e) => setRequestType(e.target.value as any)}
                            className="w-full border border-slate-300 bg-white rounded p-2 text-sm outline-none"
                        >
                            <option value="Password Change">Password Change</option>
                            <option value="Details Update">Personal Details Update</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date Needed By</label>
                        <input type="date" value={requestDate} onChange={e => setRequestDate(e.target.value)} className="w-full border border-slate-300 bg-white rounded p-2 text-sm outline-none"/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            {requestType === 'Password Change' ? 'Reason for Password Change' : 'What personal details need updating?'}
                        </label>
                        <textarea 
                            value={requestReason} 
                            onChange={e => setRequestReason(e.target.value)} 
                            rows={3} 
                            placeholder={requestType === 'Password Change' ? 'e.g. Forgot old password' : 'e.g. Change phone number to 987...'}
                            className="w-full border border-slate-300 bg-white rounded p-2 text-sm outline-none"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => setIsRequesting(false)} className="flex-1 border border-slate-200 py-2 rounded text-xs font-bold uppercase hover:bg-slate-50">Cancel</button>
                        <button onClick={handleSubmitRequest} className="flex-1 bg-blue-600 text-white py-2 rounded text-xs font-bold uppercase hover:bg-blue-700">Submit Request</button>
                    </div>
                </div>
            </div>
        )}
        
        {!isRequesting && (
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
                <button 
                    onClick={() => setIsRequesting(true)}
                    className="text-xs font-bold uppercase text-blue-600 hover:bg-blue-100 px-4 py-2 rounded transition-colors flex items-center gap-2"
                >
                    <FileEdit size={14} /> Request Details / Password Change
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
