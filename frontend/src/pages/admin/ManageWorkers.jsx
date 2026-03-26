import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

function ManageWorkers() {
  const { api } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/workers');
      setWorkers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker? This action cannot be undone.')) {
      try {
        setError('');
        setSuccess('');
        await api.delete(`/admin/workers/${workerId}`);
        setSuccess('Worker deleted successfully');
        fetchWorkers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete worker');
      }
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    if (filterVerified === 'all') return true;
    if (filterVerified === 'verified') return worker.verified;
    if (filterVerified === 'unverified') return !worker.verified;
    return true;
  });

  if (loading) {
    return <div className="admin-page"><p>Loading workers...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1> Manage Workers</h1>
        <span className="badge">{workers.length} Total</span>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="filter-bar">
        <select 
          value={filterVerified} 
          onChange={(e) => setFilterVerified(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Workers</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="empty-state">
          <p>No workers found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Skill</th>
                <th>Experience</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker._id}>
                  <td className="worker-name">
                    <strong>{worker.userId?.name || 'N/A'}</strong>
                  </td>
                  <td>{worker.userId?.email}</td>
                  <td>{worker.userId?.phone}</td>
                  <td>
                    <span className="skill-badge">{worker.skill || 'N/A'}</span>
                  </td>
                  <td>{worker.experience || 0} yrs</td>
                  <td>
                    <span className="rating">
                      {"".repeat(Math.floor(worker.averageRating || 0))}
                      {worker.averageRating ? ` ${worker.averageRating.toFixed(1)}` : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${worker.verified ? 'verified' : 'unverified'}`}>
                      {worker.verified ? ' Verified' : ' Pending'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-icon delete-btn"
                      onClick={() => handleDelete(worker._id)}
                      title="Delete Worker"
                    >
                       Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageWorkers;




