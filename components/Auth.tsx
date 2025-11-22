
import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Lock, Shield, Ban, Home } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  blockedUsers: string[]; // IDs of blocked users
}

const Auth: React.FC<AuthProps> = ({ onLogin, blockedUsers }) => {
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (blockedUsers.includes(regNo)) {
       setError("Your account has been temporarily blocked due to disciplinary action. Contact Admin.");
       return;
    }

    if (regNo && password) {
      setIsLoading(true);
      
      // Simulate DB fetch delay
      setTimeout(() => {
        const lowerReg = regNo.toLowerCase();
        let userRole = 'student';
        let userName = 'Hostel Resident';
        let roomId = 'A-101';
        let registerNumber = regNo;
        let workCat = '';

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
          workCat = 'Electrical';
        } else if (lowerReg === 'admin' && password === 'root') {
          userRole = 'admin';
          userName = 'SYSTEM ADMINISTRATOR';
          roomId = 'SERVER ROOM';
          registerNumber = 'ADMIN';
        } else if (password === '1234') {
          // Default Student
          userRole = 'student';
          userName = 'Arjun Reddy';
          roomId = '302-A';
          registerNumber = regNo; 
        } else {
            setError("Invalid Credentials");
            setIsLoading(false);
            return;
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
          workCategory: workCat,
          currentStatus: 'Free',
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
            <div className="bg-blue-600 p-3 rounded-full mb-4 shadow-lg shadow-blue-600/30 relative">
              <Shield className="text-white w-8 h-8" />
              <div className="absolute inset-0 flex items-center justify-center">
                  <Home className="text-blue-600 w-4 h-4 mt-1" fill="currentColor"/>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-wider uppercase text-center">Krishna Hostel</h1>
            <p className="mt-2 text-xs font-bold uppercase text-slate-500 tracking-widest">SIMATS Management Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded text-xs font-bold flex items-center gap-2">
                 <Ban size={14}/> {error}
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="text"
                required
                className="w-full bg-white text-slate-900 px-10 py-3.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-400 font-bold text-sm"
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
                className="w-full bg-white text-slate-900 px-10 py-3.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-400 text-sm font-bold"
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
