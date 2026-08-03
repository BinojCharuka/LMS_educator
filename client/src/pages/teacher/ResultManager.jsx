import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

const EMPTY_FORM = { studentId: '', examName: '', marks: '', totalMarks: 100, grade: '', month: '', remarks: '' };
const MONTHS = ['January 2025','February 2025','March 2025','April 2025','May 2025','June 2025','July 2025','August 2025','September 2025','October 2025','November 2025','December 2025'];

export default function ResultManager() {
  const [results,   setResults]   = useState([]);
  const [students,  setStudents]  = useState([]);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editing,   setEditing]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState({ type: '', text: '' });
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    api.get('/results').then(r => setResults(r.data.results || [])).catch(() => {});
    api.get('/admin/students/search?q=').catch(() => {});
  }, []);

  const searchStudents = async (q) => {
    if (!q.trim()) return;
    try {
      const { data } = await api.get(`/admin/students/search?q=${q}`);
      setStudents(data.students || []);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      if (editing) {
        const { data } = await api.put(`/results/${editing}`, form);
        setResults(prev => prev.map(r => r._id === editing ? data.result : r));
        setMsg({ type: 'success', text: 'Result updated!' });
      } else {
        const { data } = await api.post('/results', form);
        setResults(prev => [data.result, ...prev]);
        setMsg({ type: 'success', text: 'Result added!' });
      }
      setForm(EMPTY_FORM); setEditing(null);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save.' });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this result?')) return;
    await api.delete(`/results/${id}`).catch(() => {});
    setResults(prev => prev.filter(r => r._id !== id));
  };

  const filtered = search
    ? results.filter(r => r.studentId?.name?.toLowerCase().includes(search.toLowerCase()))
    : results;

  const pct = (m, t) => Math.round((m / t) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Result Manager</h1>
          <p className="text-slate-500 mt-1">Enter or update student exam marks.</p>
        </div>

        {/* Form */}
        <div className="glass p-6">
          <h2 className="font-semibold text-slate-900 mb-5">{editing ? 'Edit Result' : 'Add New Result'}</h2>
          {msg.text && (
            <div className={`mb-4 p-3 rounded-xl text-sm border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-1">
              <label className="label">Student ID</label>
              <div className="flex gap-2">
                <input className="input flex-1" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})}
                  placeholder="Enter Student ID (e.g., LM101)" required />
              </div>
              <div className="flex gap-2 mt-2">
                <input className="input flex-1 text-xs" placeholder="Search by name..." onChange={e => searchStudents(e.target.value)} />
              </div>
              {students.length > 0 && (
                <div className="mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm absolute z-10 w-full max-w-sm">
                  {students.map(s => (
                    <button key={s._id} type="button" onClick={() => { setForm({...form, studentId: s.studentId || s._id}); setStudents([]); }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      {s.name} <span className="text-slate-500 text-xs">— {s.studentId || 'No ID'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="label">Exam Name</label>
              <input className="input" value={form.examName} onChange={e => setForm({...form, examName: e.target.value})} required placeholder="e.g. Term 1 Paper" />
            </div>
            <div>
              <label className="label">Month</label>
              <select className="input" value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
                <option value="">-- Optional --</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Marks</label>
              <input type="number" className="input" value={form.marks} onChange={e => setForm({...form, marks: e.target.value})} required min={0} />
            </div>
            <div>
              <label className="label">Total Marks</label>
              <input type="number" className="input" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: e.target.value})} required min={1} />
            </div>
            <div>
              <label className="label">Grade (optional)</label>
              <input className="input" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} placeholder="A+, B, etc." />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="label">Remarks (optional)</label>
              <input className="input" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="Good effort, needs improvement in..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? '...' : editing ? 'Update Result' : 'Add Result'}
              </button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); }} className="btn-secondary">Cancel</button>}
            </div>
          </form>
        </div>

        {/* Search + list */}
        <input className="input max-w-xs" placeholder="Filter by student name..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left py-3 px-2">Student</th>
                <th className="text-left py-3 px-2">Exam</th>
                <th className="text-left py-3 px-2">Score</th>
                <th className="text-left py-3 px-2">%</th>
                <th className="text-left py-3 px-2">Grade</th>
                <th className="text-left py-3 px-2">Month</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-2">
                    <div className="text-slate-900 font-medium">{r.studentId?.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-wider">{r.studentId?.studentId}</div>
                  </td>
                  <td className="py-3 px-2 text-slate-700">{r.examName}</td>
                  <td className="py-3 px-2 text-slate-900">{r.marks}/{r.totalMarks}</td>
                  <td className="py-3 px-2">
                    <span className={pct(r.marks,r.totalMarks) >= 50 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                      {pct(r.marks,r.totalMarks)}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-primary-600 font-medium">{r.grade || '—'}</td>
                  <td className="py-3 px-2 text-slate-500">{r.month || '—'}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(r._id); setForm({ studentId: r.studentId?.studentId || r.studentId?._id || '', examName: r.examName, marks: r.marks, totalMarks: r.totalMarks, grade: r.grade||'', month: r.month||'', remarks: r.remarks||'' }); }}
                        className="text-primary-600 text-xs hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(r._id)} className="text-red-600 text-xs hover:underline font-medium">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No results found.</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
