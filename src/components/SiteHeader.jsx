import { useEffect, useState } from 'react';
import logoImage from '../assets/LTNJROTC Logo.png';
import { useAuth } from '../context/AuthContext';

function SiteHeader({ activePage, isScrolled, pages }) {
  const { user, profile, signOut } = useAuth();
  const [isCadetMenuOpen, setIsCadetMenuOpen] = useState(false);
  const isCadetLoggedIn = Boolean(user);
  const isAdmin = Boolean(profile?.is_admin);

  useEffect(() => {
    setIsCadetMenuOpen(false);
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

      <nav className="menu-bar" aria-label="Primary">
        <div className="top-actions">
          {pages.map((page) => (
            <a
              key={page.id}
              href={`#/${page.id}`}
              className={`top-link menu-link${activePage === page.id ? ' is-active' : ''}`}
            >
              {page.label}
            </a>
          ))}

          {isCadetLoggedIn && (
            <div className={`menu-dropdown${isCadetMenuOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className={`top-link menu-link menu-dropdown-trigger${activePage === 'competitions' || activePage === 'dashboard' || activePage === 'portfolios' || activePage === 'admin' ? ' is-active' : ''}`}
                aria-expanded={isCadetMenuOpen}
                onClick={() => setIsCadetMenuOpen((currentValue) => !currentValue)}
              >
                Cadet Tools
              </button>

              {isCadetMenuOpen && (
                <div className="menu-dropdown-panel">
                  <a href="#/dashboard" className="menu-dropdown-link">
                    Dashboard
                  </a>
                  <a href="#/competitions" className="menu-dropdown-link">
                    Competitions
                  </a>
                  <a href="#/portfolios" className="menu-dropdown-link">
                    Cadet Portfolios
                  </a>
                  {isAdmin && (
                    <a href="#/admin" className="menu-dropdown-link">
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
