import logoImage from '../assets/LTNJROTC Logo.png';
import { useAuth } from '../context/AuthContext';

function SiteHeader({ activePage, isMenuOpen, isScrolled, onToggleMenu, pages }) {
  const { user, signOut } = useAuth();

  return (
    <header className={`topbar${isScrolled ? ' is-scrolled' : ''}`}>
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
        <button
          type="button"
          className="icon-button"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          onClick={onToggleMenu}
        >
          Menu
        </button>
        {user ? (
          <>
            <a href="#/dashboard" className="top-link">
              Dashboard
            </a>
            <button type="button" className="top-link top-link-button" onClick={signOut}>
              Logout
            </button>
          </>
        ) : (
          <a href="#/login" className="top-link">
            Login
          </a>
        )}
      </div>

      <nav className={`top-actions${isMenuOpen ? ' is-open' : ''}`} aria-label="Primary">
        {pages.map((page) => (
          <a
            key={page.id}
            href={`#/${page.id}`}
            className={`top-link${activePage === page.id ? ' is-active' : ''}`}
          >
            {page.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default SiteHeader;
