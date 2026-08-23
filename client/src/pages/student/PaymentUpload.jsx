import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

export default function PaymentUpload() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPackId = queryParams.get('pack') || '';

  const [lessonPackId, setLessonPackId] = useState(initialPackId);
  const [lessonPacks, setLessonPacks] = useState([]);
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [payments, setPayments] = useState([]);

  // Generate a random remark code for OCR verification
  // Exclude ambiguous characters (0, O, 1, I, l, 5, S, 8, B) to improve Tesseract accuracy
  const randomRemark = useMemo(() => {
    const chars = 'ACDEFGHJKLMNPQRTUVWXYZ234679';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'LMS-' + result;
  }, []);

  useEffect(() => {
    api.get('/payments/my').then(r => setPayments(r.data.payments || [])).catch(() => {});
    api.get('/lesson-packs').then(r => setLessonPacks(r.data.packs || [])).catch(() => {});
  }, [success]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lessonPackId || !file) return setError('Please select a lesson pack and upload a slip image.');
    setError(''); setSuccess(''); setLoading(true); setVerifying(false);
    
    try {
      const fd = new FormData();
      fd.append('lessonPackId', lessonPackId);
      fd.append('remark', randomRemark); // Send the generated remark
      fd.append('slip', file);
      
      // Step 1: Upload the file (Fast)
      const res = await api.post('/payments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const paymentId = res.data.payment._id;
      
      // Step 2: Verify the payment using OCR (Takes 15-20s)
      setLoading(false);
      setVerifying(true);
      
      try {
        const verifyRes = await api.post(`/payments/${paymentId}/verify`, { remark: randomRemark });
        if (verifyRes.data.payment.status === 'approved') {
          setSuccess(`Verification successful! Payment approved automatically.`);
        } else {
          setSuccess(`Payment submitted, but OCR could not verify it automatically. A teacher will review it.`);
        }
      } catch (verifyErr) {
        setSuccess(`Payment submitted, but auto-verification failed. A teacher will review it.`);
      }
      
      setFile(null); setPreview(null); setLessonPackId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally { 
      setLoading(false); 
      setVerifying(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Upload Payment Slip</h1>
              <p className="text-indigo-200 text-sm md:text-base max-w-lg">
                Securely submit your bank transfer receipt to instantly unlock your premium lesson packs and start learning.
              </p>
            </div>
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
              <svg className="w-8 h-8 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold">1</div>
                <h2 className="font-display font-bold text-xl text-slate-800">Payment Details</h2>
              </div>

              {success && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 animate-fade-in-up">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p className="text-emerald-800 font-semibold text-sm">Upload Successful</p>
                    <p className="text-emerald-600 text-xs mt-1">{success}</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fade-in-up">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p className="text-red-800 font-semibold text-sm">Upload Failed</p>
                    <p className="text-red-600 text-xs mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Course / Lesson Pack</label>
                  <div className="relative">
                    <select 
                      id="payment-month-select" 
                      value={lessonPackId} 
                      onChange={e => setLessonPackId(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm" 
                      required
                    >
                      <option value="">-- Choose a lesson pack to unlock --</option>
                      {lessonPacks.map(pack => {
                        const existingPayment = payments.find(p => p.lessonPackId && p.lessonPackId._id === pack._id);
                        const isBlocked = existingPayment && (existingPayment.status === 'pending' || existingPayment.status === 'approved');
                        return (
                          <option key={pack._id} value={pack._id} disabled={isBlocked}>
                            {pack.title} {pack.price > 0 ? `(Rs. ${pack.price})` : '(Free)'} {isBlocked ? `(Already ${existingPayment.status})` : existingPayment?.status === 'rejected' ? '(Resubmit)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 mb-6 text-center">
                  <p className="text-sm text-indigo-800 mb-2 font-medium">Please write this exactly as the **Reference / Remark** on your bank transfer:</p>
                  <div className="inline-block bg-white border-2 border-indigo-500 rounded-xl px-6 py-3 font-mono font-bold text-2xl tracking-widest text-indigo-700 shadow-sm">
                    {randomRemark}
                  </div>
                  <p className="text-xs text-indigo-600 mt-3 font-semibold">Auto-verification requires this exact code, the correct price, and a date within the last 2 days.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Bank Slip Image</label>
                  <div className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                    ${preview ? 'border-primary-500 bg-primary-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}
                    onClick={() => document.getElementById('slip-file-input').click()}
                  >
                    {preview ? (
                      <div className="relative group">
                        <img src={preview} alt="Slip preview" className="max-h-56 mx-auto rounded-xl object-contain shadow-sm" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-semibold text-sm bg-black/50 px-4 py-2 rounded-full">Click to change image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <p className="text-slate-800 font-semibold mb-1">Click to browse or drag image here</p>
                        <p className="text-xs text-slate-500">Supports JPG, PNG, WebP up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <input id="slip-file-input" type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </div>

                <div className="pt-2">
                  <button type="submit" id="payment-submit-btn" disabled={loading || verifying || !file || !lessonPackId}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading Image...
                      </span>
                    ) : verifying ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying with OCR...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Submit Payment for Verification
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* History Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-slate-800">Recent Uploads</h2>
                <div className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  {payments.length} Records
                </div>
              </div>

              {payments.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {payments.map(p => (
                    <div key={p._id} className="group p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all relative overflow-hidden">
                      {p.status === 'pending' && <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />}
                      {p.status === 'approved' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />}
                      {p.status === 'rejected' && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                      
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <div>
                          <p className="text-slate-900 font-semibold text-sm line-clamp-1">{p.lessonPackId?.title || 'Unknown Pack'}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0
                          ${p.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                            p.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                            'bg-red-100 text-red-700 border border-red-200'}`}>
                          {p.status}
                        </span>
                      </div>
                      
                      {p.status === 'rejected' && p.rejectionReason && (
                        <div className="mt-3 pl-2 p-3 bg-red-50/50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                          <span className="block text-red-800 font-bold mb-0.5">Reason:</span>
                          {p.rejectionReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 h-64 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                  <span className="text-4xl opacity-50 mb-3">🧾</span>
                  <p className="text-slate-500 font-medium text-sm">No payment history yet.</p>
                  <p className="text-slate-400 text-xs mt-1">Your uploaded slips will appear here.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
