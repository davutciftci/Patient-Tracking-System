import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import SecretaryDashboard from './pages/dashboards/SecretaryDashboard';
import Examinations from './pages/dashboards/Examinations';
import Profile from './pages/dashboards/Profile';
import Appointments from './pages/dashboards/Appointments';
import Clinics from './pages/dashboards/Clinics';
import MyAppointments from './pages/dashboards/MyAppointments';
import MyExaminations from './pages/dashboards/MyExaminations';
import './App.css';

// Redirect authenticated users to their dashboard
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    const dashboardMap: Record<string, string> = {
      patient: '/dashboard/patient',
      doctor: '/dashboard/doctor',
      secretary: '/dashboard/secretary',
    };
    return <Navigate to={dashboardMap[user.role]} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRedirect>
                <Register />
              </AuthRedirect>
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/secretary"
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <SecretaryDashboard />
              </ProtectedRoute>
            }
          />

          {/* Examinations Route - Doctor Only */}
          <Route
            path="/examinations"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Examinations />
              </ProtectedRoute>
            }
          />

          {/* Profile Route - All Authenticated Users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'patient', 'secretary']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Appointments Route - Doctor and Secretary */}
          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'secretary']}>
                <Appointments />
              </ProtectedRoute>
            }
          />

          {/* Clinics Route - Secretary Only */}
          <Route
            path="/clinics"
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <Clinics />
              </ProtectedRoute>
            }
          />

          {/* My Appointments Route - Patient Only */}
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MyAppointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-examinations"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MyExaminations />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

