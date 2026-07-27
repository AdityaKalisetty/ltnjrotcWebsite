import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';

const PHOTOS_PER_PAGE = 12;

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function EventGallery({ eventSlug, photoCollections }) {
  const [event, setEvent] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(PHOTOS_PER_PAGE);

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
    setVisiblePhotoCount(PHOTOS_PER_PAGE);
    setLightboxOpen(false);
    setSelected(null);
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

  const photos = event.photos || [];
  const visiblePhotos = photos.slice(0, visiblePhotoCount);
  const remainingPhotoCount = photos.length - visiblePhotos.length;

  return (
    <section className="page-section">
      <SectionHeader eyebrow={event.date || 'Photos'} title={event.title} text={event.description} />

      <div className="content-panel">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <button type="button" className="btn" onClick={() => window.history.back()}>Back</button>
        </div>

        <div className="gallery-grid">
          {visiblePhotos.map((p, idx) => (
            <figure key={`${p.src}-${idx}`} className="gallery-item">
              <button type="button" className="lightbox-trigger" onClick={() => openLightbox(p)}>
                <img src={p.src} alt="" loading="lazy" decoding="async" />
              </button>
            </figure>
          ))}
        </div>

        {remainingPhotoCount > 0 && (
          <div className="gallery-load-more">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setVisiblePhotoCount((count) => count + PHOTOS_PER_PAGE)}
            >
              Load more photos ({remainingPhotoCount} remaining)
            </button>
          </div>
        )}
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
