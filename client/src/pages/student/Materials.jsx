import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import Hls from 'hls.js';

function getYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function Materials() {
  const [selectedPack, setSelectedPack] = useState(null);
  const [materials,  setMaterials]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [accessMsg,  setAccessMsg]  = useState('');
  const [myPayments, setMyPayments] = useState([]);
  const [lessonPacks, setLessonPacks] = useState([]);
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  const playerRef = useRef(null);
  const hlsRef = useRef(null);
  const videoContainerRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    api.get('/payments/my').then(r => setMyPayments(r.data.payments || [])).catch(() => {});
    api.get('/lesson-packs').then(r => setLessonPacks(r.data.packs || [])).catch(() => {});
  }, []);

  // Handle auto-selection of the initial study pack based on dashboard state or first approved pack
  useEffect(() => {
    if (lessonPacks.length === 0) return;
    if (selectedPack) return; // Prevent overwriting user selections

    if (location.state?.targetPackId) {
      const foundPack = lessonPacks.find(p => p._id.toString() === location.state.targetPackId.toString());
      if (foundPack) {
        setSelectedPack(foundPack);
        fetchMaterials(foundPack._id, foundPack.title);
        if (location.state.targetTab) {
          setActiveTab(location.state.targetTab);
        }
        return;
      }
    }

    // Fallback 1: auto-select the first approved pack
    if (myPayments && myPayments.length > 0) {
      const approvedPackIds = myPayments
        .filter(p => p.status === 'approved' && p.lessonPackId)
        .map(p => p.lessonPackId._id || p.lessonPackId);
        
      const firstApprovedPack = lessonPacks.find(pack => {
        const idStr = pack._id.toString();
        return approvedPackIds.some(apId => (apId._id || apId).toString() === idStr);
      });
      if (firstApprovedPack) {
        setSelectedPack(firstApprovedPack);
        fetchMaterials(firstApprovedPack._id, firstApprovedPack.title);
        return;
      }
    }

    // Fallback 2: select the first lesson pack in the list
    const firstPack = lessonPacks[0];
    if (firstPack) {
      setSelectedPack(firstPack);
      fetchMaterials(firstPack._id, firstPack.title);
    }
  }, [lessonPacks, myPayments, location.state]);

  // Auto-select the target video from dashboard state, or fallback to the first video when materials load/change
  useEffect(() => {
    if (location.state?.targetMaterialId) {
      const targetMat = materials.find(m => m._id.toString() === location.state.targetMaterialId.toString());
      if (targetMat && (targetMat.type === 'yt-video' || targetMat.type === 'video')) {
        setActiveVideo(targetMat);
        return;
      }
    }

    const firstVideo = materials.find(m => m.type === 'yt-video' || m.type === 'video');
    if (firstVideo) {
      setActiveVideo(firstVideo);
    } else {
      setActiveVideo(null);
    }
  }, [materials, location.state]);

  useEffect(() => {
    // 1. Clean up existing player & HLS instances
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error('Error destroying player:', e);
      }
      playerRef.current = null;
    }
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch (e) {
        console.error('Error destroying HLS:', e);
      }
      hlsRef.current = null;
    }

    if (!activeVideo || !videoContainerRef.current) return;

    // 2. Empty the container to remove any old player remnants
    videoContainerRef.current.innerHTML = '';

    // 3. Create the appropriate media element
    if (activeVideo.type === 'yt-video') {
      const ytDiv = document.createElement('div');
      ytDiv.className = 'w-full h-full';
      ytDiv.setAttribute('data-plyr-provider', 'youtube');
      ytDiv.setAttribute('data-plyr-embed-id', getYouTubeId(activeVideo.url));
      videoContainerRef.current.appendChild(ytDiv);

      playerRef.current = new Plyr(ytDiv, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
        settings: ['quality', 'speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
        youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
      });
    } else {
      const videoEl = document.createElement('video');
      videoEl.className = 'w-full h-full object-contain';
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('controls', '');
      videoEl.setAttribute('preload', 'metadata');

      const sourceEl = document.createElement('source');
      const isMux = activeVideo.url && activeVideo.url.includes('stream.mux.com');
      const videoSrc = isMux 
        ? activeVideo.url 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/proxy/video/${activeVideo._id}?token=${localStorage.getItem('educator_token')}`;
      
      sourceEl.setAttribute('src', videoSrc);
      sourceEl.setAttribute('type', isMux ? 'application/x-mpegURL' : 'video/mp4');
      videoEl.appendChild(sourceEl);
      videoContainerRef.current.appendChild(videoEl);

      if (isMux) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(videoSrc);
          hls.attachMedia(videoEl);
          hlsRef.current = hls;

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const availableQualities = hls.levels.map(l => l.height).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => b - a);
            const qualityOptions = [0, ...availableQualities];

            playerRef.current = new Plyr(videoEl, {
              controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
              settings: ['quality', 'speed'],
              speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
              quality: {
                default: 0,
                options: qualityOptions,
                forced: true,
                onChange: (newQuality) => {
                  if (newQuality === 0) {
                    hls.currentLevel = -1; // Auto
                  } else {
                    hls.levels.forEach((level, levelIndex) => {
                      if (level.height === newQuality) {
                        hls.currentLevel = levelIndex;
                      }
                    });
                  }
                }
              }
            });
          });
        } else {
          // Native HLS support (Safari)
          playerRef.current = new Plyr(videoEl, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
            settings: ['speed'],
            speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] }
          });
        }
      } else {
        playerRef.current = new Plyr(videoEl, {
          controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
          settings: ['speed'],
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] }
        });
      }
    }

    // 4. Return clean up function
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error in cleanup destroy:', e);
        }
        playerRef.current = null;
      }
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch (e) {
          console.error('Error in cleanup HLS destroy:', e);
        }
        hlsRef.current = null;
      }
    };
  }, [activeVideo]);

  const fetchMaterials = async (packId, packTitle) => {
    if (!packId) return;
    setLoading(true); setAccessMsg(''); setMaterials([]);
    try {
      const { data } = await api.get(`/materials/student?lessonPackId=${packId}`);
      setMaterials(data.materials || []);
    } catch (err) {
      if (err.response?.data?.accessDenied) {
        setAccessMsg(`Payment for ${packTitle} is not yet approved. Please submit your slip and wait for teacher approval.`);
      } else {
        setAccessMsg(err.response?.data?.message || 'Failed to load materials.');
      }
    } finally { setLoading(false); }
  };

  const handlePackChange = (pack) => {
    setSelectedPack(pack);
    fetchMaterials(pack._id, pack.title);
  };

  const approvedPackIds = myPayments.filter(p => p.status === 'approved' && p.lessonPackId).map(p => p.lessonPackId._id || p.lessonPackId);

  // Filter materials based on Search and Tab
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === 'All' ? true :
      activeTab === 'Videos' ? (m.type === 'yt-video' || m.type === 'video') :
      activeTab === 'Documents' ? m.type === 'pdf' :
      activeTab === 'Live' ? m.type === 'live-link' : true;
    return matchesSearch && matchesTab;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up pb-12">
        
        {/* Header Banner - Light Blue Theme */}
        <div className="bg-[#eff2fc] rounded-[24px] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between shadow-sm border border-indigo-50">
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-800 mb-2">My Learning Space</h1>
            <p className="text-slate-600 font-medium text-sm md:text-base max-w-lg mb-6">
              Access your unlocked video lessons, live class recordings, and study notes here.
            </p>
          </div>
          
          {/* Header Decorative Elements */}
          <div className="hidden md:block absolute right-0 bottom-0 top-0 w-1/3 pointer-events-none">
             <div className="absolute inset-0 bg-gradient-to-l from-indigo-100/30 to-transparent" />
             <div className="absolute right-10 bottom-4 text-8xl drop-shadow-2xl opacity-90">
               🧑‍🎓
             </div>
             <svg className="absolute top-0 right-0 text-indigo-200/50 w-64 h-64 transform translate-x-1/4 -translate-y-1/4" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
               <path fill="currentColor" d="M45.7,-76.4C58.9,-69.3,69,-56.3,77.7,-42.5C86.4,-28.7,93.6,-14.3,92.5,-0.6C91.4,13.1,82,26.2,72.7,38C63.4,49.8,54.1,60.4,41.9,68.1C29.7,75.8,14.8,80.7,0.3,80.2C-14.2,79.7,-28.4,73.8,-41.7,66C-55,58.2,-67.4,48.5,-75.4,35.6C-83.4,22.7,-87.1,6.5,-84.3,-8.6C-81.5,-23.7,-72.2,-37.7,-60.6,-48.5C-49,-59.3,-35.1,-66.8,-21.2,-71.4C-7.3,-76,6.6,-77.7,21.1,-75.8C35.6,-73.9,50.1,-68.4,45.7,-76.4Z" transform="translate(100 100)" />
             </svg>
          </div>
        </div>

        {/* Pack selector */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Select a Study Pack</h3>
          <div className="flex flex-wrap gap-3">
            {lessonPacks.map(pack => {
              const isApproved = approvedPackIds.includes(pack._id);
              const isSelected = selectedPack?._id === pack._id;
              return (
                <button key={pack._id} onClick={() => handlePackChange(pack)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center gap-2
                    ${isSelected ? 'bg-[#597ef7] border-[#597ef7] text-white shadow-md shadow-[#597ef7]/20 transform -translate-y-0.5' :
                    isApproved  ? 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100' :
                    'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 cursor-not-allowed'}`}>
                  {pack.title}
                  {isApproved && <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-current text-[10px]">✓</span>}
                  {!isApproved && <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-400"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>}
                </button>
              );
            })}
            
            {lessonPacks.length === 0 && (
               <span className="text-slate-400 text-sm italic py-2">No lesson packs available.</span>
            )}
          </div>
        </div>

        {/* Loading & Messages */}
        {loading && (
          <div className="flex items-center justify-center h-48 bg-white rounded-[24px] border border-slate-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-[#597ef7] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {accessMsg && (
          <div className="p-10 rounded-[24px] bg-red-50/50 border border-red-100 text-center shadow-sm">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-red-400 mx-auto mb-4 border border-red-100 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="font-display font-bold text-xl text-slate-800 mb-2">Content Locked</h3>
            <p className="text-sm font-medium text-slate-600 max-w-md mx-auto">{accessMsg}</p>
          </div>
        )}

        {!loading && !accessMsg && selectedPack && materials.length === 0 && (
          <div className="text-center bg-white border border-slate-100 shadow-sm rounded-[24px] py-20">
            <span className="text-5xl opacity-50 block mb-3">📭</span>
            <p className="text-slate-700 font-bold text-lg">No materials uploaded yet.</p>
            <p className="text-slate-500 text-sm mt-1">Check back later for updates on {selectedPack.title}.</p>
          </div>
        )}

        {/* Materials Display */}
        {!loading && !accessMsg && selectedPack && materials.length > 0 && (
          <div className="space-y-6">
            
            {/* Cinematic Theater Video Player Section */}
            {activeVideo && (
              <div id="video-theater" className="bg-slate-900 rounded-[28px] overflow-hidden shadow-2xl border border-slate-800 p-4 md:p-6 text-white relative animate-fade-in">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner relative group border border-slate-800">
                  <div ref={videoContainerRef} className="w-full h-full" />
                </div>
                
                {/* Info Under Player */}
                <div className="mt-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#597ef7]/20 text-[#85a5ff] border border-[#597ef7]/30 uppercase tracking-wider">
                        {activeVideo.type === 'yt-video' ? 'YouTube Stream' : 'Secured Mux Stream'}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1.5">{activeVideo.title}</h2>
                    </div>
                    <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Date Published</p>
                      <p className="text-sm font-semibold text-slate-200 mt-0.5">{new Date(activeVideo.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {activeVideo.description && (
                    <p className="text-slate-300 text-sm max-w-4xl leading-relaxed pt-3 border-t border-slate-800">
                      {activeVideo.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col mt-4">
              
              {/* Tab Navigation */}
              <div className="flex items-center gap-6 px-8 border-b border-slate-100 overflow-x-auto hide-scrollbar">
                {['All', 'Videos', 'Documents', 'Live'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 py-5 border-b-2 font-bold text-sm whitespace-nowrap transition-colors
                      ${activeTab === tab ? 'border-[#597ef7] text-[#597ef7]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  >
                    {tab === 'All' && <span className="text-lg">📚</span>}
                    {tab === 'Videos' && <span className="text-lg">📹</span>}
                    {tab === 'Documents' && <span className="text-lg">📄</span>}
                    {tab === 'Live' && <span className="text-lg">🔴</span>}
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-8 bg-slate-50/30">
                
                {/* Search Bar */}
                <div className="mb-8 max-w-md relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search materials by title..." 
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#597ef7] focus:border-[#597ef7] outline-none transition-all shadow-sm"
                  />
                  <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {filteredMaterials.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                    <p className="text-slate-500 text-sm font-medium">No materials match your search.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredMaterials.map(m => (
                      <div key={m._id} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col group hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
                        
                        {/* Top section: Icon & Title */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-sm
                            ${(m.type === 'yt-video' || m.type === 'video') ? 'bg-[#eff2fc] text-[#597ef7]' : 
                              m.type === 'pdf' ? 'bg-[#eff2fc] text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                            {(m.type === 'yt-video' || m.type === 'video') && <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                            {m.type === 'pdf' && <span className="text-xl">📄</span>}
                            {m.type === 'live-link' && <span className="text-xl">🔴</span>}
                          </div>
                          <div className="flex-1 mt-1">
                            <h4 className="font-bold text-slate-800 text-base mb-1 line-clamp-2 group-hover:text-[#597ef7] transition-colors">
                              {m.title}
                            </h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {(m.type === 'yt-video' || m.type === 'video') ? 'Video Lesson' : m.type === 'pdf' ? 'Document' : 'Live Class'}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {m.description && (
                          <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">{m.description}</p>
                        )}

                        {/* Video Thumbnail Cover */}
                        {(m.type === 'yt-video' || m.type === 'video') && (
                           <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 mb-4 shadow-sm border border-slate-100 relative group/thumb cursor-pointer"
                             onClick={() => {
                               setActiveVideo(m);
                               document.getElementById('video-theater')?.scrollIntoView({ behavior: 'smooth' });
                             }}
                           >
                             {m.type === 'yt-video' ? (
                               <img 
                                 src={`https://img.youtube.com/vi/${getYouTubeId(m.url)}/hqdefault.jpg`} 
                                 alt={m.title}
                                 className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                               />
                             ) : m.url && m.url.includes('stream.mux.com') ? (
                               <img 
                                 src={`https://image.mux.com/${m.url.match(/stream\.mux\.com\/([^/.]+)/)?.[1]}/thumbnail.png?width=640&height=360&fit_mode=preserve`} 
                                 alt={m.title}
                                 className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                               />
                             ) : (
                               <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
                                 <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-500/20">
                                   <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                 </div>
                                 <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Secured Video Lesson</span>
                               </div>
                             )}
                             
                             {/* Hover Play Overlay */}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                               <div className="w-12 h-12 rounded-full bg-white/95 text-[#597ef7] flex items-center justify-center transform scale-90 group-hover/thumb:scale-100 transition-all shadow-lg">
                                 <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                               </div>
                             </div>
                           </div>
                        )}

                        {/* Bottom Action Area */}
                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-slate-400 text-xs font-medium bg-slate-50 px-2.5 py-1 rounded-md">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </span>
                          
                          {m.type === 'pdf' && (
                            <a href={m.url} target="_blank" rel="noopener noreferrer" download
                               className="text-sm font-bold text-[#597ef7] bg-[#eff2fc] hover:bg-[#597ef7] hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                              Download
                            </a>
                          )}

                          {m.type === 'live-link' && (
                            <a href={m.url} target="_blank" rel="noopener noreferrer"
                               className="text-sm font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                              Join Live
                            </a>
                          )}

                          {(m.type === 'yt-video' || m.type === 'video') && (
                            <button 
                              onClick={() => {
                                setActiveVideo(m);
                                document.getElementById('video-theater')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2
                                ${activeVideo?._id === m._id 
                                  ? 'bg-[#597ef7] text-white' 
                                  : 'bg-[#eff2fc] text-[#597ef7] hover:bg-[#597ef7] hover:text-white'}`}
                            >
                              {activeVideo?._id === m._id ? 'Now Playing' : 'Watch Video'}
                            </button>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
