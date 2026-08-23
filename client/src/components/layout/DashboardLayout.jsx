import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Icons (inline SVG for zero deps) ─────────────────────────────────────────
const icons = {
  home:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  book:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  payment: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  chart:   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  users:   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  upload:  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  logout:  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  bell:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  menu:    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  close:   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  content: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  shield:  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  settings: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

// ── Navigation config per role ────────────────────────────────────────────────
const navConfig = {
  student: [
    { to: '/student',          label: 'Dashboard',  icon: icons.home },
    { to: '/student/courses',  label: 'Browse Courses', icon: icons.users },
    { to: '/student/payment',  label: 'Pay & Upload', icon: icons.payment },
    { to: '/student/materials',label: 'My Materials', icon: icons.book },
    { to: '/student/resources',label: 'Resource Library', icon: icons.book },
    { to: '/student/results',  label: 'My Results',  icon: icons.chart },
  ],
  teacher: [
    { to: '/teacher',           label: 'Overview',       icon: icons.home },
    { to: '/teacher/packs',     label: 'Lesson Packs',   icon: icons.book },
    { to: '/teacher/content',   label: 'Content Manager',icon: icons.content },
    { to: '/teacher/resources', label: 'Resource Manager',icon: icons.book },
    { to: '/teacher/payments',  label: 'Payment Approvals', icon: icons.payment },
    { to: '/teacher/results',   label: 'Results',        icon: icons.chart },
    { to: '/teacher/students',  label: 'Students',       icon: icons.users },
    { to: '/teacher/announcements', label: 'Announcements', icon: icons.bell },
    { to: '/teacher/settings',  label: 'System Settings', icon: icons.settings },
  ],
  admin: [
    { to: '/admin',       label: 'Overview',      icon: icons.home },
    { to: '/admin/users', label: 'User Management', icon: icons.users },
    { to: '/admin/shield',label: 'Activity Log',   icon: icons.shield },
    { to: '/admin/settings', label: 'System Settings', icon: icons.settings },
  ],
};

const roleColors = {
  student: 'text-teal-400',
  teacher: 'text-violet-400',
  admin:   'text-amber-400',
};

const roleBadge = {
  student: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  teacher: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  admin:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

// ── Sidebar Component ─────────────────────────────────────────────────────────
function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="font-display font-bold text-slate-900 text-lg tracking-tight">Educator</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 lg:hidden">
            {icons.close}
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${roleBadge[user?.role]}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/${user?.role}`}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-600 hover:text-red-700 hover:bg-red-50">
          {icons.logout}
          Logout
        </button>
      </div>
    </aside>
  );
}

// ── Dashboard Layout (Sidebar Layout) ──────────────────────────────────────────────────────────
import api from '../../api/axios';
import { useEffect } from 'react';

export default function DashboardLayout({ children }) {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Profile Settings States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [announcements, setAnnouncements] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (profileOpen && user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePassword('');
      setProfileError('');
      setProfileSuccess('');
      setIsEditingProfile(false);
    }
  }, [profileOpen, user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const payload = {
        name: profileName,
        email: profileEmail
      };
      if (profilePassword.trim()) {
        payload.password = profilePassword;
      }
      const { data } = await api.put('/auth/profile', payload);
      if (data.success) {
        setProfileSuccess('Profile updated successfully!');
        setIsEditingProfile(false);
        await refreshUser();
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'student' || user?.role === 'teacher') {
      fetchAnnouncements();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/announcements/${id}/read`);
      setAnnouncements(prev => prev.map(ann => 
        ann._id === id ? { ...ann, readBy: [...(ann.readBy || []), user._id] } : ann
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadAnnouncements = announcements.filter(a => !a.readBy?.includes(user?._id));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static lg:block transition-transform duration-300 w-64 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header (Mobile menu trigger & Profile) */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              {icons.menu}
            </button>
            <span className="text-slate-500 font-medium hidden sm:block">
              {user?.role === 'student' ? 'Student Portal' : user?.role === 'teacher' ? 'Teacher Portal' : 'Admin Portal'}
            </span>
          </div>

          <div className="flex items-center gap-4">


            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-colors hidden sm:block ${showNotifications ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                {icons.bell}
                {unreadAnnouncements.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-full shadow-sm">{unreadAnnouncements.length} Unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {announcements.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No announcements yet.</div>
                    ) : (
                      announcements.map((ann) => {
                        const isRead = ann.readBy?.includes(user?._id);
                        return (
                          <div 
                            key={ann._id} 
                            onClick={() => !isRead && markAsRead(ann._id)}
                            className={`p-4 border-b border-slate-50 transition-colors ${isRead ? 'opacity-60 bg-white' : 'bg-blue-50/50 hover:bg-blue-50 cursor-pointer'}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-sm text-slate-900">{ann.title}</h4>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                                {new Date(ann.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">{ann.message}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs select-none">
                  {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1.5 animate-fade-in-up origin-top-right">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setProfileOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors flex items-center gap-2.5"
                    >
                      <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      View Profile
                    </button>
                    
                    <div className="border-t border-slate-100 my-1" />
                    
                    <button 
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Global Profile Modal Dialog */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden relative animate-scale-up">
            
            {/* Header backdrop gradient */}
            <div className="h-28 bg-gradient-to-r from-primary-500 to-violet-600 relative">
              <button 
                onClick={() => setProfileOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Avatar block */}
            <div className="absolute top-14 left-6">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white font-bold text-2xl shadow-md select-none">
                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
              </div>
            </div>
            
            {/* Body */}
            <div className="pt-12 pb-6 px-6">
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold text-slate-800 leading-tight">
                  {isEditingProfile ? 'Edit Profile' : user?.name}
                </h2>
                <span className="inline-block mt-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {user?.role} account
                </span>
              </div>
              
              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4 border-t border-slate-100 pt-5">
                  {profileError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                      {profileError}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Full Name</label>
                    <input 
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">New Password</label>
                    <input 
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-2 pt-2">
                    <button 
                      type="button"
                      disabled={profileLoading}
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={profileLoading}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary-500/10 cursor-pointer"
                    >
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3.5 border-t border-slate-100 pt-5">
                  {profileSuccess && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold px-3 py-2.5 rounded-xl mb-4">
                      {profileSuccess}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Email Address</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Unique User ID</p>
                    <p className="text-xs font-mono text-slate-600 mt-0.5 bg-slate-50 p-1.5 rounded border border-slate-100 truncate">{user?._id || user?.id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Access Role</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5 capitalize">{user?.role || 'N/A'}</p>
                  </div>

                  <div className="mt-6 flex justify-between items-center pt-2">
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit Details
                    </button>
                    <button 
                      onClick={() => setProfileOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
