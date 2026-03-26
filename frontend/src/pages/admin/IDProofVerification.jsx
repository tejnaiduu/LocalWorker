import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

const IDProofVerification = () => {
  const { api } = useAuth();
  const [pendingProofs, setPendingProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    fetchPendingProofs();
  }, []);

  const fetchPendingProofs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/idproofs/pending');
      
      // Debug logging
      console.log('API Response:', response.data);
      console.log('Workers count:', response.data.workers?.length || 0);
      
      setPendingProofs(response.data.workers || []);
    } catch (err) {
      console.error('Error fetching proofs:', err);
      setError(`Failed to load pending ID proofs: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkDatabaseDebug = async () => {
    try {
      const response = await api.get('/debug/check/pending-proofs');
      setDebugInfo(response.data);
      console.log('Debug Info:', response.data);
    } catch (err) {
      console.error('Debug check failed:', err);
      setDebugInfo({ error: err.message });
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
        console.error('Approval error:', err);
        setError(`Failed to approve ID proof: ${err.response?.data?.error || err.message}`);
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
        console.error('Rejection error:', err);
        setError(`Failed to reject ID proof: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  const handleViewIDProof = (filename) => {
    if (!filename) {
      alert('No ID proof file available');
      return;
    }
    // Open ID proof in new window
    window.open(
      `http://localhost:5000/api/admin/idproofs/view/${filename}`,
      '_blank'
    );
  };

  if (loading) {
    return <div className="loading">Loading ID proofs...</div>;
  }

  return (
    <div className="admin-page">
      <h2>ID Proof Verification</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Debug Panel - Only visible for testing */}
      <div style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            backgroundColor: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showDebug ? ' Hide Debug' : ' Show Debug'}
        </button>
      </div>

      {showDebug && (
        <div style={{
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          fontSize: '12px',
          color: '#374151',
        }}>
          <h3 style={{ marginTop: 0, color: '#111827' }}> Debug Information</h3>
          <p><strong>Current Pending Proofs:</strong> {pendingProofs.length}</p>
          <button 
            onClick={checkDatabaseDebug}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Check Database
          </button>
          
          {debugInfo && (
            <pre style={{
              backgroundColor: '#FFFFFF',
              padding: '12px',
              borderRadius: '4px',
              marginTop: '12px',
              overflowX: 'auto',
              fontSize: '11px',
            }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          )}

          <details style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer', color: '#2563EB', fontWeight: 'bold' }}>
               Troubleshooting Tips
            </summary>
            <ul style={{ fontSize: '11px', marginTop: '8px' }}>
              <li>If "pendingCount: 0"  No workers have uploaded ID proofs yet</li>
              <li>If workers list is empty  Check if any worker profiles exist</li>
              <li>If API errors  Check backend logs and admin auth token</li>
              <li>If "N/A" shown for names  Backend not returning populated userId data</li>
            </ul>
          </details>
        </div>
      )}

      {pendingProofs.length > 0 ? (
        <div className="verification-cards">
          {pendingProofs.map((worker) => (
            <div key={worker._id} className="verification-card">
              <div className="card-header">
                <div>
                  <h3>{worker.userId?.name || 'N/A'}</h3>
                  <p className="worker-skill">{worker.skill || 'N/A'}</p>
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
                  <span className="value">{worker.idProof || 'N/A'}</span>
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
                <div className="info-row">
                  <span className="label">Submitted:</span>
                  <span className="value">
                    {worker.createdAt ? new Date(worker.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="view-btn"
                  onClick={() => handleViewIDProof(worker.idProof)}
                >
                   View ID Proof
                </button>
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
          {!showDebug && (
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px' }}>
              Click "Show Debug" button above to check if this is expected
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default IDProofVerification;





