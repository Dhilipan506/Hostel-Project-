
import React, { useState } from 'react';
import { DisciplinaryAction, UserRole } from '../types';
import { ShieldAlert, Ban, CheckCircle, AlertTriangle, Upload, X } from 'lucide-react';
import { fileToGenerativePart } from '../services/geminiService';

interface DisciplinaryProps {
  userRole: UserRole;
  reports: DisciplinaryAction[];
  onReport: (report: DisciplinaryAction) => void;
  onAction: (id: string, action: string, days?: number) => void;
}

const Disciplinary: React.FC<DisciplinaryProps> = ({ userRole, reports, onReport, onAction }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => setProofImage(reader.result as string);
        reader.readAsDataURL(e.target.files[0]);
     }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName && regNo && reason && date) {
      const newReport: DisciplinaryAction = {
        id: crypto.randomUUID(),
        studentName,
        studentId: regNo,
        reason,
        date,
        reportedBy: 'Warden',
        status: 'Reported',
        proofImage: proofImage || undefined
      };
      onReport(newReport);
      setIsReporting(false);
      setStudentName(''); setRegNo(''); setReason(''); setDate(''); setProofImage(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warden Report Form */}
      {userRole === 'warden' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
           {!isReporting ? (
             <button 
               onClick={() => setIsReporting(true)}
               className="w-full py-4 border-2 border-dashed border-teal-200 rounded-xl flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors group"
             >
               <ShieldAlert size={20} className="mr-2"/>
               <span className="font-bold uppercase text-xs">Report Disciplinary Issue</span>
             </button>
           ) : (
             <form onSubmit={handleSubmitReport}>
               <h3 className="text-sm font-bold uppercase text-teal-800 mb-4">New Disciplinary Report</h3>
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                     <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Student Name</label>
                     <input required type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full border border-slate-200 bg-white p-2 rounded text-sm outline-none text-slate-800"/>
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Register Number</label>
                     <input required type="text" value={regNo} onChange={e => setRegNo(e.target.value)} className="w-full border border-slate-200 bg-white p-2 rounded text-sm outline-none text-slate-800"/>
                  </div>
               </div>
               <div className="mb-4">
                   <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Incident Date</label>
                   <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-slate-200 bg-white p-2 rounded text-sm outline-none text-slate-800"/>
               </div>
               <div className="mb-4">
                   <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Reason / Details</label>
                   <textarea required value={reason} onChange={e => setReason(e.target.value)} className="w-full border border-slate-200 bg-white p-2 rounded text-sm outline-none text-slate-800" rows={3}/>
               </div>
               
               <div className="mb-4">
                   <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Evidence Image (Optional)</label>
                   {!proofImage ? (
                      <label className="border border-dashed border-slate-300 rounded p-3 flex items-center justify-center cursor-pointer hover:bg-slate-50">
                          <span className="text-xs text-slate-500 flex items-center"><Upload size={12} className="mr-1"/> Upload Photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                      </label>
                   ) : (
                      <div className="relative w-24 h-24 border rounded overflow-hidden">
                          <img src={proofImage} alt="Evidence" className="w-full h-full object-cover"/>
                          <button type="button" onClick={() => setProofImage(null)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X size={12}/></button>
                      </div>
                   )}
               </div>

               <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsReporting(false)} className="text-xs font-bold uppercase text-slate-400 px-3">Cancel</button>
                  <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-red-700">Submit Report</button>
               </div>
             </form>
           )}
        </div>
      )}

      {/* Admin View */}
      {userRole === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-100">
             <h3 className="text-xs font-bold uppercase text-purple-800">Disciplinary Cases</h3>
          </div>
          <div className="divide-y divide-slate-100">
             {reports.length === 0 ? (
               <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase">No Active Cases</div>
             ) : (
               reports.map(report => (
                 <div key={report.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                    <div className="flex gap-4">
                       {report.proofImage && (
                          <img src={report.proofImage} className="w-12 h-12 rounded object-cover border border-slate-200" alt="Proof"/>
                       )}
                       <div>
                            <h4 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-2">
                                {report.studentName} <span className="text-slate-400 font-mono">({report.studentId})</span>
                                {report.status === 'Action Taken' && <span className="bg-red-100 text-red-600 text-[9px] px-1 rounded">BLOCKED</span>}
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-1"><span className="font-bold">Incident:</span> {report.reason}</p>
                            <p className="text-[10px] text-slate-400">Reported on {report.date}</p>
                       </div>
                    </div>
                    {report.status === 'Reported' && (
                      <div className="flex gap-2">
                         <button 
                           onClick={() => onAction(report.id, 'Dismissed')}
                           className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase"
                         >
                           Dismiss
                         </button>
                         <button 
                           onClick={() => onAction(report.id, 'Action Taken', 7)}
                           className="bg-red-600 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-red-700 flex items-center gap-1"
                         >
                           <Ban size={12}/> Block (1 Week)
                         </button>
                      </div>
                    )}
                    {report.status === 'Action Taken' && (
                      <div className="text-red-600 text-[10px] font-bold uppercase flex items-center gap-1">
                        <Ban size={12}/> Action Taken
                      </div>
                    )}
                 </div>
               ))
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Disciplinary;
