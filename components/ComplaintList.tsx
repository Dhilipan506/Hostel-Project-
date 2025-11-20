
import React, { useState } from 'react';
import { Complaint, ComplaintStatus, Urgency, UserRole, WorkerStatus } from '../types';
import { Clock, CheckCircle2, Star, MessageSquare, UserCog, Ban, Trash2, PlayCircle, CheckSquare, Calendar, MapPin, Activity, Wrench, ArrowRight, Loader2, AlertTriangle, AlertOctagon, History, Send } from 'lucide-react';
import { moderateContent, validateExtensionReason } from '../services/geminiService';

interface ComplaintListProps {
  complaints: Complaint[];
  userRole: UserRole;
  onReviewSubmit: (id: string, rating: number, comment: string) => void;
  onUpdateStatus: (id: string, status: ComplaintStatus, updates?: Partial<Complaint>) => void;
  onDelete?: (id: string) => void;
}

const WORKERS = [
  { id: 'w1', name: 'Ramesh (Electrician)' },
  { id: 'w2', name: 'Suresh (Plumber)' },
  { id: 'w3', name: 'Mukesh (Housekeeping)' },
  { id: 'w4', name: 'Raj (Network Engineer)' },
  { id: 'w5', name: 'Ganesh (Carpenter)' },
];

