import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CompleteWorkerProfile from './pages/worker/CompleteWorkerProfile';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkerVerification from './pages/admin/WorkerVerification';
import ManageWorkers from './pages/admin/ManageWorkers';
import ManageUsers from './pages/admin/ManageUsers';
import IDProofVerification from './pages/admin/IDProofVerification';
import WorkerBrowser from './components/worker/WorkerBrowser';
import BookingHistory from './components/booking/BookingHistory';
import IDProofUpload from './components/idProof/IDProofUpload';
import './App.css';

// ProtectedRoute component for authenticated users
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ProtectedAdminRoute component for admin users
function ProtectedAdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Still loading auth state
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>Loading...</div>;
  }
  
  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Authenticated but not admin, redirect to home
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // All checks passed
  return children;
}

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/complete-profile" element={<ProtectedRoute><CompleteWorkerProfile /></ProtectedRoute>} />
      <Route path="/customer-dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer-dashboard/find-workers" element={<ProtectedRoute><WorkerBrowser /></ProtectedRoute>} />
      <Route path="/customer-dashboard/my-bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
      <Route path="/worker-dashboard" element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>} />
      <Route path="/worker-dashboard/id-proof" element={<ProtectedRoute><IDProofUpload /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="verification" element={<WorkerVerification />} />
        <Route path="idproof-verification" element={<IDProofVerification />} />
        <Route path="workers" element={<ManageWorkers />} />
        <Route path="users" element={<ManageUsers />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? (
              <Navigate to="/admin/dashboard" />
            ) : user?.role === 'worker' ? (
              <Navigate to="/worker-dashboard" />
            ) : (
              <Navigate to="/customer-dashboard" />
            )
          ) : (
            <HomePage />
          )
        }
      />
    </Routes>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <header className="header">
        <div className="header-content">
          <h1>🏢 Hyperlocal Worker Finder</h1>
          <p>Find skilled workers near you</p>
        </div>
      </header>

      <nav className="navbar">
        <a href="/login" className="nav-link">Login</a>
        <a href="/register" className="nav-link">Register</a>
      </nav>

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h2>Find Trusted Local Experts in Minutes</h2>
            <p>Connect with verified electricians, plumbers, carpenters, and more in your neighborhood</p>
            <div className="cta-buttons">
              <a href="/register" className="btn btn-primary">Get Started</a>
              <a href="/login" className="btn btn-secondary">Sign In</a>
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="service-categories">
          <h3>Our Services</h3>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">⚡</div>
              <h4>Electricians</h4>
              <p>Wiring, repairs, installations & maintenance</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🚰</div>
              <h4>Plumbers</h4>
              <p>Pipe work, leaks, fixtures & emergency repairs</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🪵</div>
              <h4>Carpenters</h4>
              <p>Carpentry, furniture & custom woodwork</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h3>Why Choose Us?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h4>Verified Workers</h4>
              <p>All workers are screened and verified for quality & reliability</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h4>Real Reviews</h4>
              <p>Read authentic 5-star ratings from verified customers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h4>Location Based</h4>
              <p>Find workers in your area with accurate distance tracking</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h4>Quick Response</h4>
              <p>Get in touch instantly via call or WhatsApp</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Skill Verified</h4>
              <p>Check experience and expertise before booking</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Secure & Safe</h4>
              <p>Verified identities and transparent communication</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <h3>How It Works</h3>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Sign Up</h4>
              <p>Create your account as a customer or worker in seconds</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Browse or List</h4>
              <p>Find workers by skill & location, or complete your profile</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Connect</h4>
              <p>Call or message workers to discuss your needs</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Review & Rate</h4>
              <p>Share feedback to help others find quality workers</p>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="trust-section">
          <h3>Trusted by Thousands</h3>
          <div className="trust-stats">
            <div className="stat">
              <h4>500+</h4>
              <p>Verified Workers</p>
            </div>
            <div className="stat">
              <h4>2,000+</h4>
              <p>Happy Customers</p>
            </div>
            <div className="stat">
              <h4>4.8★</h4>
              <p>Average Rating</p>
            </div>
            <div className="stat">
              <h4>24/7</h4>
              <p>Available Workers</p>
            </div>
          </div>
          <div className="testimonials">
            <div className="testimonial">
              <p>"Found a great electrician within 10 minutes. Professional and affordable!"</p>
              <span>- Raj K.</span>
            </div>
            <div className="testimonial">
              <p>"As a plumber, this platform helped me reach more customers. Highly recommended!"</p>
              <span>- Priya M.</span>
            </div>
            <div className="testimonial">
              <p>"Quick response, quality work, and fair pricing. Best experience so far."</p>
              <span>- Amit S.</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="final-cta">
          <h3>Ready to Get Started?</h3>
          <p>Join thousands of satisfied customers and skilled workers</p>
          <div className="cta-buttons">
            <a href="/register" className="btn btn-primary">Register Now</a>
            <a href="/login" className="btn btn-secondary">Already Have an Account?</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Hyperlocal Worker Finder. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
