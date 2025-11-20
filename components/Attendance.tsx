
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Calendar, CheckCircle2, XCircle, Save, Droplets, Clock } from 'lucide-react';

interface AttendanceProps {
  userRole: UserRole;
  currentUser: User;
}

// Mock Students Structure
interface MockStudent {
  id: string;
  name: string;
  room: string;
  status: 'Present' | 'Absent' | null;
}

const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];
const ROOMS = ['Room 101', 'Room 102', 'Room 103', 'Dormitory 1'];

const Attendance: React.FC<AttendanceProps> = ({ userRole, currentUser }) => {
  // Warden State
  const [selectedFloor, setSelectedFloor] = useState(FLOORS[0]);
  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // Updated Mock Data
  const [students, setStudents] = useState<MockStudent[]>([
    // Room 101 - 12 Students
    { id: 'REG-23-001', name: 'A. Reddy', room: '101', status: 'Present' },
    { id: 'REG-23-002', name: 'V. Singh', room: '101', status: 'Absent' },
    { id: 'REG-23-003', name: 'R. Dravid', room: '101', status: null },
    { id: 'REG-23-004', name: 'S. Tend', room: '101', status: 'Present' },
    { id: 'REG-23-005', name: 'M. Dhoni', room: '101', status: 'Present' },
    { id: 'REG-23-006', name: 'V. Kohli', room: '101', status: null },
    { id: 'REG-23-007', name: 'R. Sharma', room: '101', status: null },
    { id: 'REG-23-008', name: 'K. Rahul', room: '101', status: 'Absent' },
    { id: 'REG-23-009', name: 'H. Pandya', room: '101', status: 'Present' },
    { id: 'REG-23-010', name: 'R. Jadeja', room: '101', status: null },
    { id: 'REG-23-011', name: 'J. Bumrah', room: '101', status: 'Present' },
    { id: 'REG-23-012', name: 'M. Shami', room: '101', status: null },

    // Room 102 - 4 Students
    { id: 'REG-23-013', name: 'S. Gill', room: '102', status: null },
    { id: 'REG-23-014', name: 'S. Iyer', room: '102', status: null },
    { id: 'REG-23-015', name: 'I. Kishan', room: '102', status: null },
    { id: 'REG-23-016', name: 'S. Yadav', room: '102', status: null },

    // Room 103 - 3 Students
    { id: 'REG-23-017', name: 'R. Ashwin', room: '103', status: null },
    { id: 'REG-23-018', name: 'A. Patel', room: '103', status: null },
    { id: 'REG-23-019', name: 'S. Thakur', room: '103', status: null },
  ]);

  // Student State - History with Time
  const attendanceHistory = [
    { date: '2023-10-25', time: '09:00 AM', status: 'Present' },
    { date: '2023-10-24', time: '09:15 AM', status: 'Present' },
    { date: '2023-10-23', time: '-', status: 'Absent' },
    { date: '2023-10-22', time: '08:55 AM', status: 'Present' },
    { date: '2023-10-21', time: '09:05 AM', status: 'Present' },
  ];

  const handleMark = (id: string, status: 'Present' | 'Absent') => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSave = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Filter students based on selection
  const displayedStudents = students.filter(s => {
    // Simple mock filtering logic
    if (selectedRoom === 'Dormitory 1') return false; 
    // Extract number from "Room 101" -> "101"
    const roomNum = selectedRoom.replace('Room ', '');
    return s.room === roomNum;
  });

  if (userRole === 'student') {
    return (
      <div className="space-y-6">
        {/* History List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
             <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
               <Calendar size={14} /> Attendance Report
             </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {attendanceHistory.map((record, idx) => (
              <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                    <Clock size={10}/> {record.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   {record.status === 'Present' ? (
                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                   ) : (
                     <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                   )}
                   <span className={`text-[10px] font-bold uppercase ${
                    record.status === 'Present' ? 'text-green-600' : 'text-red-600'
                   }`}>
                    {record.status}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Warden / Admin View
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[600px] relative">
      {/* Success Popup */}
      {showSaveSuccess && (
         <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 border border-slate-700">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-xs font-bold uppercase tracking-wide">Attendance Submitted Successfully</span>
         </div>
      )}

      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-lg font-bold uppercase text-slate-800">Attendance</h2>
        <button 
          onClick={handleSave}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase flex items-center hover:bg-black shadow-lg shadow-slate-900/20 transition-all active:scale-95"
        >
          <Save size={14} className="mr-2" /> Save
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 bg-slate-50 flex gap-4 border-b border-slate-100">
        <select 
          value={selectedFloor} 
          onChange={e => setSelectedFloor(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold uppercase outline-none shadow-sm w-32"
        >
          {FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select 
          value={selectedRoom} 
          onChange={e => setSelectedRoom(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold uppercase outline-none shadow-sm w-32"
        >
          {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Three Column List: Register No | Room No | Attendance */}
      <div className="p-0">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4 w-1/3">Register Number</th>
              <th className="px-6 py-4 w-1/3">Room No</th>
              <th className="px-6 py-4 w-1/3 text-center">Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedStudents.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-xs font-bold text-slate-800 font-mono">{student.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase">
                    {student.room}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => handleMark(student.id, 'Present')}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all transform active:scale-95 ${
                        student.status === 'Present' 
                        ? 'bg-green-600 text-white shadow-md scale-110' 
                        : 'bg-slate-100 text-slate-300 hover:bg-green-100 hover:text-green-600'
                      }`}
                      title="Present"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleMark(student.id, 'Absent')}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all transform active:scale-95 ${
                        student.status === 'Absent' 
                        ? 'bg-red-600 text-white shadow-md scale-110' 
                        : 'bg-slate-100 text-slate-300 hover:bg-red-100 hover:text-red-600'
                      }`}
                      title="Absent"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayedStudents.length === 0 && (
           <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase">No students found.</div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
