import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({});
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const [liveClassForm, setLiveClassForm] = useState({ title: '', link: '' });
  const [activeLiveClass, setActiveLiveClass] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [paymentsRes, liveRes] = await Promise.all([
          api.get('/payments?status=pending'),
          api.get('/live-classes/active'),
        ]);
        setPending(paymentsRes.data.payments || []);
        setStats({ pendingCount: paymentsRes.data.count || 0 });
        if (liveRes.data.liveClasses?.length > 0) {
          setActiveLiveClass(liveRes.data.liveClasses[0]);
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleStartLiveClass = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/live-classes/start', liveClassForm);
      setActiveLiveClass(res.data.liveClass);
      setLiveClassForm({ title: '', link: '' });
      alert('Live class started!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error starting live class');
    }
  };

  const handleEndLiveClass = async () => {
    if (!activeLiveClass) return;
    try {
      await api.put(`/live-classes/${activeLiveClass._id}/end`);
      setActiveLiveClass(null);
      alert('Live class ended!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error ending live class');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-primary-600 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden shadow-lg shadow-primary-600/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-hero-mesh opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10">
            <p className="text-primary-100 font-medium mb-1">Good evening 👋</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
              Teacher Dashboard
            </h1>
            <p className="text-primary-100">
              Manage your content, approvals, and students easily.
            </p>
          </div>
          <a href="/teacher/content" className="relative z-10 bg-white text-primary-600 hover:bg-slate-50 px-6 py-3 rounded-xl font-medium transition-colors shadow-sm inline-flex items-center gap-2 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add New Content
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="font-display text-3xl font-semibold text-amber-600 mb-1">{stats.pendingCount ?? '—'}</div>
            <div className="text-slate-800 font-medium text-sm">Pending Approvals</div>
            <div className="text-slate-500 text-xs mt-1">Requires your review</div>
          </div>
          
          <a href="/teacher/content" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col hover:border-primary-300 hover:shadow-md transition-all group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="font-display text-xl font-semibold text-slate-800 mb-1">Content Manager</div>
            <div className="text-slate-500 text-sm mt-1">Upload videos & notes</div>
          </a>

          <a href="/teacher/results" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div className="font-display text-xl font-semibold text-slate-800 mb-1">Enter Results</div>
            <div className="text-slate-500 text-sm mt-1">Update exam marks</div>
          </a>

          <a href="/teacher/students" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <div className="font-display text-xl font-semibold text-slate-800 mb-1">Students</div>
            <div className="text-slate-500 text-sm mt-1">Search & manage access</div>
          </a>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Pending Payments Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  Pending Approvals
                </h3>
                <a href="/teacher/payments" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</a>
              </div>
              <div className="p-2">
                {!loading && pending.length > 0 ? (
                  pending.slice(0, 5).map(p => (
                    <a key={p._id} href="/teacher/payments" className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{p.studentId?.name || 'Student'}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{p.month} · {p.studentId?.email}</p>
                        </div>
                      </div>
                      <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-amber-200">
                        Pending
                      </span>
                    </a>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p>No pending approvals. You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Live Class Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900">Live Class</h3>
              </div>
              
              {activeLiveClass ? (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-red-600 font-semibold text-sm tracking-wide">LIVE NOW</span>
                  </div>
                  <h4 className="font-medium text-slate-900 mb-1">{activeLiveClass.title}</h4>
                  <a href={activeLiveClass.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline break-all mb-4 block">
                    {activeLiveClass.link}
                  </a>
                  <button onClick={handleEndLiveClass} className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium py-2 rounded-lg text-sm transition-colors shadow-sm">
                    End Live Class
                  </button>
                </div>
              ) : (
                <form onSubmit={handleStartLiveClass} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Class Title</label>
                    <input type="text" required value={liveClassForm.title} onChange={e => setLiveClassForm({...liveClassForm, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" placeholder="e.g. Revision Theory" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Meeting Link</label>
                    <input type="url" required value={liveClassForm.link} onChange={e => setLiveClassForm({...liveClassForm, link: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" placeholder="https://zoom.us/..." />
                  </div>
                  <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Start Live Now
                  </button>
                </form>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-display font-semibold text-lg mb-2">Teacher Resources</h3>
                <p className="text-slate-300 text-sm mb-6">Access guides on how to upload content and manage students efficiently.</p>
                <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-white/10 w-full mb-3 flex items-center justify-between">
                  <span>View Instructor Guide</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-white/10 w-full flex items-center justify-between">
                  <span>Contact Tech Support</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}
