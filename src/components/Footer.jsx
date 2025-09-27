import React from "react"
import { Link } from "react-router-dom"
import { Languages } from "lucide-react"
import "./Footer.css"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  // This function helps scroll to sections on the homepage
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand-section">
            <Link to="/" className="footer-brand">
              <div className="brand-icon">
                <Languages className="brand-icon-svg" />
              </div>
              <div className="brand-content">
                <h2>Tranzora</h2>
                <span className="brand-subtitle">AI Translation</span>
              </div>
            </Link>
            <p className="footer-description">
              Seamless, AI-powered document translation with a focus on preserving layout and context.
            </p>
          </div>

          <div className="footer-links-section">
            <div className="footer-links-group">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/history">History</Link></li>
              </ul>
            </div>
            <div className="footer-links-group">
              <h4>Features</h4>
              <ul>
                {/* These links will scroll to the info sections on your Home page */}
                <li><Link to="/#how-it-works" onClick={() => scrollToSection('how-it-works')}>How It Works</Link></li>
                <li><Link to="/#features" onClick={() => scrollToSection('features')}>Why We're Different</Link></li>
                <li><Link to="/#problem-solution" onClick={() => scrollToSection('problem-solution')}>Problem & Solution</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Tranzora. All rights reserved.</p>
          <p>Created with ❤️ by <span className="team-name">Omega</span></p>
        </div>
      </div>
    </footer>
  )
}

export default Footer