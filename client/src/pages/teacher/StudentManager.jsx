import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

export default function StudentManager() {
  const [query,    setQuery]    = useState('');
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [resetModal, setResetModal] = useState(null);
  const [newPwd, setNewPwd]       = useState('');
  const [msg,    setMsg]          = useState({ type:'', text:'' });

  const fetchStudents = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/students/search?q=${encodeURIComponent(searchQuery)}`);
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const search = () => {
    fetchStudents(query);
  };

  const resetPassword = async () => {
    if (!newPwd || newPwd.length < 6) return setMsg({ type: 'error', text: 'Min 6 characters.' });
    try {
      await api.patch(`/admin/students/${resetModal._id}/reset-password`, { newPassword: newPwd });
      setMsg({ type: 'success', text: `Password reset for ${resetModal.name}` });
      setResetModal(null); setNewPwd('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed.' });
    }
  };

  const toggleBlock = async (studentId, currentStatus, name) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} ${name}?`)) return;
    try {
      await api.patch(`/admin/users/${studentId}/block`, { isBlocked: !currentStatus });
      setMsg({ type: 'success', text: `Successfully ${currentStatus ? 'unblocked' : 'blocked'} ${name}.` });
      fetchStudents(query);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update status.' });
    }
  };

  const deleteStudent = async (studentId, name) => {
    if (!window.confirm(`WARNING: Are you sure you want to PERMANENTLY delete ${name} and all their data?`)) return;
    try {
      await api.delete(`/admin/users/${studentId}`);
      setMsg({ type: 'success', text: `Successfully deleted ${name}.` });
      fetchStudents(query);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete user.' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Student Manager</h1>
          <p className="text-slate-500 mt-1">Search students and manage their accounts.</p>
        </div>

        {msg.text && (
          <div className={`p-3 rounded-xl text-sm border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {msg.text}
          </div>
        )}

        <div className="flex gap-3">
          <input className="input flex-1 max-w-md" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search by name or email..." />
          <button onClick={search} className="btn-primary" disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {students.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(s => (
              <div key={s._id} className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center text-white font-bold">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{s.name}</p>
                    <p className="text-slate-500 text-xs">{s.email}</p>
                    {s.studentId && (
                      <div className="mt-1">
                        <span className="text-primary-700 font-mono text-[10px] tracking-wider bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                          ID: {s.studentId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>Joined {new Date(s.createdAt).toLocaleDateString()}</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium border ${s.isBlocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    {s.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setResetModal(s); setNewPwd(''); }}
                    className="btn-secondary text-xs py-1.5 px-3 w-full justify-center">
                    🔑 Reset Password
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleBlock(s._id, s.isBlocked, s.name)}
                      className={`btn-secondary text-xs py-1.5 px-3 flex-1 justify-center ${s.isBlocked ? 'text-emerald-600 hover:text-emerald-700' : 'text-orange-600 hover:text-orange-700'}`}
                    >
                      {s.isBlocked ? '✅ Unblock' : '🚫 Block'}
                    </button>
                    <button 
                      onClick={() => deleteStudent(s._id, s.name)}
                      className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center text-red-600 hover:text-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">👥</div>
            <p>No students found.</p>
          </div>
        )}
      </div>

      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setResetModal(null)}>
          <div className="bg-white border border-slate-200 shadow-xl w-full max-w-md p-6 rounded-2xl">
            <h3 className="font-display font-bold text-slate-900 text-lg mb-4">
              Reset Password — {resetModal.name}
            </h3>
            <div className="mb-4">
              <label className="label">New Password</label>
              <input type="password" className="input" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                placeholder="Minimum 6 characters" />
            </div>
            <div className="flex gap-3">
              <button onClick={resetPassword} className="btn-primary flex-1 justify-center">Reset</button>
              <button onClick={() => setResetModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
