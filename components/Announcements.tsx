
import React, { useState } from 'react';
import { Announcement, UserRole } from '../types';
import { Megaphone, Plus, Loader2, Send, ThumbsUp, ThumbsDown, AlertTriangle, X, Trash2, MessageCircle } from 'lucide-react';
import { moderateContent } from '../services/geminiService';

interface AnnouncementsProps {
  announcements: Announcement[];
  userRole: UserRole;
  onReact: (id: string, type: 'thumbsUp' | 'thumbsDown', feedback?: string) => void;
  onCreate?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
}

const Announcements: React.FC<AnnouncementsProps> = ({ announcements, userRole, onReact, onCreate, onDelete }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Downvote Moderation State
  const [downvoteModalId, setDownvoteModalId] = useState<string | null>(null);
  const [downvoteReason, setDownvoteReason] = useState('');
  const [isModeratingDownvote, setIsModeratingDownvote] = useState(false);
  const [downvoteError, setDownvoteError] = useState('');

  // View Feedback Modal
  const [viewFeedbackId, setViewFeedbackId] = useState<string | null>(null);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !onCreate) return;

    setIsProcessing(true);
    setError('');

    try {
      // Moderate Content via Gemini
      const moderation = await moderateContent(`${newTitle}\n\n${newContent}`);
      
      if (!moderation.approved) {
        setError(moderation.reason || "Content flagged as inappropriate. Please revise.");
        setIsProcessing(false);
        return;
      }

      const newAnnouncement: Announcement = {
        id: crypto.randomUUID(),
        title: newTitle.toUpperCase(), 
        content: moderation.cleanText, 
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: 'CHIEF WARDEN',
        reactions: { thumbsUp: 0, thumbsDown: 0 },
        userReaction: null,
        feedback: []
      };

      onCreate(newAnnouncement);
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      setError("Failed to post announcement. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleThumbsDownClick = (id: string) => {
    setDownvoteModalId(id);
    setDownvoteReason('');
    setDownvoteError('');
  };

  const submitDownvote = async () => {
    if (!downvoteReason.trim()) {
      setDownvoteError("Please provide a reason.");
      return;
    }
    
    setIsModeratingDownvote(true);
    try {
       const moderation = await moderateContent(downvoteReason);
       if (!moderation.approved) {
         setDownvoteError("Your reason contains inappropriate language. Please revise.");
         setIsModeratingDownvote(false);
         return;
       }
       
       if (downvoteModalId) {
         onReact(downvoteModalId, 'thumbsDown', moderation.cleanText);
         setDownvoteModalId(null);
       }
    } catch (err) {
       setDownvoteError("Verification failed.");
    } finally {
       setIsModeratingDownvote(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Downvote Reason Modal (Student) */}
      {downvoteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold uppercase text-slate-800 text-sm">Why Dislike?</h3>
              <button onClick={() => setDownvoteModalId(null)}><X size={16}/></button>
            </div>
            {downvoteError && <p className="text-red-500 text-xs font-bold mb-2">{downvoteError}</p>}
            <textarea 
               className="w-full border border-slate-200 rounded p-2 text-sm mb-4 bg-white outline-none"
               rows={3}
               placeholder="State your reason clearly..."
               value={downvoteReason}
               onChange={e => setDownvoteReason(e.target.value)}
            />
            <button 
              onClick={submitDownvote}
              disabled={isModeratingDownvote}
              className="w-full bg-slate-900 text-white py-2 rounded text-xs font-bold uppercase flex justify-center items-center"
            >
              {isModeratingDownvote ? <Loader2 className="animate-spin" size={14} /> : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}

      {/* Feedback View Modal (Warden) */}
      {viewFeedbackId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 max-h-[80vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">
               <h3 className="font-bold uppercase text-slate-800 text-sm">Student Feedback</h3>
               <button onClick={() => setViewFeedbackId(null)}><X size={16}/></button>
             </div>
             <div className="space-y-3">
               {announcements.find(a => a.id === viewFeedbackId)?.feedback?.length === 0 ? (
                 <p className="text-sm text-slate-500 italic">No written feedback provided yet.</p>
               ) : (
                 announcements.find(a => a.id === viewFeedbackId)?.feedback?.map((fb, idx) => (
                   <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-100">
                     <div className="flex justify-between items-center mb-1 border-b border-slate-200 pb-1">
                       <span className="text-[10px] font-bold uppercase text-slate-800">{fb.userName}</span>
                       <span className="text-[9px] font-mono text-slate-400">{fb.userId}</span>
                     </div>
                     <p className="text-xs text-slate-700 mt-1">"{fb.reason}"</p>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      )}

      {/* Warden Create Box */}
      {(userRole === 'warden' || userRole === 'admin') && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 mb-8">
          {!isCreating ? (
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full py-6 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wide">Create New Announcement</span>
            </button>
          ) : (
            <form onSubmit={handlePost} className="animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold uppercase text-blue-900">New Announcement</h3>
                 <button type="button" onClick={() => setIsCreating(false)} className="text-xs font-bold uppercase text-slate-400 hover:text-slate-600">Cancel</button>
               </div>
               
               {error && (
                 <div className="bg-red-50 text-red-600 text-xs p-3 rounded mb-3 font-bold uppercase flex items-center">
                   <AlertTriangle size={14} className="mr-2" />
                   {error}
                 </div>
               )}

               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Title</label>
                   <input 
                     type="text" 
                     value={newTitle}
                     onChange={e => setNewTitle(e.target.value)}
                     className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm bg-white"
                     placeholder="E.g., URGENT: WATER SUPPLY MAINTENANCE"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Message (Auto-Moderated)</label>
                   <textarea 
                     value={newContent}
                     onChange={e => setNewContent(e.target.value)}
                     className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none text-sm bg-white"
                     placeholder="Type your message here..."
                     required
                   />
                 </div>
                 <div className="flex justify-end">
                   <button 
                     type="submit" 
                     disabled={isProcessing}
                     className="bg-blue-900 text-white px-6 py-2.5 rounded-lg font-bold uppercase text-xs hover:bg-blue-800 flex items-center disabled:opacity-70 transition-all shadow-lg shadow-blue-200"
                   >
                     {isProcessing ? <Loader2 className="animate-spin mr-2" size={14} /> : <Send className="mr-2" size={14} />}
                     {isProcessing ? 'Processing...' : 'Post Now'}
                   </button>
                 </div>
               </div>
            </form>
          )}
        </div>
      )}

      {announcements.map((item) => (
        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <Megaphone size={20} />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.author}</span>
                <span className="text-xs font-bold text-slate-800 uppercase">{item.date}</span>
              </div>
            </div>
            {(userRole === 'warden' || userRole === 'admin') && onDelete && (
               <button 
                onClick={() => onDelete(item.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
               >
                 <Trash2 size={16} />
               </button>
            )}
          </div>
          
          <h3 className="text-lg font-bold uppercase text-slate-900 mb-3">{item.title}</h3>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">{item.content}</p>
          
          <div className="flex justify-between items-center border-t border-slate-50 pt-4">
            <div className="flex gap-2">
              <button 
                onClick={() => onReact(item.id, 'thumbsUp')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                  item.userReaction === 'thumbsUp' 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp size={14} />
                <span>{item.reactions.thumbsUp}</span>
              </button>
              
              <button 
                onClick={() => {
                  if (item.userReaction === 'thumbsDown') {
                     onReact(item.id, 'thumbsDown');
                  } else {
                    handleThumbsDownClick(item.id);
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                  item.userReaction === 'thumbsDown' 
                    ? 'bg-slate-200 border-slate-300 text-slate-700' 
                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ThumbsDown size={14} />
                <span>{item.reactions.thumbsDown}</span>
              </button>
            </div>

            {(userRole === 'warden' || userRole === 'admin') && item.feedback && item.feedback.length > 0 && (
               <button 
                onClick={() => setViewFeedbackId(item.id)}
                className="text-xs font-bold uppercase text-blue-600 hover:underline flex items-center gap-1"
               >
                 <MessageCircle size={14}/> View Feedback
               </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Announcements;
