import { useEffect, useMemo, useRef, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const rankAcronyms = {
  'seaman apprentice': 'SA',
  'seaman': 'SN',
  'petty officer 3rd class': 'PO3',
  'petty officer 2nd class': 'PO2',
  'petty officer 1st class': 'PO1',
  'chief petty officer': 'CPO',
  'cadet seaman apprentice': 'SA',
  'cadet seaman': 'SN',
  'cadet petty officer 3rd class': 'PO3',
  'cadet petty officer 2nd class': 'PO2',
  'cadet petty officer 1st class': 'PO1',
  'cadet chief petty officer': 'CPO',
  'cadet senior chief petty officer': 'SCPO',
  'cadet ensign': 'ENS',
  'cadet lieutenant junior grade': 'LTJG',
  'cadet lieutenant': 'LT',
  'cadet lieutenant commander': 'LCDR',
  'cadet commander': 'CDR',
};

const rankInsigniaMap = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/rankInsignias/*.{png,jpg,jpeg,webp,avif}', {
      eager: true,
      import: 'default',
    })
  ).map(([path, src]) => [path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase(), src])
);

function getRankAcronym(rank) {
  if (!rank) return null;
  const normalized = rank.toLowerCase().trim();
  return rankAcronyms[normalized] || normalized.replace(/[^a-z0-9]+/g, '').toUpperCase();
}

function getRankInsignia(rank) {
  const acronym = getRankAcronym(rank);
  if (!acronym || acronym === 'SR') return null;
  return rankInsigniaMap[acronym.toLowerCase()] || null;
}

const PHOTO_ASPECT = 4 / 5;

function createInitialCrop(naturalWidth, naturalHeight) {
  const targetAspect = PHOTO_ASPECT;
  let width = naturalWidth;
  let height = width / targetAspect;

  if (height > naturalHeight) {
    height = naturalHeight;
    width = height * targetAspect;
  }

  return {
    x: Math.max(0, (naturalWidth - width) / 2),
    y: Math.max(0, (naturalHeight - height) / 2),
    width,
    height,
  };
}

function clampRect(rect, bounds) {
  return {
    x: Math.max(bounds.x, Math.min(bounds.x + bounds.width - rect.width, rect.x)),
    y: Math.max(bounds.y, Math.min(bounds.y + bounds.height - rect.height, rect.y)),
    width: Math.min(bounds.width, rect.width),
    height: Math.min(bounds.height, rect.height),
  };
}

function parseJsonData(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
}

const ribbonPriority = [
  'Meritorious Achievement',
  'Distinguished Unit',
  'Distinguished Cadet',
  'Honor Cadet',
  'Cadet Achievement',
  'Unit Achievement',
  'Military Aptitude',
  'Naval Science IV Outstanding Cadet',
  'Naval Science III Outstanding Cadet',
  'Naval Science II Outstanding Cadet',
  'Naval Science I Outstanding Cadet',
  'Exemplary Conduct',
  'Exemplary Personal Appearance',
  'Physical Fitness',
  'Participation',
  'Unit Service',
  'Community Service',
  'Academic Team',
  'Drill Team',
  'Color Guard',
  'STEM',
  'Rifle Team',
  'Orienteering',
  'Inter-Service Competition',
  'Recruiting',
  'Basic Leadership Training',
  'Sea Cruise',
];

const ribbonImageModules = import.meta.glob('../assets/ribbonPhotos/Ribbons/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
});

const ribbonAttachmentModules = import.meta.glob('../assets/ribbonPhotos/Attachments/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
});

const ribbonImages = Object.fromEntries(
  Object.entries(ribbonImageModules).map(([path, src]) => [path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase(), src])
);

const attachmentImages = Object.fromEntries(
  Object.entries(ribbonAttachmentModules).map(([path, src]) => [path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase(), src])
);

function getRibbonImage(name) {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();
  const key = normalized;
  return ribbonImages[key] || null;
}

function getAttachmentImage(name) {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();
  return attachmentImages[normalized] || null;
}

function parseRibbonData(ribbon) {
  if (typeof ribbon === 'string') {
    return { name: ribbon, attachments: [] };
  }

  return {
    name: ribbon.name || ribbon.label || ribbon.title || '',
    attachments: Array.isArray(ribbon.attachments) ? ribbon.attachments : [],
  };
}

function CadetDashboard() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [completedCompetitionIds, setCompletedCompetitionIds] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem('cadetCompletedCompetitions') || '[]');
    } catch (error) {
      return [];
    }
  });
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const previewRef = useRef(null);
  const imageRef = useRef(null);

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreviewUrl(url);
  };

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    if (!isDragging || !dragStart) return undefined;

    const moveHandler = (event) => {
      if (!dragStart || !imageSize.width || !imageSize.height) return;
      const deltaX = event.clientX - dragStart.startX;
      const deltaY = event.clientY - dragStart.startY;
      const ratioX = imageSize.naturalWidth / imageSize.width;
      const ratioY = imageSize.naturalHeight / imageSize.height;
      const nextX = dragStart.rect.x + deltaX * ratioX;
      const nextY = dragStart.rect.y + deltaY * ratioY;
      setCropRect((current) =>
        clampRect(
          {
            ...current,
            x: nextX,
            y: nextY,
          },
          {
            x: 0,
            y: 0,
            width: imageSize.naturalWidth,
            height: imageSize.naturalHeight,
          }
        )
      );
    };

    const upHandler = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler);

    return () => {
      window.removeEventListener('pointermove', moveHandler);
      window.removeEventListener('pointerup', upHandler);
    };
  }, [isDragging, dragStart, imageSize]);

  const handleImageLoad = (event) => {
    const naturalWidth = event.target.naturalWidth;
    const naturalHeight = event.target.naturalHeight;
    const bounds = previewRef.current?.getBoundingClientRect();
    setImageSize({
      width: bounds?.width || naturalWidth,
      height: bounds?.height || naturalHeight,
      naturalWidth,
      naturalHeight,
    });
    setCropRect(createInitialCrop(naturalWidth, naturalHeight));
  };

  const captureCroppedPhoto = async () => {
    if (!imageRef.current || !photoPreviewUrl) return null;
    const canvas = document.createElement('canvas');
    const targetWidth = 400;
    const targetHeight = 500;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(
      imageRef.current,
      cropRect.x,
      cropRect.y,
      cropRect.width,
      cropRect.height,
      0,
      0,
      targetWidth,
      targetHeight
    );
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const handleSavePhoto = async () => {
    const photoUrl = await captureCroppedPhoto();
    if (!photoUrl || !profile?.id) return;

    const { error } = await supabase
      .from('cadet_profiles')
      .update({ profile_photo_url: photoUrl })
      .eq('id', profile.id);

    if (error) {
      console.error('Unable to save profile photo', error);
      return;
    }

    await refreshProfile();
    setProfileModalOpen(false);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setCropRect({ x: 0, y: 0, width: 0, height: 0 });
  };

  const competitions = useMemo(() => parseJsonData(profile?.competition_signups), [profile?.competition_signups]);
  const ribbons = useMemo(() => parseJsonData(profile?.ribbons), [profile?.ribbons]);
  const overdueForms = useMemo(() => parseJsonData(profile?.overdue_forms), [profile?.overdue_forms]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('cadetCompletedCompetitions', JSON.stringify(completedCompetitionIds));
  }, [completedCompetitionIds]);

  useEffect(() => {
    if (!loading && overdueForms.length > 0) {
      setShowOverdueModal(true);
    }
  }, [loading, overdueForms]);

  if (loading) {
    return (
      <section className="page-section">
        <SectionHeader eyebrow="Dashboard" title="Loading..." text="Please wait while your session is confirmed." />
        <div className="content-panel">
          <p>Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-section">
        <SectionHeader eyebrow="Dashboard" title="Please sign in" text="You must be logged in to see your cadet dashboard." />
        <div className="content-panel">
          <p>
            <a href="#/login" className="ghost-button">
              Go to Login
            </a>
          </p>
        </div>
      </section>
    );
  }

  const selectedCompetition = competitions.find((competition) => competition.competition_id === selectedCompetitionId);
  const competitionLabel = (competition) =>
    competition?.competition_name || competition?.name || competition?.competition_id || 'Competition';
  const activeForms = (selectedCompetition?.required_forms || []).map((form) => {
    if (typeof form === 'string') {
      return { id: form.replace(/[^a-z0-9]+/gi, '-').toLowerCase(), label: form };
    }
    return {
      id: form.id || String(form.label || form.name || form).replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
      label: form.label || form.name || String(form),
      description: form.description,
    };
  });
  const allFormsUploaded = activeForms.every((form) => Boolean(uploadedFiles[form.id]));
  const hasCompetitions = competitions.length > 0;
  const openCompetitions = competitions.filter((competition) => !completedCompetitionIds.includes(competition.competition_id));
  const completedCompetitions = competitions.filter((competition) => completedCompetitionIds.includes(competition.competition_id));
  const overdueCompetitions = overdueForms.length > 0 ? overdueForms : openCompetitions.filter((competition) => competition.due_date && new Date(competition.due_date) < new Date());

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Cadet Dashboard"
        title="Welcome back"
        text="This is your personal space for profile details, upcoming forms, and unit resources."
      />

      <div className="dashboard-grid">
        <aside className="dashboard-profile-card">
          <div className="dashboard-photo-frame">
            {profile?.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt={`${profile.name || 'Cadet'} profile`} />
            ) : (
              <div className="dashboard-photo-placeholder">No photo available</div>
            )}
            {getRankInsignia(profile?.rank) && (
              <div className="rank-insignia">
                <img src={getRankInsignia(profile.rank)} alt={`${profile.rank} insignia`} />
              </div>
            )}
            <button
              type="button"
              className="photo-upload-button"
              onClick={() => setProfileModalOpen(true)}
            >
              +
              <span className="sr-only">Upload profile photo</span>
            </button>
          </div>

          <div className="dashboard-profile-copy">
            <p className="card-tag">Cadet Profile</p>
            <h3 style={{ padding: '10px 0 0 0' }}>{profile?.name || user.email}</h3>
            {profile?.rank && <p className="profile-line">Rank: {profile.rank}</p>}
            {profile?.ns_level && <p className="profile-line">NS Level: {profile.ns_level}</p>}
            {profile?.platoon && <p className="profile-line">Platoon: {profile.platoon}</p>}
            {profile?.role && <p className="profile-line">Role: {profile.role}</p>}
            <p className="profile-line">Email: {user.email}</p>
          </div>
        </aside>

        <div className="dashboard-main-column">
          <div className="dashboard-summary-row">
            <div className="dashboard-card">
              <p className="card-tag">Forms Due</p>
              <h3>{openCompetitions.length || 'No forms due'}</h3>
              {hasCompetitions ? (
                <ul className="forms-list">
                  {openCompetitions.map((competition) => (
                    <li key={competition.competition_id}>
                      <button
                        type="button"
                        className={`forms-list-item${completedCompetitionIds.includes(competition.competition_id) ? ' is-complete' : ''}`}
                        onClick={() => setSelectedCompetitionId(competition.competition_id)}
                      >
                        <span>
                          {competitionLabel(competition)}
                          <small>{competition.date || competition.due_date}</small>
                        </span>
                        <span>{completedCompetitionIds.includes(competition.competition_id) ? 'Completed' : 'View'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No competitions are assigned to your profile yet.</p>
              )}
            </div>

            <div className="dashboard-card dashboard-actions">
              <p className="card-tag">Quick Actions</p>
              <div className="action-links">
                <a href="#/competitions" className="ghost-button">
                  Competition Registration
                </a>
                <a href="#/calendar" className="ghost-button">
                  Training Calendar
                </a>
                <a href="#/chain-of-command" className="ghost-button">
                  Unit Resources
                </a>
              </div>
            </div>
          </div>

          <div className="dashboard-card ribbons-panel">
            <p className="card-tag">Ribbons</p>
            {ribbons.length > 0 ? (
              <div className="ribbon-grid">
                {ribbons
                  .map(parseRibbonData)
                  .slice()
                  .sort((a, b) => {
                    const aIndex = ribbonPriority.indexOf(a.name);
                    const bIndex = ribbonPriority.indexOf(b.name);
                    return (aIndex === -1 ? ribbonPriority.length : aIndex) - (bIndex === -1 ? ribbonPriority.length : bIndex);
                  })
                  .map((ribbon) => {
                    const ribbonSrc = getRibbonImage(ribbon.name);
                    return (
                      <div key={ribbon.name} className="ribbon-item">
                        {Array.isArray(ribbon.attachments) && ribbon.attachments.length > 0 && (
                          <div className="ribbon-attachment-overlay">
                            {ribbon.attachments.slice(0, 3).map((attachment) => {
                              const attachmentSrc = getAttachmentImage(attachment);
                              return (
                                <span key={attachment} className="ribbon-attachment-pill">
                                  {attachmentSrc ? (
                                    <img src={attachmentSrc} alt={attachment} />
                                  ) : (
                                    <span style={{ fontSize: '10px', color: 'var(--text-soft)' }}>{attachment[0]}</span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {ribbonSrc ? (
                          <img src={ribbonSrc} alt={ribbon.name} />
                        ) : (
                          <div className="ribbon-fallback">{ribbon.name}</div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p>No ribbons recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {profileModalOpen && (
        <div className="dashboard-modal-backdrop" role="dialog" aria-modal="true">
          <div className="dashboard-modal">
            <div className="modal-header">
              <div>
                <p className="section-kicker">Update Profile Photo</p>
                <h3>Crop your image</h3>
                <p className="page-intro">Choose a photo and crop it to fit your dashboard profile frame.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setProfileModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="photo-crop-editor">
                <div className="photo-crop-preview" ref={previewRef}>
                  {photoPreviewUrl ? (
                    <>
                      <img
                        ref={imageRef}
                        src={photoPreviewUrl}
                        alt="Selected profile"
                        onLoad={handleImageLoad}
                      />
                      <div
                        className="crop-area"
                        style={{
                          left: `${(cropRect.x / imageSize.naturalWidth) * imageSize.width}px`,
                          top: `${(cropRect.y / imageSize.naturalHeight) * imageSize.height}px`,
                          width: `${(cropRect.width / imageSize.naturalWidth) * imageSize.width}px`,
                          height: `${(cropRect.height / imageSize.naturalHeight) * imageSize.height}px`,
                        }}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          setIsDragging(true);
                          setDragStart({
                            startX: event.clientX,
                            startY: event.clientY,
                            rect: cropRect,
                          });
                        }}
                      />
                    </>
                  ) : (
                    <div className="photo-crop-placeholder">
                      <span>Select a photo to begin</span>
                    </div>
                  )}
                </div>

                <div className="photo-crop-controls">
                  <label className="upload-label">
                    Choose file
                    <input type="file" accept="image/*" onChange={handlePhotoSelect} />
                  </label>
                  <p className="photo-crop-help">Drag the crop box to adjust your profile photo. The final image will be saved in the dashboard profile frame.</p>
                  <div className="photo-crop-actions">
                    <button type="button" className="ghost-button" onClick={() => setProfileModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="button" className="join-button" disabled={!photoPreviewUrl} onClick={handleSavePhoto}>
                      Save Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCompetition && (
        <div className="dashboard-modal-backdrop" role="dialog" aria-modal="true">
          <div className="dashboard-modal">
            <div className="modal-header">
              <div>
                <p className="section-kicker">{competitionLabel(selectedCompetition)}</p>
                <h3>{competitionLabel(selectedCompetition)}</h3>
                <p className="page-intro">Submit the required forms for this competition.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setSelectedCompetitionId(null)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <ul className="modal-form-list">
                {activeForms.map((form) => (
                  <li key={form.id} className="modal-form-item">
                    <div>
                      <strong>{form.label}</strong>
                      {form.description && <p>{form.description}</p>}
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setUploadedFiles((current) => ({ ...current, [form.id]: file.name }));
                      }}
                    />
                    {uploadedFiles[form.id] && <span className="form-uploaded">{uploadedFiles[form.id]}</span>}
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={() => setSelectedCompetitionId(null)}>
                Close
              </button>
              <button
                type="button"
                className="join-button"
                disabled={!allFormsUploaded}
                onClick={() => {
                  setCompletedCompetitionIds((current) => [...new Set([...current, selectedCompetition.competition_id])]);
                  setUploadedFiles({});
                  setSelectedCompetitionId(null);
                }}
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {showOverdueModal && overdueCompetitions.length > 0 && (
        <div className="dashboard-modal-backdrop" role="alertdialog" aria-modal="true">
          <div className="dashboard-modal">
            <div className="modal-header">
              <div>
                <p className="section-kicker">Overdue Forms</p>
                <h3>Attention Needed</h3>
                <p className="page-intro">These competitions have overdue paperwork and should be updated first.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowOverdueModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <ul className="modal-overdue-list">
                {overdueCompetitions.map((item) => (
                  <li key={item.competition_id || item.competition_name}>
                    <strong>{item.competition_name || item.name || item.competition_id}</strong>
                    <p>{item.reason || 'Required forms are past due.'}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-actions">
              <button type="button" className="join-button" onClick={() => setShowOverdueModal(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CadetDashboard;
