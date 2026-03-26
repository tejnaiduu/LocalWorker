import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

function WorkerVerification() {
  const { api } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingWorkers();
  }, []);

  const fetchPendingWorkers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/workers/verify-pending');
      setWorkers(response.data.workers || response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workerId) => {
    try {
      setError('');
      setSuccess('');
      await api.put(`/admin/workers/verify/${workerId}`);
      setSuccess('Worker verified and approved successfully!');
      fetchPendingWorkers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve worker');
    }
  };

  const handleReject = async (workerId) => {
    if (window.confirm('Are you sure you want to reject this worker? This cannot be undone.')) {
      try {
        setError('');
        setSuccess('');
        await api.put(`/admin/workers/reject/${workerId}`);
        setSuccess('Worker rejected');
        fetchPendingWorkers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to reject worker');
      }
    }
  };

  if (loading) {
    return <div className="admin-page"><p>Loading workers...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1> Worker Verification</h1>
        <span className="badge">{workers.length} Pending</span>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {workers.length === 0 ? (
        <div className="empty-state">
          <p> All workers have been verified!</p>
        </div>
      ) : (
        <div className="workers-list">
          {workers.map((worker) => (
            <div key={worker._id} className="worker-card verification-card">
              <div className="worker-info">
                <h3>{worker.userId?.name || 'N/A'}</h3>
                <div className="worker-details">
                  <p><strong>Email:</strong> {worker.userId?.email}</p>
                  <p><strong>Phone:</strong> {worker.userId?.phone}</p>
                  <p><strong>Skill:</strong> {worker.skill || 'N/A'}</p>
                  <p><strong>Experience:</strong> {worker.experience || 0} years</p>
                  <p><strong>Location:</strong> {worker.location || 'N/A'}</p>
                </div>
              </div>

              {worker.idProof && (
                <div className="id-proof">
                  <p><strong>ID Proof:</strong></p>
                  <a href={worker.idProof} target="_blank" rel="noopener noreferrer" className="id-proof-link">
                     View Document
                  </a>
                </div>
              )}

              <div className="action-buttons">
                <button 
                  className="btn btn-approve"
                  onClick={() => handleApprove(worker._id)}
                >
                   Approve
                </button>
                <button 
                  className="btn btn-reject"
                  onClick={() => handleReject(worker._id)}
                >
                   Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkerVerification;