const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  const colors = {
    [ComplaintStatus.SUBMITTED]: 'bg-blue-100 text-blue-700',
    [ComplaintStatus.APPROVED]: 'bg-purple-100 text-purple-700',
    [ComplaintStatus.ASSIGNED]: 'bg-indigo-100 text-indigo-700',
    [ComplaintStatus.IN_PROGRESS]: 'bg-orange-100 text-orange-700',
    [ComplaintStatus.COMPLETED]: 'bg-green-100 text-green-700',
    [ComplaintStatus.REJECTED]: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${colors[status]}`}>{status}</span>;
};

const LiveTracking: React.FC<{ status: ComplaintStatus, workerStatus?: WorkerStatus }> = ({ status, workerStatus }) => {
  const steps = [
    { label: 'Raised', active: true },
    { label: 'Approved', active: status !== ComplaintStatus.SUBMITTED && status !== ComplaintStatus.REJECTED },
    { label: 'Assigned', active: status === ComplaintStatus.ASSIGNED || status === ComplaintStatus.IN_PROGRESS || status === ComplaintStatus.COMPLETED },
    { label: 'Working', active: status === ComplaintStatus.IN_PROGRESS || status === ComplaintStatus.COMPLETED },
    { label: 'Done', active: status === ComplaintStatus.COMPLETED }
  ];

  if (status === ComplaintStatus.REJECTED) {
    return <div className="text-red-600 text-xs font-bold uppercase border-l-2 border-red-600 pl-2">Complaint Rejected</div>;
  }

  return (
    <div className="flex items-center justify-between w-full mt-4 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
      {steps.map((step, idx) => (
        <div key={idx} className="flex flex-col items-center bg-white px-1">
           <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${step.active ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
             {step.active && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
           </div>
           <span className={`text-[9px] font-bold uppercase mt-1 ${step.active ? 'text-blue-600' : 'text-slate-400'}`}>{step.label}</span>
        </div>
      ))}
    </div>
  );
};

const ComplaintCard: React.FC<{ 
  complaint: Complaint; 
  userRole: UserRole;
  onReview: (rating: number, comment: string) => void;
  onUpdate: (status: ComplaintStatus, updates?: Partial<Complaint>) => void;
  onDelete?: (id: string) => void;
}> = ({ complaint, userRole, onReview, onUpdate, onDelete }) => {
  // Review State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  
  // Warden Action States
  const [showWardenAction, setShowWardenAction] = useState<'none' | 'approve' | 'reject' | 'extend' | 'replyDelay'>('none');
  const [assignWorker, setAssignWorker] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  
  // Extension State
  const [extensionReason, setExtensionReason] = useState('');
  const [isExtending, setIsExtending] = useState(false);
  
  // Delay Reply State
  const [delayReply, setDelayReply] = useState('');

  // Worker Action States
  const [workerStatusUpdate, setWorkerStatusUpdate] = useState<WorkerStatus | ''>('');

  // Student Report Delay State
  const [showDelayReport, setShowDelayReport] = useState(false);
  const [delayReason, setDelayReason] = useState('');

  const isOverdue = complaint.estimatedCompletion && new Date(complaint.estimatedCompletion) < new Date() && complaint.status !== ComplaintStatus.COMPLETED;

  const handleApprove = () => {
    if (!assignWorker || !startDate || !completionDate) return;
    
    const estimated = `${completionDate}T18:00:00`; // Default to end of day
    onUpdate(ComplaintStatus.ASSIGNED, {
      assignedWorker: assignWorker,
      startDate: startDate,
      estimatedCompletion: estimated,
      status: ComplaintStatus.ASSIGNED,
      workerStatus: WorkerStatus.ASSIGNED
    });
    setShowWardenAction('none');
  };

  const handleReject = () => {
    if (!rejectReason) return;
    onUpdate(ComplaintStatus.REJECTED, { rejectionReason: rejectReason });
    setShowWardenAction('none');
  };

  const handleExtendDeadline = async () => {
    if (!extensionReason || !completionDate) return;
    
    setIsExtending(true);
    try {
      // Validate reason via AI
      const validation = await validateExtensionReason(extensionReason);
      const estimated = `${completionDate}T18:00:00`;
      
      onUpdate(complaint.status, {
        estimatedCompletion: estimated,
        extensionReason: extensionReason,
        adminFlagged: validation.flagForAdmin,
        // If delayed previously, maybe clear delay flag? Leaving it to show history
      });
      setShowWardenAction('none');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtending(false);
    }
  };

  const handleStudentReportDelay = () => {
    if (!delayReason) return;
    onUpdate(complaint.status, {
      isDelayed: true,
      delayReason: delayReason
    });
    setShowDelayReport(false);
  };

  const handleWardenReplyDelay = () => {
    if (!delayReply) return;
    onUpdate(complaint.status, {
      wardenDelayResponse: delayReply
    });
    setShowWardenAction('none');
  };

  const handleWorkerUpdate = (newStatus: WorkerStatus) => {
    let mainStatus = complaint.status;
    if (newStatus === WorkerStatus.REPAIRING || newStatus === WorkerStatus.CHECKING) mainStatus = ComplaintStatus.IN_PROGRESS;
    if (newStatus === WorkerStatus.COMPLETED) mainStatus = ComplaintStatus.COMPLETED;
    
    onUpdate(mainStatus, { workerStatus: newStatus });
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      onReview(rating, comment);
      setShowReviewForm(false);
      return;
    }

    setIsReviewing(true);
    setReviewError(null);

    try {
      const moderation = await moderateContent(comment);
      if (!moderation.approved) {
        setReviewError(moderation.reason || "Improper words detected.");
        setIsReviewing(false);
        return;
      }
      onReview(rating, moderation.cleanText);
      setShowReviewForm(false);
    } catch (e) {
      setReviewError("Validation failed. Try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  const displayImage = complaint.images && complaint.images.length > 0 ? complaint.images[0] : complaint.imageUrl;

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${complaint.adminFlagged ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-100'} overflow-hidden hover:shadow-md transition-shadow relative`}>
      {complaint.adminFlagged && userRole === 'admin' && (
        <div className="bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-1 absolute top-0 right-0 z-10 rounded-bl-lg flex items-center">
          <AlertOctagon size={12} className="mr-1"/> Flagged Extension
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 md:h-auto relative bg-slate-200 shrink-0 group">
          <img 
            src={displayImage} 
            alt={complaint.title} 
            className="w-full h-full object-cover absolute inset-0" 
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
             <span className={`px-2 py-1 rounded shadow text-[10px] font-bold uppercase text-white ${complaint.urgency === Urgency.CRITICAL || complaint.urgency === Urgency.HIGH ? 'bg-red-500' : 'bg-blue-500'}`}>
               {complaint.urgency}
             </span>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <StatusBadge status={complaint.status} />
                 <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{complaint.id}</span>
              </div>
              <h3 className="text-lg font-bold uppercase text-slate-900">{complaint.title}</h3>
              <span className="text-[10px] font-bold uppercase text-brand-600 bg-brand-50 px-1 rounded inline-block mt-1">{complaint.category}</span>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className="text-xs text-slate-400 flex items-center bg-slate-50 px-2 py-1 rounded">
                 <Clock size={14} className="mr-1" />
                 {new Date(complaint.submittedAt).toLocaleDateString()}
               </div>
               {userRole === 'admin' && onDelete && (
                 <button onClick={() => onDelete(complaint.id)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                   <Trash2 size={16} />
                 </button>
               )}
            </div>
          </div>
          
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">{complaint.cleanDescription}</p>
          
          {userRole === 'student' && (
            <div className="mb-4">
              <LiveTracking status={complaint.status} workerStatus={complaint.workerStatus} />
            </div>
          )}

          {/* Info Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
            {complaint.assignedWorker && (
              <div className="flex items-center gap-2 text-slate-600">
                <UserCog size={14} className="text-blue-500"/>
                <span className="font-bold uppercase">Worker:</span> {complaint.assignedWorker}
              </div>
            )}
            {complaint.startDate && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={14} className="text-green-500"/>
                <span className="font-bold uppercase">Start:</span> {complaint.startDate}
              </div>
            )}
            {complaint.estimatedCompletion && (
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={14} className={isOverdue ? 'text-red-600 animate-pulse' : 'text-orange-500'}/>
                <span className="font-bold uppercase">Due By:</span> {new Date(complaint.estimatedCompletion).toLocaleDateString()}
              </div>
            )}
          </div>
          
          {/* Delay & Extension History Info */}
          {complaint.isDelayed && (
            <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-500 mt-0.5"/>
                <div>
                  <span className="font-bold uppercase text-red-700">Student Reported Delay:</span>
                  <p className="text-slate-600">"{complaint.delayReason}"</p>
                  {complaint.wardenDelayResponse ? (
                    <div className="mt-2 pl-2 border-l-2 border-blue-200">
                      <span className="font-bold uppercase text-blue-700 block">Warden Reply:</span>
                      <span className="text-slate-600">"{complaint.wardenDelayResponse}"</span>
                    </div>
                  ) : (
                    userRole === 'warden' && showWardenAction !== 'replyDelay' && (
                      <button 
                        onClick={() => setShowWardenAction('replyDelay')}
                        className="mt-2 text-blue-600 underline font-bold uppercase text-[10px]"
                      >
                        Reply to Student
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {complaint.extensionReason && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs flex items-start gap-2">
              <History size={14} className="text-yellow-600 mt-0.5"/>
              <div>
                <span className="font-bold uppercase text-yellow-800">Deadline Extended:</span>
                <p className="text-slate-600">Reason: "{complaint.extensionReason}"</p>
                {complaint.adminFlagged && (
                   <span className="text-red-600 font-bold uppercase text-[10px] mt-1 block">⚠️ Invalid Reason Flagged to Admin</span>
                )}
              </div>
            </div>
          )}

          {/* ------ ACTIONS AREA ------ */}
          <div className="mt-auto pt-2 border-t border-slate-100">
            
            {/* STUDENT ACTIONS */}
            {userRole === 'student' && (
              <>
                {/* Review Button */}
                {complaint.status === ComplaintStatus.COMPLETED && !complaint.review && !showReviewForm && (
                  <button 
                    onClick={() => setShowReviewForm(true)}
                    className="w-full py-2 text-xs border border-yellow-400 text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 flex items-center justify-center uppercase font-bold transition-colors"
                  >
                    <Star size={14} className="mr-2" /> Rate Completed Work
                  </button>
                )}
                {/* Report Delay Button */}
                {isOverdue && !complaint.isDelayed && !showDelayReport && (
                  <button 
                    onClick={() => setShowDelayReport(true)}
                    className="w-full py-2 text-xs border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center uppercase font-bold transition-colors mt-2"
                  >
                    <AlertTriangle size={14} className="mr-2" /> Report Delay
                  </button>
                )}
              </>
            )}

            {/* WARDEN ACTIONS */}
            {(userRole === 'warden' || userRole === 'admin') && (
              <>
                 {/* Initial Approval */}
                {complaint.status === ComplaintStatus.SUBMITTED && showWardenAction === 'none' && (
                  <div className="flex gap-3">
                    <button onClick={() => setShowWardenAction('approve')} className="flex-1 py-2 text-xs bg-blue-600 text-white rounded-lg font-bold uppercase hover:bg-blue-700 shadow-sm">
                      Approve & Assign
                    </button>
                    <button onClick={() => setShowWardenAction('reject')} className="flex-1 py-2 text-xs border border-red-200 text-red-600 bg-white rounded-lg font-bold uppercase hover:bg-red-50">
                      Reject
                    </button>
                  </div>
                )}
                {/* Extend Deadline if Overdue/Active */}
                {isOverdue && complaint.status !== ComplaintStatus.COMPLETED && showWardenAction === 'none' && (
                   <button onClick={() => setShowWardenAction('extend')} className="w-full py-2 text-xs bg-slate-800 text-white rounded-lg font-bold uppercase hover:bg-black shadow-sm mt-2">
                     Extend Deadline
                   </button>
                )}
              </>
            )}

            {/* WORKER UPDATE */}
            {userRole === 'worker' && complaint.status !== ComplaintStatus.COMPLETED && (
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Update Status:</label>
                  <select 
                    className="w-full bg-white border border-slate-300 text-xs rounded p-2 outline-none font-medium"
                    value={complaint.workerStatus || ''}
                    onChange={(e) => handleWorkerUpdate(e.target.value as WorkerStatus)}
                  >
                    <option value="" disabled>Select Activity...</option>
                    {Object.values(WorkerStatus).map(ws => <option key={ws} value={ws}>{ws}</option>)}
                  </select>
               </div>
            )}

            {/* --- FORMS --- */}

            {/* 1. Warden Approval Form (Date Only) */}
            {showWardenAction === 'approve' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-3 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-xs font-bold uppercase text-blue-800 mb-3 flex items-center"><UserCog size={14} className="mr-1"/> Assign Task</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Worker</label>
                    <select value={assignWorker} onChange={(e) => setAssignWorker(e.target.value)} className="w-full p-2 text-xs border rounded bg-white outline-none">
                      <option value="">-- Choose Worker --</option>
                      {WORKERS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 text-xs border rounded bg-white outline-none"/>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">End Date</label>
                        <input type="date" value={completionDate} onChange={e => setCompletionDate(e.target.value)} className="w-full p-2 text-xs border rounded bg-white outline-none"/>
                     </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setShowWardenAction('none')} className="flex-1 py-2 bg-white border text-slate-500 rounded text-xs font-bold uppercase">Cancel</button>
                    <button onClick={handleApprove} className="flex-1 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase shadow-sm">Confirm</button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Warden Extension Form */}
            {showWardenAction === 'extend' && (
              <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 mt-3 animate-in fade-in slide-in-from-top-2">
                 <h4 className="text-xs font-bold uppercase text-slate-800 mb-3">Extend Deadline</h4>
                 <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">New Completion Date</label>
                      <input type="date" value={completionDate} onChange={e => setCompletionDate(e.target.value)} className="w-full p-2 text-xs border rounded bg-white outline-none"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Reason (Required)</label>
                      <textarea 
                        value={extensionReason} 
                        onChange={e => setExtensionReason(e.target.value)} 
                        className="w-full p-2 text-xs border rounded bg-white h-16 resize-none outline-none" 
                        placeholder="Why is it delayed? (Validated by AI)"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setShowWardenAction('none')} className="flex-1 py-2 bg-white border text-slate-500 rounded text-xs font-bold uppercase">Cancel</button>
                      <button onClick={handleExtendDeadline} disabled={isExtending} className="flex-1 py-2 bg-slate-800 text-white rounded text-xs font-bold uppercase shadow-sm flex justify-center items-center">
                        {isExtending ? <Loader2 size={14} className="animate-spin"/> : 'Update Date'}
                      </button>
                    </div>
                 </div>
              </div>
            )}

            {/* 3. Warden Reply to Delay */}
            {showWardenAction === 'replyDelay' && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                <textarea 
                   value={delayReply}
                   onChange={e => setDelayReply(e.target.value)}
                   className="w-full p-2 text-xs border rounded bg-white h-16 resize-none outline-none mb-2"
                   placeholder="Reply to student..."
                />
                <div className="flex gap-2">
                   <button onClick={() => setShowWardenAction('none')} className="flex-1 py-1 bg-white border text-slate-500 rounded text-xs font-bold uppercase">Cancel</button>
                   <button onClick={handleWardenReplyDelay} className="flex-1 py-1 bg-blue-600 text-white rounded text-xs font-bold uppercase">Send Reply</button>
                </div>
              </div>
            )}

            {/* 4. Student Report Delay Form */}
            {showDelayReport && (
               <div className="bg-red-50 p-4 rounded-lg border border-red-100 mt-3 animate-in fade-in slide-in-from-top-2">
                 <h4 className="text-xs font-bold uppercase text-red-800 mb-2">Report Work Delay</h4>
                 <textarea 
                    value={delayReason}
                    onChange={e => setDelayReason(e.target.value)}
                    className="w-full p-2 text-xs border border-red-200 rounded mb-3 h-16 resize-none bg-white outline-none"
                    placeholder="Why is this late? Give a reason..."
                 />
                 <div className="flex gap-2">
                    <button onClick={() => setShowDelayReport(false)} className="flex-1 py-2 bg-white border text-slate-500 rounded text-xs font-bold uppercase">Cancel</button>
                    <button onClick={handleStudentReportDelay} className="flex-1 py-2 bg-red-600 text-white rounded text-xs font-bold uppercase">Submit Report</button>
                  </div>
              </div>
            )}

            {/* 5. Warden Rejection Form */}
            {showWardenAction === 'reject' && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 mt-3 animate-in fade-in slide-in-from-top-2">
                 <h4 className="text-xs font-bold uppercase text-red-800 mb-2">Reason for Rejection</h4>
                 <textarea 
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full p-2 text-xs border border-red-200 rounded mb-3 h-16 resize-none bg-white outline-none"
                    placeholder="Explain why..."
                 />
                 <div className="flex gap-2">
                    <button onClick={() => setShowWardenAction('none')} className="flex-1 py-2 bg-white border text-slate-500 rounded text-xs font-bold uppercase">Cancel</button>
                    <button onClick={handleReject} className="flex-1 py-2 bg-red-600 text-white rounded text-xs font-bold uppercase">Reject Complaint</button>
                  </div>
              </div>
            )}

            {/* 6. Student Review Form */}
            {showReviewForm && (
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-3 animate-in fade-in slide-in-from-top-2">
                 <p className="text-xs font-bold uppercase text-slate-700 mb-2">Rate Service:</p>
                 <div className="flex gap-1 mb-3">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button key={star} type="button" onClick={() => setRating(star)}>
                       <Star size={20} className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"} />
                     </button>
                   ))}
                 </div>
                 {reviewError && (
                    <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-2 rounded mb-2 flex items-center">
                      <AlertTriangle size={12} className="mr-1"/> {reviewError}
                    </div>
                 )}
                 <textarea 
                  className="w-full text-xs p-2 border rounded mb-2 bg-white outline-none" 
                  placeholder="Comment on work quality (English Only)"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                 />
                 <div className="flex gap-2 justify-end">
                   <button onClick={() => setShowReviewForm(false)} disabled={isReviewing} className="text-xs text-slate-500 px-3 py-1 font-bold uppercase">Cancel</button>
                   <button 
                    onClick={handleSubmitReview}
                    disabled={isReviewing}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-bold uppercase flex items-center"
                   >
                     {isReviewing && <Loader2 size={12} className="animate-spin mr-1" />}
                     Submit
                   </button>
                 </div>
               </div>
            )}

            {/* Display Existing Review */}
            {complaint.review && (
              <div className="mt-3 bg-green-50 p-3 rounded-lg flex items-start border border-green-100">
                <CheckCircle2 size={16} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <div className="flex text-yellow-500 text-xs mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < complaint.review!.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="text-xs text-green-800 italic">"{complaint.review.comment}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ComplaintList: React.FC<ComplaintListProps> = ({ complaints, userRole, onReviewSubmit, onUpdateStatus, onDelete }) => {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
          <CheckSquare size={32} className="text-slate-300" />
        </div>
        <h3 className="text-sm font-bold uppercase text-slate-900">No items found</h3>
        <p className="text-xs text-slate-500 mt-1">
          {userRole === 'student' ? "You haven't submitted any complaints yet." : "No complaints matching this filter."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {complaints.map((complaint) => (
        <ComplaintCard 
          key={complaint.id} 
          complaint={complaint} 
          userRole={userRole}
          onReview={(rating, comment) => onReviewSubmit(complaint.id, rating, comment)} 
          onUpdate={(status, updates) => onUpdateStatus(complaint.id, status, updates)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ComplaintList;
