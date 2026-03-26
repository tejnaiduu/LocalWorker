import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

function ManageUsers() {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        setError('');
        setSuccess('');
        await api.delete(`/admin/users/${userId}`);
        setSuccess('Customer deleted successfully');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete customer');
      }
    }
  };

  if (loading) {
    return <div className="admin-page"><p>Loading users...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1> Manage Users</h1>
        <span className="badge">{users.length} Total</span>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No customers found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="user-name">
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>{user.location || 'N/A'}</td>
                  <td>
                    <small>{new Date(user.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <button 
                      className="btn-icon delete-btn"
                      onClick={() => handleDelete(user._id)}
                      title="Delete Customer"
                    >
                       Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;




