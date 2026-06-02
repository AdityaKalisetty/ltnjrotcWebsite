import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { photoCollections } from '../data/siteContent';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function EventGallery({ eventSlug }) {
  const [event, setEvent] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const allEvents = [
      ...photoCollections.competitions,
      ...photoCollections.ceremonies,
      ...photoCollections.socialsAndServices,
    ];
    const found = allEvents.find((g) => (g.slug ? g.slug === eventSlug : slugify(g.title) === eventSlug));
    setEvent(found || null);
  }, [eventSlug]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };

    if (lightboxOpen) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  if (!event) {
    return (
      <section className="page-section">
        <SectionHeader eyebrow="Photos" title="Event not found" text="The requested event could not be located." />
      </section>
    );
  }

  const openLightbox = (photo) => {
    setSelected(photo);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelected(null);
  };

  return (
    <section className="page-section">
      <SectionHeader eyebrow={event.date || 'Photos'} title={event.title} text={event.description} />

      <div className="content-panel">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <button type="button" className="btn" onClick={() => window.history.back()}>Back</button>
        </div>

        <div className="gallery-grid">
          {event.photos.map((p, idx) => (
            <figure key={`${p.src}-${idx}`} className="gallery-item">
              <button type="button" className="lightbox-trigger" onClick={() => openLightbox(p)}>
                <img src={p.src} alt="" loading="lazy" />
              </button>
            </figure>
          ))}
        </div>
      </div>

      {lightboxOpen && selected && (
        <div className="lightbox-overlay" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="lightbox-close" onClick={closeLightbox} aria-label="Close">×</button>
            <img src={selected.src} alt={selected.name} className="lightbox-img" />
            <div className="lightbox-actions">
              <a className="btn btn--primary lightbox-download" href={selected.src} download>Download</a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default EventGallery;
