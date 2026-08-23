import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.stats || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Students',  value: stats.totalStudents,   icon: '🎓', color: 'text-primary-400' },
    { label: 'Total Teachers',  value: stats.totalTeachers,   icon: '👨‍🏫', color: 'text-violet-400' },
    { label: 'Total Materials', value: stats.totalMaterials,  icon: '📚', color: 'text-teal-400' },
    { label: 'Total Payments',  value: stats.totalPayments,   icon: '💳', color: 'text-emerald-400' },
    { label: 'Pending Payments',value: stats.pendingPayments, icon: '⏳', color: 'text-amber-400' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-primary-600 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden shadow-lg shadow-primary-600/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-hero-mesh opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10">
            <p className="text-primary-100 font-medium mb-1">System Administration</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
              Admin Overview
            </h1>
            <p className="text-primary-100">
              System-wide statistics, user controls, and activity monitoring.
            </p>
          </div>
          <a href="/admin/users" className="relative z-10 bg-white text-primary-600 hover:bg-slate-50 px-6 py-3 rounded-xl font-medium transition-colors shadow-sm inline-flex items-center gap-2 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Manage Users
          </a>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div className="font-display text-3xl font-semibold text-slate-800 mb-1">{stats.totalStudents ?? '—'}</div>
              <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Total Students</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div className="font-display text-3xl font-semibold text-slate-800 mb-1">{stats.totalTeachers ?? '—'}</div>
              <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Total Teachers</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div className="font-display text-3xl font-semibold text-slate-800 mb-1">{stats.totalMaterials ?? '—'}</div>
              <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Total Materials</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <div className="font-display text-3xl font-semibold text-slate-800 mb-1">{stats.totalPayments ?? '—'}</div>
              <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Total Payments</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="font-display text-3xl font-semibold text-slate-800 mb-1">{stats.pendingPayments ?? '—'}</div>
              <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Pending Payments</div>
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">System Logs & Activity</h3>
                <a href="/admin/shield" className="text-sm font-medium text-primary-600 hover:text-primary-700">View detailed logs</a>
              </div>
              <div className="p-6">
                <p className="text-slate-500 text-sm mb-4">Activity log shows recent security events and system actions. Detailed logging ensures administrative accountability.</p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <p className="text-slate-500 text-sm">Head over to the Shield / Activity Log section to monitor real-time security events.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-display font-semibold text-lg mb-2">Quick Shortcuts</h3>
                <p className="text-slate-300 text-sm mb-6">Frequently used administrative actions.</p>
                
                <a href="/admin/users" className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors border border-white/10 w-full mb-3 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  Block / Unblock Users
                </a>
                
                <a href="/admin/shield" className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors border border-white/10 w-full flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  Review Audit Logs
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Site Customization */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Site Customization</h3>
            <p className="text-slate-500 text-sm mt-1">Manage the teacher profile displayed on the public landing page hero section.</p>
          </div>
          <div className="p-6">
            <LandingTeacherForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Simple internal component to manage the form state
function LandingTeacherForm() {
  const [data, setData] = useState({ name: '', qualifications: '', imageUrl: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/proxy/settings/landing-teacher')
      .then(res => {
        if (res.data?.setting) setData(res.data.setting);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const fd = new FormData();
      if (data.name) fd.append('name', data.name);
      if (data.qualifications) fd.append('qualifications', data.qualifications);
      if (file) fd.append('image', file);

      const res = await api.post('/admin/settings/landing-teacher', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData(res.data.setting);
      setFile(null);
      setMsg('Teacher profile updated successfully!');
    } catch (err) {
      setMsg('Failed to update: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-4">
      {msg && <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm mb-4">{msg}</div>}
      <div>
        <label className="label">Teacher Name</label>
        <input className="input" value={data.name || ''} onChange={e => setData({...data, name: e.target.value})} placeholder="e.g. Mr. Suresh" required />
      </div>
      <div>
        <label className="label">Qualifications</label>
        <input className="input" value={data.qualifications || ''} onChange={e => setData({...data, qualifications: e.target.value})} placeholder="e.g. M.Sc. | B.Ed. Hons." required />
      </div>
      <div>
        <label className="label">Profile Image (optional)</label>
        {data.imageUrl && !file && (
          <img src={data.imageUrl} alt="Current profile" className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-primary-100" />
        )}
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="input p-2" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary mt-2">
        {loading ? 'Saving...' : 'Save Teacher Profile'}
      </button>
    </form>
  );
}
