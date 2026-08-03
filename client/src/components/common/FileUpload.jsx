import { useState, useEffect } from 'react';

export default function FileUpload({ 
  file, 
  onChange, 
  accept = "*", 
  label = "Upload File",
  progress = 0,
  speed = "",
  timeLeft = "",
  isUploading = false
}) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
  };

  // Helper to format bytes
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  // Helper to get extension
  const getExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toUpperCase();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      
      {!file && !isUploading && (
        <div 
          className={`relative overflow-hidden border-2 border-dashed rounded-xl transition-all p-6 text-center
            ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-primary-400'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            accept={accept} 
            onChange={handleChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl mb-2">
              ☁️
            </div>
            <p className="text-slate-600 font-bold text-sm">Drag & drop your file here</p>
            <p className="text-slate-400 text-xs font-medium">or click to browse</p>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="bg-white border border-indigo-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center animate-pulse">
                ⏳
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 line-clamp-1">{file?.name || 'Uploading...'}</p>
                <p className="text-xs font-medium text-slate-500">Uploading...</p>
              </div>
            </div>
            <span className="text-indigo-600 font-bold text-sm">{progress}%</span>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-1.5">
              <span>🚀</span> Speed: {speed || 'Calculating...'}
            </div>
            <div className="flex items-center gap-1.5">
              <span>⏱️</span> Time left: {timeLeft || 'Calculating...'}
            </div>
          </div>
        </div>
      )}

      {file && !isUploading && (
        <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm group">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 overflow-hidden">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 text-lg font-bold">
                {getExtension(file.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 line-clamp-1 mb-1" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">{formatBytes(file.size)}</span>
                  <span className="text-emerald-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Ready
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0">
              <div className="relative">
                <input 
                  type="file" 
                  accept={accept} 
                  onChange={handleChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button type="button" className="w-full px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors border border-indigo-100 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Replace
                </button>
              </div>
              <button 
                type="button"
                onClick={handleRemove}
                className="w-full px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors border border-red-100 flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
