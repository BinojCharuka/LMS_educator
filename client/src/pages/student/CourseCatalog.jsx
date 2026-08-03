import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function CourseCatalog() {
  const [lessonPacks, setLessonPacks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState(null);
  const [previewMaterials, setPreviewMaterials] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [teacherFilter, setTeacherFilter] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packRes, payRes] = await Promise.all([
          api.get('/lesson-packs'),
          api.get('/payments/my')
        ]);
        setLessonPacks(packRes.data.packs || []);
        setPayments(payRes.data.payments || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openPreview = async (pack) => {
    setSelectedPack(pack);
    setLoadingPreview(true);
    setPreviewMaterials([]);
    try {
      const { data } = await api.get(`/materials/preview/${pack._id}`);
      setPreviewMaterials(data.materials || []);
    } catch (err) {
      console.error('Failed to load preview', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setSelectedPack(null);
    setPreviewMaterials([]);
  };

  const getPaymentStatus = (packId) => {
    const payment = payments.find(p => p.lessonPackId && p.lessonPackId._id === packId);
    return payment ? payment.status : null; // 'approved', 'pending', 'rejected', or null
  };

  const handlePayNow = (packId) => {
    // Navigate to payment upload with preselected packId
    navigate(`/student/payment?pack=${packId}`);
  };

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const filteredPacks = lessonPacks.filter(pack => {
    const matchesSearch = pack.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (pack.description && pack.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    // Determine exam
    let exam = 'Other';
    if (pack.title.toUpperCase().includes('A/L')) exam = 'A/L';
    else if (pack.title.toUpperCase().includes('O/L')) exam = 'O/L';
    const matchesExam = examFilter === 'All' ? true : exam === examFilter;
    
    // Determine category
    let category = 'General';
    if (pack.title.toUpperCase().includes('ICT') || pack.title.toUpperCase().includes('NETWORKING') || pack.title.toUpperCase().includes('LOGIC')) {
      category = 'ICT';
    }
    const matchesCat = catFilter === 'All' ? true : category === catFilter;
    
    // Teacher matches dynamically
    const teacherName = pack.createdBy?.name || 'Amila Abeysinghe';
    const matchesTeacher = teacherFilter === 'All' ? true : teacherName === teacherFilter;
    
    return matchesSearch && matchesExam && matchesCat && matchesTeacher;
  });

  const uniqueTeachers = ['All', ...new Set(lessonPacks.map(p => p.createdBy?.name || 'Amila Abeysinghe').filter(Boolean))];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Banner Area */}
        <div className="bg-[#eff2fc] rounded-[24px] p-8 md:p-10 relative overflow-hidden flex items-center justify-between shadow-sm border border-indigo-50/50">
          <div className="relative z-10 max-w-xl">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-800 mb-2">Study Packs</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="hover:text-indigo-600 cursor-pointer">Home</span>
              <span>•</span>
              <span className="text-slate-800 font-medium">Study Packs</span>
            </div>
          </div>
          {/* Decorative Elements replacing the 3D illustration */}
          <div className="hidden md:flex absolute right-12 bottom-0 top-0 items-center justify-center pointer-events-none">
             <div className="w-32 h-32 bg-indigo-200/50 rounded-full blur-3xl absolute right-10" />
             <div className="w-24 h-24 bg-purple-200/50 rounded-full blur-2xl absolute right-0 top-4" />
             <div className="relative w-40 h-40 flex items-center justify-center text-7xl drop-shadow-2xl opacity-90 transform rotate-12">
               ⭐
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="font-display font-bold text-xl text-slate-800">Study Packs</h2>
            
            {/* Filter Dropdowns (Custom premium dropdowns) */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Study Packs" 
                  className="w-full md:w-64 pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                />
              </div>

              {/* Exam Filter */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'exam' ? null : 'exam')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-colors flex items-center gap-2 cursor-pointer min-w-[100px] justify-between"
                >
                  <span>{examFilter === 'All' ? 'Exam' : examFilter}</span>
                  <svg className={`w-4 h-4 text-slate-500 transition-transform ${activeDropdown === 'exam' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {activeDropdown === 'exam' && (
                  <div className="absolute z-30 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-lg py-1 left-0">
                    {['All', 'A/L', 'O/L', 'Other'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { setExamFilter(option); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${examFilter === option ? 'text-primary-600 font-semibold bg-primary-50/50' : 'text-slate-600'}`}
                      >
                        {option === 'All' ? 'All Exams' : option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-colors flex items-center gap-2 cursor-pointer min-w-[120px] justify-between"
                >
                  <span>{catFilter === 'All' ? 'Category' : catFilter}</span>
                  <svg className={`w-4 h-4 text-slate-500 transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {activeDropdown === 'category' && (
                  <div className="absolute z-30 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-lg py-1 left-0">
                    {['All', 'ICT', 'General'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { setCatFilter(option); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${catFilter === option ? 'text-primary-600 font-semibold bg-primary-50/50' : 'text-slate-600'}`}
                      >
                        {option === 'All' ? 'All Categories' : option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Teacher Filter */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'teacher' ? null : 'teacher')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-colors flex items-center gap-2 cursor-pointer min-w-[120px] justify-between"
                >
                  <span>{teacherFilter === 'All' ? 'Teacher' : teacherFilter.split(' ')[0]}</span>
                  <svg className={`w-4 h-4 text-slate-500 transition-transform ${activeDropdown === 'teacher' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {activeDropdown === 'teacher' && (
                  <div className="absolute z-30 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-lg py-1 left-0">
                    {uniqueTeachers.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => { setTeacherFilter(option); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${teacherFilter === option ? 'text-primary-600 font-semibold bg-primary-50/50' : 'text-slate-600'}`}
                      >
                        {option === 'All' ? 'All Teachers' : option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPacks.map(pack => {
              const status = getPaymentStatus(pack._id);
              const isApproved = status === 'approved';
              const isPending = status === 'pending';

              return (
                <div key={pack._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden group">
                  {/* Top Image Section */}
                  <div className="relative h-44 bg-gradient-to-br from-indigo-500 to-purple-600">
                    {pack.imageUrl ? (
                      <img src={pack.imageUrl} alt={pack.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 group-hover:scale-105 transition-transform duration-700">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    
                    {/* Floating Price Tag */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-white/50">
                      {pack.price > 0 ? `Rs. ${pack.price}` : 'Free'}
                    </div>

                    {/* Teacher Avatar overlapping edge */}
                    <div className="absolute -bottom-5 left-5 w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                       <span className="text-sm">👨‍🏫</span>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-5 pt-8 flex flex-col flex-grow bg-white">
                    <div className="mb-3">
                      <span className="inline-block bg-slate-100/80 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {pack.createdBy?.name || 'Amila Abeysinghe'}
                      </span>
                    </div>
                    
                    <h3 className="font-display text-lg font-bold text-slate-900 line-clamp-2 mb-4 group-hover:text-indigo-600 transition-colors">
                      {pack.title}
                    </h3>
                    
                    <div className="mt-auto flex flex-col gap-2">
                      {isApproved ? (
                        <button onClick={() => navigate('/student/materials')} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
                          View Study Pack
                        </button>
                      ) : isPending ? (
                        <button disabled className="w-full bg-amber-50 text-amber-600 border border-amber-200 text-sm font-semibold py-2.5 rounded-xl cursor-not-allowed">
                          Payment Pending
                        </button>
                      ) : (
                        <>
                          <button onClick={() => openPreview(pack)} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-bold py-2.5 rounded-xl transition-colors">
                            Buy Now ( 30 Days )
                          </button>
                          <button onClick={() => openPreview(pack)} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
                            View Study Pack
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredPacks.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <span className="text-3xl opacity-50">📚</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700">No Study Packs Found</h3>
                <p className="text-slate-500 mt-1 text-sm">
                  {lessonPacks.length === 0 
                    ? 'Check back later for new lesson packs.' 
                    : 'Try adjusting your search query or filters.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Redesigned Preview Modal */}
      {selectedPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-slate-50 rounded-[32px] shadow-2xl w-full max-w-5xl max-h-full overflow-y-auto flex flex-col relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
            
            {/* Close Button */}
            <button onClick={closePreview} className="absolute top-6 right-6 z-20 bg-white/50 hover:bg-white backdrop-blur-md text-slate-500 hover:text-slate-800 p-2 rounded-full transition-all shadow-sm border border-slate-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Header Section */}
            <div className="bg-[#eff2fc] rounded-[24px] m-4 p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between shadow-sm border border-indigo-50">
              
              {/* Header Content */}
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-800">{selectedPack.title}</h2>
                  <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    ID: {selectedPack._id.slice(-4)}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mb-8 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">👨‍🏫</span> {selectedPack.createdBy?.name || 'Amila Abeysinghe'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">📅</span> {new Date().getFullYear()}AL
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-indigo-50/80 text-indigo-500 border border-indigo-200 font-semibold px-6 py-2.5 rounded-xl text-sm shadow-sm backdrop-blur-sm">
                    Purchase study pack to access content
                  </div>
                  <button 
                    onClick={() => handlePayNow(selectedPack._id)}
                    className="bg-[#597ef7] hover:bg-indigo-500 text-white font-bold px-10 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20"
                  >
                    Buy
                  </button>
                  {getPaymentStatus(selectedPack._id) === 'rejected' && (
                    <span className="text-xs font-bold text-red-500 ml-2 bg-red-50 px-3 py-2 rounded-lg border border-red-100">Payment Rejected</span>
                  )}
                  {getPaymentStatus(selectedPack._id) === 'pending' && (
                    <span className="text-xs font-bold text-amber-500 ml-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">Payment Pending</span>
                  )}
                </div>
              </div>

              {/* Header Decorative Elements */}
              <div className="hidden md:block absolute right-0 bottom-0 top-0 w-1/3 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-l from-indigo-100/30 to-transparent" />
                <div className="absolute right-10 bottom-6 text-8xl drop-shadow-2xl opacity-90 transform -rotate-6">
                  👩‍💻
                </div>
                {/* Abstract shape */}
                <svg className="absolute top-4 right-10 text-orange-400/20 w-48 h-48 transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            {/* Main Modal Body */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm mx-4 mb-4 flex-grow flex flex-col overflow-hidden">
              
              {/* Tab Navigation */}
              <div className="flex items-center gap-8 px-8 border-b border-slate-100 bg-white">
                <button className="flex items-center gap-2 py-4 border-b-2 border-[#597ef7] text-[#597ef7] font-bold text-sm">
                  <span className="text-lg">🎓</span> Lessons
                </button>
                <button className="flex items-center gap-2 py-4 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">
                  <span className="text-lg">📄</span> Tutes
                </button>
              </div>

              {/* Content Area */}
              <div className="p-8 bg-white flex-grow">
                
                {/* Search Bar */}
                <div className="mb-8 max-w-sm">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search by Topic" 
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#597ef7] focus:border-[#597ef7] outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Lessons Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {loadingPreview ? (
                     <div className="col-span-full flex justify-center py-12">
                       <div className="w-8 h-8 border-4 border-[#597ef7] border-t-transparent rounded-full animate-spin" />
                     </div>
                  ) : previewMaterials.length > 0 ? (
                    previewMaterials.map(m => (
                      <div key={m._id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-100 hover:shadow-md transition-all group">
                        
                        {/* Play Icon Box */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105
                          ${m.type === 'yt-video' ? 'bg-[#eff2fc] text-[#597ef7]' : 'bg-slate-50 text-slate-400'}`}>
                          {m.type === 'yt-video' ? (
                            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                          ) : (
                            <span className="text-lg">📄</span>
                          )}
                        </div>
                        
                        {/* Text Info */}
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-sm mb-0.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {m.title}
                          </h4>
                          <p className="text-slate-500 text-xs font-medium">Purchase Study Pack to access</p>
                        </div>
                        
                        {/* Lock Icon */}
                        <div className="w-10 h-8 bg-slate-100/80 border border-slate-200/50 text-slate-400 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                      <div className="text-4xl mb-3 opacity-50">📭</div>
                      <h4 className="font-semibold text-slate-700">No lessons available yet</h4>
                      <p className="text-sm text-slate-500 mt-1">Materials will appear here once added by the teacher.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
