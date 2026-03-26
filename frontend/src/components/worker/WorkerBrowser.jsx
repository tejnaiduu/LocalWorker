import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import BookingForm from '../booking/BookingForm';
import RatingDisplay from '../rating/RatingDisplay';
import './WorkerBrowser.css';

const WorkerBrowser = () => {
  const { api } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workers');
      if (response.data && response.data.workers) {
        setWorkers(response.data.workers);
        setFilteredWorkers(response.data.workers);
      }
    } catch (err) {
      setError('Failed to load workers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillFilter = (skill) => {
    setSkillFilter(skill);
    if (skill === 'all') {
      setFilteredWorkers(workers);
    } else {
      setFilteredWorkers(workers.filter(w => w.skill === skill));
    }
  };

  const handleBookClick = (worker) => {
    setSelectedWorker(worker);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedWorker(null);
  };

  if (loading) {
    return <div className="loading">Loading workers...</div>;
  }

  return (
    <div className="worker-browser-container">
      <h1>Find Workers</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-section">
        <h3>Filter by Skill</h3>
        <div className="filter-buttons">
          <button
            className={skillFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleSkillFilter('all')}
          >
            All
          </button>
          <button
            className={skillFilter === 'plumber' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleSkillFilter('plumber')}
          >
            Plumber
          </button>
          <button
            className={skillFilter === 'electrician' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleSkillFilter('electrician')}
          >
            Electrician
          </button>
          <button
            className={skillFilter === 'carpenter' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleSkillFilter('carpenter')}
          >
            Carpenter
          </button>
        </div>
      </div>

      {showBookingForm && selectedWorker ? (
        <BookingForm
          worker={selectedWorker}
          onSuccess={handleBookingSuccess}
          onCancel={() => setShowBookingForm(false)}
        />
      ) : (
        <div className="workers-grid">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker) => (
              <div key={worker._id} className="worker-card">
                <div className="worker-header">
                  <h3>{worker.name || 'Unnamed Worker'}</h3>
                  <div className="skill-badge">{worker.skill}</div>
                </div>

                <div className="worker-info">
                  <p>
                    <strong>Experience:</strong> {worker.experience || 'N/A'} years
                  </p>
                  <p>
                    <strong>Location:</strong> {worker.location || 'N/A'}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span
                      className={`status-badge ${worker.status === 'available' ? 'available' : 'busy'}`}
                    >
                      {worker.status}
                    </span>
                  </p>
                  <p>
                    <strong>Verified:</strong>{' '}
                    <span className="verified-badge">
                      {worker.verified ? ' Verified' : 'Pending Verification'}
                    </span>
                  </p>
                </div>

                <RatingDisplay
                  workerId={worker._id}
                  averageRating={worker.averageRating}
                  totalReviews={worker.totalReviews}
                />

                <button
                  className="book-btn"
                  onClick={() => handleBookClick(worker)}
                  disabled={worker.status === 'busy'}
                >
                  {worker.status === 'busy' ? 'Currently Busy' : 'Book Now'}
                </button>
              </div>
            ))
          ) : (
            <p className="no-workers">No workers found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerBrowser;





