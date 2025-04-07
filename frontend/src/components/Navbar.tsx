import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png'; // Make sure to create an assets folder and put logo.png there

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Shelfware Tracker Logo" className="logo-image" />
          <span className="logo-text">Shelfware Tracker</span>
        </Link>
      </div>
      
      <ul className="navbar-links">
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/">Projects</Link>
        </li>
        <li className={location.pathname === '/create' ? 'active' : ''}>
          <Link to="/create">Add Project</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;