import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Languages } from "lucide-react"
import "./Navbar.css"
import "../index.css"

const Navbar = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="brand-icon">
            <Languages className="brand-icon-svg" />
          </div>
          <div className="brand-content">
            <h2>Tranzora</h2>
          </div>
        </Link>

        <div className="navbar-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link 
            to="/history" 
            className={`nav-link ${location.pathname === "/history" ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            History
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <div className="menu-bar"></div>
          <div className="menu-bar"></div>
          <div className="menu-bar"></div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link 
            to="/history" 
            className={`nav-link ${location.pathname === "/history" ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            History
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar