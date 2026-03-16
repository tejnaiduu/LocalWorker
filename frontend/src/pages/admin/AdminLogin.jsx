import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../auth/Auth.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { api } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/admin/login', { email, password });
      
      const { token, user } = response.data;
      
      // Store in correct localStorage keys
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update axios headers IMMEDIATELY
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      // Redirect to /admin (parent route) with a small delay to ensure localStorage is set
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 50);
    } catch (err) {
      setError(err.response?.data?.error || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🛡️ Admin Login</h2>
        <p className="auth-subtitle">Access the admin panel</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an admin account?{' '}
            <button 
              className="link-btn"
              onClick={() => navigate('/admin/register')}
            >
              Register here
            </button>
          </p>
          <p style={{ marginTop: '10px' }}>
            Back to home?{' '}
            <button 
              className="link-btn"
              onClick={() => navigate('/')}
            >
              Click here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
