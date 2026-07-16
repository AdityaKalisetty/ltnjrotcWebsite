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

function getCompetitionId(competition) {
  if (!competition) return '';
  return typeof competition === 'string'
    ? competition
    : competition?.competition_id || competition?.id || '';
}

function getCompetitionLabel(competition) {
  if (!competition) return 'Competition';
  return typeof competition === 'string'
    ? competition
    : competition?.competition_name || competition?.name || competition?.competition_id || 'Competition';
}

function getCompetitionDate(competition) {
  if (!competition) return '';
  return typeof competition === 'string'
    ? ''
    : competition?.date || competition?.due_date || '';
}

function resolveCompetition(competition, competitionCatalog) {
  const competitionId = getCompetitionId(competition);
  const catalogItem = competitionCatalog.find((item) => item.id === competitionId);

  if (typeof competition === 'string') {
    return {
      competition_id: competitionId,
      competition_name: catalogItem?.name || competitionId,
      date: catalogItem?.date || '',
      due_date: catalogItem?.date || '',
      required_forms: catalogItem?.formRequirements || [],
    };
  }

  if (!competition) {
    return null;
  }

  return {
    ...competition,
    competition_id: competitionId,
    competition_name: competition.competition_name || competition.name || catalogItem?.name || competitionId,
    date: competition.date || competition.due_date || catalogItem?.date || '',
    due_date: competition.due_date || competition.date || catalogItem?.date || '',
    required_forms: competition.required_forms || catalogItem?.formRequirements || [],
  };
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

const availableRibbonOptions = Object.entries(ribbonImageModules)
  .map(([path, src]) => ({
    name: path.split('/').pop().replace(/\.[^.]+$/, ''),
    src,
  }))
  .sort((first, second) => {
    const firstIndex = ribbonPriority.indexOf(first.name);
    const secondIndex = ribbonPriority.indexOf(second.name);
    const normalizedFirst = firstIndex === -1 ? ribbonPriority.length : firstIndex;
    const normalizedSecond = secondIndex === -1 ? ribbonPriority.length : secondIndex;

    if (normalizedFirst !== normalizedSecond) {
      return normalizedFirst - normalizedSecond;
    }

    return first.name.localeCompare(second.name);
  });

const availableAttachmentOptions = Object.entries(ribbonAttachmentModules)
  .map(([path, src]) => ({
    name: path.split('/').pop().replace(/\.[^.]+$/, ''),
    src,
  }))
  .sort((first, second) => first.name.localeCompare(second.name));

function getRibbonImage(name) {
  if (!name) return null;
  return ribbonImages[name.toLowerCase().trim()] || null;
}

function getAttachmentImage(name) {
  if (!name) return null;
  return attachmentImages[name.toLowerCase().trim()] || null;
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

function sortRibbonList(ribbons) {
  return ribbons
    .map(parseRibbonData)
    .slice()
    .sort((first, second) => {
      const firstIndex = ribbonPriority.indexOf(first.name);
      const secondIndex = ribbonPriority.indexOf(second.name);
      const normalizedFirst = firstIndex === -1 ? ribbonPriority.length : firstIndex;
      const normalizedSecond = secondIndex === -1 ? ribbonPriority.length : secondIndex;

      if (normalizedFirst !== normalizedSecond) {
        return normalizedFirst - normalizedSecond;
      }

      return first.name.localeCompare(second.name);
    });
}

function createProfileForm(profile) {
  return {
    name: profile?.name || '',
    rank: profile?.rank || '',
    ns_level: profile?.ns_level || '',
    platoon: profile?.platoon || '',
    role: profile?.role || '',
  };
}

function createRibbonForm(profile) {
  return {
    ribbons: sortRibbonList(parseJsonData(profile?.ribbons)).map((ribbon) => ({
      ...ribbon,
      attachments: [ribbon.attachments[0] || ''],
    })),
  };
}

function CadetDashboard({
  competitionCatalog = [],
  managedProfile = null,
  managedEmail = '',
  onManagedProfileRefresh = null,
  readOnly = false,
}) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const activeProfile = managedProfile || profile;
  const activeEmail = managedEmail || managedProfile?.email || user?.email || '';
  const isManagedView = Boolean(managedProfile);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileForm, setProfileForm] = useState(() => createProfileForm(null));
  const [profileFormMessage, setProfileFormMessage] = useState('');
  const [profileFormError, setProfileFormError] = useState('');
  const [ribbonEditorOpen, setRibbonEditorOpen] = useState(false);
  const [ribbonForm, setRibbonForm] = useState(() => createRibbonForm(null));
  const [ribbonFormMessage, setRibbonFormMessage] = useState('');
  const [ribbonFormError, setRibbonFormError] = useState('');
  const [ribbonEditorTab, setRibbonEditorTab] = useState('checklist');
  const [ribbonSearch, setRibbonSearch] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingRibbons, setIsSavingRibbons] = useState(false);
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

  const competitions = useMemo(
    () => parseJsonData(activeProfile?.competition_signups),
    [activeProfile?.competition_signups]
  );
  const allCompetitions = useMemo(
    () => competitions.map((competition) => resolveCompetition(competition, competitionCatalog)).filter(Boolean),
    [competitions, competitionCatalog]
  );
  const ribbons = useMemo(() => sortRibbonList(parseJsonData(activeProfile?.ribbons)), [activeProfile?.ribbons]);
  const overdueForms = useMemo(() => parseJsonData(activeProfile?.overdue_forms), [activeProfile?.overdue_forms]);

  const filteredRibbonOptions = useMemo(() => {
    const searchTerm = ribbonSearch.trim().toLowerCase();

    return availableRibbonOptions.filter((option) => {
      if (!searchTerm) {
        return true;
      }

      return option.name.toLowerCase().includes(searchTerm);
    });
  }, [ribbonForm.ribbons, ribbonSearch]);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('cadetCompletedCompetitions', JSON.stringify(completedCompetitionIds));
  }, [completedCompetitionIds]);

  useEffect(() => {
    if (!loading && overdueForms.length > 0) {
      setShowOverdueModal(true);
    }
  }, [loading, overdueForms]);

  const refreshActiveProfile = async () => {
    if (isManagedView && onManagedProfileRefresh) {
      return onManagedProfileRefresh();
    }

    return refreshProfile();
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreviewUrl(url);
  };

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
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.drawImage(
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
    if (!photoUrl || !activeProfile?.id) return;

    const { error } = await supabase
      .from('cadet_profiles')
      .update({ profile_photo_url: photoUrl })
      .eq('id', activeProfile.id);

    if (error) {
      console.error('Unable to save profile photo', error);
      return;
    }

    await refreshActiveProfile();
    setProfileModalOpen(false);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setCropRect({ x: 0, y: 0, width: 0, height: 0 });
  };

  const openProfileEditor = () => {
    setProfileForm(createProfileForm(activeProfile));
    setProfileFormMessage('');
    setProfileFormError('');
    setProfileEditorOpen(true);
  };

  const closeProfileEditor = () => {
    setProfileEditorOpen(false);
    setProfileFormMessage('');
    setProfileFormError('');
  };

  const openRibbonEditor = () => {
    setRibbonForm(createRibbonForm(activeProfile));
    setRibbonFormMessage('');
    setRibbonFormError('');
    setRibbonSearch('');
    setRibbonEditorTab('checklist');
    setProfileEditorOpen(false);
    setRibbonEditorOpen(true);
  };

  const closeRibbonEditor = () => {
    setRibbonEditorOpen(false);
    setRibbonFormMessage('');
    setRibbonFormError('');
    setRibbonSearch('');
  };

  const handleProfileFormChange = (field, value) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleToggleRibbon = (ribbonName) => {
    setRibbonForm((current) => {
      const exists = current.ribbons.some((ribbon) => ribbon.name === ribbonName);

      if (exists) {
        return {
          ...current,
          ribbons: current.ribbons.filter((ribbon) => ribbon.name !== ribbonName),
        };
      }

      return {
        ...current,
        ribbons: sortRibbonList([...current.ribbons, { name: ribbonName, attachments: [] }]),
      };
    });
  };

  const handleRibbonAttachmentChange = (ribbonName, slotIndex, value) => {
    setRibbonForm((current) => ({
      ...current,
      ribbons: current.ribbons.map((ribbon) => {
        if (ribbon.name !== ribbonName) {
          return ribbon;
        }

        return {
          ...ribbon,
          attachments: [slotIndex === 0 ? value : ribbon.attachments[0] || ''],
        };
      }),
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setProfileFormError('');
    setProfileFormMessage('');

    if (!activeProfile?.id) {
      setProfileFormError('Your profile is still loading. Please try again.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const { error } = await supabase
        .from('cadet_profiles')
        .update({
          name: profileForm.name.trim(),
          rank: profileForm.rank.trim(),
          ns_level: profileForm.ns_level.trim(),
          platoon: profileForm.platoon.trim(),
          role: profileForm.role.trim(),
        })
        .eq('id', activeProfile.id);

      if (error) {
        setProfileFormError(error.message || 'Unable to save your profile.');
        return;
      }

      await refreshActiveProfile();
      setProfileFormMessage('Profile updated.');
      window.setTimeout(() => {
        setProfileEditorOpen(false);
        setProfileFormMessage('');
      }, 700);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveRibbons = async (event) => {
    event.preventDefault();
    setRibbonFormError('');
    setRibbonFormMessage('');

    if (!activeProfile?.id) {
      setRibbonFormError('Your profile is still loading. Please try again.');
      return;
    }

    setIsSavingRibbons(true);

    try {
      const ribbonsToSave = sortRibbonList(ribbonForm.ribbons)
        .filter((ribbon) => ribbon.name.trim())
        .map((ribbon) => ({
          name: ribbon.name.trim(),
          attachments: ribbon.attachments.filter(Boolean).slice(0, 1),
        }));

      const { error } = await supabase
        .from('cadet_profiles')
        .update({
          ribbons: ribbonsToSave,
        })
        .eq('id', activeProfile.id);

      if (error) {
        setRibbonFormError(error.message || 'Unable to save your ribbons.');
        return;
      }

      await refreshActiveProfile();
      setRibbonFormMessage('Ribbons updated.');
      window.setTimeout(() => {
        setRibbonEditorOpen(false);
        setRibbonFormMessage('');
      }, 700);
    } finally {
      setIsSavingRibbons(false);
    }
  };

  if (!isManagedView && loading) {
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
        <SectionHeader eyebrow="Dashboard" title="Please log in" text="You must be logged in to see your cadet dashboard." />
        <div className="content-panel">
          <p>
            <a href="#/login" className="ghost-button">
              Go to Log In
            </a>
          </p>
        </div>
      </section>
    );
  }

  const selectedCompetition = allCompetitions.find(
    (competition) => getCompetitionId(competition) === selectedCompetitionId
  );
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
  const hasCompetitions = allCompetitions.length > 0;
  const openCompetitions = allCompetitions.filter((competition) => {
    const competitionId = getCompetitionId(competition);
    return competitionId && !completedCompetitionIds.includes(competitionId);
  });
  const overdueCompetitions = overdueForms.length > 0
    ? overdueForms
    : openCompetitions.filter((competition) => {
        const date = getCompetitionDate(competition);
        return date && new Date(date) < new Date();
      });

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Cadet Dashboard"
        title="Welcome back"
        text={
          readOnly
            ? "You're viewing this cadet's dashboard in portfolio mode."
            : isManagedView
            ? "You're editing this cadet's dashboard, including their profile details, forms, and ribbons."
            : 'This is your personal space for profile details, upcoming forms, and unit resources.'
        }
      />

      <div className="dashboard-grid">
        <aside className="dashboard-profile-card">
          <div className="dashboard-photo-frame">
            {activeProfile?.profile_photo_url ? (
              <img src={activeProfile.profile_photo_url} alt={`${activeProfile.name || 'Cadet'} profile`} />
            ) : (
              <div className="dashboard-photo-placeholder">No photo available</div>
            )}
            {getRankInsignia(activeProfile?.rank) && (
              <div className="rank-insignia">
                <img src={getRankInsignia(activeProfile.rank)} alt={`${activeProfile.rank} insignia`} />
              </div>
            )}
            {!readOnly && (
              <button
                type="button"
                className="photo-upload-button"
                onClick={() => setProfileModalOpen(true)}
              >
                +
                <span className="sr-only">Upload profile photo</span>
              </button>
            )}
          </div>

          <div className="dashboard-profile-copy">
            <div className="profile-summary-header">
              <p className="card-tag">Cadet Profile</p>
              {!readOnly && (
                <button type="button" className="profile-edit-button" onClick={openProfileEditor}>
                  <span className="profile-edit-button-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1 1 0 0 0 0-1.41l-2.5-2.5a1 1 0 0 0-1.41 0l-1.96 1.96 3.75 3.75Z" />
                    </svg>
                  </span>
                  <span>Edit</span>
                </button>
              )}
            </div>

            <h3>{activeProfile?.name || activeEmail}</h3>
            {activeProfile?.rank && <p className="profile-line">Rank: {activeProfile.rank}</p>}
            {activeProfile?.ns_level && <p className="profile-line">NS Level: {activeProfile.ns_level}</p>}
            {activeProfile?.platoon && <p className="profile-line">Platoon: {activeProfile.platoon}</p>}
            {activeProfile?.role && <p className="profile-line">Role: {activeProfile.role}</p>}
            <p className="profile-line">Email: {activeEmail}</p>
          </div>
        </aside>

        <div className="dashboard-main-column">
          <div className="dashboard-summary-row">
            <div className="dashboard-card">
              <p className="card-tag">Forms Due</p>
              {hasCompetitions ? (
                <ul className="forms-list">
                  {openCompetitions.map((competition) => {
                    const competitionId = getCompetitionId(competition);
                    const isComplete = completedCompetitionIds.includes(competitionId);

                    return (
                      <li key={competitionId || getCompetitionLabel(competition)}>
                        <button
                          type="button"
                          className={`forms-list-item${isComplete ? ' is-complete' : ''}`}
                          onClick={() => competitionId && setSelectedCompetitionId(competitionId)}
                        >
                          <span>
                            {getCompetitionLabel(competition)}
                            <small>{getCompetitionDate(competition)}</small>
                          </span>
                          <span>{isComplete ? 'Completed' : 'View'}</span>
                        </button>
                      </li>
                    );
                  })}
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
                <a href="#/unit-resources" className="ghost-button">
                  Unit Resources
                </a>
              </div>
            </div>
          </div>

          <div className="dashboard-card ribbons-panel">
            <div className="ribbons-panel-header">
              <p className="card-tag">Ribbons</p>
              {!readOnly && (
                <button type="button" className="ribbon-manage-button" onClick={openRibbonEditor}>
                  <span className="profile-edit-button-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1 1 0 0 0 0-1.41l-2.5-2.5a1 1 0 0 0-1.41 0l-1.96 1.96 3.75 3.75Z" />
                    </svg>
                  </span>
                  <span className="sr-only">Edit ribbons</span>
                </button>
              )}
            </div>
            {ribbons.length > 0 ? (
              (() => {
                const rows = [];
                const remainder = ribbons.length % 3;
                if (remainder > 0) rows.push(ribbons.slice(0, remainder));
                for (let index = remainder; index < ribbons.length; index += 3) {
                  rows.push(ribbons.slice(index, index + 3));
                }

                return (
                  <div className="ribbon-rack">
                    {rows.map((row, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="ribbon-row"
                        style={{ justifyContent: row.length < 3 ? 'center' : 'flex-start' }}
                      >
                        {row.map((ribbon) => {
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
                                          <span style={{ fontSize: '10px', color: 'var(--text-soft)' }}>
                                            {attachment[0]}
                                          </span>
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
                    ))}
                  </div>
                );
              })()
            ) : (
              <p>No ribbons recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {!readOnly && profileEditorOpen && (
        <div className="dashboard-modal-backdrop" role="dialog" aria-modal="true">
          <div className="dashboard-modal dashboard-modal--wide">
            <div className="modal-header">
              <div>
                <p className="section-kicker">Edit Profile</p>
                <h3>Update your information</h3>
                <p className="page-intro">
                  {isManagedView ? "Keep this cadet's profile details current." : 'Keep your profile details current.'}
                </p>
              </div>
              <button type="button" className="icon-button" onClick={closeProfileEditor}>
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-editor-form">
              <div className="profile-editor-sections">
                <section className="profile-editor-section">
                  <div className="modal-section-heading">
                    <p className="card-tag">Section One</p>
                    <h4>Personal Information</h4>
                  </div>

                  <div className="profile-editor-grid">
                    <label className="auth-field">
                      <span className="auth-label">Full name</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={profileForm.name}
                        onChange={(event) => handleProfileFormChange('name', event.target.value)}
                        placeholder="Cadet name"
                      />
                    </label>

                    <label className="auth-field">
                      <span className="auth-label">Email</span>
                      <input
                        className="auth-input profile-editor-readonly"
                        type="email"
                        value={activeEmail}
                        disabled
                      />
                    </label>
                  </div>
                </section>

                <section className="profile-editor-section">
                  <div className="modal-section-heading">
                    <p className="card-tag">Section Two</p>
                    <h4>Rank and Unit</h4>
                  </div>

                  <div className="profile-editor-grid">
                    <label className="auth-field">
                      <span className="auth-label">Rank</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={profileForm.rank}
                        onChange={(event) => handleProfileFormChange('rank', event.target.value)}
                        placeholder="Cadet rank"
                      />
                    </label>

                    <label className="auth-field">
                      <span className="auth-label">NS level</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={profileForm.ns_level}
                        onChange={(event) => handleProfileFormChange('ns_level', event.target.value)}
                        placeholder="NS level"
                      />
                    </label>

                    <label className="auth-field">
                      <span className="auth-label">Platoon</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={profileForm.platoon}
                        onChange={(event) => handleProfileFormChange('platoon', event.target.value)}
                        placeholder="Platoon"
                      />
                    </label>

                    <label className="auth-field">
                      <span className="auth-label">Role</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={profileForm.role}
                        onChange={(event) => handleProfileFormChange('role', event.target.value)}
                        placeholder="Current billet or role"
                      />
                    </label>
                  </div>
                </section>

                <section className="profile-editor-section">
                  <div className="modal-section-heading">
                    <p className="card-tag">Section Three</p>
                    <h4>Awards and Ribbons</h4>
                  </div>

                  <p className="ribbon-empty-copy">
                    Ribbon editing now lives in the ribbons panel so it stays separate from your profile details.
                  </p>
                  <div className="modal-actions modal-actions--start">
                    <button type="button" className="ghost-button" onClick={openRibbonEditor}>
                      Manage Ribbons
                    </button>
                  </div>
                </section>
              </div>

              {profileFormError && <p className="auth-message auth-message--error">{profileFormError}</p>}
              {profileFormMessage && <p className="auth-message auth-message--success">{profileFormMessage}</p>}

              <div className="modal-actions">
                <button type="button" className="ghost-button" onClick={closeProfileEditor}>
                  Cancel
                </button>
                <button type="submit" className="join-button" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!readOnly && ribbonEditorOpen && (
        <div className="dashboard-modal-backdrop" role="dialog" aria-modal="true">
          <div className="dashboard-modal dashboard-modal--wide">
            <div className="modal-header">
              <div>
                <p className="section-kicker">Ribbon Editor</p>
                <h3>Manage your ribbons</h3>
                <p className="page-intro">Choose your ribbons, then assign an attachment for each one.</p>
              </div>
              <button type="button" className="icon-button" onClick={closeRibbonEditor}>
                Close
              </button>
            </div>

            <form onSubmit={handleSaveRibbons} className="profile-editor-form ribbon-editor-form--compact">
              <div className="ribbon-editor-tabs" role="tablist" aria-label="Ribbon editor sections">
                <button
                  type="button"
                  role="tab"
                  aria-selected={ribbonEditorTab === 'checklist'}
                  className={`ribbon-editor-tab ${ribbonEditorTab === 'checklist' ? 'is-active' : ''}`}
                  onClick={() => setRibbonEditorTab('checklist')}
                >
                  Ribbon Checklist
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={ribbonEditorTab === 'attachments'}
                  className={`ribbon-editor-tab ${ribbonEditorTab === 'attachments' ? 'is-active' : ''}`}
                  onClick={() => setRibbonEditorTab('attachments')}
                >
                  Attachments
                </button>
              </div>

              {ribbonEditorTab === 'checklist' ? (
                <section className="profile-editor-section">
                  <div className="modal-section-heading">
                    <p className="card-tag">Step One</p>
                    <h4>Select ribbons</h4>
                  </div>

                  <div className="ribbon-search-shell">
                    <label className="auth-field">
                      <span className="auth-label">Search ribbons</span>
                      <input
                        className="auth-input"
                        type="search"
                        value={ribbonSearch}
                        onChange={(event) => setRibbonSearch(event.target.value)}
                        placeholder="Filter the checklist"
                      />
                    </label>

                    <div className="ribbon-checklist">
                      {filteredRibbonOptions.map((option) => {
                        const checked = ribbonForm.ribbons.some((ribbon) => ribbon.name === option.name);

                        return (
                          <label key={option.name} className={`ribbon-checklist-item ${checked ? 'is-selected' : ''}`}>
                            <input
                              className="ribbon-checklist-input"
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleRibbon(option.name)}
                            />
                            <span className="ribbon-checklist-box" aria-hidden="true">
                              <svg viewBox="0 0 16 16" focusable="false">
                                <path d="M6.35 11.2 2.9 7.75l1.2-1.2 2.25 2.25 5.55-5.55 1.2 1.2Z" />
                              </svg>
                            </span>
                            <span className="ribbon-option-thumb">
                              <img src={option.src} alt={option.name} />
                            </span>
                            <span className="ribbon-option-meta">
                              <strong>{option.name}</strong>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ) : (
                <section className="profile-editor-section">
                  <div className="modal-section-heading">
                    <p className="card-tag">Step Two</p>
                    <h4>Choose attachments</h4>
                  </div>

                  <div className="ribbon-attachment-grid">
                    {ribbonForm.ribbons.length > 0 ? (
                      ribbonForm.ribbons.map((ribbon) => {
                        const ribbonSrc = getRibbonImage(ribbon.name);

                        return (
                          <article key={ribbon.name} className="ribbon-attachment-card">
                            <div className="ribbon-selected-title ribbon-selected-title--compact ribbon-attachment-card-title">
                              <span className="ribbon-selected-thumb ribbon-selected-thumb--large">
                                {ribbonSrc ? (
                                  <img src={ribbonSrc} alt={ribbon.name} />
                                ) : (
                                  <span>{ribbon.name.slice(0, 1)}</span>
                                )}
                              </span>
                              <div>
                                <strong>{ribbon.name}</strong>
                              </div>
                            </div>

                            <div className="ribbon-attachment-selectors ribbon-attachment-selectors--grid">
                              {[0].map((slotIndex) => {
                                const selectedValue = ribbon.attachments[slotIndex] || '';

                                return (
                                  <label
                                    key={`${ribbon.name}-${slotIndex}`}
                                    className="auth-field ribbon-attachment-field"
                                  >
                                    <span className="auth-label">Attachment</span>
                                    <div className="ribbon-attachment-select-wrap">
                                      {selectedValue && getAttachmentImage(selectedValue) ? (
                                        <span className="ribbon-attachment-select-thumb">
                                          <img src={getAttachmentImage(selectedValue)} alt={selectedValue} />
                                        </span>
                                      ) : null}
                                      <select
                                        className="auth-input auth-select ribbon-attachment-select"
                                        value={selectedValue}
                                        onChange={(event) =>
                                          handleRibbonAttachmentChange(ribbon.name, slotIndex, event.target.value)
                                        }
                                      >
                                        <option value="">None</option>
                                        {availableAttachmentOptions.map((option) => {
                                          return (
                                            <option key={option.name} value={option.name}>
                                              {option.name}
                                            </option>
                                          );
                                        })}
                                      </select>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <p className="ribbon-empty-copy">Select ribbons in the checklist tab first.</p>
                    )}
                  </div>
                </section>
              )}

              {ribbonFormError && <p className="auth-message auth-message--error">{ribbonFormError}</p>}
              {ribbonFormMessage && <p className="auth-message auth-message--success">{ribbonFormMessage}</p>}

              <div className="modal-actions">
                <button type="button" className="ghost-button" onClick={closeRibbonEditor}>
                  Cancel
                </button>
                <button type="submit" className="join-button" disabled={isSavingRibbons}>
                  {isSavingRibbons ? 'Saving...' : 'Save Ribbons'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!readOnly && profileModalOpen && (
        <div className="dashboard-modal-backdrop" role="dialog" aria-modal="true">
          <div className="dashboard-modal">
            <div className="modal-header">
              <div>
                <p className="section-kicker">Update Profile Photo</p>
                <h3>Crop your image</h3>
                <p className="page-intro">Choose a photo and crop it to fit your dashboard profile frame.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setProfileModalOpen(false)}>
                Close
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
                <p className="section-kicker">Forms</p>
                <h3>{getCompetitionLabel(selectedCompetition)}</h3>
                <p className="page-intro">
                  {readOnly ? 'Review the required forms for this competition.' : 'Submit the required forms for this competition.'}
                </p>
              </div>
              <button type="button" className="icon-button" onClick={() => setSelectedCompetitionId(null)}>
                Close
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
                    {readOnly ? (
                      <span className="form-uploaded">Required for this event</span>
                    ) : (
                      <>
                        <label className="modal-file-upload">
                          <span className="modal-file-upload-button">Choose PDF</span>
                          <span className="modal-file-upload-copy">
                            {uploadedFiles[form.id] ? 'Replace file' : 'Upload signed form'}
                          </span>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              setUploadedFiles((current) => ({ ...current, [form.id]: file.name }));
                            }}
                          />
                        </label>
                        {uploadedFiles[form.id] && <span className="form-uploaded">{uploadedFiles[form.id]}</span>}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={() => setSelectedCompetitionId(null)}>
                Close
              </button>
              {!readOnly && (
                <button
                  type="button"
                  className="join-button"
                  disabled={!allFormsUploaded}
                  onClick={() => {
                    const competitionId = getCompetitionId(selectedCompetition);
                    if (!competitionId) return;
                    setCompletedCompetitionIds((current) => [...new Set([...current, competitionId])]);
                    setUploadedFiles({});
                    setSelectedCompetitionId(null);
                  }}
                >
                  Mark Complete
                </button>
              )}
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
                Close
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
