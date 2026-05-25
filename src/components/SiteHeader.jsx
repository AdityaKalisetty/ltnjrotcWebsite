import logoImage from '../assets/LTNJROTC Logo.png';

function SiteHeader({ activePage, isMenuOpen, isScrolled, onToggleMenu, pages }) {
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
