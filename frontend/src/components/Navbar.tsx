import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Shelfware Tracker Logo" className="logo-image" />
          <span className="logo-text">PXL Shelfware Tracker</span>
        </Link>
      </div>
      
      <ul className="navbar-links">
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/">Projects</Link>
        </li>
        <li className={location.pathname === '/about' ? 'active' : ''}>
          <Link to="/about">About</Link>
        </li>
        <li>
          <a href="https://github.com/PXL-Digital-Application-Samples/shelfware" target="_blank" rel="noopener noreferrer">Docs</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;