import { useState } from 'react';
import './UIComponents.css';

function EmergencyButton({ skill, onSearch }) {
  const [searching, setSearching] = useState(false);

  const skillConfig = {
    electrician: { icon: '⚡', label: 'Electrician' },
    plumber: { icon: '🔧', label: 'Plumber' },
    carpenter: { icon: '🪚', label: 'Carpenter' },
  };

  const handleEmergencyClick = async () => {
    setSearching(true);
    try {
      await onSearch();
    } finally {
      setSearching(false);
    }
  };

  const config = skillConfig[skill] || { icon: '⚡', label: skill };

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
          {config.icon} Need {config.label} NOW
        </>
      )}
    </button>
  );
}

export default EmergencyButton;
