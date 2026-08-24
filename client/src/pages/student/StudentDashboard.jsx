import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [results,  setResults]  = useState([]);
  const [liveClass, setLiveClass] = useState(null);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes, liveRes, matRes] = await Promise.all([
          api.get('/payments/my'),
          api.get('/results/my'),
          api.get('/live-classes/active'),
          api.get('/materials/student/recent')
        ]);
        setPayments(pRes.data.payments || []);
        setResults(rRes.data.results || []);
        setRecentMaterials(matRes.data.materials || []);
        if (liveRes.data.liveClasses?.length > 0) {
          setLiveClass(liveRes.data.liveClasses[0]);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const approvedPacks = payments.filter(p => p.status === 'approved').length;
  const latestResult   = results[0];
  const pendingCount   = payments.filter(p => p.status === 'pending').length;



  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-primary-600 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden shadow-lg shadow-primary-600/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-hero-mesh opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-primary-100 font-medium">Good evening 👋</p>
              {user?.studentId && (
                <span className="bg-white/20 text-white text-[10px] font-mono tracking-wider px-2 py-0.5 rounded backdrop-blur-sm border border-white/20">
                  ID: {user.studentId}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
              Welcome back, {(user?.name || '').split(' ')[0]}!
            </h1>
            <p className="text-primary-100">
              You have a live class in <strong className="text-white">2 days</strong>. Don't miss it!
            </p>
          </div>
          <Link to="/student/materials" className="relative z-10 bg-white text-primary-600 hover:bg-slate-50 px-6 py-3 rounded-xl font-medium transition-colors shadow-sm inline-flex items-center gap-2 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Go to My Classes
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="font-display text-3xl font-semibold text-emerald-600 mb-1">{approvedPacks}</div>
            <div className="text-slate-800 font-medium text-sm">Packs Unlocked</div>
            <div className="text-slate-500 text-xs mt-1">Approved lesson packs</div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="font-display text-3xl font-semibold text-blue-600 mb-1">{pendingCount}</div>
            <div className="text-slate-800 font-medium text-sm">Pending Payments</div>
            <div className="text-slate-500 text-xs mt-1">Needs approval</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div className="font-display text-3xl font-semibold text-amber-600 mb-1">{latestResult ? `${latestResult.marks}/${latestResult.totalMarks}` : '—'}</div>
            <div className="text-slate-800 font-medium text-sm">Latest Quiz Score</div>
            <div className="text-slate-500 text-xs mt-1">Last exam</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="font-display text-3xl font-semibold text-indigo-600 mb-1">Active</div>
            <div className="text-slate-800 font-medium text-sm">Access Status</div>
            <div className="text-slate-500 text-xs mt-1">Currently enrolled</div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* Upcoming / Live Class */}
            {liveClass ? (
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden flex flex-col relative ring-2 ring-red-100">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <div className="bg-red-50 px-6 py-3 flex items-center gap-2 border-b border-red-100">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-red-600 text-xs font-bold tracking-wide uppercase">Live Now</span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-slate-900 mb-4">{liveClass.title}</h3>
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Happening Right Now
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-500">
                      Join quickly before it ends!
                    </div>
                    <a href={liveClass.link} target="_blank" rel="noopener noreferrer" className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Join Class
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-primary-600 px-6 py-3 flex items-center gap-2">
                  <span className="text-white text-xs font-semibold tracking-wide uppercase">Upcoming Classes</span>
                </div>
                <div className="p-8 text-center text-slate-500">
                  <p>No active live classes right now.</p>
                </div>
              </div>
            )}

            {/* Recent Materials */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Recently Added Materials</h3>
                <Link to="/student/materials" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
              </div>
              <div className="p-2">
                {recentMaterials.length > 0 ? recentMaterials.map((mat) => (
                  <Link 
                    key={mat._id} 
                    to="/student/materials" 
                    state={{
                      targetPackId: mat.lessonPackId,
                      targetTab: mat.type === 'pdf' ? 'Documents' : 
                                 mat.type === 'live-link' ? 'Live' : 'Videos',
                      targetMaterialId: mat._id
                    }}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform
                        ${(mat.type === 'yt-video' || mat.type === 'video') ? 'bg-primary-50 text-primary-600' : 
                          mat.type === 'pdf' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                        {(mat.type === 'yt-video' || mat.type === 'video') && <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                        {mat.type === 'pdf' && <span className="text-base">📄</span>}
                        {mat.type === 'live-link' && <span className="text-base">🔴</span>}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs">{mat.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(mat.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                )) : (
                  <div className="text-center py-6 text-slate-500 text-sm">No recent materials found.</div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="w-full lg:w-1/3 space-y-6">
            
            {/* Payment Status */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Payment Status</h3>
              </div>
              <div className="p-6">
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.slice(0, 4).map(p => (
                      <div key={p._id} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{p.lessonPackId?.title || 'Unknown Pack'}</span>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${p.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : p.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No payment records found.</p>
                )}
                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <Link to="/student/payment" className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Submit new payment
                  </Link>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-display font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-slate-300 text-sm mb-4">Having trouble with payments or accessing materials? Contact our support team.</p>
                <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-white/10 w-full">
                  Contact Support
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
