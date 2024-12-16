// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/mainStyle.css';
import './css/customStyle.css';

const Header = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`header ${isActive ? 'active' : ''}`} data-header>
      <div className="container">
        <h1>
          <Link to="/" className="logo">OBBM<span className="span">.</span></Link>
        </h1>

        <nav className="navbar" data-navbar>
          <ul className="navbar-list">
            <li className="nav-item"><Link to="/" className="navbar-link" data-nav-link>Home</Link></li>
            <li className="nav-item"><a href="#about" className="navbar-link" data-nav-link>About Us</a></li>
            <li className="nav-item"><a href="#events" className="navbar-link" data-nav-link>Dishes</a></li>
            <li className="nav-item"><a href="#equiped" className="navbar-link" data-nav-link>Equipment</a></li>
            <li className="nav-item"><a href="#blog" className="navbar-link" data-nav-link>Blog</a></li>
            <li className="nav-item"><a href="#contact" className="navbar-link" data-nav-link>Contact Us</a></li>
            <li><a href="/admin" className="navbar-link" data-nav-link>Admin</a></li>
          </ul>
        </nav>

        <div className="header-btn-group">
          <button className="search-btn" aria-label="Search" data-search-btn>
            <ion-icon name="search-outline"></ion-icon>
          </button>
          <Link to="/account" className="navbar-link bi bi-receipt bill" data-nav-link></Link>
          <Link to="/menu" className="navbar-link bi bi-card-checklist"></Link>
          <Link to="/login" className="btn btn-hover align-middle">Sign In</Link>
          <button className="nav-toggle-btn" aria-label="Toggle Menu" data-menu-toggle-btn>
            <span className="line top"></span> <span className="line middle"></span> <span className="line bottom"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

