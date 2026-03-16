import { useState, useEffect } from 'react';
import axios from 'axios';
import RatingStars from '../rating/RatingStars';
import StatusBadge from '../shared/StatusBadge';
import './WorkerDetails.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function WorkerDetails({ worker: initialWorker, workerId, onClose }) {
  const [worker, setWorker] = useState(initialWorker || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(!initialWorker);
  const [error, setError] = useState('');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/workers/${workerId}`);
        setWorker(response.data);
      } catch (err) {
        setError('Failed to fetch worker details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (workerId && !initialWorker) {
      fetchWorker();
    }
  }, [workerId, initialWorker]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!worker) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/reviews/${worker._id}`);
        setReviews(response.data.reviews || []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };

    fetchReviews();
  }, [worker]);

  const handleCall = () => {
    window.location.href = `tel:${worker.phone}`;
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${worker.phone.replace(/\D/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) return <div className="modal-overlay"><div className="modal-content loading">Loading...</div></div>;
  if (error) return <div className="modal-overlay"><div className="modal-content alert error">{error}</div></div>;
  if (!worker) return <div className="modal-overlay"><div className="modal-content alert error">Worker not found</div></div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="details-header">
          <div className="header-info">
            <h2>{worker.name}</h2>
            {worker.isVerified && <span className="verified-badge">✅ Verified</span>}
            {worker.status && <StatusBadge status={worker.status} />}
          </div>
        </div>

        {/* Rating Section */}
        <div className="worker-rating-section">
          {worker.averageRating > 0 ? (
            <>
              <div className="rating-card">
                <div className="rating-display">
                  <div className="rating-stars-large">
                    {'⭐'.repeat(Math.floor(worker.averageRating))}
                    {worker.averageRating % 1 > 0 && '✨'}
                  </div>
                  <div className="rating-info">
                    <div className="rating-value">{worker.averageRating.toFixed(1)}</div>
                    <div className="rating-label">out of 5 stars</div>
                    <div className="review-count">Based on {worker.totalReviews} review{worker.totalReviews !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-rating-card">
              <div className="no-rating-icon">⭐</div>
              <div className="no-rating-text">No ratings yet</div>
              <div className="no-rating-subtitle">Be the first to rate this worker</div>
            </div>
          )}
        </div>

        <div className="details-info">
          <p><strong>Skill:</strong> {worker.skill.charAt(0).toUpperCase() + worker.skill.slice(1)}</p>
          <p><strong>Experience:</strong> {worker.experience} years</p>
          <p><strong>Location:</strong> {worker.location}</p>
          <p><strong>Phone:</strong> {worker.phone}</p>
        </div>

        <div className="action-buttons">
          <button className="btn-call" onClick={handleCall}>📞 Call</button>
          <button className="btn-whatsapp" onClick={handleWhatsApp}>💬 WhatsApp</button>
        </div>

        <div className="reviews-section">
          <h3>Customer Reviews {reviews.length > 0 && `(${reviews.length})`}</h3>
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((rev) => (
                <div key={rev._id} className="review-item">
                  <div className="review-header">
                    <div className="review-meta">
                      <strong className="reviewer-name">{rev.userId.name}</strong>
                      <span className="review-date">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <span className="review-rating">{'⭐'.repeat(rev.rating)}</span>
                  </div>
                  {rev.review && <p className="review-text">{rev.review}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
