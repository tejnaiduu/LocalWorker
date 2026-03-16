import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminDashboard() {
  const { api, user } = useAuth();
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

  if (loading) {
    return <div className="admin-dashboard"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👷</div>
          <div className="stat-content">
            <h3>Total Workers</h3>
            <p className="stat-number">{stats.totalWorkers}</p>
          </div>
        </div>

        <div className="stat-card verified">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Verified Workers</h3>
            <p className="stat-number">{stats.verifiedWorkers}</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Verification</h3>
            <p className="stat-number">{stats.pendingWorkers}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-box">
          <h3>📝 Quick Summary</h3>
          <ul>
            <li>Total customers: <strong>{stats.totalUsers}</strong></li>
            <li>Total workers registered: <strong>{stats.totalWorkers}</strong></li>
            <li>Verified workers: <strong>{stats.verifiedWorkers}</strong> ({stats.totalWorkers > 0 ? ((stats.verifiedWorkers / stats.totalWorkers) * 100).toFixed(0) : 0}%)</li>
            <li>Pending verification: <strong>{stats.pendingWorkers}</strong></li>
          </ul>
        </div>

        <div className="info-box">
          <h3>⚡ Quick Actions</h3>
          <p>Navigate using the sidebar menu to:</p>
          <ul>
            <li>✅ Verify workers and manage their status</li>
            <li>👷 View and manage all workers</li>
            <li>👥 View and manage all customers</li>
            <li>🔍 Monitor worker compliance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
