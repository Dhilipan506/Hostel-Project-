
import React, { useState } from 'react';
import { Complaint, ComplaintStatus, Urgency, UserRole, WorkerStatus, User, WorkerAvailability } from '../types';
import { Clock, CheckCircle2, Star, MessageSquare, UserCog, Ban, Trash2, PlayCircle, CheckSquare, Calendar, MapPin, Activity, Wrench, ArrowRight, Loader2, AlertTriangle, AlertOctagon, History, Send, Camera, Package, Check, X, Eye, Image as ImageIcon } from 'lucide-react';
import { validateExtensionReason, fileToGenerativePart, validateWorkerEvidence } from '../services/geminiService';

interface ComplaintListProps {
  complaints: Complaint[];
  userRole: UserRole;
  availableWorkers?: User[]; 
  currentUser?: User;
  onReviewSubmit: (id: string, rating: number, comment: string) => void;
  onUpdateStatus: (id: string, status: ComplaintStatus, updates?: Partial<Complaint>) => void;
  onDelete?: (id: string) => void;
}

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

const LiveTracking: React.FC<{ 
  status: ComplaintStatus, 
  workerStatus?: WorkerStatus,
  assignedWorker?: string,
  workerImage?: string
}> = ({ status, workerStatus, assignedWorker, workerImage }) => {
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
    <div className="mt-6 relative">
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center bg-white px-1">
             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${step.active ? 'border-blue-600 bg-blue-600 scale-110' : 'border-slate-300 bg-white'}`}>
               {step.active && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
             </div>
             <span className={`text-[9px] font-bold uppercase mt-1 ${step.active ? 'text-blue-600' : 'text-slate-400'}`}>{step.label}</span>
          </div>
        ))}
      </div>
      
      {/* Worker Profile in Timeline */}
      {(status === ComplaintStatus.ASSIGNED || status === ComplaintStatus.IN_PROGRESS) && assignedWorker && (
         <div className="mt-4 flex justify-center animate-in fade-in slide-in-from-top-2">
            <div className="bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2">
               <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100">
                 {workerImage ? (
                    <img src={workerImage} className="w-full h-full object-cover" alt="Worker"/>
                 ) : (
                    <UserCog size={16} className="text-slate-400 m-1"/>
                 )}
               </div>
               <div>
                 <p className="text-[9px] text-slate-400 uppercase font-bold">Current Status</p>
                 <p className="text-[10px] text-blue-600 font-bold uppercase">{workerStatus || 'Assigned'}</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

const ComplaintCard: React.FC<{ 
  complaint: Complaint; 
  userRole: UserRole;
  workersList?: User[];
  onReview: (rating: number, comment: string) => void;
  onUpdate: (status: ComplaintStatus, updates?: Partial<Complaint>) => void;
  onDelete?: (id: string) => void;
}> = ({ complaint, userRole, workersList, onReview, onUpdate, onDelete }) => {
  
  // States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<{name: string, id: string} | null>(null);
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofStage, setProofStage] = useState<'reached' | 'working' | 'completed'>('reached');
  const [extensionReason, setExtensionReason] = useState('');
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [delayReason, setDelayReason] = useState('');
  const [showDelayModal, setShowDelayModal] = useState(false);
  
  // Image Modals
  const [viewStudentImage, setViewStudentImage] = useState(false);
  const [viewWorkerProof, setViewWorkerProof] = useState<string | null>(null);

  // Deadline Logic
  const isDeadlinePassed = complaint.estimatedCompletion && new Date() > new Date(complaint.estimatedCompletion);

  // Get Assigned Worker Image
  const assignedWorkerObj = workersList?.find(w => w.registerNumber === complaint.assignedWorkerId);

  // Warden Actions
  const handleApprove = () => onUpdate(ComplaintStatus.APPROVED);
  const handleReject = () => {
    if(rejectionReason) {
       onUpdate(ComplaintStatus.REJECTED, { rejectionReason });
    }
  };

  const handleAssign = () => {
    if (selectedWorker) {
      const now = new Date();
      const estimated = new Date(now.getTime() + 48 * 60 * 60 * 1000); // Default 2 days
      onUpdate(ComplaintStatus.ASSIGNED, { 
        assignedWorker: selectedWorker.name,
        assignedWorkerId: selectedWorker.id,
        estimatedCompletion: estimated.toISOString(),
        workerAccepted: false, 
        workerStatus: WorkerStatus.ASSIGNED
      });
      setShowAssignModal(false);
    }
  };

  // Worker Actions
  const handleWorkerAccept = () => {
    onUpdate(ComplaintStatus.ASSIGNED, { 
      workerAccepted: true, 
      workerStatus: WorkerStatus.ACCEPTED 
    });
  };

  const handleWorkerReject = () => {
    onUpdate(ComplaintStatus.APPROVED, { 
      assignedWorker: undefined,
      assignedWorkerId: undefined,
      workerAccepted: false,
      workerStatus: undefined,
      wardenNote: `Worker rejected task. Reason: Busy/Unavailable.` 
    });
  };

  const handleProofUpload = async () => {
    if (!proofFile) return;
    setIsProcessing(true);
    try {
      let isValid = true;
      let reason = '';

      // SKIP AI CHECK FOR "REACHED" PHOTO
      if (proofStage !== 'reached') {
        const validation = await validateWorkerEvidence(proofFile, proofStage, complaint.cleanDescription);
        isValid = validation.isValid;
        reason = validation.reason || '';
      }
      
      if (!isValid) {
        alert(`Proof Rejected by System: ${reason}`);
        setIsProcessing(false);
        return;
      }

      const part = await fileToGenerativePart(proofFile);
      const base64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      
      const newProofs = { ...complaint.proofImages, [proofStage]: base64 };
      
      let newStatus = complaint.status;
      let newWorkerStatus = complaint.workerStatus;

      if (proofStage === 'reached') {
        newWorkerStatus = WorkerStatus.REACHED;
        newStatus = ComplaintStatus.IN_PROGRESS; 
      } else if (proofStage === 'working') {
        newWorkerStatus = WorkerStatus.REPAIRING;
      } else if (proofStage === 'completed') {
        newWorkerStatus = WorkerStatus.COMPLETED;
        newStatus = ComplaintStatus.COMPLETED;
      }

      onUpdate(newStatus, { 
        proofImages: newProofs, 
        workerStatus: newWorkerStatus,
        completionTime: proofStage === 'completed' ? new Date().toISOString() : undefined
      });
      
      setShowProofUpload(false);
      setProofFile(null);

    } catch (e) {
      alert("Upload failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtensionRequest = async () => {
    if (!extensionReason) return;
    const check = await validateExtensionReason(extensionReason);
    onUpdate(complaint.status, {
      extensionReason,
      adminFlagged: check.flagForAdmin,
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
    });
    setShowExtensionModal(false);
  };

  const handleDelayReport = () => {
    if (delayReason) {
      onUpdate(complaint.status, { isDelayed: true, delayReason });
      setShowDelayModal(false);
    }
  };

  // Styles based on role
  const cardBorder = userRole === 'warden' ? 'border-teal-100' : userRole === 'worker' ? 'border-orange-100' : 'border-blue-100';
  const buttonPrimary = userRole === 'warden' ? 'bg-teal-600 hover:bg-teal-700' : userRole === 'worker' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 mb-4 transition-all hover:shadow-md ${cardBorder} ${complaint.urgency === Urgency.CRITICAL ? 'border-l-4 border-l-red-500' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-start">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer group" onClick={() => setViewStudentImage(true)}>
             <img src={complaint.imageUrl} alt="Issue" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
               <Eye className="text-white" size={16} />
             </div>
          </div>
          <div>
             <div className="flex items-center gap-2">
               <h3 className="text-sm font-bold uppercase text-slate-800">{complaint.title}</h3>
               <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                 complaint.urgency === Urgency.CRITICAL ? 'bg-red-100 text-red-700' : 
                 complaint.urgency === Urgency.HIGH ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'
               }`}>{complaint.urgency}</span>
             </div>
             <p className="text-[10px] font-mono text-slate-400 mt-1">{complaint.id}</p>
             <div className="flex items-center gap-2 mt-1">
                <MapPin size={10} className="text-slate-400"/>
                <span className="text-xs font-bold text-slate-600">{complaint.studentRoom}</span>
                <span className="text-[10px] text-slate-400 uppercase">| {complaint.category}</span>
             </div>
          </div>
        </div>
        <div className="text-right">
           <StatusBadge status={complaint.status} />
           {complaint.submittedAt && (
             <p className="text-[10px] text-slate-400 font-bold mt-1">{new Date(complaint.submittedAt).toLocaleDateString()}</p>
           )}
        </div>
      </div>

      {/* Content */}
      <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-2 rounded border border-slate-100">
        <span className="font-bold">System Summary:</span> {complaint.cleanDescription}
      </p>
      
      {/* STUDENT VIEWING WORKER PROOF */}
      {complaint.proofImages && (
        <div className="mb-4 flex gap-2">
            {complaint.proofImages.reached && (
                <button onClick={() => setViewWorkerProof(complaint.proofImages?.reached || null)} className="text-[10px] font-bold uppercase flex items-center gap-1 bg-slate-50 px-2 py-1 rounded hover:bg-slate-100">
                    <ImageIcon size={10} /> Worker Reached
                </button>
            )}
            {complaint.proofImages.working && (
                <button onClick={() => setViewWorkerProof(complaint.proofImages?.working || null)} className="text-[10px] font-bold uppercase flex items-center gap-1 bg-slate-50 px-2 py-1 rounded hover:bg-slate-100">
                    <ImageIcon size={10} /> Work in Progress
                </button>
            )}
            {complaint.proofImages.completed && (
                <button onClick={() => setViewWorkerProof(complaint.proofImages?.completed || null)} className="text-[10px] font-bold uppercase flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">
                    <ImageIcon size={10} /> Completion Proof
                </button>
            )}
        </div>
      )}

      <LiveTracking 
        status={complaint.status} 
        workerStatus={complaint.workerStatus} 
        assignedWorker={complaint.assignedWorker}
        workerImage={assignedWorkerObj?.profileImage}
      />

      {/* ACTION BUTTONS */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
         
         {/* STUDENT ACTIONS */}
         {userRole === 'student' && complaint.status === ComplaintStatus.COMPLETED && !complaint.review && (
           <button 
             onClick={() => setShowReviewForm(!showReviewForm)} 
             className="text-xs font-bold uppercase text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors"
           >
             Write Review
           </button>
         )}

         {/* WARDEN ACTIONS */}
         {userRole === 'warden' && complaint.status === ComplaintStatus.SUBMITTED && (
           <>
             <button onClick={handleApprove} className="bg-teal-600 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-teal-700 flex items-center">
               <CheckCircle2 size={14} className="mr-1"/> Approve
             </button>
             <div className="flex items-center gap-1">
               <input 
                 type="text" 
                 placeholder="Reason..." 
                 className="text-xs border rounded px-2 py-2 w-24 outline-none bg-white focus:border-red-300"
                 value={rejectionReason}
                 onChange={e => setRejectionReason(e.target.value)}
               />
               <button onClick={handleReject} className="bg-red-100 text-red-600 px-3 py-2 rounded text-xs font-bold uppercase hover:bg-red-200">Reject</button>
             </div>
           </>
         )}

         {userRole === 'warden' && complaint.status === ComplaintStatus.APPROVED && (
           <div className="relative">
             {showAssignModal ? (
               <div className="absolute bottom-full right-0 mb-2 bg-white shadow-xl border border-slate-200 p-3 rounded-lg z-10 w-64">
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Select Worker</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1 mb-2">
                     {workersList?.map(w => (
                       <button 
                        key={w.registerNumber} 
                        onClick={() => setSelectedWorker({name: `${w.name} (${w.workCategory || 'General'})`, id: w.registerNumber})}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-slate-50 flex justify-between ${selectedWorker?.id === w.registerNumber ? 'bg-teal-50 text-teal-700' : 'text-slate-700'}`}
                       >
                         <span className="font-bold">{w.name}</span>
                         <span className={`text-[9px] px-1.5 rounded ${w.currentStatus === 'Free' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{w.currentStatus || 'Free'}</span>
                       </button>
                     ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAssignModal(false)} className="text-[10px] font-bold uppercase text-slate-400">Cancel</button>
                    <button onClick={handleAssign} className="bg-teal-600 text-white px-3 py-1 rounded text-[10px] font-bold uppercase">Confirm</button>
                  </div>
               </div>
             ) : (
               <button onClick={() => setShowAssignModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-indigo-700 flex items-center">
                 <UserCog size={14} className="mr-1"/> Assign Worker
               </button>
             )}
           </div>
         )}

         {/* WORKER ACTIONS */}
         {userRole === 'worker' && complaint.status === ComplaintStatus.ASSIGNED && !complaint.workerAccepted && (
            <div className="flex gap-2">
                <button onClick={handleWorkerAccept} className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold uppercase flex items-center hover:bg-green-700 shadow-lg shadow-green-200">
                   <Check size={14} className="mr-1" /> Accept Job
                </button>
                <button onClick={handleWorkerReject} className="bg-red-100 text-red-600 px-4 py-2 rounded text-xs font-bold uppercase flex items-center hover:bg-red-200">
                   <X size={14} className="mr-1" /> Reject
                </button>
            </div>
         )}

         {userRole === 'worker' && complaint.workerAccepted && complaint.status !== ComplaintStatus.COMPLETED && (
           <>
             <button 
               onClick={() => { setProofStage('reached'); setShowProofUpload(true); }}
               disabled={!!complaint.proofImages?.reached}
               className={`px-3 py-2 rounded text-xs font-bold uppercase flex items-center ${complaint.proofImages?.reached ? 'bg-green-50 text-green-600 cursor-default' : 'bg-white border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600'}`}
             >
               <MapPin size={14} className="mr-1"/> {complaint.proofImages?.reached ? 'Reached' : 'Mark Reached'}
             </button>
             
             {complaint.proofImages?.reached && (
               <button 
                  onClick={() => { setProofStage('working'); setShowProofUpload(true); }}
                  disabled={!!complaint.proofImages?.working}
                  className={`px-3 py-2 rounded text-xs font-bold uppercase flex items-center ${complaint.proofImages?.working ? 'bg-green-50 text-green-600 cursor-default' : 'bg-white border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600'}`}
               >
                 <Wrench size={14} className="mr-1"/> {complaint.proofImages?.working ? 'Work Started' : 'Start Work'}
               </button>
             )}

             {complaint.proofImages?.working && (
                <button 
                  onClick={() => { setProofStage('completed'); setShowProofUpload(true); }}
                  className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-green-700 flex items-center shadow-lg shadow-green-200"
                >
                  <CheckCircle2 size={14} className="mr-1"/> Mark Done
                </button>
             )}
           </>
         )}

      </div>
      
      {/* Review Form */}
      {showReviewForm && (
        <div className="mt-4 bg-blue-50 p-4 rounded-lg animate-in fade-in">
          <h4 className="text-xs font-bold uppercase text-blue-800 mb-2">Rate Service</h4>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={20} fill={s <= rating ? "gold" : "none"} stroke={s <= rating ? "gold" : "#cbd5e1"} onClick={() => setRating(s)} className="cursor-pointer" />
            ))}
          </div>
          <textarea 
            className="w-full p-2 rounded border border-blue-200 text-xs mb-2 outline-none bg-white"
            placeholder="Optional comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button 
            onClick={() => { onReview(rating, comment); setShowReviewForm(false); }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold uppercase"
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Proof Upload Modal */}
      {showProofUpload && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
               <h3 className="font-bold uppercase text-slate-800 text-sm mb-4">Upload {proofStage} Photo</h3>
               <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center mb-4 bg-slate-50">
                  <Camera size={32} className="text-slate-400 mb-2"/>
                  <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
               </div>
               <p className="text-[10px] text-blue-600 mb-4 bg-blue-50 p-2 rounded flex items-center gap-2">
                  <Activity size={12}/> Photo will be visible to Student.
               </p>
               <div className="flex justify-end gap-2">
                  <button onClick={() => setShowProofUpload(false)} className="text-xs font-bold uppercase text-slate-400 px-3">Cancel</button>
                  <button onClick={handleProofUpload} disabled={isProcessing || !proofFile} className={`${buttonPrimary} text-white px-4 py-2 rounded text-xs font-bold uppercase flex items-center disabled:opacity-50`}>
                     {isProcessing ? <Loader2 className="animate-spin mr-2" size={14}/> : 'Upload'}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* VIEW IMAGE MODAL (Student Complaint) */}
      {viewStudentImage && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewStudentImage(false)}>
             <div className="max-w-2xl w-full bg-white rounded-lg overflow-hidden relative p-2">
                 <img src={complaint.imageUrl} className="w-full h-auto rounded" alt="Evidence"/>
                 <button className="absolute top-4 right-4 bg-white text-black p-2 rounded-full"><X size={16}/></button>
             </div>
         </div>
      )}

      {/* VIEW PROOF IMAGE MODAL (Worker Proof) */}
      {viewWorkerProof && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewWorkerProof(null)}>
             <div className="max-w-2xl w-full bg-white rounded-lg overflow-hidden relative p-2">
                 <img src={viewWorkerProof} className="w-full h-auto rounded" alt="Proof"/>
                 <button className="absolute top-4 right-4 bg-white text-black p-2 rounded-full"><X size={16}/></button>
             </div>
         </div>
      )}
    </div>
  );
};

const ComplaintList: React.FC<ComplaintListProps> = ({ complaints, userRole, availableWorkers, currentUser, onReviewSubmit, onUpdateStatus, onDelete }) => {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
           <CheckSquare size={24} className="text-slate-300" />
        </div>
        <p className="text-slate-400 font-bold uppercase text-sm">No records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <ComplaintCard 
          key={complaint.id} 
          complaint={complaint} 
          userRole={userRole}
          workersList={availableWorkers}
          onReview={(r, c) => onReviewSubmit(complaint.id, r, c)}
          onUpdate={(s, u) => onUpdateStatus(complaint.id, s, u)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ComplaintList;
