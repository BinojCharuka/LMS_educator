import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

export default function PaymentApprovals() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('pending');
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectReason,  setRejectReason]  = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get(`/payments${params}`);
      setPayments(data.payments || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    try {
      await api.patch(`/payments/${id}/status`, {
        status,
        rejectionReason: status === 'rejected' ? rejectReason : '',
      });
      setPayments(prev => prev.filter(p => p._id !== id));
      setSelected(null);
      setRejectReason('');
    } catch {}
    finally { setActionLoading(''); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Payment Approvals</h1>
          <p className="text-slate-500 mt-1">Review payment slips and approve access to lesson packs.</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['pending','approved','rejected',''].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                filter === s ? 'bg-primary-600 border-primary-600 text-white shadow-sm' : 'border-slate-300 text-slate-500 hover:border-slate-400 bg-white'
              }`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">✅</div>
            <p>No {filter || ''} payments to review.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payments.map(p => (
              <div key={p._id} className="glass-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{p.studentId?.name}</p>
                    <p className="text-slate-500 text-xs">{p.studentId?.email}</p>
                  </div>
                  <span className={`badge-${p.status}`}>{p.status}</span>
                </div>
                <p className="text-primary-600 font-medium text-sm mb-3">{p.lessonPackId?.title || 'Unknown Pack'}</p>

                <div className="rounded-xl overflow-hidden bg-slate-100 mb-3 cursor-pointer border border-slate-200"
                  onClick={() => setSelected(p)}>
                  <img src={p.slipImageUrl} alt="Bank slip" className="w-full h-36 object-cover hover:scale-105 transition-transform" />
                  <p className="text-xs text-center text-slate-500 py-1.5">Click to view full</p>
                </div>

                <p className="text-slate-500 text-xs mb-3">{new Date(p.createdAt).toLocaleDateString()}</p>

                {(p.status === 'pending' || p.status === 'approved') && (
                  <div className="flex gap-2">
                    {p.status === 'pending' && (
                      <button onClick={() => handleAction(p._id, 'approved')}
                        disabled={!!actionLoading}
                        className="btn-success flex-1 justify-center text-xs py-2">
                        ✓ Approve
                      </button>
                    )}
                    <button onClick={() => setSelected(p)}
                      className="btn-danger flex-1 justify-center text-xs py-2">
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white border border-slate-200 shadow-xl w-full max-w-lg p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-slate-900 text-lg">
                {selected.studentId?.name} — {selected.lessonPackId?.title || 'Unknown Pack'}
              </h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <img src={selected.slipImageUrl} alt="Slip" className="w-full rounded-xl mb-4 max-h-80 object-contain bg-slate-100 border border-slate-200" />
            {(selected.status === 'pending' || selected.status === 'approved') && (
              <>
                <div className="mb-3">
                  <label className="label">Rejection reason (optional)</label>
                  <input className="input" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    placeholder="e.g. Slip is unclear..." />
                </div>
                <div className="flex gap-3">
                  {selected.status === 'pending' && (
                    <button onClick={() => handleAction(selected._id, 'approved')} className="btn-success flex-1 justify-center">✓ Approve</button>
                  )}
                  <button onClick={() => handleAction(selected._id, 'rejected')} className="btn-danger flex-1 justify-center">✕ Reject</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
