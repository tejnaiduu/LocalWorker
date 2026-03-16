import { useState, useEffect } from 'react';
import axios from 'axios';
import WorkerCard from './WorkerCard';
import './WorkerList.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function WorkerList() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  useEffect(() => {
    fetchWorkers('');
  }, []);

  const fetchWorkers = async (skill) => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE_URL}/api/workers`;
      if (skill) {
        url = `${API_BASE_URL}/api/workers/skill/${skill}`;
      }
      const response = await axios.get(url);
      setWorkers(response.data);
    } catch (err) {
      setError('Failed to fetch workers. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillFilter = (skill) => {
    setSelectedSkill(skill);
    fetchWorkers(skill);
  };

  const handleShowAll = () => {
    setSelectedSkill('');
    fetchWorkers('');
  };

  return (
    <div className="worker-list-container">
      <div className="skills-filter">
        <h3>Filter by Skill</h3>
        <div className="skill-buttons">
          <button
            className={`skill-btn ${selectedSkill === '' ? 'active' : ''}`}
            onClick={handleShowAll}
          >
            All Workers
          </button>
          <button
            className={`skill-btn ${selectedSkill === 'plumber' ? 'active' : ''}`}
            onClick={() => handleSkillFilter('plumber')}
          >
            🔧 Plumber
          </button>
          <button
            className={`skill-btn ${selectedSkill === 'electrician' ? 'active' : ''}`}
            onClick={() => handleSkillFilter('electrician')}
          >
            ⚡ Electrician
          </button>
          <button
            className={`skill-btn ${selectedSkill === 'carpenter' ? 'active' : ''}`}
            onClick={() => handleSkillFilter('carpenter')}
          >
            🪵 Carpenter
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading">Loading workers...</div>
      ) : workers.length === 0 ? (
        <div className="no-workers">
          <p>No workers found for this skill.</p>
        </div>
      ) : (
        <div className="workers-grid">
          {workers.map(worker => (
            <WorkerCard key={worker._id} worker={worker} />
          ))}
        </div>
      )}
    </div>
  );
}
