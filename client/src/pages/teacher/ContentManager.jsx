import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FileUpload from '../../components/common/FileUpload';
import api from '../../api/axios';

const EMPTY = { title: '', type: 'yt-video', url: '', lessonPackId: '', description: '' };

export default function ContentManager() {
  const [materials, setMaterials]   = useState([]);
  const [lessonPacks, setLessonPacks] = useState([]);
  const [form,       setForm]       = useState(EMPTY);
  const [pdfFile,    setPdfFile]    = useState(null);
  const [editing,    setEditing]    = useState(null); // material._id
  const [loading,    setLoading]    = useState(false);
  const [fetchLoad,  setFetchLoad]  = useState(true);
  const [filter,     setFilter]     = useState('');
  const [msg,        setMsg]        = useState({ type: '', text: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  const loadMaterials = async () => {
    setFetchLoad(true);
    const params = filter ? `?lessonPackId=${filter}` : '';
    const { data } = await api.get(`/materials${params}`);
    setMaterials(data.materials || []);
    setFetchLoad(false);
  };

  useEffect(() => { 
    loadMaterials(); 
  }, [filter]);

  useEffect(() => {
    api.get('/lesson-packs').then(res => setLessonPacks(res.data.packs || [])).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      // Check if this is a video upload and attempt Mux upload
      if (form.type === 'video' && pdfFile) {
        let uploadSuccess = false;
        let muxPlaybackUrl = '';
        
        try {
          // 1. Request direct upload URL from backend
          const muxRes = await api.post('/materials/mux-upload-url');
          if (muxRes.data && muxRes.data.uploadUrl) {
            const { uploadUrl, uploadId } = muxRes.data;
            
            // 2. Direct upload to Mux S3 bucket (via signed URL)
            const axiosDirect = await import('axios');
            await axiosDirect.default.put(uploadUrl, pdfFile, {
              headers: { 'Content-Type': pdfFile.type },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setUploadProgress(percentCompleted);
                  
                  if (progressEvent.rate) {
                    const k = 1024;
                    const i = Math.floor(Math.log(progressEvent.rate) / Math.log(k));
                    const speedText = parseFloat((progressEvent.rate / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes/s', 'KB/s', 'MB/s', 'GB/s'][i];
                    setUploadSpeed(speedText);
                  }
                  
                  if (progressEvent.estimated) {
                    const seconds = Math.round(progressEvent.estimated);
                    const timeText = seconds > 60 ? `${Math.floor(seconds/60)}m ${seconds%60}s` : `${seconds}s`;
                    setTimeLeft(timeText);
                  }
                }
              }
            });

            // 3. Poll for transcoding status
            setUploadSpeed('Transcoding video...');
            setTimeLeft('Waiting for Mux...');
            let status = 'waiting';
            let retries = 0;
            while (status !== 'completed' && status !== 'errored' && retries < 25) {
              await new Promise(resolve => setTimeout(resolve, 3000));
              const statusRes = await api.get(`/materials/mux-status/${uploadId}`);
              status = statusRes.data.status;
              if (status === 'completed') {
                muxPlaybackUrl = statusRes.data.playbackUrl;
                uploadSuccess = true;
                break;
              }
              retries++;
            }
            if (status === 'errored' || !uploadSuccess) {
              throw new Error('Mux transcoding failed or timed out.');
            }
          }
        } catch (muxError) {
          console.warn('Mux direct upload failed, falling back to standard backend upload:', muxError);
        }

        if (uploadSuccess && muxPlaybackUrl) {
          const materialData = { ...form, url: muxPlaybackUrl };
          if (editing) await api.put(`/materials/${editing}`, materialData);
          else         await api.post('/materials', materialData);
          
          setMsg({ type: 'success', text: editing ? 'Material updated (Mux Video Ready)!' : 'Material added (Mux Video Ready)!' });
          setForm(EMPTY); setPdfFile(null); setEditing(null);
          loadMaterials();
          return;
        }
      }

      // Standard fallback (PDF uploads, and video uploads when Mux is disabled/unavailable)
      if (['pdf', 'video'].includes(form.type) && pdfFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append('file', pdfFile);

        const config = {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
              
              if (progressEvent.rate) {
                const k = 1024;
                const i = Math.floor(Math.log(progressEvent.rate) / Math.log(k));
                const speedText = parseFloat((progressEvent.rate / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes/s', 'KB/s', 'MB/s', 'GB/s'][i];
                setUploadSpeed(speedText);
              }
              
              if (progressEvent.estimated) {
                const seconds = Math.round(progressEvent.estimated);
                const timeText = seconds > 60 ? `${Math.floor(seconds/60)}m ${seconds%60}s` : `${seconds}s`;
                setTimeLeft(timeText);
              }
            }
          }
        };

        if (editing) await api.put(`/materials/${editing}`, fd, config);
        else         await api.post('/materials', fd, config);
      } else {
        if (editing) await api.put(`/materials/${editing}`, form);
        else         await api.post('/materials', form);
      }
      setMsg({ type: 'success', text: editing ? 'Material updated!' : 'Material added!' });
      setForm(EMPTY); setPdfFile(null); setEditing(null);
      loadMaterials();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save.' });
    } finally { 
      setLoading(false); 
      setUploadProgress(0);
      setUploadSpeed('');
      setTimeLeft('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return;
    try {
      await api.delete(`/materials/${id}`);
      setMaterials(prev => prev.filter(m => m._id !== id));
    } catch {}
  };

  const startEdit = (m) => {
    setEditing(m._id);
    setForm({ title: m.title, type: m.type, url: m.url, lessonPackId: m.lessonPackId?._id || m.lessonPackId || '', description: m.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const typeIcon = { pdf: '📄', 'yt-video': '📹', 'video': '🎥', 'live-link': '🔴' };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-br from-violet-900 via-indigo-900 to-violet-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Content Manager</h1>
              <p className="text-violet-200 text-sm md:text-base max-w-lg">
                Create, organize, and manage your learning materials across all your lesson packs.
              </p>
            </div>
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
              <span className="text-3xl">📚</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
              ${editing ? 'bg-amber-50 text-amber-500' : 'bg-primary-50 text-primary-500'}`}>
              {editing ? '✏️' : '➕'}
            </div>
            <h2 className="font-display font-bold text-xl text-slate-800">
              {editing ? 'Edit Material' : 'Add New Material'}
            </h2>
          </div>

          {msg.text && (
            <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 animate-fade-in-up border
              ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
              <div className="mt-0.5 shrink-0">
                {msg.type === 'success' ? '✅' : '❌'}
              </div>
              <div>
                <p className="font-semibold text-sm">{msg.type === 'success' ? 'Success' : 'Error'}</p>
                <p className={`text-xs mt-1 ${msg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm" placeholder="e.g. Chapter 1 – Kinematics" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Lesson Pack</label>
              <div className="relative">
                <select name="lessonPackId" value={form.lessonPackId} onChange={handleChange} required className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm">
                  <option value="">-- Select Lesson Pack --</option>
                  {lessonPacks.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
              <div className="relative">
                <select name="type" value={form.type} onChange={handleChange} className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm">
                  <option value="yt-video">YouTube Video</option>
                  <option value="video">Direct Video Upload</option>
                  <option value="pdf">PDF Document</option>
                  <option value="live-link">Live Class Link</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div className={['pdf', 'video'].includes(form.type) ? "md:col-span-2" : ""}>
              {['pdf', 'video'].includes(form.type) ? (
                <FileUpload 
                  file={pdfFile}
                  onChange={setPdfFile}
                  accept={form.type === 'video' ? "video/*" : "application/pdf"}
                  label={form.type === 'video' ? "Upload Video File" : "Upload PDF Document"}
                  progress={uploadProgress}
                  speed={uploadSpeed}
                  timeLeft={timeLeft}
                  isUploading={loading && !!pdfFile}
                />
              ) : (
                <>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{form.type === 'yt-video' ? 'YouTube URL' : 'Meeting Link'}</label>
                  <input name="url" value={form.url} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm"
                    placeholder={form.type === 'yt-video' ? 'https://youtu.be/...' : 'https://meet.google.com/...'} />
                </>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description (optional)</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm" placeholder="Brief description..." rows="2" />
            </div>
            
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
              <button type="submit" disabled={loading} 
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  editing ? 'Update Material' : 'Add Material'
                )}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); }} 
                  className="sm:w-32 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl transition-all">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="font-display font-bold text-2xl text-slate-800">Uploaded Materials</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <select value={filter} onChange={e => setFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm shadow-sm">
                <option value="">All Lesson Packs</option>
                {lessonPacks.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <div className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 border border-primary-100">
              {materials.length} Items
            </div>
          </div>
        </div>

        {/* List */}
        {fetchLoad ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : materials.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
            <span className="text-5xl opacity-50 mb-4 block">📭</span>
            <h3 className="text-lg font-semibold text-slate-700">No Materials Found</h3>
            <p className="text-slate-500 mt-1">Start by adding your first material above.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {materials.map(m => (
              <div key={m._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 group flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner
                    ${m.type === 'pdf' ? 'bg-blue-50 text-blue-500 border border-blue-100' :
                    (m.type === 'yt-video' || m.type === 'video') ? 'bg-red-50 text-red-500 border border-red-100' :
                    'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
                    {typeIcon[m.type]}
                  </div>
                  
                  {/* Action buttons visible on hover */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                    <button onClick={() => startEdit(m)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <div className="w-px bg-slate-200 mx-1"></div>
                    <button onClick={() => handleDelete(m._id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">{m.title}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <p className="text-slate-500 text-xs font-medium truncate">{m.lessonPackId?.title || 'Unknown Pack'}</p>
                </div>
                
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 flex-grow">
                  {m.description || 'No description provided.'}
                </p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border
                    ${m.type === 'pdf' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    (m.type === 'yt-video' || m.type === 'video') ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {m.type === 'yt-video' ? 'YouTube' : m.type === 'video' ? 'Direct Video' : m.type === 'pdf' ? 'PDF Doc' : 'Live Class'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
