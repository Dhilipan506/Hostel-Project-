
import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Lock, Shield, PenTool, BookOpen } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regNo && password) {
      setIsLoading(true);
      
      // Simulate DB fetch delay
      setTimeout(() => {
        const lowerReg = regNo.toLowerCase();
        let userRole = 'student';
        let userName = 'Hostel Resident';
        let roomId = 'A-101';
        let registerNumber = regNo;

        // Role Detection Logic (Mock)
        if (lowerReg === 'warden' && password === 'admin') {
          userRole = 'warden';
          userName = 'Mr. Sharma (Chief Warden)';
          roomId = 'WARDEN OFFICE';
          registerNumber = 'WARDEN-01';
        } else if (lowerReg === 'worker' && password === 'work') {
          userRole = 'worker';
          userName = 'Ramesh (Electrician)'; 
          roomId = 'MAINTENANCE';
          registerNumber = 'WORKER-01';
        } else if (lowerReg === 'admin' && password === 'root') {
          userRole = 'admin';
          userName = 'SYSTEM ADMINISTRATOR';
          roomId = 'SERVER ROOM';
          registerNumber = 'ADMIN';
        } else {
          // Default Student - ensure 9 digits if numeric, else generic
          userRole = 'student';
          userName = 'Arjun Reddy';
          roomId = '302-A';
          registerNumber = '123456789'; // 9 Digit Format
        }

        onLogin({
          registerNumber: registerNumber,
          name: userName,
          role: userRole as any,
          roomNumber: roomId,
          phoneNumber: '9876543210',
          address: '123 Main St, City',
          details: 'No medical history',
          profileImage: '',
          bloodGroup: 'O+',
          dob: '2000-01-01',
          fatherName: userRole === 'student' ? 'Rajesh Reddy' : undefined,
          hostelValidUpto: '2025-12-31',
          password: password 
        });
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center relative font-sans"
      style={{
        backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Saveetha_Engineering_College_Circular_Block.jpg/1280px-Saveetha_Engineering_College_Circular_Block.jpg')`
      }}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[3px]"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full border border-slate-200">
          
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full mb-4 shadow-lg shadow-blue-600/30">
              <Shield className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-wider uppercase text-center">Krishna Hostel</h1>
            <p className="mt-2 text-xs font-bold uppercase text-slate-500 tracking-widest">SIMATS Management Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="text"
                required
                className="w-full bg-slate-50 text-slate-900 px-10 py-3.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-400 font-bold text-sm"
                placeholder="Username / ID"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
              />
            </div>

            <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="password"
                required
                className="w-full bg-slate-50 text-slate-900 px-10 py-3.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-400 text-sm font-bold"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.01] active:scale-95 uppercase text-xs tracking-widest disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Verifying...' : 'Secure Login'}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { title: 'Student', u: 'student', p: '1234', icon: BookOpen, color: 'text-blue-600' },
                { title: 'Warden', u: 'warden', p: 'admin', icon: Shield, color: 'text-purple-600' },
                { title: 'Worker', u: 'worker', p: 'work', icon: PenTool, color: 'text-orange-600' },
                { title: 'Admin', u: 'admin', p: 'root', icon: Lock, color: 'text-slate-600' }
              ].map((cred) => (
                <div key={cred.title} className="p-2 bg-slate-50 border border-slate-100 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-colors group"
                     onClick={() => { setRegNo(cred.u); setPassword(cred.p); }}>
                  <div className="flex items-center gap-2 mb-1">
                    <cred.icon size={14} className={cred.color} />
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase group-hover:text-blue-600">
                      {cred.title} Login
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </form>
        </div>
      </div>

      <div className="absolute bottom-6 w-full text-center z-10">
        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
          Krishna Hostel • Management System v2.0
        </p>
      </div>

    </div>
  );
};

export default Auth;