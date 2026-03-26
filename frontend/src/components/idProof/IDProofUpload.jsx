import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './IDProofUpload.css';

const IDProofUpload = ({ onClose }) => {
  const { api } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workerData, setWorkerData] = useState(null);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    try {
      const response = await api.get('/workers/me');
      if (response.data) {
        setWorkerData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch worker data:', err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload JPG, PNG, or PDF only.');
        setFile(null);
        return;
      }

      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setFile(null);
        return;
      }

      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('idProof', file);

      const response = await api.post('/idproof/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.message);
      setFile(null);
      // Reset input
      const fileInput = document.getElementById('idProofFile');
      if (fileInput) fileInput.value = '';

      // Refresh worker data
      fetchWorkerData();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to upload ID proof'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="idproof-upload-container">
      <h2>Upload ID Proof</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {workerData?.idProof && (
        <div className="current-proof-section">
          <h3>Current Upload Status</h3>
          <div className="proof-status">
            <p>
              <strong>File:</strong> {workerData.idProof}
            </p>
            <p>
              <strong>Approval Status:</strong>{' '}
              <span
                className={`approval-badge ${
                  workerData.idProofApproved ? 'approved' : 'pending'
                }`}
              >
                {workerData.idProofApproved ? ' Approved' : ' Pending Approval'}
              </span>
            </p>
          </div>

          {workerData.idProofApproved && (
            <div className="approval-message">
              <p> Your ID proof has been verified and approved by admin.</p>
            </div>
          )}

          {!workerData.idProofApproved && (
            <div className="pending-message">
              <p>Your ID proof is waiting for admin approval. You can upload a new one to replace it.</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="idProofFile" className="file-label">
            <div className="file-input-wrapper">
              <div className="file-icon"></div>
              <p className="label-text">
                {file ? (
                  <>
                    <strong>{file.name}</strong>
                    <br />
                    <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                  </>
                ) : (
                  <>
                    <strong>Choose File</strong>
                    <br />
                    <small>
                      JPG, PNG, or PDF (Max 5MB)
                    </small>
                  </>
                )}
              </p>
            </div>
            <input
              type="file"
              id="idProofFile"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="form-info">
          <p> Accepted formats: JPG, PNG, PDF</p>
          <p> Maximum file size: 5MB</p>
          <p> Admin approval required before profile display</p>
        </div>

        <button
          type="submit"
          className="upload-btn"
          disabled={!file || loading}
        >
          {loading ? 'Uploading...' : 'Upload ID Proof'}
        </button>

        {success && (
          <div className="additional-actions">
            <button
              type="button"
              className="close-btn"
              onClick={() => onClose && onClose()}
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        {onClose && !success && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onClose()}
          >
            Skip for Now
          </button>
        )}
      </form>
    </div>
  );
};

export default IDProofUpload;





