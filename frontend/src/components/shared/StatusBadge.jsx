import './UIComponents.css';

function StatusBadge({ status }) {
  const getStatusClass = () => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'available';
      case 'busy':
        return 'busy';
      case 'requested':
        return 'requested';
      case 'accepted':
        return 'accepted';
      case 'completed':
        return 'completed';
      case 'rejected':
        return 'rejected';
      default:
        return 'available';
    }
  };

  const getStatusLabel = () => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'requested':
        return 'Requested';
      case 'accepted':
        return 'Accepted';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {getStatusLabel()}
    </span>
  );
}

export default StatusBadge;
