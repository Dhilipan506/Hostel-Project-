
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Complaint, ComplaintStatus, UserRole } from '../types';
import { ShieldAlert, BarChart3, Wrench, UserCheck, Users } from 'lucide-react';

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
  slate: '#64748b',
  teal: '#14b8a6',
  orange: '#f97316',
  indigo: '#6366f1'
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ complaints, userRole }) => {
  const total = complaints.length;
  const completed = complaints.filter(c => c.status === ComplaintStatus.COMPLETED).length;
  const pending = complaints.filter(c => c.status !== ComplaintStatus.COMPLETED && c.status !== ComplaintStatus.REJECTED).length;
  
  // STUDENT DASHBOARD
  if (userRole === 'student') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold uppercase text-slate-400">Total Complaints</h3>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-b-4 border-green-500">
          <h3 className="text-xs font-bold uppercase text-slate-400">Resolved</h3>
          <p className="text-2xl font-extrabold text-green-600 mt-1">{completed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-b-4 border-orange-500">
          <h3 className="text-xs font-bold uppercase text-slate-400">In Progress</h3>
          <p className="text-2xl font-extrabold text-orange-600 mt-1">{pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-xs font-bold uppercase text-slate-400">Avg Resolution</h3>
           <p className="text-2xl font-extrabold text-blue-600 mt-1">2 Days</p>
        </div>
      </div>
    );
  }

  // WORKER / WARDEN / ADMIN SHARED DATA
  // Mock performance data generation based on complaints
  const workerStats = [
    { name: 'Ramesh', assigned: 0, completed: 0 },
    { name: 'Suresh', assigned: 0, completed: 0 },
    { name: 'Mukesh', assigned: 0, completed: 0 },
  ];

  complaints.forEach(c => {
    if (c.assignedWorker) {
      const workerName = c.assignedWorker.split(' ')[0];
      const stat = workerStats.find(s => s.name === workerName);
      if (stat) {
        stat.assigned++;
        if (c.status === ComplaintStatus.COMPLETED) stat.completed++;
      }
    }
  });

  // Fallback mock data if empty for visualization
  const chartData = workerStats.some(s => s.assigned > 0) ? workerStats : [
    { name: 'Ramesh', assigned: 12, completed: 10 },
    { name: 'Suresh', assigned: 8, completed: 5 },
    { name: 'Mukesh', assigned: 15, completed: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* ADMIN SPECIFIC - GOD MODE STATS */}
      {userRole === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold uppercase text-slate-400">Total System Users</h3>
                <Users size={16} className="text-blue-400"/>
              </div>
              <p className="text-3xl font-extrabold">1,240</p>
              <p className="text-[10px] text-slate-400 mt-1">Students, Workers & Wardens</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-400">Pending Approvals</h3>
              <p className="text-3xl font-extrabold text-orange-600">12</p>
              <p className="text-[10px] text-slate-400 mt-1">Leave & User Requests</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-400">Active Issues</h3>
              <p className="text-3xl font-extrabold text-blue-600">{pending}</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-400">System Health</h3>
              <p className="text-3xl font-extrabold text-green-600">98%</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WORKER PERFORMANCE GRAPH - VISIBLE TO WARDEN & ADMIN */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase text-slate-800">Worker Performance</h3>
              <p className="text-xs text-slate-400">Tasks Assigned vs Completed</p>
            </div>
            <BarChart3 className="text-blue-500" size={20} />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold'}} />
                <Bar dataKey="assigned" name="Assigned" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill={COLORS.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-sm font-bold uppercase text-slate-800 mb-6">Issue Categories</h3>
           <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Electrical', value: 35 },
                      { name: 'Plumbing', value: 25 },
                      { name: 'Furniture', value: 15 },
                      { name: 'Cleaning', value: 10 },
                      { name: 'Other', value: 15 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.values(COLORS).map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}}/>
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
