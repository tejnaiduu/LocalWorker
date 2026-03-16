import './UIComponents.css';

function StatusBadge({ status }) {
  if (status === 'available') {
    return <span className="status-badge available">🟢 Available</span>;
  }
  return <span className="status-badge busy">🔴 Busy</span>;
}

export default StatusBadge;
