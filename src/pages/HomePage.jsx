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
          <p className="hero-kicker">Lebanon Trail High School</p>
          <div className="hero-mark">LT</div>
          <h1>Committed.</h1>
          <p className="hero-text">
            Developing leaders through service, discipline, academics, and teamwork.
          </p>

          <div className="hero-actions">
            <a href="#/current-month" className="join-button">
              View This Month
            </a>
            <a href="#/photos" className="ghost-button">
              Explore Photos
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
          text="These pages give the site a clearer structure: photos, scheduling, leadership information, and a monthly spotlight page."
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
            The site now has dedicated areas for archives, schedules, leadership, and
            monthly recognition so it can grow with the company instead of feeling like
            a single poster page.
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
