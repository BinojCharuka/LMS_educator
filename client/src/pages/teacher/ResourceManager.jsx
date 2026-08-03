import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

const CATEGORIES = ['Note', 'Paper', 'Past Paper', 'Other'];

export default function ResourceManager() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Note');
  const [file, setFile] = useState(null);
  
  // Progress state
  const [progress, setProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  
  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [undoTarget, setUndoTarget] = useState(null);
  const [undoSeconds, setUndoSeconds] = useState(10);
  
  const fileInputRef = useRef(null);

  const fetchResources = async () => {
    setFetchLoading(true);
    try {
      const { data } = await api.get('/resources');
      setResources(data.resources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Countdown timer for undo target
  useEffect(() => {
    let interval;
    if (undoTarget && undoSeconds > 0) {
      interval = setInterval(() => {
        setUndoSeconds(prev => prev - 1);
      }, 1000);
    } else if (undoSeconds === 0 && undoTarget) {
      // Time is up, actual UI cleanup is handled by the timeout in handleConfirmDelete
      setUndoTarget(null);
    }
    return () => clearInterval(interval);
  }, [undoTarget, undoSeconds]);

  const handleFile = (fileObj) => {
    if (fileObj && fileObj.type === 'application/pdf') {
      setFile(fileObj);
    } else if (fileObj) {
      setMsg({ type: 'error', text: 'Please select a valid PDF file.' });
    }
  };

  const onFileChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !category || !file) {
      return setMsg({ type: 'error', text: 'All fields are required.' });
    }
    setLoading(true); setMsg({ type: '', text: '' });
    setProgress(0); setUploadSpeed(''); setTimeLeft('');
    
    let startTime = Date.now();
    
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('category', category);
      fd.append('file', file);

      await api.post('/resources', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentCompleted = Math.round((loaded * 100) / total);
          setProgress(percentCompleted);
          
          const timeElapsed = (Date.now() - startTime) / 1000;
          if (timeElapsed > 0.5) {
            const speed = loaded / timeElapsed;
            
            let formattedSpeed = '';
            if (speed > 1024 * 1024) formattedSpeed = (speed / (1024 * 1024)).toFixed(1) + ' MB/s';
            else if (speed > 1024) formattedSpeed = (speed / 1024).toFixed(0) + ' KB/s';
            else formattedSpeed = speed.toFixed(0) + ' B/s';
            
            setUploadSpeed(formattedSpeed);
            
            const remainingBytes = total - loaded;
            const secondsLeft = remainingBytes / speed;
            if (secondsLeft === Infinity || isNaN(secondsLeft)) {
              setTimeLeft('...');
            } else if (secondsLeft > 60) {
              setTimeLeft(Math.round(secondsLeft / 60) + 'm left');
            } else {
              setTimeLeft(Math.round(secondsLeft) + 's left');
            }
          }
        }
      });
      setMsg({ type: 'success', text: 'Resource uploaded successfully.' });
      setTitle(''); setFile(null); if (fileInputRef.current) fileInputRef.current.value = '';
      fetchResources();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const confirmDelete = (id, title) => {
    setDeleteTarget({ id, title });
  };

  const handleConfirmDelete = () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    setUndoSeconds(10);
    
    // Optimistic UI hide
    setResources(prev => prev.filter(r => r._id !== target.id));
    
    const timeoutId = setTimeout(async () => {
      try {
        await api.delete(`/resources/${target.id}`);
        setUndoTarget(null);
      } catch (err) {
        console.error(err);
        fetchResources(); // Restore if error
      }
    }, 10000);
    
    setUndoTarget({ ...target, timeoutId });
  };

  const handleUndo = () => {
    if (undoTarget && undoTarget.timeoutId) {
      clearTimeout(undoTarget.timeoutId);
      setUndoTarget(null);
      setMsg({ type: 'success', text: 'Deletion was undone successfully.' });
      fetchResources();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl relative">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Resource Manager</h1>
          <p className="text-slate-500 mt-1">Upload free study materials like past papers and notes for students.</p>
        </div>

        {msg.text && (
          <div className={`p-4 rounded-xl text-sm border font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {msg.text}
          </div>
        )}

        <div className="glass p-6 md:p-8">
          <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Upload New Resource</h2>
          <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-6">
            
            {/* Left side: Details */}
            <div className="space-y-5">
              <div>
                <label className="label">Resource Title</label>
                <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 2024 Final Past Paper" required />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)} required>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Right side: File Upload */}
            <div>
              <label className="label mb-2">PDF Document</label>
              
              {!file ? (
                <div 
                  className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-primary-400 transition-all rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer h-[178px]"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <p className="font-medium text-slate-700 mb-1">Click or drag file to upload</p>
                  <p className="text-xs text-slate-500">PDF documents only (max 10MB)</p>
                </div>
              ) : (
                <div className="border border-slate-200 bg-white rounded-2xl p-5 h-[178px] flex flex-col justify-center">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate" title={file.name}>{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatSize(file.size)}</p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="mt-5">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-primary-600">{progress}% Uploading...</span>
                        <span className="text-slate-500">{uploadSpeed} &bull; {timeLeft}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-5">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs py-1.5 flex-1 justify-center rounded-lg">
                        Replace
                      </button>
                      <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="btn-danger text-xs py-1.5 flex-1 justify-center rounded-lg">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
              <input type="file" accept="application/pdf" className="hidden" onChange={onFileChange} ref={fileInputRef} />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">
              <button type="submit" className="btn-primary w-full justify-center py-3.5 shadow-primary-600/25" disabled={loading || !file}>
                {loading ? 'Uploading Resource...' : 'Upload Resource to Library'}
              </button>
            </div>
          </form>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Uploaded Resources</h2>
          {fetchLoading ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl border-dashed">
              <p className="text-slate-500">No resources uploaded yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resources.map(r => (
                <div key={r._id} className="glass-card flex flex-col justify-between group h-full">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{r.category}</span>
                      <span className="text-xs font-medium text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                      </div>
                      <h3 className="font-semibold text-slate-900 line-clamp-2 leading-tight" title={r.title}>{r.title}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex-1 justify-center py-1.5 rounded-lg border-slate-200">View</a>
                    <button onClick={() => confirmDelete(r._id, r.title)} className="btn-danger text-xs flex-1 justify-center py-1.5 rounded-lg border-red-100 text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">Delete Resource?</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Are you sure you want to delete <span className="font-semibold text-slate-700">"{deleteTarget.title}"</span>? This will remove it from the library for all students.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 justify-center py-2.5 shadow-none border-slate-200">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="btn-primary bg-red-600 hover:bg-red-700 shadow-red-600/20 flex-1 justify-center py-2.5">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Toast */}
      {undoTarget && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Resource deleted</span>
            <span className="text-xs text-slate-400">Permanently deleting in {undoSeconds}s...</span>
          </div>
          <button 
            onClick={handleUndo} 
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors text-white border border-white/5"
          >
            Undo
          </button>
        </div>
      )}

    </DashboardLayout>
  );
}
