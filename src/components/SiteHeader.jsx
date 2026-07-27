import { useEffect, useState } from 'react';
import logoImage from '../assets/LTNJROTC Logo.png';
import { useAuth } from '../context/AuthContext';

function SiteHeader({ activePage, isScrolled, pages }) {
  const { user, profile, signOut } = useAuth();
  const [isCadetMenuOpen, setIsCadetMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isCadetLoggedIn = Boolean(user);
  const isAdmin = Boolean(profile?.is_admin);
  const isSupplyOfficer = Boolean(profile?.role?.toLowerCase().includes('supply'));

  useEffect(() => {
    setIsCadetMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [activePage, isCadetLoggedIn]);

  return (
    <header className={`topbar-shell${isScrolled ? ' is-scrolled' : ''}`}>
      <div className="topbar">
        <a href="#/home" className="brand-block">
          <img
            src={logoImage}
            alt="Lebanon Trail NJROTC logo"
            className="brand-logo"
          />

          <div className="brand-copy">
            <p className="brand-name">Lebanon Trail NJROTC</p>
            <p className="brand-values">Honor Courage Commitment</p>
          </div>
        </a>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-controls="primary-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
        >
          <span className="mobile-menu-toggle-line" aria-hidden="true" />
          <span className="mobile-menu-toggle-line" aria-hidden="true" />
          <span className="mobile-menu-toggle-line" aria-hidden="true" />
        </button>

        <div className="header-controls">
          {user && (
            <a href="#/dashboard" className="top-link top-utility-link">
              Dashboard
            </a>
          )}

          {user ? (
            <button type="button" className="top-link top-link-button" onClick={signOut}>
              Logout
            </button>
          ) : (
            <a href="#/login" className="login-button">
              <span className="login-button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-6 1.79-6 4v1h12v-1c0-2.21-2.67-4-6-4Z" />
                </svg>
              </span>
              <span>Cadet Login</span>
            </a>
          )}
        </div>
      </div>

      <nav
        id="primary-navigation"
        className={`menu-bar${isMobileMenuOpen ? ' is-open' : ''}`}
        aria-label="Primary"
      >
        <div className="top-actions">
          {pages.map((page) => (
            <a
              key={page.id}
              href={`#/${page.id}`}
              className={`top-link menu-link${activePage === page.id ? ' is-active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {page.label}
            </a>
          ))}

          {isCadetLoggedIn && (
            <div className={`menu-dropdown${isCadetMenuOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className={`top-link menu-link menu-dropdown-trigger${activePage === 'competitions' || activePage === 'dashboard' || activePage === 'portfolios' || activePage === 'admin' || activePage === 'supply' ? ' is-active' : ''}`}
                aria-expanded={isCadetMenuOpen}
                onClick={() => setIsCadetMenuOpen((currentValue) => !currentValue)}
              >
                Cadet Tools
              </button>

              {isCadetMenuOpen && (
                <div className="menu-dropdown-panel">
                  <a href="#/dashboard" className="menu-dropdown-link" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </a>
                  <a href="#/competitions" className="menu-dropdown-link" onClick={() => setIsMobileMenuOpen(false)}>
                    Competitions
                  </a>
                  <a href="#/portfolios" className="menu-dropdown-link" onClick={() => setIsMobileMenuOpen(false)}>
                    Cadet Portfolios
                  </a>
                  {(isAdmin || isSupplyOfficer) && (
                    <a href="#/supply" className="menu-dropdown-link" onClick={() => setIsMobileMenuOpen(false)}>
                      Supply Tools
                    </a>
                  )}
                  {isAdmin && (
                    <a href="#/admin" className="menu-dropdown-link" onClick={() => setIsMobileMenuOpen(false)}>
                      Admin Tools
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default SiteHeader;
