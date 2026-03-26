import { Navigate, Route, Routes } from 'react-router-dom';
import BookingHistory from '../components/booking/BookingHistory';
import IDProofUpload from '../components/idProof/IDProofUpload';
import WorkerBrowser from '../components/worker/WorkerBrowser';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminRegister from '../pages/admin/AdminRegister';
import IDProofVerification from '../pages/admin/IDProofVerification';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageWorkers from '../pages/admin/ManageWorkers';
import WorkerVerification from '../pages/admin/WorkerVerification';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import HomePage from '../pages/home/HomePage';
import CompleteWorkerProfile from '../pages/worker/CompleteWorkerProfile';
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import { ProtectedAdminRoute, ProtectedRoute } from './RouteGuards';

function AppRoutes() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', background: '#1E3A5F', color: 'white' }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/complete-profile" element={<ProtectedRoute><CompleteWorkerProfile /></ProtectedRoute>} />
      <Route path="/customer-dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer-dashboard/find-workers" element={<ProtectedRoute><WorkerBrowser /></ProtectedRoute>} />
      <Route path="/customer-dashboard/my-bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
      <Route path="/worker-dashboard" element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>} />
      <Route path="/worker-dashboard/id-proof" element={<ProtectedRoute><IDProofUpload /></ProtectedRoute>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="verification" element={<WorkerVerification />} />
        <Route path="idproof-verification" element={<IDProofVerification />} />
        <Route path="workers" element={<ManageWorkers />} />
        <Route path="users" element={<ManageUsers />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : user?.role === 'worker' ? (
              <Navigate to="/worker-dashboard" replace />
            ) : (
              <Navigate to="/customer-dashboard" replace />
            )
          ) : (
            <HomePage />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
