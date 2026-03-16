import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/BookingForm.css';

const BookingForm = ({ worker, onSuccess, onCancel }) => {
  const { api } = useAuth();
  const [formData, setFormData] = useState({
    serviceDetails: '',
    scheduledDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.serviceDetails.trim()) {
      setError('Please describe the service needed');
      return;
    }

    if (!formData.scheduledDate) {
      setError('Please select a date');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/bookings', {
        workerId: worker._id,
        serviceDetails: formData.serviceDetails,
        scheduledDate: formData.scheduledDate,
      });

      setSuccess('Booking request sent successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-overlay">
      <div className="booking-form-container">
        <button className="close-btn" onClick={onCancel}>×</button>
        
        <h2>Book {worker.name}</h2>
        <p className="worker-skill">{worker.skill}</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="serviceDetails">Service Details *</label>
            <textarea
              id="serviceDetails"
              name="serviceDetails"
              value={formData.serviceDetails}
              onChange={handleChange}
              placeholder="Describe the service you need..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="scheduledDate">Preferred Date & Time *</label>
            <input
              type="datetime-local"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Booking...' : 'Submit Booking'}
            </button>
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
