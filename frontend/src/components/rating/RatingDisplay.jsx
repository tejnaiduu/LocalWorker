import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './RatingDisplay.css';

const RatingDisplay = ({ workerId, averageRating = 0, totalReviews = 0 }) => {
  const { api } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatings, setShowRatings] = useState(false);

  useEffect(() => {
    if (showRatings) {
      fetchRatings();
    }
  }, [showRatings, workerId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ratings/worker/${workerId}`);
      setRatings(response.data.ratings || []);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (stars) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= stars ? 'filled' : 'empty'}`}
          >
            
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="rating-display">
      <div className="rating-summary">
        {renderStars(averageRating)}
        <div className="rating-info">
          <span className="average-rating">{averageRating.toFixed(1)}</span>
          <span className="review-count">({totalReviews} reviews)</span>
        </div>
      </div>

      <button
        className="view-reviews-btn"
        onClick={() => setShowRatings(!showRatings)}
      >
        {showRatings ? 'Hide Reviews' : 'View Reviews'}
      </button>

      {showRatings && (
        <div className="reviews-container">
          {loading ? (
            <p>Loading reviews...</p>
          ) : ratings.length > 0 ? (
            <div className="reviews-list">
              {ratings.map((rating) => (
                <div key={rating._id} className="review-item">
                  <div className="review-header">
                    {renderStars(rating.stars)}
                    <span className="review-date">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.review && (
                    <p className="review-text">{rating.review}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">No reviews yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;





