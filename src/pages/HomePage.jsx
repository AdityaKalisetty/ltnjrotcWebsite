import SectionHeader from '../components/SectionHeader';

function HomePage({
  heroPhotos,
  activePhotoIndex,
  onPreviousPhoto,
  onNextPhoto,
  onSelectPhoto,
  quickLinks,
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-carousel" aria-label="NJROTC photo carousel">
          {heroPhotos.map((photo, index) => (
            <div
              key={photo}
              className={`hero-slide${index === activePhotoIndex ? ' is-active' : ''}`}
              style={{ backgroundImage: `url(${photo})` }}
              aria-hidden={index === activePhotoIndex ? 'false' : 'true'}
            />
          ))}
        </div>

        <div className="hero-overlay" />

        <div className="hero-content">
          <h1 className="hero-live-heading" aria-label="Lead, Innovate, Value, and Empathize">
            <span className="hero-live-word">
              <span className="hero-live-initial">L</span>ead,
            </span>{' '}
            <span className="hero-live-word">
              <span className="hero-live-initial">I</span>nnovate,
            </span>{' '}
            <span className="hero-live-word">
              <span className="hero-live-initial">V</span>alue,
            </span>{' '}
            <span className="hero-live-word">
              and <span className="hero-live-initial">E</span>mpathize
            </span>
          </h1>
          <p className="hero-text">
            Developing leaders through service, discipline, academics, and teamwork.
          </p>

          <div className="hero-actions">
            <a href="#/enrollment" className="join-button">
              Enrollment
            </a>
            <a href="#/calendar" className="ghost-button">
              Calendar
            </a>
          </div>
        </div>

        {heroPhotos.length > 1 && (
          <div className="hero-carousel-controls" aria-label="Carousel controls">
            <button
              type="button"
              className="carousel-arrow"
              onClick={onPreviousPhoto}
              aria-label="Show previous photo"
            >
              &lt;
            </button>

            <div className="carousel-dots">
              {heroPhotos.map((photo, index) => (
                <button
                  key={`${photo}-dot`}
                  type="button"
                  className={`carousel-dot${index === activePhotoIndex ? ' is-active' : ''}`}
                  onClick={() => onSelectPhoto(index)}
                  aria-label={`Show photo ${index + 1}`}
                  aria-pressed={index === activePhotoIndex}
                />
              ))}
            </div>

            <button
              type="button"
              className="carousel-arrow"
              onClick={onNextPhoto}
              aria-label="Show next photo"
            >
              &gt;
            </button>
          </div>
        )}
      </section>

      <section className="page-section">
        <SectionHeader
          eyebrow="Site Sections"
          title="Everything Cadets and Families Need"
          text="These pages give the site a clearer structure for scheduling, leadership information, photos, and future enrollment details."
        />

        <div className="feature-grid">
          {quickLinks.map((item) => (
            <a key={item.title} href={item.href} className="feature-card">
              <p className="card-tag">Explore</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="info-strip">
        <div className="info-copy">
          <p className="info-label">Why This Structure</p>
          <h2>Built for updates throughout the year.</h2>
          <p className="info-text">
            The site now has dedicated areas for schedules, leadership, archives, and
            cadet-only tools so it can keep growing with the company instead of feeling
            like a single poster page.
          </p>
        </div>

        <div className="info-actions">
          <a href="#/chain-of-command" className="join-button">
            View Leadership
          </a>
          <a href="#/calendar" className="ghost-button">
            Open Calendar
          </a>
        </div>
      </section>
    </>
  );
}

export default HomePage;
