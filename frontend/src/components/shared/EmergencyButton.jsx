import { useState } from 'react';
import './UIComponents.css';

function EmergencyButton({ skill, onSearch }) {
  const [searching, setSearching] = useState(false);

  const skillEmojis = {
    electrician: '⚡',
    plumber: '🚰',
    carpenter: '🪵',
  };

  const handleEmergencyClick = async () => {
    setSearching(true);
    try {
      await onSearch();
    } finally {
      setSearching(false);
    }
  };

  const emoji = skillEmojis[skill] || '⚡';
  const skillLabel = skill.charAt(0).toUpperCase() + skill.slice(1);

  return (
    <button
      className="emergency-button"
      onClick={handleEmergencyClick}
      disabled={searching}
    >
      {searching ? (
        <>
          <span className="spinner"></span>
          Searching...
        </>
      ) : (
        <>
          {emoji} Need {skillLabel} NOW
        </>
      )}
    </button>
  );
}

export default EmergencyButton;
