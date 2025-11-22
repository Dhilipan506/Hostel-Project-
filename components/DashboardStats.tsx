
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, RadialBarChart, RadialBar } from 'recharts';
import { Complaint, ComplaintStatus, UserRole, User, WorkerAvailability } from '../types';
import { Users, CheckCircle2, Clock, AlertTriangle, Briefcase, Shield, Activity, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  complaints: Complaint[];
  userRole: UserRole;
  currentUser?: User;
  onStatusChange?: (newStatus: WorkerAvailability) => void;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  slate: '#64748b',
  teal: '#14b8a6',
  orange: '#f97316',
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ complaints, userRole, currentUser, onStatusChange }) => {
  const total = complaints.length;
  
  // --- STUDENT DASHBOARD ---
  if (userRole === 'student') {
    const studentComplaints = complaints.filter(c => c.studentId === currentUser?.registerNumber);
    const studentTotal = studentComplaints.length;
    const studentCompleted = studentComplaints.filter(c => c.status === ComplaintStatus.COMPLETED).length;
    const studentOngoing = studentComplaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS || c.status === ComplaintStatus.ASSIGNED).length;
    const studentPending = studentComplaints.filter(c => c.status === ComplaintStatus.SUBMITTED).length;
    const studentRejected = studentComplaints.filter(c => c.status === ComplaintStatus.REJECTED).length;

    const expenseData = [
        { month: 'Jan', amount: 200 }, { month: 'Feb', amount: 150 }, { month: 'Mar', amount: 300 }, { month: 'Apr', amount: 250 }
    ];

    const reputationValue = 85;
    const gaugeData = [{ name: 'Reputation', value: reputationValue, fill: '#3b82f6' }];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400">Total Raised</h3>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{studentTotal}</p>
                </div>
                <Activity className="text-blue-200" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 border-b-4 border-green-500">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400">Completed</h3>
                    <p className="text-2xl font-extrabold text-green-600 mt-1">{studentCompleted}</p>
                </div>
                <CheckCircle2 className="text-green-200" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 border-b-4 border-orange-500">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400">On Going</h3>
                    <p className="text-2xl font-extrabold text-orange-600 mt-1">{studentOngoing}</p>
                </div>
                <Clock className="text-orange-200" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400">Pending / Rejected</h3>
                    <p className="text-2xl font-extrabold text-slate-600 mt-1">{studentPending + studentRejected}</p>
                </div>
                <AlertTriangle className="text-slate-200" size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Speedometer */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold uppercase text-slate-800 mb-2">Hostel Reputation Score</h3>
              <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="70%" innerRadius="70%" outerRadius="100%" barSize={20} data={gaugeData} startAngle={180} endAngle={0}>
                          <RadialBar background dataKey="value" cornerRadius={10}/>
                      </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-3xl font-extrabold text-blue-600">
                      {reputationValue}%
                  </div>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Good Standing</p>
           </div>

           {/* Line Graph */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50 col-span-2">
              <h3 className="text-sm font-bold uppercase text-slate-800 mb-4">Monthly Activity</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={expenseData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:10}}/>
                     <Tooltip />
                     <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{r:5}}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- WORKER DASHBOARD ---
  if (userRole === 'worker') {
    const workerComplaints = complaints.filter(c => c.assignedWorkerId === currentUser?.registerNumber);
    const workerAssigned = workerComplaints.length;
    const workerCompleted = workerComplaints.filter(c => c.status === ComplaintStatus.COMPLETED).length;
    const workerPending = workerComplaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS || c.status === ComplaintStatus.ASSIGNED).length;
    const completionRate = workerAssigned > 0 ? Math.round((workerCompleted / workerAssigned) * 100) : 0;

    const weeklyPerformance = [
        { day: 'Mon', tasks: 2 }, { day: 'Tue', tasks: 4 }, { day: 'Wed', tasks: 3 },
        { day: 'Thu', tasks: 5 }, { day: 'Fri', tasks: 3 }, { day: 'Sat', tasks: 6 }, { day: 'Sun', tasks: 2 },
    ];
    const jobTypes = [{ name: 'Repair', value: 60 }, { name: 'Replace', value: 30 }, { name: 'Checkup', value: 10 }];
    const gaugeData = [{ name: 'Completion', value: completionRate, fill: '#f97316' }];

    return (
      <div className="space-y-6">
         {/* Status Bar */}
         <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100 flex flex-col md:flex-row items-center justify-between">
           <div>
             <h2 className="text-lg font-extrabold uppercase text-slate-800">My Status</h2>
             <p className="text-xs text-slate-500">Current Availability Status</p>
           </div>
           <div className="flex bg-slate-100 p-1 rounded-lg mt-4 md:mt-0">
              {(['Free', 'Busy', 'Working', 'Unavailable'] as WorkerAvailability[]).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange && onStatusChange(status)}
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${
                    currentUser?.currentStatus === status 
                    ? status === 'Free' ? 'bg-green-500 text-white shadow' 
                    : status === 'Busy' ? 'bg-orange-500 text-white shadow'
                    : status === 'Working' ? 'bg-blue-500 text-white shadow'
                    : 'bg-red-500 text-white shadow'
                    : 'text-slate-500 hover:bg-white'
                  }`}
                >
                  {status}
                </button>
              ))}
           </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-50">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-xs font-bold uppercase text-slate-400">Total Assigned</h3>
                     <p className="text-2xl font-extrabold text-slate-800 mt-1">{workerAssigned}</p>
                  </div>
                  <Briefcase className="text-orange-200" size={24}/>
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-green-50 border-b-4 border-green-500">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-xs font-bold uppercase text-slate-400">Completed</h3>
                     <p className="text-2xl font-extrabold text-green-600 mt-1">{workerCompleted}</p>
                  </div>
                  <CheckCircle2 className="text-green-200" size={24}/>
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-50 border-b-4 border-blue-500">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-xs font-bold uppercase text-slate-400">On Going</h3>
                     <p className="text-2xl font-extrabold text-blue-600 mt-1">{workerPending}</p>
                  </div>
                  <Clock className="text-blue-200" size={24}/>
               </div>
            </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-50">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-xs font-bold uppercase text-slate-400">Efficiency</h3>
                     <p className="text-2xl font-extrabold text-slate-800 mt-1">{completionRate}%</p>
                  </div>
                  <TrendingUp className="text-slate-200" size={24}/>
               </div>
            </div>
         </div>

        {/* Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-50 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold uppercase text-slate-800 mb-2">Task Completion Score</h3>
              <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="70%" innerRadius="70%" outerRadius="100%" barSize={20} data={gaugeData} startAngle={180} endAngle={0}>
                          <RadialBar background dataKey="value" cornerRadius={10}/>
                      </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-3xl font-extrabold text-orange-600">
                      {completionRate}%
                  </div>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">High Performance</p>
           </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-50 col-span-2">
                <h3 className="text-sm font-bold uppercase text-slate-800 mb-4">Weekly Work Load</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyPerformance}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="tasks" stroke="#f97316" strokeWidth={3} dot={{r:4}}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- WARDEN / ADMIN DASHBOARD ---
  const completed = complaints.filter(c => c.status === ComplaintStatus.COMPLETED).length;
  const ongoing = complaints.filter(c => c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.IN_PROGRESS).length;
  const pending = complaints.filter(c => c.status === ComplaintStatus.SUBMITTED).length;
  const critical = complaints.filter(c => c.urgency === 'Critical' && c.status !== ComplaintStatus.COMPLETED).length;
  const resolutionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const gaugeData = [{ name: 'Resolution', value: resolutionRate, fill: '#14b8a6' }];

  const floorStats = [
      { floor: 'G', complaints: 12 }, { floor: '1st', complaints: 25 }, { floor: '2nd', complaints: 18 }, { floor: '3rd', complaints: 8 }
  ];
  
  const workerEfficiency = [
      { name: 'Elec', efficiency: 90 }, { name: 'Plumb', efficiency: 75 }, { name: 'Clean', efficiency: 95 }, { name: 'Wifi', efficiency: 80 }
  ];

  const lineData = [ {name: 'Week 1', v: 10}, {name: 'Week 2', v: 20}, {name: 'Week 3', v: 15}, {name: 'Week 4', v: 30} ];

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 border-b-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                   <h3 className="text-xs font-bold uppercase text-slate-400">Completed</h3>
                   <p className="text-2xl font-extrabold text-green-600 mt-1">{completed}</p>
                </div>
                <CheckCircle2 size={24} className="text-green-200"/>
              </div>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 border-b-4 border-orange-500">
              <div className="flex justify-between items-start">
                <div>
                   <h3 className="text-xs font-bold uppercase text-slate-400">On Going</h3>
                   <p className="text-2xl font-extrabold text-orange-600 mt-1">{ongoing}</p>
                </div>
                <Clock size={24} className="text-orange-200"/>
              </div>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 border-b-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                   <h3 className="text-xs font-bold uppercase text-slate-400">New / Pending</h3>
                   <p className="text-2xl font-extrabold text-blue-600 mt-1">{pending}</p>
                </div>
                <AlertTriangle size={24} className="text-blue-200"/>
              </div>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 border-b-4 border-red-500">
              <div className="flex justify-between items-start">
                <div>
                   <h3 className="text-xs font-bold uppercase text-slate-400">Critical Issues</h3>
                   <p className="text-2xl font-extrabold text-red-600 mt-1">{critical}</p>
                </div>
                <AlertTriangle size={24} className="text-red-200"/>
              </div>
           </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Resolution Speedometer */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold uppercase text-slate-800 mb-2">Overall Resolution Rate</h3>
            <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="70%" innerRadius="70%" outerRadius="100%" barSize={20} data={gaugeData} startAngle={180} endAngle={0}>
                        <RadialBar background dataKey="value" cornerRadius={10}/>
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-3xl font-extrabold text-teal-600">
                    {resolutionRate}%
                </div>
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Target: 90%</p>
         </div>

        {/* Worker Efficiency Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-2">
          <h3 className="text-sm font-bold uppercase text-slate-800 mb-4">Worker Efficiency by Dept</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerEfficiency}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip />
                <Bar dataKey="efficiency" fill={userRole === 'warden' ? COLORS.teal : COLORS.purple} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Floor */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1">
            <h3 className="text-sm font-bold uppercase text-slate-800 mb-4">Issue Hotspots</h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={floorStats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true}/>
                        <XAxis type="number" hide/>
                        <YAxis dataKey="floor" type="category" tick={{fontSize:10}} width={30}/>
                        <Tooltip />
                        <Bar dataKey="complaints" fill={COLORS.warning} radius={[0, 4, 4, 0]} barSize={20}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        
        {/* Weekly Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-2">
            <h3 className="text-sm font-bold uppercase text-slate-800 mb-4">Complaint Volume Trend</h3>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                        <Tooltip />
                        <Line type="natural" dataKey="v" stroke={COLORS.danger} strokeWidth={3} dot={{r:4}}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
