
import React, { useState } from 'react';
import { Loader2, Upload, AlertTriangle, CheckCircle, HelpCircle, X } from 'lucide-react';
import { analyzeComplaint, fileToGenerativePart } from '../services/geminiService';
import { Complaint, ComplaintStatus, Category } from '../types';

interface ComplaintFormProps {
  onComplaintAdded: (complaint: Complaint) => void;
  onCancel: () => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onComplaintAdded, onCancel }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (imageFiles.length + files.length > 3) {
        setError("Maximum 3 photos allowed.");
        return;
      }
      
      const newFiles = [...imageFiles, ...files];
      const newPreviews = [...imagePreviews, ...files.map(f => URL.createObjectURL(f))];
      
      setImageFiles(newFiles);
      setImagePreviews(newPreviews);
      setError(null);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) {
      setError("Please select a problem category.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a description.");
      return;
    }
    if (imageFiles.length === 0) {
      setError("At least one image is mandatory for proof.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Call Gemini with user category hint and MULTIPLE images
      const analysis = await analyzeComplaint(description, imageFiles, category);

      if (!analysis.isSafe) {
        setError(`Submission rejected: ${analysis.rejectionReason || 'Content violation detected.'}`);
        setIsSubmitting(false);
        return;
      }

      // Validating if image matches description
      if (!analysis.matchesDescription) {
        setError("Evidence Mismatch: The uploaded image does not match your description. You must upload valid proof of the specific problem.");
        setIsSubmitting(false);
        return;
      }

      // Process all images to base64 for storage
      const base64Images = await Promise.all(imageFiles.map(async (f) => {
        const part = await fileToGenerativePart(f);
        return `data:${f.type};base64,${part.inlineData.data}`;
      }));

      // Construct Complaint Object
      const newComplaint: Complaint = {
        id: 'TEMP', // Placeholder, will be overwritten by parent with ID logic
        studentId: 'PENDING',
        title: analysis.title,
        description: description,
        cleanDescription: analysis.cleanDescription,
        imageUrl: base64Images[0], // Primary image
        images: base64Images, // All images
        category: analysis.category,
        urgency: analysis.urgency,
        status: ComplaintStatus.SUBMITTED,
        submittedAt: new Date().toISOString(),
      };

      onComplaintAdded(newComplaint);
    } catch (err) {
      console.error(err);
      setError("Failed to process complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-blue-50 flex justify-between items-center">
        <h2 className="text-lg font-bold uppercase text-blue-900">File New Complaint</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 uppercase text-xs font-bold">Cancel</button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start">
            <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
            Problem Category
          </label>
          <div className="relative">
             <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-sm font-bold"
            >
              <option value="" disabled>Select a category...</option>
              <option value={Category.AC}>AC</option>
              <option value={Category.ELECTRICAL}>Electrical</option>
              <option value={Category.FURNITURE}>Furniture</option>
              <option value={Category.CLEANING}>Cleaning</option>
              <option value={Category.WIFI}>Wifi</option>
              <option value={Category.PLUMBING}>Plumbing</option>
              <option value={Category.WATERSUPPLY}>Water Supply</option>
              <option value={Category.OTHER}>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
            Issue Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm bg-white"
            placeholder="Describe the problem clearly..."
          />
          <div className="flex items-center gap-2 mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
            <HelpCircle size={14} />
            <p>AI will strictly verify if your description matches the attached photo.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
            Evidence Images (Max 3)
          </label>
          <div className="flex flex-wrap gap-4 mb-4">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {imageFiles.length < 3 && (
              <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center">
                   <Upload className="w-6 h-6 text-slate-400 mb-1" />
                   <span className="text-[10px] font-bold uppercase text-slate-500">Add Photo</span>
                </div>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold uppercase hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center shadow-lg shadow-blue-200 text-xs tracking-widest"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Validating Proof...
              </>
            ) : (
              <>
                Submit Complaint
                <CheckCircle className="ml-2" size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
