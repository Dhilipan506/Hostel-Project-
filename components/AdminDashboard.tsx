
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User, Complaint, LeaveRequest } from '../types';
import { Users, ClipboardList, CheckCircle2, AlertTriangle, Briefcase, Shield, UserCheck, Clock, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  complaints: Complaint[];
  leaveRequests: LeaveRequest[];
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  slate: '#64748b',
  purple: '#8b5cf6'
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, complaints, leaveRequests }) => {
  
  // --- DATA PROCESSING ---

  // 1. Worker Performance Data
  const workers = users.filter(u => u.role === 'worker');
  const workerPerformance = workers.map(w => {
    const tasks = complaints.filter(c => c.assignedWorker?.includes(w.name));
    const completed = tasks.filter(c => c.status === 'Completed').length;
    return {
      name: w.name,
      assigned: tasks.length,
      completed: completed,
      efficiency: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 100,
      status: w.currentStatus || 'Free'
    };
  });

  // 2. Student Behavior (Mocked Logic)
  const students = users.filter(u => u.role === 'student');
  const studentStats = students.slice(0, 5).map(s => ({
    name: s.name,
    room: s.roomNumber,
    complaintsRaised: complaints.filter(c => c.studentId === s.registerNumber).length,
    lateEntries: Math.floor(Math.random() * 3), // Mock data
    flags: Math.floor(Math.random() * 2) // Mock disciplinary flags
  }));

  // 3. Warden Stats (Mocked as we usually have 1 logged in warden)
  const wardenStats = [
    { name: 'Mr. Sharma', shift: 'Morning', resolved: 15, leavesProcessed: 8 },
    { name: 'Mrs. Verma', shift: 'Evening', resolved: 12, leavesProcessed: 5 },
    { name: 'Mr. Khan', shift: 'Night', resolved: 8, leavesProcessed: 2 },
  ];

  // 4. Attendance Data (Mocked for Visualization)
  const studentAttendance = [
    { name: 'Present', value: 85 },
    { name: 'Absent', value: 10 },
    { name: 'Leave', value: 5 },
  ];
  
  const workerAttendance = [
    { name: 'Present', value: 92 },
    { name: 'Absent', value: 4 },
    { name: 'Leave', value: 4 },
  ];

  return (
    <div className="space-y-8">
      
      {/* TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group">
          <div className="absolute right-2 top-2 opacity-10 group-hover:scale-110 transition-transform"><Users size={60}/></div>
          <h3 className="text-xs font-bold uppercase text-slate-400">Total Population</h3>
          <p className="text-3xl font-extrabold mt-1">{users.length}</p>
          <p className="text-[10px] text-slate-400 mt-2 flex items-center"><TrendingUp size={10} className="mr-1 text-green-400"/> +12 this month</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-xs font-bold uppercase text-slate-500">Overall Attendance</h3>
           <div className="flex items-end gap-2 mt-1">
             <p className="text-3xl font-extrabold text-slate-800">88%</p>
             <p className="text-[10px] font-bold text-green-600 mb-1 bg-green-50 px-1.5 py-0.5 rounded">Good</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-xs font-bold uppercase text-slate-500">Active Issues</h3>
           <p className="text-3xl font-extrabold text-blue-600 mt-1">{complaints.filter(c => c.status !== 'Completed').length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-xs font-bold uppercase text-slate-500">Pending Leaves</h3>
           <p className="text-3xl font-extrabold text-orange-500 mt-1">{leaveRequests.filter(r => r.status === 'Pending').length}</p>
        </div>
      </div>

      {/* ROW 1: WORKER & WARDEN REPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Worker Behavior & Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase text-slate-800 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600"/> Worker Behavior & Performance
              </h3>
              <p className="text-xs text-slate-400">Tasks Assigned vs Completed</p>
            </div>
          </div>
          
          <div className="h-48 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerPerformance} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}}/>
                <Bar dataKey="assigned" name="Assigned" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill={COLORS.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Worker Status List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
                <tr>
                  <th className="p-3">Worker Name</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Efficiency</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {workerPerformance.map((w, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold text-slate-700">{w.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        w.status === 'Free' ? 'bg-green-100 text-green-700' : 
                        w.status === 'Busy' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-blue-600">{w.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warden Report & Attendance */}
        <div className="space-y-6">
           {/* Attendance Report */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold uppercase text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-purple-600"/> Attendance Report
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="text-center">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Students</h4>
                    <div className="h-32 relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={studentAttendance} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                               <Cell fill={COLORS.success} />
                               <Cell fill={COLORS.danger} />
                               <Cell fill={COLORS.warning} />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-slate-700">
                         85%
                       </div>
                    </div>
                 </div>
                 <div className="text-center">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Workers</h4>
                    <div className="h-32 relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={workerAttendance} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                               <Cell fill={COLORS.success} />
                               <Cell fill={COLORS.danger} />
                               <Cell fill={COLORS.warning} />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-slate-700">
                         92%
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Warden Performance */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold uppercase text-slate-800 mb-4 flex items-center gap-2">
                <Shield size={18} className="text-slate-600"/> Warden Report
              </h3>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Shift</th>
                    <th className="p-3 text-center">Resolved</th>
                    <th className="p-3 text-center">Leaves</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {wardenStats.map((w, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-slate-700">{w.name}</td>
                      <td className="p-3 text-slate-500">{w.shift}</td>
                      <td className="p-3 text-center font-bold text-green-600">{w.resolved}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{w.leavesProcessed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* ROW 2: STUDENT BEHAVIOR */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h3 className="text-sm font-bold uppercase text-slate-800 mb-6 flex items-center gap-2">
            <UserCheck size={18} className="text-orange-600"/> Student Behavior Analysis
         </h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Room</th>
                  <th className="p-3 text-center">Complaints Raised</th>
                  <th className="p-3 text-center">Late Entries</th>
                  <th className="p-3 text-center">Disciplinary Flags</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {studentStats.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-700">{s.name}</td>
                    <td className="p-3 text-slate-500">{s.room}</td>
                    <td className="p-3 text-center">{s.complaintsRaised}</td>
                    <td className="p-3 text-center text-orange-600 font-bold">{s.lateEntries}</td>
                    <td className="p-3 text-center text-red-600 font-bold">{s.flags}</td>
                    <td className="p-3 text-center">
                       {s.flags > 1 ? (
                         <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                           <AlertTriangle size={10} /> Critical
                         </span>
                       ) : (
                         <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                           <CheckCircle2 size={10} /> Good
                         </span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
