
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Calendar, CheckCircle2, XCircle, Save, Droplets, Clock, Users, Briefcase, History } from 'lucide-react';

interface AttendanceProps {
  userRole: UserRole;
  currentUser: User;
  onSaveAttendance?: () => void; // Callback for notification
}

// Mock Data Interfaces
interface MockStudent {
  id: string;
  name: string;
  room: string;
  status: 'Present' | 'Absent' | null;
}

interface MockWorker {
  id: string;
  name: string;
  role: string;
  status: 'Present' | 'Absent' | null;
}

interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent';
  timeIn: string;
  timeOut?: string;
}

const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];
const ROOMS = ['Room 101', 'Room 102', 'Room 103', 'Dormitory 1'];

const Attendance: React.FC<AttendanceProps> = ({ userRole, currentUser, onSaveAttendance }) => {
  // Warden State
  const [activeTab, setActiveTab] = useState<'students' | 'workers'>('students');
  const [selectedFloor, setSelectedFloor] = useState(FLOORS[0]);
  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // Mock Student Data (For Warden Marking)
  const [students, setStudents] = useState<MockStudent[]>([
    { id: 'REG-23-001', name: 'A. Reddy', room: '101', status: 'Present' },
    { id: 'REG-23-002', name: 'V. Singh', room: '101', status: 'Absent' },
    { id: 'REG-23-003', name: 'K. Sharma', room: '102', status: null },
    { id: 'REG-23-004', name: 'R. John', room: '102', status: 'Present' },
  ]);

  // Mock Worker Data (For Warden Marking)
  const [workers, setWorkers] = useState<MockWorker[]>([
    { id: 'WRK-001', name: 'Ramesh Kumar', role: 'Electrician', status: 'Present' },
    { id: 'WRK-002', name: 'Suresh', role: 'Plumber', status: 'Absent' },
  ]);

  // Mock History Data (For Student/Worker View)
  const attendanceHistory: AttendanceRecord[] = [
     { date: 'Oct 26, 2023', status: 'Present', timeIn: '09:00 AM', timeOut: '06:00 PM' },
     { date: 'Oct 25, 2023', status: 'Present', timeIn: '09:15 AM', timeOut: '06:10 PM' },
     { date: 'Oct 24, 2023', status: 'Absent', timeIn: '-', timeOut: '-' },
     { date: 'Oct 23, 2023', status: 'Present', timeIn: '08:55 AM', timeOut: '05:45 PM' },
     { date: 'Oct 22, 2023', status: 'Present', timeIn: '09:05 AM', timeOut: '06:00 PM' },
  ];

  // Adjust Mock Data context based on role
  const myHistory = attendanceHistory.map(r => {
      if (userRole === 'student') {
          return { ...r, timeIn: r.status === 'Present' ? '8:30 PM' : '-', timeOut: '-' }; // Students usually have Entry Time
      }
      return r;
  });

  const handleMarkStudent = (id: string, status: 'Present' | 'Absent') => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleMarkWorker = (id: string, status: 'Present' | 'Absent') => {
    setWorkers(workers.map(w => w.id === id ? { ...w, status } : w));
  };

  const handleSave = () => {
    setShowSaveSuccess(true);
    if (onSaveAttendance) onSaveAttendance();
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const displayedStudents = students; 

  // --- STUDENT / WORKER VIEW (READ ONLY HISTORY) ---
  if (userRole === 'student' || userRole === 'worker') {
      const presentCount = myHistory.filter(h => h.status === 'Present').length;
      const absentCount = myHistory.filter(h => h.status === 'Absent').length;
      const percentage = Math.round((presentCount / myHistory.length) * 100);

      return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[600px] p-6">
            <h2 className="text-lg font-bold uppercase text-slate-800 mb-6 flex items-center gap-2">
                <History className={userRole === 'student' ? 'text-blue-600' : 'text-orange-600'}/> 
                My Attendance History
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-xs font-bold uppercase text-slate-500">Days Present</p>
                    <p className="text-3xl font-extrabold text-green-600 mt-2">{presentCount}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <p className="text-xs font-bold uppercase text-slate-500">Days Absent</p>
                    <p className="text-3xl font-extrabold text-red-600 mt-2">{absentCount}</p>
                </div>
                <div className={`p-4 rounded-xl border ${userRole === 'student' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                    <p className="text-xs font-bold uppercase text-slate-500">Attendance Rate</p>
                    <p className={`text-3xl font-extrabold mt-2 ${userRole === 'student' ? 'text-blue-600' : 'text-orange-600'}`}>{percentage}%</p>
                </div>
            </div>

            {/* History Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4">{userRole === 'student' ? 'Entry Time' : 'Check In'}</th>
                            <th className="px-6 py-4">{userRole === 'student' ? 'Remarks' : 'Check Out'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {myHistory.map((record, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400"/> {record.date}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center justify-center gap-1 w-24 mx-auto ${record.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {record.status === 'Present' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-600 font-mono">{record.timeIn}</td>
                                <td className="px-6 py-4 text-xs text-slate-600 font-mono">{record.timeOut || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      );
  }

  // --- WARDEN VIEW (MARKING INTERFACE) ---
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[600px] relative">
      {showSaveSuccess && (
         <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 border border-slate-700">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-xs font-bold uppercase tracking-wide">Attendance Closed & Notified</span>
         </div>
      )}

      <div className="p-6 pb-0 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold uppercase text-slate-800">Attendance Registry</h2>
          <button 
            onClick={handleSave}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase flex items-center hover:bg-black shadow-lg shadow-slate-900/20 transition-all active:scale-95"
          >
            <Save size={14} className="mr-2" /> Close & Notify
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-100 mt-2">
          <button 
            onClick={() => setActiveTab('students')}
            className={`pb-3 text-xs font-bold uppercase flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users size={14} /> Students
          </button>
          <button 
            onClick={() => setActiveTab('workers')}
            className={`pb-3 text-xs font-bold uppercase flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'workers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Briefcase size={14} /> Staff / Workers
          </button>
        </div>
      </div>

      {/* Filters */}
      {activeTab === 'students' && (
        <div className="p-4 bg-slate-50 flex gap-4 border-y border-slate-100">
          <select value={selectedFloor} onChange={e => setSelectedFloor(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold uppercase outline-none shadow-sm w-32 text-slate-800">
            {FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold uppercase outline-none shadow-sm w-32 text-slate-800">
            {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}

      {/* Table Content */}
      <div className="p-0">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4 w-1/3">ID</th>
              <th className="px-6 py-4 w-1/3">Name/Role</th>
              <th className="px-6 py-4 w-1/3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeTab === 'students' ? (
                displayedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">{student.id}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 uppercase">{student.name}</td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex justify-center gap-2">
                          <button onClick={() => handleMarkStudent(student.id, 'Present')} className={`p-1 rounded ${student.status === 'Present' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300'}`}><CheckCircle2 size={16}/></button>
                          <button onClick={() => handleMarkStudent(student.id, 'Absent')} className={`p-1 rounded ${student.status === 'Absent' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-300'}`}><XCircle size={16}/></button>
                       </div>
                    </td>
                  </tr>
                ))
            ) : (
               workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">{worker.id}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 uppercase">{worker.name} ({worker.role})</td>
                     <td className="px-6 py-4 text-center">
                       <div className="flex justify-center gap-2">
                          <button onClick={() => handleMarkWorker(worker.id, 'Present')} className={`p-1 rounded ${worker.status === 'Present' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300'}`}><CheckCircle2 size={16}/></button>
                          <button onClick={() => handleMarkWorker(worker.id, 'Absent')} className={`p-1 rounded ${worker.status === 'Absent' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-300'}`}><XCircle size={16}/></button>
                       </div>
                    </td>
                  </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
