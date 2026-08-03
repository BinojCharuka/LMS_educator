import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public
import Landing from './pages/Landing';
import Login   from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import PaymentUpload    from './pages/student/PaymentUpload';
import Materials        from './pages/student/Materials';
import Results          from './pages/student/Results';
import ResourceLibrary  from './pages/student/ResourceLibrary';
import CourseCatalog    from './pages/student/CourseCatalog';

// Teacher
import TeacherDashboard  from './pages/teacher/TeacherDashboard';
import ContentManager    from './pages/teacher/ContentManager';
import PaymentApprovals  from './pages/teacher/PaymentApprovals';
import ResultManager     from './pages/teacher/ResultManager';
import StudentManager    from './pages/teacher/StudentManager';
import ResourceManager   from './pages/teacher/ResourceManager';
import AnnouncementManager from './pages/teacher/AnnouncementManager';
import LessonPackManager from './pages/teacher/LessonPackManager';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManager    from './pages/admin/UserManager';
import ActivityLog    from './pages/admin/ActivityLog';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}
