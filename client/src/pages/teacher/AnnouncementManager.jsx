import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'normal' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/announcements', form);
      showToast('Announcement posted successfully!');
      setForm({ title: '', message: '', priority: 'normal' });
      fetchAnnouncements();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post announcement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      showToast('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete announcement', 'error');
    }
  };

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-xl z-50 animate-fade-in-up font-medium text-white ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-500 mt-1">Post updates and alerts to all students.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Post Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4">New Announcement</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Class Rescheduled"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea
                    required
                    className="input min-h-[120px] resize-none"
                    placeholder="Enter announcement details..."
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select
                    className="input"
                    value={form.priority}
                    onChange={e => setForm({...form, priority: e.target.value})}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center"
                >
                  {isSubmitting ? 'Posting...' : 'Post Announcement'}
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Recent Announcements</h2>
              </div>
              <div className="p-6 flex-1 bg-slate-50 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <p>No announcements posted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((ann) => (
                      <div key={ann._id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(ann._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Delete Announcement"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                            ann.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                            ann.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {ann.priority}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-lg text-slate-900 mb-2 pr-8">{ann.title}</h3>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap">{ann.message}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                          <span>Posted by {ann.createdBy?.name || 'Teacher'}</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {ann.readBy?.length || 0} read
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
