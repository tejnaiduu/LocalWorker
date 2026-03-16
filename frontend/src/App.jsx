
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
    <div>
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
    </div>
  );
}

function HomePage() {
  // Inline styles for guaranteed CSS loading
  const styles = {
    navbar: {
      background: '#1E3A5F',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 48px',
      position: 'sticky',
      top: '0',
      zIndex: '100',
    },
    navbarLogo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    navbarLogoIcon: {
      width: '36px',
      height: '36px',
      background: '#2563EB',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    navbarLogoText: {
      color: 'white',
      fontSize: '18px',
      fontWeight: '700',
    },
    navbarButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    navbarBtnLogin: {
      border: '1px solid rgba(255, 255, 255, 0.4)',
      background: 'transparent',
      color: 'white',
      padding: '8px 20px',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
    },
    navbarBtnRegister: {
      background: '#2563EB',
      color: 'white',
      padding: '8px 20px',
      borderRadius: '8px',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
    },
    heroSection: {
      background: '#1E3A5F',
      minHeight: '440px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 48px',
    },
    heroContainer: {
      maxWidth: '1100px',
      width: '100%',
      textAlign: 'center',
    },
    heroHeadline: {
      color: 'white',
      fontSize: '40px',
      fontWeight: '700',
      marginBottom: '12px',
    },
    heroSubtext: {
      color: '#93C5FD',
      fontSize: '16px',
      marginBottom: '28px',
    },
    heroButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
    },
    heroBtnPrimary: {
      background: '#2563EB',
      color: 'white',
      padding: '12px 28px',
      borderRadius: '8px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-block',
    },
    heroBtnOutline: {
      border: '1px solid rgba(255, 255, 255, 0.5)',
      color: 'white',
      padding: '12px 28px',
      borderRadius: '8px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-block',
    },
    servicesSection: {
      background: '#F9FAFB',
      padding: '60px 48px',
    },
    servicesTitle: {
      color: '#111827',
      fontSize: '22px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '32px',
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      maxWidth: '1000px',
      margin: '0 auto',
    },
    serviceCard: {
      background: 'white',
      border: '0.5px solid #E5E7EB',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    serviceIcon: {
      width: '52px',
      height: '52px',
      borderRadius: '12px',
      margin: '0 auto 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    serviceCardTitle: {
      color: '#111827',
      fontSize: '15px',
      fontWeight: '600',
    },
    serviceCardDesc: {
      color: '#6B7280',
      fontSize: '13px',
      marginTop: '6px',
    },
    whyChooseSection: {
      background: 'white',
      padding: '60px 48px',
    },
    whyChooseTitle: {
      color: '#111827',
      fontSize: '22px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '32px',
    },
    whyChooseGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      maxWidth: '1000px',
      margin: '0 auto',
    },
    whyChooseCard: {
      background: 'white',
      border: '0.5px solid #E5E7EB',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    whyChooseIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      margin: '0 auto 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    whyChooseCardTitle: {
      color: '#111827',
      fontSize: '14px',
      fontWeight: '600',
    },
    whyChooseCardDesc: {
      color: '#6B7280',
      fontSize: '12px',
      marginTop: '4px',
    },
    howItWorksSection: {
      background: '#F9FAFB',
      padding: '60px 48px',
    },
    howItWorksTitle: {
      color: '#111827',
      fontSize: '22px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '32px',
    },
    stepsContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: '0',
      maxWidth: '1000px',
      margin: '0 auto',
    },
    stepItem: {
      flex: '1',
      textAlign: 'center',
    },
    stepCircle: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      background: '#2563EB',
      color: 'white',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
    },
    stepCard: {
      background: 'white',
      border: '0.5px solid #E5E7EB',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
    },
    stepCardTitle: {
      color: '#111827',
      fontSize: '14px',
      fontWeight: '600',
      marginTop: '12px',
    },
    stepCardDesc: {
      color: '#6B7280',
      fontSize: '12px',
      marginTop: '4px',
    },
    stepArrow: {
      color: '#CBD5E1',
      fontSize: '24px',
      alignSelf: 'center',
      margin: '0 8px',
    },
    trustSection: {
      background: '#1E3A5F',
      padding: '60px 48px',
    },
    trustTitle: {
      color: 'white',
      fontSize: '22px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '32px',
    },
    trustStatsRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '48px',
      marginBottom: '40px',
    },
    trustStatItem: {
      textAlign: 'center',
    },
    trustStatNumber: {
      color: 'white',
      fontSize: '28px',
      fontWeight: '700',
    },
    trustStatLabel: {
      color: '#93C5FD',
      fontSize: '13px',
      marginTop: '4px',
    },
    testimonialsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      maxWidth: '1000px',
      margin: '0 auto',
    },
    testimonialCard: {
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '12px',
      padding: '20px',
    },
    testimonialText: {
      color: 'white',
      fontSize: '13px',
      fontStyle: 'italic',
      marginTop: '20px',
    },
    testimonialAuthor: {
      color: '#93C5FD',
      fontSize: '12px',
      fontWeight: '500',
      marginTop: '12px',
    },
    ctaSection: {
      background: 'white',
      padding: '60px 48px',
      textAlign: 'center',
      borderTop: '0.5px solid #E5E7EB',
    },
    ctaTitle: {
      color: '#111827',
      fontSize: '24px',
      fontWeight: '700',
    },
    ctaButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      marginTop: '24px',
    },
    ctaBtnPrimary: {
      background: '#2563EB',
      color: 'white',
      padding: '12px 28px',
      borderRadius: '8px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-block',
    },
    ctaBtnOutline: {
      border: '1px solid #2563EB',
      color: '#2563EB',
      padding: '12px 28px',
      borderRadius: '8px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-block',
    },
    footer: {
      background: '#1E3A5F',
      padding: '20px 48px',
      textAlign: 'center',
    },
    footerText: {
      color: '#93C5FD',
      fontSize: '13px',
    },
  };

  return (
    <div style={{ paddingTop: '64px' }}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navbarLogo}>
          <div style={styles.navbarLogoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={styles.navbarLogoText}>LocalWorker</span>
        </div>
        <div style={styles.navbarButtons}>
          <a href="/login" style={styles.navbarBtnLogin}>Login</a>
          <a href="/register" style={styles.navbarBtnRegister}>Register</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          <h1 style={styles.heroHeadline}>Find Trusted Local Experts in Minutes</h1>
          <p style={styles.heroSubtext}>Connect with verified electricians, plumbers, carpenters and more in your neighbourhood</p>
          <div style={styles.heroButtons}>
            <a href="/register" style={styles.heroBtnPrimary}>Get Started</a>
            <a href="/login" style={styles.heroBtnOutline}>Sign In</a>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section style={styles.servicesSection}>
        <h2 style={styles.servicesTitle}>Our Services</h2>
        <div style={styles.servicesGrid}>
          <div style={styles.serviceCard}>
            <div style={{ ...styles.serviceIcon, background: '#FFF7ED', color: '#D97706' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h4 style={styles.serviceCardTitle}>Electricians</h4>
            <p style={styles.serviceCardDesc}>Wiring, repairs, installations & maintenance</p>
          </div>
          <div style={styles.serviceCard}>
            <div style={{ ...styles.serviceIcon, background: '#EFF6FF', color: '#2563EB' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <h4 style={styles.serviceCardTitle}>Plumbers</h4>
            <p style={styles.serviceCardDesc}>Pipe work, leaks, fixtures & emergency repairs</p>
          </div>
          <div style={styles.serviceCard}>
            <div style={{ ...styles.serviceIcon, background: '#F0FDF4', color: '#16A34A' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h4 style={styles.serviceCardTitle}>Carpenters</h4>
            <p style={styles.serviceCardDesc}>Carpentry, furniture & custom woodwork</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section style={styles.whyChooseSection}>
        <h2 style={styles.whyChooseTitle}>Why Choose Us</h2>
        <div style={styles.whyChooseGrid}>
          <div style={styles.whyChooseCard}>
            <div style={{ ...styles.whyChooseIcon, background: '#EFF6FF', color: '#2563EB' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h4 style={styles.whyChooseCardTitle}>Verified Workers</h4>
            <p style={styles.whyChooseCardDesc}>All workers are screened and verified for quality & reliability</p>
          </div>
          <div style={styles.whyChooseCard}>
            <div style={{ ...styles.whyChooseIcon, background: '#FFF7ED', color: '#F59E0B' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h4 style={styles.whyChooseCardTitle}>Real Reviews</h4>
            <p style={styles.whyChooseCardDesc}>Read authentic 5-star ratings from verified customers</p>
          </div>
          <div style={styles.whyChooseCard}>
            <div style={{ ...styles.whyChooseIcon, background: '#FEF2F2', color: '#DC2626' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h4 style={styles.whyChooseCardTitle}>Location Based</h4>
            <p style={styles.whyChooseCardDesc}>Find workers in your area with accurate distance tracking</p>
          </div>
          <div style={styles.whyChooseCard}>
            <div style={{ ...styles.whyChooseIcon, background: '#F0FDF4', color: '#16A34A' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h4 style={styles.whyChooseCardTitle}>Quick Response</h4>
            <p style={styles.whyChooseCardDesc}>Get in touch instantly via call or WhatsApp</p>
          </div>
          <div style={styles.whyChooseCard}>
            <div style={{ ...styles.whyChooseIcon, background: '#EFF6FF', color: '#2563EB' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <h4 style={styles.whyChooseCardTitle}>Skill Verified</h4>
            <p style={styles.whyChooseCardDesc}>Check experience and expertise before booking</p>
          </div>
          <div style={styles.whyChooseCard}>
            <div style={{ ...styles.whyChooseIcon, background: '#FFF7ED', color: '#F59E0B' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h4 style={styles.whyChooseCardTitle}>Secure & Safe</h4>
            <p style={styles.whyChooseCardDesc}>Verified identities and transparent communication</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorksSection}>
        <h2 style={styles.howItWorksTitle}>How It Works</h2>
        <div style={styles.stepsContainer}>
          <div style={styles.stepItem}>
            <div style={styles.stepCircle}>1</div>
            <div style={styles.stepCard}>
              <h4 style={styles.stepCardTitle}>Sign Up</h4>
              <p style={styles.stepCardDesc}>Create your account as a customer or worker</p>
            </div>
          </div>
          <span style={styles.stepArrow}>→</span>
          <div style={styles.stepItem}>
            <div style={styles.stepCircle}>2</div>
            <div style={styles.stepCard}>
              <h4 style={styles.stepCardTitle}>Browse or List</h4>
              <p style={styles.stepCardDesc}>Find workers by skill, location or complete your profile</p>
            </div>
          </div>
          <span style={styles.stepArrow}>→</span>
          <div style={styles.stepItem}>
            <div style={styles.stepCircle}>3</div>
            <div style={styles.stepCard}>
              <h4 style={styles.stepCardTitle}>Connect</h4>
              <p style={styles.stepCardDesc}>Call or message workers to discuss your needs</p>
            </div>
          </div>
          <span style={styles.stepArrow}>→</span>
          <div style={styles.stepItem}>
            <div style={styles.stepCircle}>4</div>
            <div style={styles.stepCard}>
              <h4 style={styles.stepCardTitle}>Review & Rate</h4>
              <p style={styles.stepCardDesc}>Share feedback to help others find quality workers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Thousands Section */}
      <section style={styles.trustSection}>
        <h2 style={styles.trustTitle}>Trusted by Thousands</h2>
        <div style={styles.trustStatsRow}>
          <div style={styles.trustStatItem}>
            <div style={styles.trustStatNumber}>500+</div>
            <div style={styles.trustStatLabel}>Verified Workers</div>
          </div>
          <div style={styles.trustStatItem}>
            <div style={styles.trustStatNumber}>2,000+</div>
            <div style={styles.trustStatLabel}>Happy Customers</div>
          </div>
          <div style={styles.trustStatItem}>
            <div style={styles.trustStatNumber}>4.8★</div>
            <div style={styles.trustStatLabel}>Average Rating</div>
          </div>
          <div style={styles.trustStatItem}>
            <div style={styles.trustStatNumber}>24/7</div>
            <div style={styles.trustStatLabel}>Available Workers</div>
          </div>
        </div>
        <div style={styles.testimonialsRow}>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>"Found a great electrician within 10 minutes. Professional and affordable!"</p>
            <span style={styles.testimonialAuthor}>- Raj K.</span>
          </div>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>"As a plumber, this platform helped me reach more customers. Highly recommended!"</p>
            <span style={styles.testimonialAuthor}>- Priya M.</span>
          </div>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>"Quick response, quality work, and fair pricing. Best experience so far."</p>
            <span style={styles.testimonialAuthor}>- Amit S.</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
        <div style={styles.ctaButtons}>
          <a href="/register" style={styles.ctaBtnPrimary}>Register as Customer</a>
          <a href="/register" style={styles.ctaBtnOutline}>Register as Worker</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2024 LocalWorker. All rights reserved.</p>
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
