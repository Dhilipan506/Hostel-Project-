
import React, { useState } from 'react';
import { LeaveRequest, UserRole, User } from '../types';
import { Calendar, Check, X, Plus, Loader2, AlertTriangle, FileCheck, Download, Eye, User as UserIcon, Shield, Clock } from 'lucide-react';
import { moderateContent, fileToGenerativePart } from '../services/geminiService';

interface LeavePortalProps {
  requests: LeaveRequest[];
  userRole: UserRole;
  currentUser: User;
  onAddRequest: (req: LeaveRequest) => void;
  onUpdateStatus: (id: string, status: 'Approved' | 'Rejected') => void;
}

const LeavePortal: React.FC<LeavePortalProps> = ({ requests, userRole, currentUser, onAddRequest, onUpdateStatus }) => {
  const [isCreating, setIsCreating] = useState(false);
  
  // Form Fields
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Gate Pass View
  const [showGatePass, setShowGatePass] = useState<LeaveRequest | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) return;

    // Student checks
    if (userRole === 'student' && (!timeOut || !timeIn || !proofFile)) {
        setError("Please fill all fields and upload mentor proof.");
        return;
    }

    setIsSubmitting(true);
    setError('');

    try {
        // AI Check for validity/language
        const moderation = await moderateContent(reason);
        if (!moderation.approved) {
            setError(moderation.reason || "Invalid reason provided.");
            setIsSubmitting(false);
            return;
        }

        let proofUrl = '';
        if (proofFile) {
            const part = await fileToGenerativePart(proofFile);
            proofUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }

        const newReq: LeaveRequest = {
            id: crypto.randomUUID(),
            userId: currentUser.registerNumber,
            userName: currentUser.name,
            userRole: userRole as 'student' | 'worker' | 'warden',
            fromDate,
            toDate,
            reason: moderation.cleanText,
            status: 'Pending',
            timeOut: timeOut || undefined,
            timeIn: timeIn || undefined,
            mentorProofUrl: proofUrl || undefined,
            // Gate pass pre-fill
            roomNumber: currentUser.roomNumber,
            phone: currentUser.phoneNumber,
            address: currentUser.address,
            fatherName: currentUser.fatherName
        };
        
        onAddRequest(newReq);
        setIsCreating(false);
        resetForm();
    } catch (e) {
        setError("Submission failed.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const resetForm = () => {
      setFromDate('');
      setToDate('');
      setReason('');
      setTimeOut('');
      setTimeIn('');
      setProofFile(null);
  };

  // Filter logic
  let displayedRequests = requests;
  if (userRole === 'student') {
      displayedRequests = requests.filter(r => r.userId === currentUser.registerNumber);
  } else if (userRole === 'worker') {
      displayedRequests = requests.filter(r => r.userId === currentUser.registerNumber);
  } else if (userRole === 'warden') {
      // Warden sees Students and Workers, and their own
      displayedRequests = requests.filter(r => r.userRole !== 'admin');
  }
  // Admin sees all (no filter needed)

  return (
    <div className="space-y-6">
      
      {/* Gate Pass Modal */}
      {showGatePass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-md p-0 rounded-none shadow-2xl overflow-hidden relative animate-in zoom-in-95">
                  <div className="bg-blue-900 text-white p-4 text-center border-b-4 border-yellow-500">
                      <h2 className="text-xl font-serif font-bold uppercase tracking-widest">Krishna Hostel</h2>
                      <p className="text-[10px] uppercase tracking-[0.3em] mt-1">Official Gate Pass</p>
                  </div>
                  <div className="p-8 space-y-4 font-mono text-sm relative">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                          <Shield size={200} />
                      </div>
                      
                      <div className="flex justify-between border-b border-dashed border-slate-300 pb-2">
                          <span className="text-slate-500">PASS ID:</span>
                          <span className="font-bold text-slate-900">#{showGatePass.id.slice(0,8).toUpperCase()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <p className="text-[10px] text-slate-500 uppercase">Student Name</p>
                              <p className="font-bold uppercase">{showGatePass.userName}</p>
                          </div>
                          <div>
                              <p className="text-[10px] text-slate-500 uppercase">Room No</p>
                              <p className="font-bold uppercase">{showGatePass.roomNumber || 'N/A'}</p>
                          </div>
                      </div>
                      <div>
                           <p className="text-[10px] text-slate-500 uppercase">Reason for Leaving</p>
                           <p className="font-bold uppercase">{showGatePass.reason}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-blue-50 p-3 rounded border border-blue-100">
                          <div>
                              <p className="text-[10px] text-blue-500 uppercase">Leaving</p>
                              <p className="font-bold text-blue-900">{showGatePass.fromDate}</p>
                              <p className="text-xs text-blue-800">{showGatePass.timeOut}</p>
                          </div>
                          <div>
                              <p className="text-[10px] text-blue-500 uppercase">Returning</p>
                              <p className="font-bold text-blue-900">{showGatePass.toDate}</p>
                              <p className="text-xs text-blue-800">{showGatePass.timeIn}</p>
                          </div>
                      </div>
                      <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-end">
                          <div>
                              <p className="text-[10px] text-slate-400 uppercase">Issued By</p>
                              <p className="font-bold font-serif italic">Chief Warden</p>
                          </div>
                          <div className="text-right">
                              <div className="inline-block border-2 border-green-600 text-green-600 px-2 py-1 rounded font-bold text-xs uppercase transform -rotate-12 opacity-80">
                                  APPROVED
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="bg-slate-100 p-3 flex justify-between items-center">
                      <button onClick={() => setShowGatePass(null)} className="text-xs font-bold uppercase text-slate-500 hover:text-slate-800">Close</button>
                      <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-black">
                          <Download size={14} /> Print / Download
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Create Button */}
      {(userRole === 'worker' || userRole === 'student' || userRole === 'warden') && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
            {!isCreating ? (
                 <button 
                    onClick={() => setIsCreating(true)}
                    className="w-full py-4 border-2 border-dashed border-blue-200 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors group"
                 >
                    <Plus size={20} className="mr-2 group-hover:scale-110 transition-transform"/> 
                    <span className="font-bold uppercase text-xs">
                        {userRole === 'student' ? 'Request Outing / Leave' : 'Apply for Leave'}
                    </span>
                 </button>
            ) : (
                <form onSubmit={handleSubmit} className="animate-in fade-in">
                    <h4 className="text-sm font-bold uppercase text-slate-800 mb-4 flex items-center gap-2">
                        {userRole === 'student' ? <FileCheck size={16}/> : <Clock size={16}/>}
                        New Application
                    </h4>
                    
                    {error && <p className="text-red-600 text-xs font-bold mb-3 bg-red-50 p-2 rounded flex items-center"><AlertTriangle size={14} className="mr-2"/> {error}</p>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">From Date</label>
                            <input type="date" required value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full border border-slate-200 bg-white rounded p-2 text-sm outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">To Date</label>
                            <input type="date" required value={toDate} onChange={e => setToDate(e.target.value)} className="w-full border border-slate-200 bg-white rounded p-2 text-sm outline-none"/>
                        </div>
                    </div>

                    {userRole === 'student' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Time Out</label>
                                <input type="time" required value={timeOut} onChange={e => setTimeOut(e.target.value)} className="w-full border border-slate-200 bg-white rounded p-2 text-sm outline-none"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Time In (Expected)</label>
                                <input type="time" required value={timeIn} onChange={e => setTimeIn(e.target.value)} className="w-full border border-slate-200 bg-white rounded p-2 text-sm outline-none"/>
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Reason</label>
                        <input type="text" required value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Family Function, Medical Checkup" className="w-full border border-slate-200 bg-white rounded p-2 text-sm outline-none"/>
                    </div>

                    {userRole === 'student' && (
                        <div className="mb-4">
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Mentor Approval Letter (Image)</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 flex flex-col items-center justify-center">
                                <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files?.[0] || null)} className="text-xs"/>
                                <p className="text-[10px] text-slate-400 mt-2">Must contain mentor signature</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setIsCreating(false)} className="text-xs font-bold uppercase text-slate-400 px-3 hover:text-slate-600">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded text-xs font-bold uppercase flex items-center hover:bg-blue-700 shadow-lg shadow-blue-200">
                            {isSubmitting && <Loader2 className="animate-spin mr-2" size={14}/>} Submit Application
                        </button>
                    </div>
                </form>
            )}
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-500">
                {userRole === 'admin' ? 'All Leave Requests' : 'History'}
              </h3>
          </div>
          <div className="divide-y divide-slate-100">
              {displayedRequests.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase">No records found.</div>
              ) : (
                  displayedRequests.map(req => (
                      <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                      req.userRole === 'student' ? 'bg-blue-100 text-blue-700' :
                                      req.userRole === 'warden' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                  }`}>
                                      {req.userRole}
                                  </span>
                                  <span className="text-xs font-bold text-slate-800 uppercase">{req.userName}</span>
                              </div>
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                  req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                  req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                              }`}>
                                  {req.status}
                              </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 mb-3">
                              <div>
                                  <span className="font-bold text-slate-400 block text-[9px] uppercase">Duration</span>
                                  {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}
                              </div>
                              <div>
                                  <span className="font-bold text-slate-400 block text-[9px] uppercase">Reason</span>
                                  {req.reason}
                              </div>
                              {req.timeOut && (
                                  <div>
                                      <span className="font-bold text-slate-400 block text-[9px] uppercase">Timing</span>
                                      {req.timeOut} to {req.timeIn}
                                  </div>
                              )}
                          </div>

                          {req.mentorProofUrl && (
                              <div className="mb-3">
                                  <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Mentor Letter</p>
                                  <img src={req.mentorProofUrl} alt="Proof" className="h-16 rounded border border-slate-200 object-cover"/>
                              </div>
                          )}

                          <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
                              
                              {/* Student Gate Pass Action */}
                              {userRole === 'student' && req.status === 'Approved' && (
                                  <button 
                                    onClick={() => setShowGatePass(req)}
                                    className="text-xs font-bold uppercase text-green-600 hover:bg-green-50 px-3 py-1 rounded flex items-center"
                                  >
                                      <FileCheck size={14} className="mr-1"/> View Gate Pass
                                  </button>
                              )}

                              {/* Approval Actions */}
                              {req.status === 'Pending' && (
                                  (userRole === 'warden' && req.userRole !== 'warden') || 
                                  (userRole === 'admin') 
                              ) && (
                                  <>
                                      <button onClick={() => onUpdateStatus(req.id, 'Approved')} className="bg-green-600 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-green-700 flex items-center">
                                          <Check size={12} className="mr-1"/> Approve
                                      </button>
                                      <button onClick={() => onUpdateStatus(req.id, 'Rejected')} className="bg-red-100 text-red-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-red-200 flex items-center">
                                          <X size={12} className="mr-1"/> Reject
                                      </button>
                                  </>
                              )}
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};

export default LeavePortal;
