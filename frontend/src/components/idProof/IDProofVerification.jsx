import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../pages/admin/AdminPages.css';

const IDProofVerification = () => {
  const { api } = useAuth();
  const [pendingProofs, setPendingProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingProofs();
  }, []);

  const fetchPendingProofs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/idproofs/pending');
      setPendingProofs(response.data.workers || []);
      setError('');
    } catch (err) {
      setError('Failed to load pending ID proofs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workerId) => {
    if (window.confirm('Approve this ID proof?')) {
      try {
        await api.put(`/admin/idproofs/${workerId}/approve`);
        setSuccess('ID proof approved successfully');
        fetchPendingProofs();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to approve ID proof');
      }
    }
  };

  const handleReject = async (workerId) => {
    if (window.confirm('Reject this ID proof? It will be removed.')) {
      try {
        await api.put(`/admin/idproofs/${workerId}/reject`);
        setSuccess('ID proof rejected and removed');
        fetchPendingProofs();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to reject ID proof');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading ID proofs...</div>;
  }

  return (
    <div className="admin-page">
      <h2>ID Proof Verification</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {pendingProofs.length > 0 ? (
        <div className="verification-cards">
          {pendingProofs.map((worker) => (
            <div key={worker._id} className="verification-card">
              <div className="card-header">
                <div>
                  <h3>{worker.userId?.name || 'N/A'}</h3>
                  <p className="worker-skill">{worker.skill}</p>
                </div>
                <span className="status-badge pending">Pending</span>
              </div>

              <div className="card-content">
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{worker.userId?.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{worker.userId?.phone || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">ID Proof File:</span>
                  <span className="value">{worker.idProof}</span>
                </div>
                <div className="info-row">
                  <span className="label">Location:</span>
                  <span className="value">{worker.location || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Experience:</span>
                  <span className="value">
                    {worker.experience ? `${worker.experience} years` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(worker._id)}
                >
                   Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReject(worker._id)}
                >
                   Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          <p> No pending ID proofs to verify</p>
        </div>
      )}
    </div>
  );
};

export default IDProofVerification;




