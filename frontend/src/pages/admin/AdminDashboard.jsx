import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminDashboard() {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    verifiedWorkers: 0,
    pendingWorkers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  // SVG Icons
  const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );

  const WorkerIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="20" y1="8" x2="20" y2="14"></line>
      <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>
  );

  const VerifiedIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );

  const PendingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );

  const verificationPercentage = stats.totalWorkers > 0 
    ? ((stats.verifiedWorkers / stats.totalWorkers) * 100).toFixed(0) 
    : 0;

  if (loading) {
    return <div className="admin-dashboard"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-pill customers">
            <UsersIcon />
          </div>
          <div className="stat-content">
            <h3>Total customers</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-pill workers">
            <WorkerIcon />
          </div>
          <div className="stat-content">
            <h3>Total workers</h3>
            <p className="stat-number">{stats.totalWorkers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-pill verified">
            <VerifiedIcon />
          </div>
          <div className="stat-content">
            <h3>Verified workers</h3>
            <p className="stat-number">{stats.verifiedWorkers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-pill pending">
            <PendingIcon />
          </div>
          <div className="stat-content">
            <h3>Pending verification</h3>
            <p className="stat-number">{stats.pendingWorkers}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-box">
          <h3>Quick Summary</h3>
          <ul>
            <li>
              <span className="label">Total customers</span>
              <span className="value">{stats.totalUsers}</span>
            </li>
            <li>
              <span className="label">Total workers registered</span>
              <span className="value">{stats.totalWorkers}</span>
            </li>
            <li>
              <span className="label">Verified workers</span>
              <span className="value">
                {stats.verifiedWorkers}
                <span className="pill success">({verificationPercentage}%)</span>
              </span>
            </li>
            <li>
              <span className="label">Pending verification</span>
              <span className="value">
                {stats.pendingWorkers}
                {stats.pendingWorkers > 0 && <span className="pill danger">{stats.pendingWorkers}</span>}
              </span>
            </li>
          </ul>
        </div>

        <div className="info-box">
          <h3>Quick Actions</h3>
          <p>Navigate using the sidebar menu to:</p>
          <div className="quick-actions-list">
            <div className="quick-action-item" onClick={() => navigate('/admin/verification')}>
              <span className="quick-action-icon"></span>
              <span className="quick-action-text">Verify workers and manage their status</span>
              <span className="quick-action-arrow"></span>
            </div>
            <div className="quick-action-item" onClick={() => navigate('/admin/workers')}>
              <span className="quick-action-icon"></span>
              <span className="quick-action-text">View and manage all workers</span>
              <span className="quick-action-arrow"></span>
            </div>
            <div className="quick-action-item" onClick={() => navigate('/admin/users')}>
              <span className="quick-action-icon"></span>
              <span className="quick-action-text">View and manage all customers</span>
              <span className="quick-action-arrow"></span>
            </div>
            <div className="quick-action-item" onClick={() => navigate('/admin/idproof-verification')}>
              <span className="quick-action-icon"></span>
              <span className="quick-action-text">Monitor worker compliance</span>
              <span className="quick-action-arrow"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;




