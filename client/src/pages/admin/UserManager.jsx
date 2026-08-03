import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

export default function UserManager() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Creation State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'student', password: '' });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Password Reset State
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? `?role=${roleFilter}` : '';
      const { data } = await api.get(`/admin/users${params}`);
      setUsers(data.users || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [roleFilter]);

  const toggleBlock = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}/block`, { isBlocked: !user.isBlocked });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u));
      setMsg({ type: 'success', text: `${user.name} ${user.isBlocked ? 'unblocked' : 'blocked'}.` });
    } catch { setMsg({ type: 'error', text: 'Action failed.' }); }
  };

  const deleteUser = async (user) => {
    if (!confirm(`Permanently delete ${user.name} and all their data?`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      setMsg({ type: 'success', text: `${user.name} deleted.` });
    } catch { setMsg({ type: 'error', text: 'Delete failed.' }); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      const { data } = await api.post('/admin/users', createForm);
      if (data.success) {
        setUsers(prev => [data.user, ...prev]);
        setMsg({ type: 'success', text: `User ${data.user.name} created successfully.` });
        setIsCreateOpen(false);
        setCreateForm({ name: '', email: '', role: 'student', password: '' });
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      const { data } = await api.patch(`/admin/users/${resetTarget._id}/reset-password`, { newPassword: resetPasswordVal });
      if (data.success) {
        setMsg({ type: 'success', text: `Password reset successfully for ${resetTarget.name}.` });
        setIsResetOpen(false);
        setResetTarget(null);
        setResetPasswordVal('');
      }
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      const { data } = await api.patch(`/admin/users/${user._id}/role`, { role: newRole });
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
        setMsg({ type: 'success', text: `Role updated to ${newRole} for ${user.name}.` });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update role.' });
    }
  };

  const roleBadge = {
    student: 'bg-teal-50 text-teal-600 border-teal-200',
    teacher: 'bg-violet-50 text-violet-600 border-violet-200',
    admin:   'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500 mt-1">View, block, or remove platform users.</p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary-500/10 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        </div>

        {msg.text && (
          <div className={`p-3 rounded-xl text-sm border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {msg.text}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {['', 'student', 'teacher', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                roleFilter === r ? 'bg-primary-600 border-primary-600 text-white shadow-sm' : 'border-slate-300 text-slate-500 hover:border-slate-400 bg-white'
              }`}>
              {r ? r.charAt(0).toUpperCase() + r.slice(1) + 's' : 'All'}
            </button>
          ))}
          <span className="text-slate-500 text-sm self-center ml-2">{users.length} users</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u._id} className={`glass p-4 flex items-center justify-between gap-4 flex-wrap md:flex-nowrap ${u.isBlocked ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      {u.isBlocked && <span className="text-xs font-medium bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">Blocked</span>}
                    </div>
                    <p className="text-slate-500 text-xs truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap md:flex-nowrap flex-shrink-0 ml-auto md:ml-0">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button 
                    onClick={() => { setResetTarget(u); setIsResetOpen(true); }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-9 5a3 3 0 11-6 0 3 3 0 016 0zM19 9a7 7 0 00-14 0 7 7 0 0014 0z" />
                    </svg>
                    Reset Pass
                  </button>

                  {u.role !== 'admin' && (
                    <>
                      <button onClick={() => toggleBlock(u)}
                        className={`text-xs py-1.5 px-3 rounded-xl font-bold cursor-pointer transition-all border ${
                          u.isBlocked 
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200' 
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200'
                        }`}
                      >
                        {u.isBlocked ? 'Activate' : 'Disable'}
                      </button>
                      <button onClick={() => deleteUser(u)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs py-1.5 px-3 rounded-xl font-bold cursor-pointer transition-all">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && <div className="text-center py-12 text-slate-500">No users found.</div>}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up">
            <div className="h-20 bg-gradient-to-r from-primary-500 to-violet-600 relative flex items-center px-6">
              <h3 className="text-white font-bold font-display text-lg">Add New User</h3>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                  {createError}
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Full Name</label>
                <input 
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full mt-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Email Address</label>
                <input 
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full mt-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Password</label>
                <input 
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full mt-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  disabled={createLoading}
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary-500/10 cursor-pointer"
                >
                  {createLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden relative animate-scale-up">
            <div className="h-20 bg-gradient-to-r from-primary-500 to-violet-600 relative flex items-center px-6">
              <h3 className="text-white font-bold font-display text-lg">Reset Password</h3>
              <button 
                onClick={() => { setIsResetOpen(false); setResetTarget(null); setResetPasswordVal(''); }}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Set a new password for <span className="font-semibold text-slate-800">{resetTarget?.name}</span> ({resetTarget?.email}).
              </p>

              {resetError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                  {resetError}
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">New Password</label>
                <input 
                  type="password"
                  required
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full mt-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  disabled={resetLoading}
                  onClick={() => { setIsResetOpen(false); setResetTarget(null); setResetPasswordVal(''); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary-500/10 cursor-pointer"
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
