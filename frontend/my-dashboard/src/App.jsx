import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProfilePage from './pages/ProfilePage';
import SurveysPage from './pages/SurveysPage';
import AssistantPage from './pages/AssistantPage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children, adminOnly = false, employeeOnly = false }) {
  const { user, isAdmin } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  if (employeeOnly && isAdmin) return <Navigate to="/admin" replace />;

  return children;
}

function AppRoutes() {
  const { user, isAdmin } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={isAdmin ? '/admin' : '/'} replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <ProtectedRoute employeeOnly>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="courses"
          element={
            <ProtectedRoute employeeOnly>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="courses/:id"
          element={
            <ProtectedRoute employeeOnly>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute employeeOnly>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="surveys"
          element={
            <ProtectedRoute employeeOnly>
              <SurveysPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="assistant"
          element={
            <ProtectedRoute employeeOnly>
              <AssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
