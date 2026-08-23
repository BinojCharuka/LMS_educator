import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public
const Landing = lazy(() => import('./pages/Landing'));
const Login   = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Student
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const PaymentUpload    = lazy(() => import('./pages/student/PaymentUpload'));
const Materials        = lazy(() => import('./pages/student/Materials'));
const Results          = lazy(() => import('./pages/student/Results'));
const ResourceLibrary  = lazy(() => import('./pages/student/ResourceLibrary'));
const CourseCatalog    = lazy(() => import('./pages/student/CourseCatalog'));

// Teacher
const TeacherDashboard  = lazy(() => import('./pages/teacher/TeacherDashboard'));
const ContentManager    = lazy(() => import('./pages/teacher/ContentManager'));
const PaymentApprovals  = lazy(() => import('./pages/teacher/PaymentApprovals'));
const ResultManager     = lazy(() => import('./pages/teacher/ResultManager'));
const StudentManager    = lazy(() => import('./pages/teacher/StudentManager'));
const ResourceManager   = lazy(() => import('./pages/teacher/ResourceManager'));
const AnnouncementManager = lazy(() => import('./pages/teacher/AnnouncementManager'));
const LessonPackManager = lazy(() => import('./pages/teacher/LessonPackManager'));
const SystemSettings    = lazy(() => import('./pages/teacher/SystemSettings'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManager    = lazy(() => import('./pages/admin/UserManager'));
const ActivityLog    = lazy(() => import('./pages/admin/ActivityLog'));

const FallbackLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const InitLoader = () => {
  const location = useLocation();
  useEffect(() => {
    // If not on the landing page, we don't need to wait for a hero image to load
    // so we instantly clear the global preloader.
    if (location.pathname !== '/') {
      window.dispatchEvent(new Event('app-ready'));
    }
  }, [location.pathname]);
  return null;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <InitLoader />
        <Suspense fallback={<FallbackLoader />}>
          <Routes>
            {/* ── Public routes ────────────────────────────────── */}
            <Route path="/"        element={<Landing />} />
            <Route path="/login"   element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Student routes ───────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student"           element={<StudentDashboard />} />
              <Route path="/student/courses"   element={<CourseCatalog />} />
              <Route path="/student/payment"   element={<PaymentUpload />} />
              <Route path="/student/materials" element={<Materials />} />
              <Route path="/student/resources" element={<ResourceLibrary />} />
              <Route path="/student/results"   element={<Results />} />
            </Route>

            {/* ── Teacher routes ───────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher"           element={<TeacherDashboard />} />
              <Route path="/teacher/content"   element={<ContentManager />} />
              <Route path="/teacher/resources" element={<ResourceManager />} />
              <Route path="/teacher/payments"  element={<PaymentApprovals />} />
              <Route path="/teacher/results"   element={<ResultManager />} />
              <Route path="/teacher/students"  element={<StudentManager />} />
              <Route path="/teacher/announcements" element={<AnnouncementManager />} />
              <Route path="/teacher/packs" element={<LessonPackManager />} />
              <Route path="/teacher/settings" element={<SystemSettings />} />
            </Route>

            {/* ── Admin routes ─────────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin"       element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManager />} />
              <Route path="/admin/shield" element={<ActivityLog />} />
            </Route>

            {/* ── Fallback ─────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
