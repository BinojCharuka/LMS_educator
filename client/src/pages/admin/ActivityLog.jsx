import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/logs');
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionBadgeColor = (action) => {
    const act = action.toLowerCase();
    if (act.includes('login')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (act.includes('register')) return 'bg-teal-50 text-teal-600 border-teal-200';
    if (act.includes('create')) return 'bg-blue-50 text-blue-600 border-blue-200';
    if (act.includes('delete')) return 'bg-rose-50 text-rose-600 border-rose-200';
    if (act.includes('role')) return 'bg-violet-50 text-violet-600 border-violet-200';
    if (act.includes('password') || act.includes('reset')) return 'bg-amber-50 text-amber-600 border-amber-200';
    if (act.includes('disable') || act.includes('block')) return 'bg-red-50 text-red-600 border-red-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Activity Log</h1>
            <p className="text-slate-500 mt-1">View system events, audit trails, and administrative actions.</p>
          </div>
          <button 
            onClick={loadLogs}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
            </svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl text-sm border bg-red-50 border-red-200 text-red-600 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log._id} className="glass p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:translate-x-1">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold mt-0.5">
                    {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                      <p className="text-slate-800 text-sm font-medium">{log.details}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {log.user ? (
                        <span>
                          By <span className="font-medium text-slate-600">{log.user.name}</span> ({log.user.email} • {log.user.role})
                        </span>
                      ) : (
                        <span>System Process</span>
                      )}
                      {log.ipAddress && (
                        <span className="font-mono">IP: {log.ipAddress}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-medium whitespace-nowrap self-end md:self-center">
                  {new Date(log.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">No logs found</h3>
                  <p className="text-slate-400 text-xs mt-1">Actions performed on the platform will be logged here.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
