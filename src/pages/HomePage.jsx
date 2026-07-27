import SectionHeader from '../components/SectionHeader';

function HomePage({
  heroPhotos,
  activePhotoIndex,
  onPreviousPhoto,
  onNextPhoto,
  onSelectPhoto,
  announcements,
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
            Developing leaders through discipline, academics, and teamwork.
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

      <section className="page-section recruiting-video-section">
        <SectionHeader
          eyebrow="Recruiting Video"
          title="What It Means To Join."
        />

        <div className="video-placeholder-card" aria-label="Recruiting video coming soon">
          <div className="video-placeholder-frame">
            <div className="video-placeholder-badge">Coming Soon</div>
            <div className="video-placeholder-play" aria-hidden="true">
              &gt;
            </div>
          </div>

          <div className="video-placeholder-copy">
            <p className="info-label">Coming Soon</p>
            <h2>Recruiting video premiere coming soon.</h2>
            <p className="info-text">
              Once the video is ready, cadets and families will be
              able to watch it right here on the home page.
            </p>
          </div>
        </div>
      </section>

      {announcements.length > 0 && (
      <section className="page-section announcements-section">
        <SectionHeader
          eyebrow="Unit Updates"
          title="Latest Announcements"
          text="Important reminders, event callouts, and poster updates from the admin team will appear here."
        />

        <div className="announcement-grid">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="announcement-card">
              {announcement.imageUrl ? (
                <div className="announcement-poster-shell">
                  <img
                    src={announcement.imageUrl}
                    alt={announcement.title}
                    className="announcement-poster"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="announcement-poster-shell announcement-poster-shell--empty">
                  <span>Poster space</span>
                </div>
              )}

              <div className="announcement-copy">
                <p className="card-tag">{announcement.date || 'Announcement'}</p>
                <h3>{announcement.title}</h3>
                <p>{announcement.summary}</p>
                {announcement.body && <p>{announcement.body}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
      )}
    </>
  );
}

export default HomePage;
