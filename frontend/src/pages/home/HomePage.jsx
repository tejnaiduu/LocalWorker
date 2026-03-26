import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <nav className="home-navbar">
        <div className="home-navbar-logo">
          <div className="home-navbar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="home-navbar-logo-text">LocalWorker</span>
        </div>
        <div className="home-navbar-buttons">
          <Link to="/login" className="home-navbar-btn-login">Login</Link>
          <Link to="/register" className="home-navbar-btn-register">Register</Link>
          <Link to="/admin/login" className="home-navbar-btn-login">Admin Login</Link>
          <Link to="/admin/register" className="home-navbar-btn-register">Admin Register</Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-headline">Find Trusted Local Experts in Minutes</h1>
          <p className="hero-subtext">Connect with verified electricians, plumbers, carpenters and more in your neighbourhood</p>
          <div className="hero-buttons">
            <Link to="/register" className="hero-btn-primary">Get Started</Link>
            <Link to="/login" className="hero-btn-outline">Sign In</Link>
          </div>
        </div>
      </section>

      <section className="home-section services-section">
        <h2 className="home-section-title">Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon service-icon-electrician">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h4 className="service-card-title">Electricians</h4>
            <p className="service-card-desc">Wiring, repairs, installations & maintenance</p>
          </div>
          <div className="service-card">
            <div className="service-icon service-icon-plumber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <h4 className="service-card-title">Plumbers</h4>
            <p className="service-card-desc">Pipe work, leaks, fixtures & emergency repairs</p>
          </div>
          <div className="service-card">
            <div className="service-icon service-icon-carpenter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h4 className="service-card-title">Carpenters</h4>
            <p className="service-card-desc">Carpentry, furniture & custom woodwork</p>
          </div>
        </div>
      </section>

      <section className="home-section why-choose-section">
        <h2 className="home-section-title">Why Choose Us</h2>
        <div className="why-choose-grid">
          <div className="why-choose-card">
            <div className="why-choose-icon why-choose-icon-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h4 className="why-choose-card-title">Verified Workers</h4>
            <p className="why-choose-card-desc">All workers are screened and verified for quality & reliability</p>
          </div>
          <div className="why-choose-card">
            <div className="why-choose-icon why-choose-icon-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h4 className="why-choose-card-title">Real Reviews</h4>
            <p className="why-choose-card-desc">Read authentic 5-star ratings from verified customers</p>
          </div>
          <div className="why-choose-card">
            <div className="why-choose-icon why-choose-icon-red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h4 className="why-choose-card-title">Location Based</h4>
            <p className="why-choose-card-desc">Find workers in your area with accurate distance tracking</p>
          </div>
          <div className="why-choose-card">
            <div className="why-choose-icon why-choose-icon-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h4 className="why-choose-card-title">Quick Response</h4>
            <p className="why-choose-card-desc">Get in touch instantly via call or WhatsApp</p>
          </div>
          <div className="why-choose-card">
            <div className="why-choose-icon why-choose-icon-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <h4 className="why-choose-card-title">Skill Verified</h4>
            <p className="why-choose-card-desc">Check experience and expertise before booking</p>
          </div>
          <div className="why-choose-card">
            <div className="why-choose-icon why-choose-icon-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h4 className="why-choose-card-title">Secure & Safe</h4>
            <p className="why-choose-card-desc">Verified identities and transparent communication</p>
          </div>
        </div>
      </section>

      <section className="home-section how-it-works-section">
        <h2 className="home-section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number-circle">1</div>
            <div className="step-card">
              <h4 className="step-card-title">Sign Up</h4>
              <p className="step-card-desc">Create your account as a customer or worker</p>
            </div>
          </div>
          <span className="step-arrow">&rarr;</span>
          <div className="step-item">
            <div className="step-number-circle">2</div>
            <div className="step-card">
              <h4 className="step-card-title">Browse or List</h4>
              <p className="step-card-desc">Find workers by skill, location or complete your profile</p>
            </div>
          </div>
          <span className="step-arrow">&rarr;</span>
          <div className="step-item">
            <div className="step-number-circle">3</div>
            <div className="step-card">
              <h4 className="step-card-title">Connect</h4>
              <p className="step-card-desc">Call or message workers to discuss your needs</p>
            </div>
          </div>
          <span className="step-arrow">&rarr;</span>
          <div className="step-item">
            <div className="step-number-circle">4</div>
            <div className="step-card">
              <h4 className="step-card-title">Review & Rate</h4>
              <p className="step-card-desc">Share feedback to help others find quality workers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <h2 className="home-section-title">Trusted by Thousands</h2>
        <div className="trust-stats-row">
          <div className="trust-stat-item">
            <div className="trust-stat-number">500+</div>
            <div className="trust-stat-label">Verified Workers</div>
          </div>
          <div className="trust-stat-item">
            <div className="trust-stat-number">2,000+</div>
            <div className="trust-stat-label">Happy Customers</div>
          </div>
          <div className="trust-stat-item">
            <div className="trust-stat-number">4.8*</div>
            <div className="trust-stat-label">Average Rating</div>
          </div>
          <div className="trust-stat-item">
            <div className="trust-stat-number">24/7</div>
            <div className="trust-stat-label">Available Workers</div>
          </div>
        </div>
        <div className="testimonials-row">
          <div className="testimonial-card">
            <p className="testimonial-text">"Found a great electrician within 10 minutes. Professional and affordable!"</p>
            <span className="testimonial-author">- Raj K.</span>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">"As a plumber, this platform helped me reach more customers. Highly recommended!"</p>
            <span className="testimonial-author">- Priya M.</span>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">"Quick response, quality work, and fair pricing. Best experience so far."</p>
            <span className="testimonial-author">- Amit S.</span>
          </div>
        </div>
      </section>

      <section className="home-section cta-section">
        <h2 className="cta-title">Ready to Get Started?</h2>
        <div className="cta-buttons">
          <Link to="/register" className="cta-btn-primary">Register as Customer</Link>
          <Link to="/register" className="cta-btn-outline">Register as Worker</Link>
        </div>
      </section>

      <footer className="home-footer">
        <p className="home-footer-text">&copy; 2024 LocalWorker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
