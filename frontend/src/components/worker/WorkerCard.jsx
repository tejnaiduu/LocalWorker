import './WorkerCard.css';
import StatusBadge from '../shared/StatusBadge';
import RatingStars from '../rating/RatingStars';

const getSkillEmoji = (skill) => {
  const emojis = {
    plumber: '🔧',
    electrician: '⚡',
    carpenter: '🪵'
  };
  return emojis[skill] || '👷';
};

export default function WorkerCard({ worker, onClick }) {
  // Don't display workers with incomplete profiles
  if (!worker.skill || !worker.experience || !worker.phone || !worker.location) {
    return null;
  }

  const handleCall = () => {
    window.location.href = `tel:${worker.phone}`;
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${worker.phone.replace(/\D/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="worker-card" onClick={onClick}>
      <div className="worker-header">
        <div className="skill-emoji">{getSkillEmoji(worker.skill)}</div>
        <div className="header-content">
          <h3>{worker.name || 'Worker'}</h3>
          {worker.isVerified && <span className="verified-badge">✅ Verified</span>}
        </div>
      </div>

      {worker.status && <StatusBadge status={worker.status} />}
      
      <div className="rating-section">
        {worker.averageRating > 0 ? (
          <RatingStars rating={worker.averageRating} reviews={worker.totalReviews} />
        ) : (
          <div className="no-rating">⭐ No ratings yet</div>
        )}
      </div>

      <div className="worker-details">
        <div className="detail-row">
          <span className="label">Skill:</span>
          <span className="value">{worker.skill ? worker.skill.charAt(0).toUpperCase() + worker.skill.slice(1) : 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="label">Experience:</span>
          <span className="value">{worker.experience || 'N/A'} years</span>
        </div>
        <div className="detail-row">
          <span className="label">Location:</span>
          <span className="value">{worker.location || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="label">Phone:</span>
          <span className="value">{worker.phone || 'N/A'}</span>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-call" onClick={(e) => { e.stopPropagation(); handleCall(); }}>
          📞 Call
        </button>
        <button className="btn-whatsapp" onClick={(e) => { e.stopPropagation(); handleWhatsApp(); }}>
          💬 WhatsApp
        </button>
      </div>
    </div>
  );
}
