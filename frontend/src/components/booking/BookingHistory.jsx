import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RatingForm from '../rating/RatingForm';
import './BookingHistory.css';

const BookingHistory = () => {
  const { api } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [workerReviews, setWorkerReviews] = useState({}); // Store reviews by workerId
  const [expandedBookings, setExpandedBookings] = useState({}); // Track which bookings show reviews

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      if (response.data && response.data.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkerReviews = async (workerId) => {
    if (workerReviews[workerId]) {
      return; // Already fetched
    }
    try {
      const response = await api.get(`/reviews/${workerId}`);
      setWorkerReviews((prev) => ({
        ...prev,
        [workerId]: response.data.reviews || [],
      }));
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const toggleReviews = async (bookingId, workerId) => {
    setExpandedBookings((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
    if (!expandedBookings[bookingId]) {
      await fetchWorkerReviews(workerId);
    }
  };

  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    return bookings.filter((b) => b.status === filter);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/bookings/${bookingId}`);
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        );
      } catch (err) {
        alert('Failed to cancel booking');
      }
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    if (window.confirm('Mark this booking as completed?')) {
      try {
        await api.put(`/bookings/${bookingId}`, { status: 'completed' });
        const updatedBooking = bookings.find((b) => b._id === bookingId);
        if (updatedBooking) {
          setSelectedBooking({ ...updatedBooking, status: 'completed' });
          setShowRatingForm(true);
        }
      } catch (err) {
        alert('Failed to complete booking');
      }
    }
  };

  const handleRatingSuccess = () => {
    setShowRatingForm(false);
    setSelectedBooking(null);
    fetchBookings();
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: 'status-requested',
      accepted: 'status-accepted',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return colors[status] || '';
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  if (showRatingForm && selectedBooking) {
    return (
      <RatingForm
        booking={selectedBooking}
        workerName={selectedBooking.workerId.name}
        onSuccess={handleRatingSuccess}
        onCancel={() => setShowRatingForm(false)}
      />
    );
  }

  return (
    <div className="booking-history-container">
      <h1>Your Bookings</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-section">
        <button
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={
            filter === 'requested' ? 'filter-btn active' : 'filter-btn'
          }
          onClick={() => setFilter('requested')}
        >
          Pending
        </button>
        <button
          className={filter === 'accepted' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('accepted')}
        >
          Accepted
        </button>
        <button
          className={
            filter === 'completed' ? 'filter-btn active' : 'filter-btn'
          }
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button
          className={
            filter === 'cancelled' ? 'filter-btn active' : 'filter-btn'
          }
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.workerId.name}</h3>
                <span className={`status-badge ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </span>
              </div>

              {/* Worker Rating Display */}
              <div className="booking-worker-rating">
                {booking.workerId.averageRating > 0 ? (
                  <div className="worker-rating-info">
                    <div className="rating-stars">
                      {''.repeat(Math.floor(booking.workerId.averageRating))}
                      {booking.workerId.averageRating % 1 > 0 && ''}
                    </div>
                    <div className="rating-text">
                      <strong>{booking.workerId.averageRating.toFixed(1)}</strong>
                      <span> / 5</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-rating-yet"> No ratings yet</div>
                )}
              </div>

              <div className="booking-details">
                <p>
                  <strong>Skill:</strong> {booking.workerId.skill}
                </p>
                <p>
                  <strong>Service:</strong> {booking.serviceDetails}
                </p>
                <p>
                  <strong>Scheduled:</strong>{' '}
                  {new Date(booking.scheduledDate).toLocaleString()}
                </p>
                {booking.completedAt && (
                  <p>
                    <strong>Completed:</strong>{' '}
                    {new Date(booking.completedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Reviews Section */}
              {expandedBookings[booking._id] && (
                <div className="booking-reviews-section">
                  <h4>Customer Reviews ({workerReviews[booking.workerId._id]?.length || 0})</h4>
                  {workerReviews[booking.workerId._id] && workerReviews[booking.workerId._id].length > 0 ? (
                    <div className="reviews-list">
                      {workerReviews[booking.workerId._id].map((review, idx) => (
                        <div key={idx} className="review-item-booking">
                          <div className="review-header-booking">
                            <span className="review-rating">{''.repeat(review.rating)}</span>
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="review-text">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-reviews-yet">No reviews for this worker yet</p>
                  )}
                </div>
              )}

              <div className="booking-actions">
                {booking.status === 'requested' && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel
                  </button>
                )}
                {booking.status === 'accepted' && (
                  <>
                    <button
                      className="complete-btn"
                      onClick={() => handleCompleteBooking(booking._id)}
                    >
                      Mark Complete
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === 'completed' && (
                  <button
                    className="rate-btn"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowRatingForm(true);
                    }}
                  >
                    Rate Worker
                  </button>
                )}
                <button
                  className="reviews-toggle-btn"
                  onClick={() => toggleReviews(booking._id, booking.workerId._id)}
                >
                  {expandedBookings[booking._id] ? ' Hide Reviews' : ' View Reviews'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-bookings">No bookings found</p>
      )}
    </div>
  );
};

export default BookingHistory;





