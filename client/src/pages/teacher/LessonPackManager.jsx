import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FileUpload from '../../components/common/FileUpload';
import api from '../../api/axios';

export default function LessonPackManager() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '', price: '' });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPacks = async () => {
    try {
      const res = await api.get('/lesson-packs');
      setPacks(res.data.packs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    if (!formData.title) {
      return setError('Title is required');
    }

    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('price', formData.price);
      if (imageFile) fd.append('image', imageFile);

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

      if (editingId) {
        await api.put(`/lesson-packs/${editingId}`, fd, config);
        setSuccess('Lesson pack updated successfully!');
      } else {
        await api.post('/lesson-packs', fd, config);
        setSuccess('Lesson pack created successfully!');
      }

      setFormData({ title: '', description: '', price: '' });
      setImageFile(null);
      setEditingId(null);
      fetchPacks();
    } catch (err) {
      setError(err.response?.data?.message || (editingId ? 'Error updating lesson pack' : 'Error creating lesson pack'));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
      setUploadSpeed('');
      setTimeLeft('');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lesson pack?')) return;
    try {
      await api.delete(`/lesson-packs/${id}`);
      fetchPacks();
    } catch (err) {
      alert('Error deleting lesson pack');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Lesson Packs Manager</h1>
              <p className="text-indigo-200 text-sm md:text-base max-w-lg">
                Create and manage structured learning packages for your students to explore and purchase.
              </p>
            </div>
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
              <span className="text-3xl">📦</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center font-bold text-lg">
                  ✨
                </div>
                <h2 className="font-display font-bold text-xl text-slate-800">
                  {editingId ? 'Edit Pack' : 'Create Pack'}
                </h2>
              </div>
              
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fade-in-up">
                  <span className="mt-0.5 shrink-0 text-red-500">❌</span>
                  <div>
                    <p className="text-red-800 font-semibold text-sm">Error</p>
                    <p className="text-red-600 text-xs mt-1">{error}</p>
                  </div>
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 animate-fade-in-up">
                  <span className="mt-0.5 shrink-0 text-emerald-500">✅</span>
                  <div>
                    <p className="text-emerald-800 font-semibold text-sm">Success</p>
                    <p className="text-emerald-600 text-xs mt-1">{success}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Pack Title</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm" placeholder="e.g. Grade 10 - Science - Unit 1" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm" placeholder="Topics covered..." rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Price (Rs.)</label>
                  <input type="number" className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm" placeholder="e.g. 1500 (Leave empty for Free)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <FileUpload 
                    file={imageFile}
                    onChange={setImageFile}
                    accept="image/*"
                    label="Course Cover Image"
                    progress={uploadProgress}
                    speed={uploadSpeed}
                    timeLeft={timeLeft}
                    isUploading={isSubmitting && !!imageFile}
                  />
                </div>
                <div className="pt-2 space-y-3">
                  <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center disabled:opacity-50 transform hover:-translate-y-0.5">
                    {isSubmitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Lesson Pack' : 'Create Lesson Pack')}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', description: '', price: '' }); setImageFile(null); setError(''); setSuccess(''); }} className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold py-3.5 rounded-xl shadow-sm border border-slate-200 transition-all">
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List of Packs */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-slate-800">Existing Lesson Packs</h2>
                <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-100">
                  {packs.length} Packs
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : packs.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                  <span className="text-5xl opacity-50 mb-4 block">📭</span>
                  <h3 className="text-lg font-semibold text-slate-700">No Lesson Packs</h3>
                  <p className="text-slate-500 mt-1">Create your first lesson pack to get started.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                  {packs.map(pack => (
                    <div key={pack._id} className="group p-4 bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-indigo-300 hover:shadow-md transition-all gap-4">
                      <div className="flex items-start gap-4 flex-1 w-full">
                        <div className="relative shrink-0">
                          {pack.imageUrl ? (
                            <img src={pack.imageUrl} alt={pack.title} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shadow-sm border border-slate-100" />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl shadow-inner border border-slate-100">
                              📚
                            </div>
                          )}
                          <div className="absolute -bottom-2 -right-2 bg-white rounded-lg shadow-sm border border-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                            ID: {pack._id.slice(-4).toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">{pack.title}</h3>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{pack.description || 'No description provided.'}</p>
                          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                            <span>💳</span>
                            {pack.price > 0 ? `Rs. ${pack.price}` : 'Free Access'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                        <button onClick={() => {
                          setEditingId(pack._id);
                          setFormData({ title: pack.title, description: pack.description || '', price: pack.price || '' });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} className="w-full sm:w-auto flex items-center justify-center gap-2 p-2.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-100" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          <span className="sm:hidden text-sm font-semibold">Edit</span>
                        </button>
                        <button onClick={() => handleDelete(pack._id)} className="w-full sm:w-auto flex items-center justify-center gap-2 p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100" title="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          <span className="sm:hidden text-sm font-semibold">Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}
