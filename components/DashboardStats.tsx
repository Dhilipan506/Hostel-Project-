
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { Complaint, ComplaintStatus, Urgency, UserRole, Category, WorkerStatus } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  complaints: Complaint[];
  userRole: UserRole;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  slate: '#64748b'
};

// Speedometer/Gauge Component
const GaugeChart: React.FC<{ value: number, total: number, color: string, label: string }> = ({ value, total, color, label }) => {
  const data = [
    { name: 'Value', value: value },
    { name: 'Empty', value: total === 0 ? 1 : total - value },
  ];
  
  // Avoid divide by zero visual
  const displayData = total === 0 ? [{name: 'Empty', value: 1}] : data;
  const displayColor = total === 0 ? '#e2e8f0' : color;

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={displayColor} />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Value Centered */}
        <div className="absolute top-[55%] left-0 right-0 text-center">
          <span className="text-2xl font-extrabold text-slate-800">{value}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase text-slate-500 mt-[-20px]">{label}</span>
    </div>
  );
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ complaints, userRole }) => {
  const total = complaints.length;
  const completed = complaints.filter(c => c.status === ComplaintStatus.COMPLETED).length;
  const pending = complaints.filter(c => c.status !== ComplaintStatus.COMPLETED && c.status !== ComplaintStatus.REJECTED).length;
  const rejected = complaints.filter(c => c.status === ComplaintStatus.REJECTED).length;

  // STUDENT DASHBOARD SPECIFIC
  if (userRole === 'student') {
    // Prepare data for line chart (Monthly Work Completed)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = new Array(12).fill(0).map((_, i) => ({ name: monthNames[i], completed: 0 }));
    
    complaints.forEach(c => {
      if (c.status === ComplaintStatus.COMPLETED && c.submittedAt) {
        const d = new Date(c.submittedAt);
        monthlyData[d.getMonth()].completed += 1;
      }
    });

    const currentMonth = new Date().getMonth();
    const visibleMonthlyData = monthlyData.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

    return (
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <GaugeChart value={total} total={total} color={COLORS.primary} label="Total Raised" />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <GaugeChart value={completed} total={total} color={COLORS.success} label="Resolved" />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <GaugeChart value={pending} total={total} color={COLORS.warning} label="In Progress" />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <GaugeChart value={rejected} total={total} color={COLORS.danger} label="Rejected" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold uppercase text-slate-700 mb-4 flex items-center">
             <Activity size={16} className="mr-2 text-blue-500" />
             Monthly Work Completed
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visibleMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  labelStyle={{fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px', color: '#64748b'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke={COLORS.success} 
                  strokeWidth={3} 
                  dot={{r: 4, strokeWidth: 2, fill: 'white'}} 
                  activeDot={{r: 6}} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // WARDEN/ADMIN DASHBOARD
  if (userRole === 'warden' || userRole === 'admin') {
    const categoryData = Object.values(Category).map(cat => ({
      name: cat,
      value: complaints.filter(c => c.category === cat).length
    })).filter(d => d.value > 0);

    const urgencyData = Object.values(Urgency).map(urg => ({
      name: urg,
      count: complaints.filter(c => c.urgency === urg && c.status !== ComplaintStatus.COMPLETED).length
    }));

    // Mock Data for Area Chart - Complaint Volume Trends
    const trendData = [
      { name: 'Mon', volume: 4 },
      { name: 'Tue', volume: 7 },
      { name: 'Wed', volume: 3 },
      { name: 'Thu', volume: 8 },
      { name: 'Fri', volume: 12 },
      { name: 'Sat', volume: 6 },
      { name: 'Sun', volume: 2 },
    ];

    return (
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col">
             <span className="text-xs font-bold uppercase text-slate-400 mb-2">Total Complaints</span>
             <span className="text-3xl font-extrabold text-slate-800">{total}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col border-l-4 border-orange-400">
             <span className="text-xs font-bold uppercase text-slate-400 mb-2">Active / Pending</span>
             <span className="text-3xl font-extrabold text-orange-500">{pending}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col border-l-4 border-green-400">
             <span className="text-xs font-bold uppercase text-slate-400 mb-2">Resolved</span>
             <span className="text-3xl font-extrabold text-green-600">{completed}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col border-l-4 border-red-400">
             <span className="text-xs font-bold uppercase text-slate-400 mb-2">Critical Open</span>
             <span className="text-3xl font-extrabold text-red-600">
               {complaints.filter(c => c.urgency === Urgency.CRITICAL && c.status !== ComplaintStatus.COMPLETED).length}
             </span>
          </div>
        </div>

        {/* Unique Area Chart for Warden */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold uppercase text-slate-700 mb-4 flex items-center">
            <TrendingUp size={16} className="mr-2 text-indigo-500" />
            Weekly Complaint Volume Trend
          </h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', textTransform: 'uppercase', fontSize: '10px'}} />
                  <Area type="monotone" dataKey="volume" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold uppercase text-slate-700 mb-4">All Complaints by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.danger][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px', textTransform: 'uppercase'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold uppercase text-slate-700 mb-4">Open Issues by Urgency</h3>
             <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={urgencyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === 'worker') {
    // Worker View (Existing)
    const myTasks = complaints; 
    const myPending = myTasks.filter(c => c.status !== ComplaintStatus.COMPLETED).length;
    const myDone = myTasks.filter(c => c.status === ComplaintStatus.COMPLETED).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Assigned Tasks</h4>
            <div className="text-4xl font-bold text-slate-800">{myTasks.length}</div>
          </div>
          <Activity className="text-blue-100 w-12 h-12" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Pending / Active</h4>
            <div className="text-4xl font-bold text-slate-800">{myPending}</div>
          </div>
          <Clock className="text-orange-100 w-12 h-12" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
           <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Completed</h4>
            <div className="text-4xl font-bold text-slate-800">{myDone}</div>
          </div>
          <CheckCircle2 className="text-green-100 w-12 h-12" />
        </div>
      </div>
    );
  }

  return null;
};

export default DashboardStats;
