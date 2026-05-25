import SectionHeader from '../components/SectionHeader';

function renderEventCard(group) {
  const slug = group.slug || group.title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const thumbnail = group.photos && group.photos[0] ? group.photos[0].src : null;

  return (
    <article key={group.title} className="archive-card event-card">
      <a
        className="event-link"
        href={`#/photos/event/${slug}`}
        onClick={(e) => {
          e.preventDefault();
          window.location.hash = `#/photos/event/${slug}`;
        }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={group.title}
            loading="lazy"
            className="event-thumb-img"
          />
        ) : (
          <div className="event-thumb-empty">No preview</div>
        )}
        <div className="event-meta">
          <h4>{group.title}</h4>
          {group.date && <p className="event-date">{group.date}</p>}
          {group.description && <p>{group.description}</p>}
          <span className="event-count">{(group.photos || []).length} photos</span>
        </div>
      </a>
    </article>
  );
}

function PhotosPage({ photoCollections }) {
  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Lebanon Trail NJROTC"
        title="Photography Archive"
        text="Downloadable photos taken by our very own public affairs department."
      />

      <div className="stacked-sections">
        <div className="content-panel">
          <h3>Competitions</h3>
          <div className="archive-grid">
            {photoCollections.competitions.map(renderEventCard)}
          </div>
        </div>

        <div className="content-panel">
          <h3>Ceremonies</h3>
          <div className="archive-grid">
            {photoCollections.ceremonies.map(renderEventCard)}
          </div>
        </div>

        <div className="content-panel">
          <h3>Socials & Services</h3>
          <div className="archive-grid">
            {photoCollections.socialsAndServices.map(renderEventCard)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PhotosPage;
