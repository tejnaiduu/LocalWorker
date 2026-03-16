import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RatingForm.css';

const RatingForm = ({ booking, workerName, onSuccess, onCancel }) => {
  const { api } = useAuth();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const response = await api.post('/ratings', {
        workerId: booking.workerId,
        bookingId: booking._id,
        stars: rating,
        review: review.trim(),
      });

      setSuccess('Rating submitted successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStarInput = () => {
    return (
      <div className="star-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className="star-label">
            <input
              type="radio"
              name="rating"
              value={star}
              checked={rating === star}
              onChange={() => setRating(star)}
            />
            <span className={`star ${star <= rating ? 'filled' : 'empty'}`}>
              ★
            </span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="rating-form-overlay">
      <div className="rating-form-container">
        <button className="close-btn" onClick={onCancel}>×</button>
        
        <h2>Rate {workerName}</h2>
        <p className="form-subtitle">How was your experience?</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating *</label>
            {renderStarInput()}
            <p className="rating-label">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="review">Review (Optional)</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience... (max 500 characters)"
              rows="4"
              maxLength="500"
            />
            <p className="char-count">{review.length}/500</p>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Skip for Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingForm;
