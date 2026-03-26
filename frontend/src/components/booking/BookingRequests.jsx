import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './BookingRequests.css';

const BookingRequests = () => {
  const { api } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('requested');

  // Helper function to render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <span className="stars">
        {'*'.repeat(fullStars)}
        {hasHalfStar && '+'}
        {'-'.repeat(emptyStars)}
      </span>
    );
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/bookings');
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError('Failed to load booking requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      setError('');
      const response = await api.put(`/bookings/${bookingId}`, { status: 'accepted' });
      setSuccess('Booking accepted. Customer will be notified.');
      
      // Update local state
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: 'accepted' } : b
      ));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      setError('');
      const response = await api.put(`/bookings/${bookingId}`, { status: 'rejected' });
      setSuccess('Booking rejected. Customer will be notified.');
      
      // Update local state
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: 'rejected' } : b
      ));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject booking');
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      setError('');
      const response = await api.put(`/bookings/${bookingId}`, { status: 'completed' });
      setSuccess('Booking marked as completed.');
      
      // Update local state
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: 'completed' } : b
      ));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete booking');
    }
  };

  const pendingRequests = bookings.filter(b => b.status === 'requested');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');
  const rejectedBookings = bookings.filter(b => b.status === 'rejected');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  if (loading) {
    return <div className="booking-requests-loading">Loading booking requests...</div>;
  }

  const getDisplayBookings = () => {
    switch (filter) {
      case 'requested':
        return pendingRequests;
      case 'accepted':
        return acceptedBookings;
      case 'completed':
        return completedBookings;
      case 'rejected':
        return rejectedBookings;
      default:
        return pendingRequests;
    }
  };

  const displayBookings = getDisplayBookings();

  return (
    <div className="booking-requests-container">
      <div className="booking-requests-header">
        <h2>Booking Requests</h2>
        <p className="booking-summary">
          <span className="badge pending">{pendingRequests.length} Pending</span>
          <span className="badge accepted">{acceptedBookings.length} Accepted</span>
          <span className="badge completed">{completedBookings.length} Completed</span>
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'requested' ? 'active' : ''}`}
          onClick={() => setFilter('requested')}
        >
          Requested ({pendingRequests.length})
        </button>
        <button
          className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({acceptedBookings.length})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({completedBookings.length})
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({rejectedBookings.length})
        </button>
      </div>

      {displayBookings.length === 0 ? (
        <div className="no-bookings">
          {filter === 'requested' ? (
            <>
              <p>No pending booking requests</p>
              <p className="subtle">Bookings will appear here when customers request your services</p>
            </>
          ) : (
            <p>No {filter} bookings</p>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {displayBookings.map((booking) => (
            <div key={booking._id} className={`booking-card status-${booking.status}`}>
              <div className="booking-card-header">
                <div className="customer-info">
                  <h3>{booking.customerId?.name || 'Unknown Customer'}</h3>
                  <p className="customer-email">{booking.customerId?.email}</p>
                </div>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="booking-card-details">
                <div className="detail-item">
                  <span className="label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Service:
                  </span>
                  <span className="value">{booking.serviceDetails}</span>
                </div>
                <div className="detail-item">
                  <span className="label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Scheduled Date:
                  </span>
                  <span className="value">
                    {new Date(booking.scheduledDate).toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Contact:
                  </span>
                  <span className="value">{booking.customerId?.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Request Date:
                  </span>
                  <span className="value">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Worker's Own Rating Info */}
              <div className="worker-own-rating">
                {booking.workerId?.averageRating > 0 ? (
                  <div className="rating-summary">
                    <div className="rating-badge">
                      <div className="rating-stars">
                        {renderStars(booking.workerId.averageRating)}
                      </div>
                      <div className="rating-details">
                        <strong>{booking.workerId.averageRating.toFixed(1)}</strong>
                        <span className="total-reviews">({booking.workerId.totalReviews} {booking.workerId.totalReviews === 1 ? 'review' : 'reviews'})</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-rating-info">
                    <span className="rating-stars">**---</span>
                    <span>No reviews yet - Build your profile!</span>
                  </div>
                )}
              </div>

              <div className="booking-card-actions">
                {booking.status === 'requested' && (
                  <>
                    <button
                      className="btn-accept"
                      onClick={() => handleAcceptBooking(booking._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleRejectBooking(booking._id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                {booking.status === 'accepted' && (
                  <button
                    className="btn-complete"
                    onClick={() => handleCompleteBooking(booking._id)}
                  >
                    Mark as Completed
                  </button>
                )}
                {booking.status === 'completed' && (
                  <span className="completed-text">Completed</span>
                )}
                {booking.status === 'rejected' && (
                  <span className="rejected-text">Rejected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingRequests;





