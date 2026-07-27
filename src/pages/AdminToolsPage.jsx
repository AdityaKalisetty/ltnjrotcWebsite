import { useEffect, useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import CadetDashboard from './CadetDashboard';
import FormsCompliancePanel from '../components/FormsCompliancePanel';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../context/SiteContentContext';
import { supabase } from '../lib/supabaseClient';

const defaultCompetition = {
  id: '',
  name: '',
  types: [''],
  description: '',
  date: '',
  location: '',
  registrationCloses: '',
  formRequirements: [{ id: '', label: '' }],
};

const defaultCalendarItem = {
  date: '',
  title: '',
  detail: '',
};

const defaultWeeklyPlanDay = {
  day: '',
  rotation: '',
  morning: '',
  flagDetail: '',
  periods: ['', '', '', ''],
  afternoon: '',
  theme: 'a-day',
};

const photoCategoryOptions = [
  { id: 'competitions', label: 'Competitions' },
  { id: 'ceremonies', label: 'Ceremonies' },
  { id: 'socialsAndServices', label: 'Socials & Services' },
];

const EVENT_PHOTO_BUCKET = 'event-photos';
const ANNOUNCEMENT_BUCKET = 'announcement-posters';

const defaultPhotoEvent = {
  title: '',
  date: '',
  description: '',
  slug: '',
  photos: [],
};

const defaultAnnouncement = {
  id: '',
  title: '',
  date: '',
  summary: '',
  body: '',
  imageUrl: '',
  imageStoragePath: '',
};

function createCompetitionForm(competition) {
  if (!competition) {
    return defaultCompetition;
  }

  return {
    id: competition.id || '',
    name: competition.name || '',
    types: Array.isArray(competition.types) && competition.types.length > 0 ? competition.types : [''],
    description: competition.description || '',
    date: competition.date || '',
    location: competition.location || '',
    registrationCloses: competition.registrationCloses || '',
    formRequirements:
      Array.isArray(competition.formRequirements) && competition.formRequirements.length > 0
        ? competition.formRequirements.map((item) => ({
            id: item.id || '',
            label: item.label || '',
          }))
        : [{ id: '', label: '' }],
  };
}

function normalizeCompetition(competition) {
  return {
    id: competition.id.trim(),
    name: competition.name.trim(),
    types: competition.types.map((item) => item.trim()).filter(Boolean),
    description: competition.description.trim(),
    date: competition.date.trim(),
    location: competition.location.trim(),
    registrationCloses: competition.registrationCloses.trim(),
    formRequirements: competition.formRequirements
      .map((item) => ({
        id: item.id.trim(),
        label: item.label.trim(),
      }))
      .filter((item) => item.id && item.label),
  };
}

function createCalendarItemForm(item) {
  if (!item) {
    return defaultCalendarItem;
  }

  return {
    date: item.date || '',
    title: item.title || '',
    detail: item.detail || '',
  };
}

function normalizeCalendarItem(item) {
  return {
    date: item.date.trim(),
    title: item.title.trim(),
    detail: item.detail.trim(),
  };
}

function createWeeklyPlanForm(weeklyPlan) {
  return {
    rangeLabel: weeklyPlan?.rangeLabel || '',
    title: weeklyPlan?.title || '',
    footerNotes: Array.isArray(weeklyPlan?.footerNotes) ? weeklyPlan.footerNotes : [''],
    days:
      Array.isArray(weeklyPlan?.days) && weeklyPlan.days.length > 0
        ? weeklyPlan.days.map((day) => ({
            day: day.day || '',
            rotation: day.rotation || '',
            morning: day.morning || '',
            flagDetail: day.flagDetail || '',
            periods: Array.isArray(day.periods) && day.periods.length > 0 ? day.periods : ['', '', '', ''],
            afternoon: day.afternoon || '',
            theme: day.theme || 'a-day',
          }))
        : [defaultWeeklyPlanDay],
  };
}

function normalizeWeeklyPlan(plan) {
  return {
    rangeLabel: plan.rangeLabel.trim(),
    title: plan.title.trim(),
    footerNotes: plan.footerNotes.map((note) => note.trim()).filter(Boolean),
    days: plan.days.map((day) => ({
      day: day.day.trim(),
      rotation: day.rotation.trim(),
      morning: day.morning.trim(),
      flagDetail: day.flagDetail.trim(),
      periods: day.periods.map((period) => period.trim()).filter(Boolean),
      afternoon: day.afternoon.trim(),
      theme: day.theme || 'a-day',
    })),
  };
}

function createSpotlightForm(spotlight) {
  return {
    month: spotlight?.month || '',
    cadet: spotlight?.cadet || '',
    cadetName: spotlight?.cadetName || '',
    citation: spotlight?.citation || '',
    newsletterTitle: spotlight?.newsletterTitle || '',
    newsletterSummary: spotlight?.newsletterSummary || '',
  };
}

function normalizeSpotlight(spotlight) {
  return {
    month: spotlight.month.trim(),
    cadet: spotlight.cadet.trim(),
    cadetName: spotlight.cadetName.trim(),
    citation: spotlight.citation.trim(),
    newsletterTitle: spotlight.newsletterTitle.trim(),
    newsletterSummary: spotlight.newsletterSummary.trim(),
  };
}

function getRotationFromTheme(theme) {
  return theme === 'b-day' ? 'B' : 'A';
}

function formatRosterName(name) {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return 'Unnamed cadet';
  }

  const nameParts = normalizedName.split(/\s+/).filter(Boolean);

  if (nameParts.length === 1) {
    return nameParts[0];
  }

  const lastName = nameParts.at(-1);
  const firstNames = nameParts.slice(0, -1).join(' ');
  return `${lastName}, ${firstNames}`;
}

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function sanitizeFileSegment(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createPhotoEventForm(event) {
  if (!event) {
    return defaultPhotoEvent;
  }

  return {
    title: event.title || '',
    date: event.date || '',
    description: event.description || '',
    slug: event.slug || slugify(event.title),
    photos: Array.isArray(event.photos)
      ? event.photos.map((photo, index) => ({
          src: photo.src || '',
          name: photo.name || `Photo ${index + 1}`,
          storagePath: photo.storagePath || '',
        }))
      : [],
  };
}

function createAnnouncementForm(announcement) {
  if (!announcement) {
    return defaultAnnouncement;
  }

  return {
    id: announcement.id || '',
    title: announcement.title || '',
    date: announcement.date || '',
    summary: announcement.summary || '',
    body: announcement.body || '',
    imageUrl: announcement.imageUrl || '',
    imageStoragePath: announcement.imageStoragePath || '',
  };
}

function sortAnnouncements(items) {
  return items.slice().sort((first, second) => {
    if (first.date && second.date) {
      return second.date.localeCompare(first.date);
    }

    if (first.date) {
      return -1;
    }

    if (second.date) {
      return 1;
    }

    return first.title.localeCompare(second.title);
  });
}

function normalizeAnnouncements(items) {
  return sortAnnouncements(
    (items || [])
      .map((item) => ({
        id: slugify(item.id || item.title),
        title: item.title.trim(),
        date: item.date.trim(),
        summary: item.summary.trim(),
        body: item.body.trim(),
        imageUrl: (item.imageUrl || '').trim(),
        imageStoragePath: (item.imageStoragePath || '').trim(),
      }))
      .filter((item) => item.id && item.title)
  );
}

function sortPhotoEvents(events) {
  return events.slice().sort((first, second) => {
    if (first.date && second.date) {
      return second.date.localeCompare(first.date);
    }

    if (first.date) {
      return -1;
    }

    if (second.date) {
      return 1;
    }

    return first.title.localeCompare(second.title);
  });
}

function createPhotoCollectionsForm(collections) {
  return {
    competitions: sortPhotoEvents((collections?.competitions || []).map(createPhotoEventForm)),
    ceremonies: sortPhotoEvents((collections?.ceremonies || []).map(createPhotoEventForm)),
    socialsAndServices: sortPhotoEvents((collections?.socialsAndServices || []).map(createPhotoEventForm)),
  };
}

function normalizePhotoCollections(collections) {
  const normalizeEvent = (event) => ({
    title: event.title.trim(),
    date: event.date.trim(),
    description: event.description.trim(),
    slug: slugify(event.slug || event.title),
    photos: (event.photos || [])
      .map((photo, index) => ({
        src: photo.src,
        name: (photo.name || `Photo ${index + 1}`).trim(),
        storagePath: (photo.storagePath || '').trim(),
      }))
      .filter((photo) => photo.src),
  });

  return {
    competitions: sortPhotoEvents(
      (collections.competitions || [])
        .map(normalizeEvent)
        .filter((event) => event.title)
    ),
    ceremonies: sortPhotoEvents(
      (collections.ceremonies || [])
        .map(normalizeEvent)
        .filter((event) => event.title)
    ),
    socialsAndServices: sortPhotoEvents(
      (collections.socialsAndServices || [])
        .map(normalizeEvent)
        .filter((event) => event.title)
    ),
  };
}

function AdminToolsPage() {
  const { user, profile, loading } = useAuth();
  const {
    announcements,
    competitionCatalog,
    calendarItems,
    weeklyPlan,
    currentMonthSpotlight,
    photoCollections,
    saveSection,
    loading: siteContentLoading,
    error: siteContentError,
  } = useSiteContent();
  const [cadets, setCadets] = useState([]);
  const [cadetsLoading, setCadetsLoading] = useState(false);
  const [cadetsError, setCadetsError] = useState('');
  const [managedCadetId, setManagedCadetId] = useState('');
  const [managedCadetProfile, setManagedCadetProfile] = useState(null);
  const [managedCadetLoading, setManagedCadetLoading] = useState(false);
  const [managedCadetError, setManagedCadetError] = useState('');
  const [competitionDrafts, setCompetitionDrafts] = useState([]);
  const [savingCompetitions, setSavingCompetitions] = useState(false);
  const [competitionMessage, setCompetitionMessage] = useState('');
  const [competitionError, setCompetitionError] = useState('');
  const [calendarDrafts, setCalendarDrafts] = useState([]);
  const [weeklyPlanDraft, setWeeklyPlanDraft] = useState(() => createWeeklyPlanForm(weeklyPlan));
  const [spotlightDraft, setSpotlightDraft] = useState(() => createSpotlightForm(currentMonthSpotlight));
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState('');
  const [scheduleError, setScheduleError] = useState('');
  const [announcementDrafts, setAnnouncementDrafts] = useState(() =>
    sortAnnouncements(announcements.map((item) => createAnnouncementForm(item)))
  );
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState('');
  const [savingAnnouncements, setSavingAnnouncements] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementError, setAnnouncementError] = useState('');
  const [photoCollectionDrafts, setPhotoCollectionDrafts] = useState(() => createPhotoCollectionsForm(photoCollections));
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState('competitions');
  const [selectedPhotoEventSlug, setSelectedPhotoEventSlug] = useState('');
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [photoMessage, setPhotoMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [activeTab, setActiveTab] = useState('cadets');
  const [cadetSearch, setCadetSearch] = useState('');

  useEffect(() => {
    setCompetitionDrafts(competitionCatalog.map((item) => createCompetitionForm(item)));
  }, [competitionCatalog]);

  useEffect(() => {
    setCalendarDrafts(calendarItems.map((item) => createCalendarItemForm(item)));
  }, [calendarItems]);

  useEffect(() => {
    setWeeklyPlanDraft(createWeeklyPlanForm(weeklyPlan));
  }, [weeklyPlan]);

  useEffect(() => {
    setSpotlightDraft(createSpotlightForm(currentMonthSpotlight));
  }, [currentMonthSpotlight]);

  useEffect(() => {
    setAnnouncementDrafts(sortAnnouncements(announcements.map((item) => createAnnouncementForm(item))));
  }, [announcements]);

  useEffect(() => {
    setPhotoCollectionDrafts(createPhotoCollectionsForm(photoCollections));
  }, [photoCollections]);

  useEffect(() => {
    if (!announcementDrafts.some((item) => item.id === selectedAnnouncementId)) {
      setSelectedAnnouncementId(announcementDrafts[0]?.id || '');
    }
  }, [announcementDrafts, selectedAnnouncementId]);

  useEffect(() => {
    const events = photoCollectionDrafts[selectedPhotoCategory] || [];

    if (!events.some((event) => event.slug === selectedPhotoEventSlug)) {
      setSelectedPhotoEventSlug(events[0]?.slug || '');
    }
  }, [photoCollectionDrafts, selectedPhotoCategory, selectedPhotoEventSlug]);

  useEffect(() => {
    if (!profile?.is_admin) {
      return;
    }

    const loadCadets = async () => {
      setCadetsLoading(true);
      setCadetsError('');

      const { data, error } = await supabase
        .from('cadet_profiles')
        .select('id, name, email, rank, platoon, role, is_admin, competition_signups')
        .order('name', { ascending: true });

      if (error) {
        setCadetsError(error.message || 'Unable to load cadet roster.');
        setCadetsLoading(false);
        return;
      }

      setCadets(data || []);
      setCadetsLoading(false);
    };

    void loadCadets();
  }, [profile?.is_admin]);

  const filteredCadets = useMemo(() => {
    const searchTerm = cadetSearch.trim().toLowerCase();
    const matchingCadets = cadets.filter((cadet) =>
      [cadet.name, cadet.email, cadet.rank, cadet.platoon, cadet.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm))
    );

    if (!searchTerm) {
      return matchingCadets.slice().sort((first, second) => {
        return formatRosterName(first.name).localeCompare(formatRosterName(second.name));
      });
    }

    return matchingCadets.sort((first, second) => {
      return formatRosterName(first.name).localeCompare(formatRosterName(second.name));
    });
  }, [cadets, cadetSearch]);

  const selectedCadetSummary = useMemo(
    () => cadets.find((item) => item.id === managedCadetId) || null,
    [cadets, managedCadetId]
  );
  const activePhotoEvents = useMemo(
    () => photoCollectionDrafts[selectedPhotoCategory] || [],
    [photoCollectionDrafts, selectedPhotoCategory]
  );
  const selectedAnnouncement = useMemo(
    () => announcementDrafts.find((item) => item.id === selectedAnnouncementId) || null,
    [announcementDrafts, selectedAnnouncementId]
  );
  const selectedPhotoEvent = useMemo(
    () => activePhotoEvents.find((event) => event.slug === selectedPhotoEventSlug) || null,
    [activePhotoEvents, selectedPhotoEventSlug]
  );

  if (loading || siteContentLoading) {
    return (
      <section className="page-section">
        <SectionHeader eyebrow="Admin Tools" title="Loading..." text="Checking your access to the admin workspace." />
        <div className="content-panel">
          <p>Loading admin tools...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-section">
        <SectionHeader
          eyebrow="Admin Tools"
          title="Please log in"
          text="You need to be logged in before you can open the admin workspace."
        />
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

  if (!profile?.is_admin) {
    return (
      <section className="page-section">
        <SectionHeader
          eyebrow="Admin Tools"
          title="Access restricted"
          text="This page is only available to website admins."
        />
        <div className="content-panel">
          <p>Your account is signed in, but `is_admin` is not enabled on your cadet profile yet.</p>
        </div>
      </section>
    );
  }

  const loadManagedCadetProfile = async (cadetId) => {
    if (!cadetId) {
      setManagedCadetId('');
      setManagedCadetProfile(null);
      setManagedCadetError('');
      return;
    }

    setManagedCadetId(cadetId);
    setManagedCadetProfile(null);
    setManagedCadetLoading(true);
    setManagedCadetError('');

    const { data, error } = await supabase
      .from('cadet_profiles')
      .select(
        'id, auth_user_id, name, email, rank, ns_level, platoon, role, is_admin, profile_photo_url, ribbons, competition_signups, overdue_forms, awards'
      )
      .eq('id', cadetId)
      .maybeSingle();

    if (error || !data) {
      setManagedCadetProfile(null);
      setManagedCadetError(error?.message || 'Unable to open that cadet dashboard.');
      setManagedCadetLoading(false);
      return;
    }

    setManagedCadetId(cadetId);
    setManagedCadetProfile(data);
    setManagedCadetLoading(false);
  };

  const refreshManagedCadet = async () => {
    if (!managedCadetId) {
      return;
    }

    const { data, error } = await supabase
      .from('cadet_profiles')
      .select(
        'id, auth_user_id, name, email, rank, ns_level, platoon, role, is_admin, profile_photo_url, ribbons, competition_signups, overdue_forms, awards'
      )
      .eq('id', managedCadetId)
      .maybeSingle();

    if (error || !data) {
      setManagedCadetError(error?.message || 'Unable to refresh that cadet dashboard.');
      return;
    }

    setManagedCadetProfile(data);
    setManagedCadetError('');
    setCadets((current) =>
      current.map((item) =>
        item.id === managedCadetId
          ? {
              ...item,
              name: data.name || '',
              email: data.email || '',
              rank: data.rank || '',
              platoon: data.platoon || '',
              role: data.role || '',
              is_admin: Boolean(data.is_admin),
            }
          : item
      )
    );
  };

  const updatePhotoCategoryEvents = (categoryId, updater) => {
    setPhotoCollectionDrafts((current) => ({
      ...current,
      [categoryId]: sortPhotoEvents(updater(current[categoryId] || [])),
    }));
  };

  const updateAnnouncements = (updater) => {
    setAnnouncementDrafts((current) => sortAnnouncements(updater(current)));
  };

  const handleCreatePhotoEvent = () => {
    const nextEventBase = {
      ...defaultPhotoEvent,
      title: 'New Event',
      slug: slugify(`new-event-${Date.now()}`),
    };

    updatePhotoCategoryEvents(selectedPhotoCategory, (events) => [nextEventBase, ...events]);
    setSelectedPhotoEventSlug(nextEventBase.slug);
    setPhotoMessage('');
    setPhotoError('');
  };

  const handlePhotoEventFieldChange = (field, value) => {
    if (!selectedPhotoEvent) {
      return;
    }

    updatePhotoCategoryEvents(selectedPhotoCategory, (events) =>
      events.map((event) => {
        if (event.slug !== selectedPhotoEventSlug) {
          return event;
        }

        const nextEvent = {
          ...event,
          [field]: value,
        };

        if (field === 'title' && (!event.slug || event.slug === slugify(event.title))) {
          nextEvent.slug = slugify(value);
        }

        if (field === 'slug') {
          nextEvent.slug = slugify(value);
        }

        return nextEvent;
      })
    );
  };

  const handleDeletePhotoEvent = async () => {
    if (!selectedPhotoEvent) {
      return;
    }

    setPhotoError('');
    setPhotoMessage('');

    const deleteError = await deleteStoragePhotos(
      (selectedPhotoEvent.photos || []).map((photo) => photo.storagePath)
    );

    if (deleteError) {
      setPhotoError(deleteError.message || 'Unable to remove that event from storage.');
      return;
    }

    updatePhotoCategoryEvents(selectedPhotoCategory, (events) =>
      events.filter((event) => event.slug !== selectedPhotoEventSlug)
    );
    setSelectedPhotoEventSlug('');
    setPhotoMessage('Event removed.');
  };

  const deleteStorageObjects = async (bucketName, storagePaths) => {
    const pathsToDelete = storagePaths.filter(Boolean);

    if (pathsToDelete.length === 0) {
      return null;
    }

    const { error } = await supabase.storage.from(bucketName).remove(pathsToDelete);
    return error || null;
  };

  const deleteStoragePhotos = async (storagePaths) =>
    deleteStorageObjects(EVENT_PHOTO_BUCKET, storagePaths);

  const buildStorageObjectPath = (folderPath, fileName, index, fallbackName) => {
    const extensionMatch = fileName.match(/\.[^.]+$/);
    const extension = extensionMatch ? extensionMatch[0].toLowerCase() : '.jpg';
    const baseName =
      sanitizeFileSegment(fileName.replace(/\.[^.]+$/, '')) || `${fallbackName}-${index + 1}`;
    const uniqueSuffix =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${index + 1}`;

    return `${folderPath}/${baseName}-${uniqueSuffix}${extension}`;
  };

  const buildStoragePhotoPath = (categoryId, eventSlug, fileName, index) =>
    buildStorageObjectPath(`${categoryId}/${eventSlug}`, fileName, index, 'photo');

  const uploadPhotosToStorage = async (categoryId, eventSlug, fileList) => {
    const files = Array.from(fileList || []);

    return Promise.all(
      files.map(async (file, index) => {
        const storagePath = buildStoragePhotoPath(categoryId, eventSlug, file.name, index);
        const { error: uploadError } = await supabase.storage
          .from(EVENT_PHOTO_BUCKET)
          .upload(storagePath, file, { upsert: false });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from(EVENT_PHOTO_BUCKET).getPublicUrl(storagePath);

        return {
          src: data.publicUrl,
          name: file.name.replace(/\.[^.]+$/, '') || `Photo ${index + 1}`,
          storagePath,
        };
      })
    );
  };

  const uploadAnnouncementPosterToStorage = async (announcementId, file) => {
    const storagePath = buildStorageObjectPath(
      announcementId,
      file.name,
      0,
      'poster'
    );
    const { error: uploadError } = await supabase.storage
      .from(ANNOUNCEMENT_BUCKET)
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(ANNOUNCEMENT_BUCKET).getPublicUrl(storagePath);

    return {
      imageUrl: data.publicUrl,
      imageStoragePath: storagePath,
    };
  };

  const handleCreateAnnouncement = () => {
    const nextAnnouncement = {
      ...defaultAnnouncement,
      id: slugify(`announcement-${Date.now()}`),
      title: 'New Announcement',
      date: 'July 16, 2026',
    };

    updateAnnouncements((current) => [nextAnnouncement, ...current]);
    setSelectedAnnouncementId(nextAnnouncement.id);
    setAnnouncementMessage('');
    setAnnouncementError('');
  };

  const handleAnnouncementFieldChange = (field, value) => {
    if (!selectedAnnouncement) {
      return;
    }

    let nextSelectedId = selectedAnnouncementId;

    updateAnnouncements((current) =>
      current.map((item) => {
        if (item.id !== selectedAnnouncementId) {
          return item;
        }

        const nextAnnouncement = {
          ...item,
          [field]: value,
        };

        if (field === 'title' && (!item.id || item.id === slugify(item.title))) {
          nextAnnouncement.id = slugify(value);
        }

        nextSelectedId = nextAnnouncement.id;

        return nextAnnouncement;
      })
    );

    setSelectedAnnouncementId(nextSelectedId);
  };

  const handleAnnouncementPosterUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !selectedAnnouncement) {
      return;
    }

    if (!selectedAnnouncement.id) {
      setAnnouncementError('Give this announcement a title before uploading a poster.');
      event.target.value = '';
      return;
    }

    setAnnouncementError('');
    setAnnouncementMessage('');

    try {
      if (selectedAnnouncement.imageStoragePath) {
        await deleteStorageObjects(ANNOUNCEMENT_BUCKET, [selectedAnnouncement.imageStoragePath]);
      }

      const poster = await uploadAnnouncementPosterToStorage(selectedAnnouncement.id, file);

      updateAnnouncements((current) =>
        current.map((item) =>
          item.id === selectedAnnouncementId
            ? {
                ...item,
                ...poster,
              }
            : item
        )
      );
      event.target.value = '';
    } catch (error) {
      const message = error?.message || '';
      setAnnouncementError(
        /bucket not found/i.test(message)
          ? 'Announcement poster storage has not been set up yet. Run supabase/announcement_posters_storage.sql in the Supabase SQL Editor, then try again.'
          : message || 'Unable to upload that announcement poster.'
      );
    }
  };

  const handleRemoveAnnouncementPoster = async () => {
    if (!selectedAnnouncement?.imageStoragePath) {
      return;
    }

    setAnnouncementError('');
    setAnnouncementMessage('');

    const deleteError = await deleteStorageObjects(ANNOUNCEMENT_BUCKET, [
      selectedAnnouncement.imageStoragePath,
    ]);

    if (deleteError) {
      setAnnouncementError(deleteError.message || 'Unable to remove that announcement poster.');
      return;
    }

    updateAnnouncements((current) =>
      current.map((item) =>
        item.id === selectedAnnouncementId
          ? { ...item, imageUrl: '', imageStoragePath: '' }
          : item
      )
    );
  };

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) {
      return;
    }

    setAnnouncementError('');
    setAnnouncementMessage('');

    if (selectedAnnouncement.imageStoragePath) {
      const deleteError = await deleteStorageObjects(ANNOUNCEMENT_BUCKET, [
        selectedAnnouncement.imageStoragePath,
      ]);

      if (deleteError) {
        setAnnouncementError(deleteError.message || 'Unable to remove that announcement poster.');
        return;
      }
    }

    updateAnnouncements((current) =>
      current.filter((item) => item.id !== selectedAnnouncementId)
    );
    setSelectedAnnouncementId('');
    setAnnouncementMessage('Announcement removed.');
  };

  const handlePhotoUpload = async (event) => {
    const files = event.target.files;

    if (!files?.length || !selectedPhotoEvent) {
      return;
    }

    if (!selectedPhotoEvent.slug) {
      setPhotoError('Give this event a title or slug before uploading photos.');
      event.target.value = '';
      return;
    }

    try {
      const newPhotos = await uploadPhotosToStorage(
        selectedPhotoCategory,
        selectedPhotoEvent.slug,
        files
      );

      updatePhotoCategoryEvents(selectedPhotoCategory, (events) =>
        events.map((entry) =>
          entry.slug === selectedPhotoEventSlug
            ? { ...entry, photos: [...entry.photos, ...newPhotos] }
            : entry
        )
      );
      setPhotoError('');
      event.target.value = '';
    } catch (error) {
      setPhotoError(error.message || 'Unable to add those photos.');
    }
  };

  const handleRemovePhoto = async (photoIndex) => {
    if (!selectedPhotoEvent) {
      return;
    }

    const targetPhoto = selectedPhotoEvent.photos[photoIndex];
    setPhotoError('');
    setPhotoMessage('');

    if (targetPhoto?.storagePath) {
      const deleteError = await deleteStoragePhotos([targetPhoto.storagePath]);

      if (deleteError) {
        setPhotoError(deleteError.message || 'Unable to remove that photo from storage.');
        return;
      }
    }

    updatePhotoCategoryEvents(selectedPhotoCategory, (events) =>
      events.map((event) =>
        event.slug === selectedPhotoEventSlug
          ? { ...event, photos: event.photos.filter((_, index) => index !== photoIndex) }
          : event
      )
    );
  };

  const handlePhotoCollectionSave = async (event) => {
    event.preventDefault();
    setPhotoMessage('');
    setPhotoError('');

    const normalizedCollections = normalizePhotoCollections(photoCollectionDrafts);
    const allEvents = [
      ...normalizedCollections.competitions,
      ...normalizedCollections.ceremonies,
      ...normalizedCollections.socialsAndServices,
    ];
    const duplicateSlugs = allEvents.filter(
      (item, index) => allEvents.findIndex((candidate) => candidate.slug === item.slug) !== index
    );

    if (duplicateSlugs.length > 0) {
      setPhotoError('Each event needs a unique slug or title so its gallery link stays unique.');
      return;
    }

    setSavingPhotos(true);
    const { error } = await saveSection('photoCollections', normalizedCollections);

    if (error) {
      setPhotoError(error.message || 'Unable to save photo collections.');
      setSavingPhotos(false);
      return;
    }

    setPhotoCollectionDrafts(normalizedCollections);
    setPhotoMessage('Photo archive updated.');
    setSavingPhotos(false);
  };

  const handleCompetitionSave = async (event) => {
    event.preventDefault();
    setCompetitionMessage('');
    setCompetitionError('');

    const normalizedCompetitions = competitionDrafts.map(normalizeCompetition);
    const hasInvalidCompetition = normalizedCompetitions.some(
      (item) => !item.id || !item.name || !item.date
    );

    if (hasInvalidCompetition) {
      setCompetitionError('Each competition needs at least an id, name, and date.');
      return;
    }

    setSavingCompetitions(true);
    const { error } = await saveSection('competitionCatalog', normalizedCompetitions);

    if (error) {
      setCompetitionError(error.message || 'Unable to save competitions.');
      setSavingCompetitions(false);
      return;
    }

    setCompetitionMessage('Competitions updated.');
    setSavingCompetitions(false);
  };

  const handleScheduleSave = async (event) => {
    event.preventDefault();
    setScheduleMessage('');
    setScheduleError('');

    const normalizedCalendarItems = calendarDrafts
      .map(normalizeCalendarItem)
      .filter((item) => item.date || item.title || item.detail);
    const normalizedWeeklyPlan = normalizeWeeklyPlan(weeklyPlanDraft);
    const normalizedSpotlight = normalizeSpotlight(spotlightDraft);

    setSavingSchedule(true);

    const [calendarResult, weeklyPlanResult, spotlightResult] = await Promise.all([
      saveSection('calendarItems', normalizedCalendarItems),
      saveSection('weeklyPlan', normalizedWeeklyPlan),
      saveSection('currentMonthSpotlight', normalizedSpotlight),
    ]);

    const firstError = calendarResult.error || weeklyPlanResult.error || spotlightResult.error || null;

    if (firstError) {
      setScheduleError(firstError.message || 'Unable to save schedule content.');
      setSavingSchedule(false);
      return;
    }

    setScheduleMessage('Calendar, weekly plan, and spotlight updated.');
    setSavingSchedule(false);
  };

  const handleAnnouncementSave = async (event) => {
    event.preventDefault();
    setAnnouncementMessage('');
    setAnnouncementError('');

    const normalizedAnnouncements = normalizeAnnouncements(announcementDrafts);
    const duplicateIds = normalizedAnnouncements.filter(
      (item, index) =>
        normalizedAnnouncements.findIndex((candidate) => candidate.id === item.id) !== index
    );

    if (duplicateIds.length > 0) {
      setAnnouncementError('Each announcement needs a unique title.');
      return;
    }

    setSavingAnnouncements(true);
    const { error } = await saveSection('announcements', normalizedAnnouncements);

    if (error) {
      setAnnouncementError(error.message || 'Unable to save announcements.');
      setSavingAnnouncements(false);
      return;
    }

    setAnnouncementDrafts(normalizedAnnouncements);
    setAnnouncementMessage('Announcements updated.');
    setSavingAnnouncements(false);
  };

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Admin Tools"
        title="Website admin workspace"
        text="This workspace now uses the same tabbed editor pattern as the ribbon manager, with a cadet picker designed to stay usable for a large roster."
      />

      {(siteContentError || cadetsError) && (
        <div className="content-panel admin-alert-panel">
          {siteContentError && (
            <p>
              {siteContentError} Run <code>supabase/admin_content_tools.sql</code> in Supabase SQL
              Editor, then refresh this page.
            </p>
          )}
          {cadetsError && <p>{cadetsError}</p>}
        </div>
      )}

      <div className="admin-tools-shell">
        <div className="admin-tools-header">
          <div>
            <p className="section-kicker">Admin Tools</p>
            <h3>Manage live site content</h3>
            <p className="page-intro">
              Tabs keep each admin workflow focused while still using the same editor language as the cadet dashboard.
            </p>
          </div>
          <div className="admin-meta-group">
            <span className="admin-status-pill">{cadets.length} cadets loaded</span>
            <span className="admin-status-pill">Admin access active</span>
          </div>
        </div>

        <div className="ribbon-editor-tabs admin-editor-tabs" role="tablist" aria-label="Admin tool sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cadets'}
            className={`ribbon-editor-tab ${activeTab === 'cadets' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('cadets')}
          >
            Cadets
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'competitions'}
            className={`ribbon-editor-tab ${activeTab === 'competitions' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('competitions')}
          >
            Competitions
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'forms'}
            className={`ribbon-editor-tab ${activeTab === 'forms' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('forms')}
          >
            Forms
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'schedule'}
            className={`ribbon-editor-tab ${activeTab === 'schedule' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Calendar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'announcements'}
            className={`ribbon-editor-tab ${activeTab === 'announcements' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            Announcements
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'photos'}
            className={`ribbon-editor-tab ${activeTab === 'photos' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            Photos
          </button>
        </div>

        {activeTab === 'cadets' && (
          <section className="admin-tab-section admin-section">
            <div className="modal-section-heading">
              <p className="card-tag">Cadet Manager</p>
              <h4>Open a cadet dashboard</h4>
            </div>

            {!managedCadetId ? (
              <>
                <div className="admin-roster-toolbar">
                  <label className="auth-field">
                    <span className="auth-label">Search cadets</span>
                    <input
                      className="auth-input"
                      type="search"
                      value={cadetSearch}
                      onChange={(event) => setCadetSearch(event.target.value)}
                      placeholder="Search by name, email, rank, platoon, or role"
                    />
                  </label>
                  <div className="admin-roster-stats">
                    <span className="admin-status-pill">{filteredCadets.length} shown</span>
                    {cadetsLoading ? <span className="admin-status-pill">Loading roster...</span> : null}
                  </div>
                </div>

                <div className="admin-cadet-list admin-cadet-list--roster">
                  {filteredCadets.map((cadet) => (
                    <button
                      key={cadet.id}
                      type="button"
                      className="admin-cadet-list-item"
                      onClick={() => void loadManagedCadetProfile(cadet.id)}
                    >
                      <strong>{formatRosterName(cadet.name)}</strong>
                      <span>{cadet.rank || 'No rank yet'}</span>
                    </button>
                  ))}
                  {filteredCadets.length === 0 && (
                    <p className="admin-empty-copy">No cadets matched that search.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="admin-dashboard-shell">
                <div className="admin-dashboard-toolbar">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setManagedCadetId('');
                      setManagedCadetProfile(null);
                      setManagedCadetError('');
                    }}
                  >
                    Back to roster
                  </button>
                  <div className="admin-dashboard-meta">
                    <p className="card-tag">Editing dashboard</p>
                    <h5>{formatRosterName(selectedCadetSummary?.name || managedCadetProfile?.name)}</h5>
                  </div>
                </div>

                {managedCadetError && <p className="auth-message auth-message--error">{managedCadetError}</p>}
                {managedCadetLoading && <p className="admin-helper-copy">Opening cadet dashboard...</p>}

                {managedCadetProfile && !managedCadetLoading ? (
                  <CadetDashboard
                    competitionCatalog={competitionCatalog}
                    managedProfile={managedCadetProfile}
                    managedEmail={managedCadetProfile.email || ''}
                    onManagedProfileRefresh={refreshManagedCadet}
                  />
                ) : null}
              </div>
            )}
          </section>
        )}

        {activeTab === 'forms' && <FormsCompliancePanel cadets={cadets} />}

        {activeTab === 'competitions' && (
          <section className="admin-tab-section admin-section">
            <div className="modal-section-heading">
              <p className="card-tag">Competition Manager</p>
              <h4>Edit public competitions</h4>
            </div>

            <form className="admin-stack-form" onSubmit={handleCompetitionSave}>
            <div className="admin-stack-list">
              {competitionDrafts.map((competition, index) => (
                <article key={`${competition.id || 'competition'}-${index}`} className="admin-editor-card">
                  <div className="admin-editor-card-header">
                    <strong>{competition.name || `Competition ${index + 1}`}</strong>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() =>
                        setCompetitionDrafts((current) => current.filter((_, currentIndex) => currentIndex !== index))
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="admin-form-grid">
                    <label className="auth-field">
                      <span className="auth-label">Competition ID</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={competition.id}
                        onChange={(event) =>
                          setCompetitionDrafts((current) =>
                            current.map((item, currentIndex) =>
                              currentIndex === index ? { ...item, id: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className="auth-field">
                      <span className="auth-label">Name</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={competition.name}
                        onChange={(event) =>
                          setCompetitionDrafts((current) =>
                            current.map((item, currentIndex) =>
                              currentIndex === index ? { ...item, name: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className="auth-field">
                      <span className="auth-label">Date</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={competition.date}
                        onChange={(event) =>
                          setCompetitionDrafts((current) =>
                            current.map((item, currentIndex) =>
                              currentIndex === index ? { ...item, date: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className="auth-field">
                      <span className="auth-label">Registration closes</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={competition.registrationCloses}
                        onChange={(event) =>
                          setCompetitionDrafts((current) =>
                            current.map((item, currentIndex) =>
                              currentIndex === index ? { ...item, registrationCloses: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className="auth-field">
                      <span className="auth-label">Location</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={competition.location}
                        onChange={(event) =>
                          setCompetitionDrafts((current) =>
                            current.map((item, currentIndex) =>
                              currentIndex === index ? { ...item, location: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className="auth-field">
                      <span className="auth-label">Types</span>
                      <input
                        className="auth-input"
                        type="text"
                        value={competition.types.join(', ')}
                        onChange={(event) =>
                          setCompetitionDrafts((current) =>
                            current.map((item, currentIndex) =>
                              currentIndex === index
                                ? { ...item, types: event.target.value.split(',').map((entry) => entry.trim()) }
                                : item
                            )
                          )
                        }
                      />
                    </label>
                  </div>

                  <label className="auth-field">
                    <span className="auth-label">Description</span>
                    <textarea
                      className="auth-input admin-textarea"
                      value={competition.description}
                      onChange={(event) =>
                        setCompetitionDrafts((current) =>
                          current.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, description: event.target.value } : item
                          )
                        )
                      }
                    />
                  </label>

                  <div className="admin-mini-list">
                    <div className="admin-subsection-header">
                      <strong>Required forms</strong>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() =>
                          setCompetitionDrafts((current) =>
                            current.map((item, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...item,
                                    formRequirements: [...item.formRequirements, { id: '', label: '' }],
                                  }
                                : item
                            )
                          )
                        }
                      >
                        Add form
                      </button>
                    </div>

                    {competition.formRequirements.map((formRequirement, formIndex) => (
                      <div key={`${formRequirement.id || 'form'}-${formIndex}`} className="admin-inline-grid">
                        <input
                          className="auth-input"
                          type="text"
                          value={formRequirement.id}
                          placeholder="form-id"
                          onChange={(event) =>
                            setCompetitionDrafts((current) =>
                              current.map((item, currentIndex) =>
                                currentIndex === index
                                  ? {
                                      ...item,
                                      formRequirements: item.formRequirements.map((formItem, requirementIndex) =>
                                        requirementIndex === formIndex
                                          ? { ...formItem, id: event.target.value }
                                          : formItem
                                      ),
                                    }
                                  : item
                              )
                            )
                          }
                        />
                        <input
                          className="auth-input"
                          type="text"
                          value={formRequirement.label}
                          placeholder="Form label"
                          onChange={(event) =>
                            setCompetitionDrafts((current) =>
                              current.map((item, currentIndex) =>
                                currentIndex === index
                                  ? {
                                      ...item,
                                      formRequirements: item.formRequirements.map((formItem, requirementIndex) =>
                                        requirementIndex === formIndex
                                          ? { ...formItem, label: event.target.value }
                                          : formItem
                                      ),
                                    }
                                  : item
                              )
                            )
                          }
                        />
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() =>
                            setCompetitionDrafts((current) =>
                              current.map((item, currentIndex) =>
                                currentIndex === index
                                  ? {
                                      ...item,
                                      formRequirements: item.formRequirements.filter(
                                        (_, requirementIndex) => requirementIndex !== formIndex
                                      ),
                                    }
                                  : item
                              )
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="modal-actions modal-actions--start">
              <button
                type="button"
                className="ghost-button"
                onClick={() => setCompetitionDrafts((current) => [...current, createCompetitionForm(null)])}
              >
                Add competition
              </button>
              <button type="submit" className="join-button" disabled={savingCompetitions}>
                {savingCompetitions ? 'Saving...' : 'Save Competitions'}
              </button>
            </div>

            {competitionError && <p className="auth-message auth-message--error">{competitionError}</p>}
            {competitionMessage && <p className="auth-message auth-message--success">{competitionMessage}</p>}
            </form>
          </section>
        )}

        {activeTab === 'schedule' && (
          <section className="admin-tab-section admin-section">
            <div className="modal-section-heading">
              <p className="card-tag">Calendar and Weekly Plan</p>
              <h4>Edit the schedule and spotlight</h4>
            </div>

            <form className="admin-stack-form" onSubmit={handleScheduleSave}>
            <div className="admin-editor-card">
              <div className="admin-editor-card-header">
                <strong>Company happenings</strong>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setCalendarDrafts((current) => [...current, createCalendarItemForm(null)])}
                >
                  Add happening
                </button>
              </div>

              {calendarDrafts.map((item, index) => (
                <div key={`${item.title || 'calendar'}-${index}`} className="admin-card-stack">
                  <div className="admin-inline-grid admin-inline-grid--triple">
                    <input
                      className="auth-input"
                      type="text"
                      value={item.date}
                      placeholder="Date"
                      onChange={(event) =>
                        setCalendarDrafts((current) =>
                          current.map((entry, currentIndex) =>
                            currentIndex === index ? { ...entry, date: event.target.value } : entry
                          )
                        )
                      }
                    />
                    <input
                      className="auth-input"
                      type="text"
                      value={item.title}
                      placeholder="Title"
                      onChange={(event) =>
                        setCalendarDrafts((current) =>
                          current.map((entry, currentIndex) =>
                            currentIndex === index ? { ...entry, title: event.target.value } : entry
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() =>
                        setCalendarDrafts((current) => current.filter((_, currentIndex) => currentIndex !== index))
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    className="auth-input admin-textarea"
                    value={item.detail}
                    placeholder="Detail"
                    onChange={(event) =>
                      setCalendarDrafts((current) =>
                        current.map((entry, currentIndex) =>
                          currentIndex === index ? { ...entry, detail: event.target.value } : entry
                        )
                      )
                    }
                  />
                </div>
              ))}
            </div>

            <div className="admin-editor-card">
              <div className="admin-editor-card-header">
                <strong>Plan of the Week</strong>
              </div>

              <div className="weekly-plan-shell admin-weekly-plan-editor">
                <div className="weekly-plan-heading">
                  <input
                    className="admin-weekly-input admin-weekly-input--range"
                    type="text"
                    value={weeklyPlanDraft.rangeLabel}
                    placeholder="Week of ..."
                    onChange={(event) =>
                      setWeeklyPlanDraft((current) => ({ ...current, rangeLabel: event.target.value }))
                    }
                  />
                  <input
                    className="admin-weekly-input admin-weekly-input--title"
                    type="text"
                    value={weeklyPlanDraft.title}
                    placeholder="Plan of the Week"
                    onChange={(event) =>
                      setWeeklyPlanDraft((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </div>

                <div className="weekly-plan-grid">
                  {weeklyPlanDraft.days.map((day, index) => (
                    <article
                      key={`${day.day || 'day'}-${index}`}
                      className={`week-day-column week-day-column--${day.theme}`}
                    >
                      <input
                        className="admin-weekly-input admin-weekly-input--rotation"
                        type="text"
                        value={day.rotation}
                        placeholder="A"
                        onChange={(event) =>
                          setWeeklyPlanDraft((current) => ({
                            ...current,
                            days: current.days.map((entry, currentIndex) =>
                              currentIndex === index ? { ...entry, rotation: event.target.value } : entry
                            ),
                          }))
                        }
                      />

                      <div className="admin-weekly-pill-row">
                        <input
                          className="admin-weekly-input admin-weekly-input--pill"
                          type="text"
                          value={day.day}
                          placeholder="Monday"
                          onChange={(event) =>
                            setWeeklyPlanDraft((current) => ({
                              ...current,
                              days: current.days.map((entry, currentIndex) =>
                                currentIndex === index ? { ...entry, day: event.target.value } : entry
                              ),
                            }))
                          }
                        />
                        <select
                          className="admin-weekly-input admin-weekly-select"
                          value={day.theme}
                          onChange={(event) =>
                            setWeeklyPlanDraft((current) => ({
                              ...current,
                              days: current.days.map((entry, currentIndex) =>
                                currentIndex === index
                                  ? {
                                      ...entry,
                                      theme: event.target.value,
                                      rotation:
                                        entry.rotation === 'A' || entry.rotation === 'B'
                                          ? getRotationFromTheme(event.target.value)
                                          : entry.rotation,
                                    }
                                  : entry
                              ),
                            }))
                          }
                        >
                          <option value="a-day">A day</option>
                          <option value="b-day">B day</option>
                        </select>
                      </div>

                      <div className="week-day-block">
                        <textarea
                          className="admin-weekly-input admin-weekly-input--morning"
                          value={day.morning}
                          placeholder="Morning activity"
                          onChange={(event) =>
                            setWeeklyPlanDraft((current) => ({
                              ...current,
                              days: current.days.map((entry, currentIndex) =>
                                currentIndex === index ? { ...entry, morning: event.target.value } : entry
                              ),
                            }))
                          }
                        />
                        <textarea
                          className="admin-weekly-input admin-weekly-input--flag"
                          value={day.flagDetail}
                          placeholder="Flag detail"
                          onChange={(event) =>
                            setWeeklyPlanDraft((current) => ({
                              ...current,
                              days: current.days.map((entry, currentIndex) =>
                                currentIndex === index ? { ...entry, flagDetail: event.target.value } : entry
                              ),
                            }))
                          }
                        />
                      </div>

                      <div className="week-day-divider" />

                      <div className="week-day-periods">
                        {day.periods.map((period, periodIndex) => (
                          <textarea
                            key={`${day.day || 'day'}-period-${periodIndex}`}
                            className="admin-weekly-input admin-weekly-input--period"
                            value={period}
                            placeholder={`Period ${periodIndex + 1}`}
                            onChange={(event) =>
                              setWeeklyPlanDraft((current) => ({
                                ...current,
                                days: current.days.map((entry, currentIndex) =>
                                  currentIndex === index
                                    ? {
                                        ...entry,
                                        periods: entry.periods.map((periodEntry, currentPeriodIndex) =>
                                          currentPeriodIndex === periodIndex ? event.target.value : periodEntry
                                        ),
                                      }
                                    : entry
                                ),
                              }))
                            }
                          />
                        ))}
                      </div>

                      <div className="week-day-divider" />

                      <textarea
                        className="admin-weekly-input admin-weekly-input--footer"
                        value={day.afternoon}
                        placeholder="Afternoon activity"
                        onChange={(event) =>
                          setWeeklyPlanDraft((current) => ({
                            ...current,
                            days: current.days.map((entry, currentIndex) =>
                              currentIndex === index ? { ...entry, afternoon: event.target.value } : entry
                            ),
                          }))
                        }
                      />
                    </article>
                  ))}
                </div>

                <div className="weekly-plan-notes">
                  {weeklyPlanDraft.footerNotes.map((note, index) => (
                    <textarea
                      key={`note-${index}`}
                      className="admin-weekly-input admin-weekly-input--note"
                      value={note}
                      placeholder="Footer note"
                      onChange={(event) =>
                        setWeeklyPlanDraft((current) => ({
                          ...current,
                          footerNotes: current.footerNotes.map((entry, currentIndex) =>
                            currentIndex === index ? event.target.value : entry
                          ),
                        }))
                      }
                    />
                  ))}
                  <div className="modal-actions modal-actions--start">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() =>
                        setWeeklyPlanDraft((current) => ({
                          ...current,
                          footerNotes: [...current.footerNotes, ''],
                        }))
                      }
                    >
                      Add note
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-editor-card">
              <div className="admin-editor-card-header">
                <strong>Monthly spotlight</strong>
              </div>

              <div className="admin-form-grid">
                <label className="auth-field">
                  <span className="auth-label">Month</span>
                  <input
                    className="auth-input"
                    type="text"
                    value={spotlightDraft.month}
                    onChange={(event) =>
                      setSpotlightDraft((current) => ({ ...current, month: event.target.value }))
                    }
                  />
                </label>
                <label className="auth-field">
                  <span className="auth-label">Cadet label</span>
                  <input
                    className="auth-input"
                    type="text"
                    value={spotlightDraft.cadet}
                    onChange={(event) =>
                      setSpotlightDraft((current) => ({ ...current, cadet: event.target.value }))
                    }
                  />
                </label>
                <label className="auth-field">
                  <span className="auth-label">Cadet name</span>
                  <input
                    className="auth-input"
                    type="text"
                    value={spotlightDraft.cadetName}
                    onChange={(event) =>
                      setSpotlightDraft((current) => ({ ...current, cadetName: event.target.value }))
                    }
                  />
                </label>
                <label className="auth-field">
                  <span className="auth-label">Newsletter title</span>
                  <input
                    className="auth-input"
                    type="text"
                    value={spotlightDraft.newsletterTitle}
                    onChange={(event) =>
                      setSpotlightDraft((current) => ({ ...current, newsletterTitle: event.target.value }))
                    }
                  />
                </label>
              </div>

              <label className="auth-field">
                <span className="auth-label">Citation</span>
                <textarea
                  className="auth-input admin-textarea"
                  value={spotlightDraft.citation}
                  onChange={(event) =>
                    setSpotlightDraft((current) => ({ ...current, citation: event.target.value }))
                  }
                />
              </label>
              <label className="auth-field">
                <span className="auth-label">Newsletter summary</span>
                <textarea
                  className="auth-input admin-textarea"
                  value={spotlightDraft.newsletterSummary}
                  onChange={(event) =>
                    setSpotlightDraft((current) => ({ ...current, newsletterSummary: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="modal-actions modal-actions--start">
              <button type="submit" className="join-button" disabled={savingSchedule}>
                {savingSchedule ? 'Saving...' : 'Save Schedule Content'}
              </button>
            </div>

            {scheduleError && <p className="auth-message auth-message--error">{scheduleError}</p>}
            {scheduleMessage && <p className="auth-message auth-message--success">{scheduleMessage}</p>}
            </form>
          </section>
        )}

        {activeTab === 'photos' && (
          <section className="admin-tab-section admin-section">
            <div className="modal-section-heading">
              <p className="card-tag">Photo and Event Manager</p>
              <h4>Manage photo archive events</h4>
            </div>

            <form className="admin-stack-form" onSubmit={handlePhotoCollectionSave}>
              <div className="ribbon-editor-tabs admin-editor-tabs" role="tablist" aria-label="Photo categories">
                {photoCategoryOptions.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedPhotoCategory === category.id}
                    className={`ribbon-editor-tab ${selectedPhotoCategory === category.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedPhotoCategory(category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="admin-roster-toolbar">
                <div className="admin-roster-stats">
                  <span className="admin-status-pill">{activePhotoEvents.length} events</span>
                  <span className="admin-status-pill">
                    {(selectedPhotoEvent?.photos || []).length} photos in selected event
                  </span>
                </div>
                <div className="admin-photo-actions">
                  <button type="button" className="ghost-button" onClick={handleCreatePhotoEvent}>
                    New event
                  </button>
                </div>
              </div>

              <div className="admin-photo-layout">
                <div className="admin-cadet-list">
                  {activePhotoEvents.map((event) => (
                    <button
                      key={event.slug || event.title}
                      type="button"
                      className={`admin-cadet-list-item${selectedPhotoEventSlug === event.slug ? ' is-active' : ''}`}
                      onClick={() => setSelectedPhotoEventSlug(event.slug)}
                    >
                      <strong>{event.title || 'Untitled event'}</strong>
                      <span>{event.date || 'No date yet'}</span>
                      <span>{event.photos.length} photos</span>
                    </button>
                  ))}
                  {activePhotoEvents.length === 0 && (
                    <p className="admin-empty-copy">No events yet in this category. Start with `New event`.</p>
                  )}
                </div>

                {selectedPhotoEvent ? (
                  <div className="admin-card-stack">
                    <article className="admin-editor-card">
                      <div className="admin-editor-card-header">
                        <strong>Event details</strong>
                        <button type="button" className="ghost-button" onClick={handleDeletePhotoEvent}>
                          Delete event
                        </button>
                      </div>

                      <div className="admin-form-grid">
                        <label className="auth-field">
                          <span className="auth-label">Event title</span>
                          <input
                            className="auth-input"
                            type="text"
                            value={selectedPhotoEvent.title}
                            onChange={(event) => handlePhotoEventFieldChange('title', event.target.value)}
                          />
                        </label>
                        <label className="auth-field">
                          <span className="auth-label">Event date</span>
                          <input
                            className="auth-input"
                            type="text"
                            value={selectedPhotoEvent.date}
                            placeholder="June 14, 2026"
                            onChange={(event) => handlePhotoEventFieldChange('date', event.target.value)}
                          />
                        </label>
                        <label className="auth-field">
                          <span className="auth-label">Slug</span>
                          <input
                            className="auth-input"
                            type="text"
                            value={selectedPhotoEvent.slug}
                            onChange={(event) => handlePhotoEventFieldChange('slug', event.target.value)}
                          />
                        </label>
                      </div>

                      <label className="auth-field">
                        <span className="auth-label">Description</span>
                        <textarea
                          className="auth-input admin-textarea"
                          value={selectedPhotoEvent.description}
                          placeholder="Short public description for the archive card and event gallery."
                          onChange={(event) => handlePhotoEventFieldChange('description', event.target.value)}
                        />
                      </label>
                    </article>

                    <article className="admin-editor-card">
                      <div className="admin-editor-card-header">
                        <strong>Photos</strong>
                        <label className="upload-label">
                          Add photos
                          <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
                        </label>
                      </div>

                      <p className="admin-helper-copy">
                        You can select and add multiple photos at once.
                      </p>

                      <div className="admin-mini-list">
                        {selectedPhotoEvent.photos.map((photo, index) => (
                          <div key={`${photo.name}-${index}`} className="admin-photo-row">
                            <img
                              src={photo.src}
                              alt={photo.name}
                              className="admin-photo-thumb"
                              loading="lazy"
                            />
                            <div className="admin-photo-meta">
                              <strong>{photo.name || `Photo ${index + 1}`}</strong>
                            </div>
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => handleRemovePhoto(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        {selectedPhotoEvent.photos.length === 0 && (
                          <p className="admin-empty-copy">
                            This event has no photos yet. Use `Add photos` to upload them here.
                          </p>
                        )}
                      </div>
                    </article>
                  </div>
                ) : (
                  <p className="admin-empty-copy">Choose an event to edit, or create a new one.</p>
                )}
              </div>

              {photoError && <p className="auth-message auth-message--error">{photoError}</p>}
              {photoMessage && <p className="auth-message auth-message--success">{photoMessage}</p>}

              <div className="modal-actions modal-actions--start">
                <button type="submit" className="join-button" disabled={savingPhotos}>
                  {savingPhotos ? 'Saving...' : 'Save Photo Archive'}
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'announcements' && (
          <section className="admin-tab-section admin-section">
            <div className="modal-section-heading">
              <p className="card-tag">Announcement Board</p>
              <h4>Create updates and poster announcements</h4>
            </div>

            <form className="admin-stack-form" onSubmit={handleAnnouncementSave}>
              <div className="admin-roster-toolbar">
                <div className="admin-roster-stats">
                  <span className="admin-status-pill">{announcementDrafts.length} announcements</span>
                  <span className="admin-status-pill">
                    {selectedAnnouncement?.imageUrl ? 'Poster attached' : 'No poster attached'}
                  </span>
                </div>
                <div className="admin-photo-actions">
                  <button type="button" className="ghost-button" onClick={handleCreateAnnouncement}>
                    New announcement
                  </button>
                </div>
              </div>

              <div className="admin-photo-layout">
                <div className="admin-cadet-list">
                  {announcementDrafts.map((announcement) => (
                    <button
                      key={announcement.id || announcement.title}
                      type="button"
                      className={`admin-cadet-list-item${selectedAnnouncementId === announcement.id ? ' is-active' : ''}`}
                      onClick={() => setSelectedAnnouncementId(announcement.id)}
                    >
                      <strong>{announcement.title || 'Untitled announcement'}</strong>
                      <span>{announcement.date || 'No date yet'}</span>
                      <span>{announcement.imageUrl ? 'Poster ready' : 'Text only'}</span>
                    </button>
                  ))}
                  {announcementDrafts.length === 0 && (
                    <p className="admin-empty-copy">
                      No announcements yet. Start with `New announcement`.
                    </p>
                  )}
                </div>

                {selectedAnnouncement ? (
                  <div className="admin-card-stack">
                    <article className="admin-editor-card">
                      <div className="admin-editor-card-header">
                        <strong>Announcement details</strong>
                        <button type="button" className="ghost-button" onClick={handleDeleteAnnouncement}>
                          Delete announcement
                        </button>
                      </div>

                      <div className="admin-form-grid">
                        <label className="auth-field">
                          <span className="auth-label">Title</span>
                          <input
                            className="auth-input"
                            type="text"
                            value={selectedAnnouncement.title}
                            onChange={(event) => handleAnnouncementFieldChange('title', event.target.value)}
                          />
                        </label>
                        <label className="auth-field">
                          <span className="auth-label">Date</span>
                          <input
                            className="auth-input"
                            type="text"
                            value={selectedAnnouncement.date}
                            placeholder="July 16, 2026"
                            onChange={(event) => handleAnnouncementFieldChange('date', event.target.value)}
                          />
                        </label>
                        <label className="auth-field">
                          <span className="auth-label">Summary</span>
                          <input
                            className="auth-input"
                            type="text"
                            value={selectedAnnouncement.summary}
                            onChange={(event) => handleAnnouncementFieldChange('summary', event.target.value)}
                          />
                        </label>
                      </div>

                      <label className="auth-field">
                        <span className="auth-label">Full announcement</span>
                        <textarea
                          className="auth-input admin-textarea"
                          value={selectedAnnouncement.body}
                          placeholder="Add the full message that cadets and families should see."
                          onChange={(event) => handleAnnouncementFieldChange('body', event.target.value)}
                        />
                      </label>
                    </article>

                    <article className="admin-editor-card">
                      <div className="admin-editor-card-header">
                        <strong>Poster image</strong>
                        <div className="admin-photo-actions">
                          <label className="upload-label">
                            Upload poster
                            <input type="file" accept="image/*" onChange={handleAnnouncementPosterUpload} />
                          </label>
                          {selectedAnnouncement.imageUrl ? (
                            <button type="button" className="ghost-button" onClick={handleRemoveAnnouncementPoster}>
                              Remove poster
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {selectedAnnouncement.imageUrl ? (
                        <img
                          src={selectedAnnouncement.imageUrl}
                          alt={selectedAnnouncement.title}
                          className="admin-announcement-poster"
                        />
                      ) : (
                        <p className="admin-empty-copy">
                          No poster uploaded yet. Add an image to show a flyer-style announcement on the home page.
                        </p>
                      )}
                    </article>
                  </div>
                ) : (
                  <p className="admin-empty-copy">Choose an announcement to edit, or create a new one.</p>
                )}
              </div>

              {announcementError && <p className="auth-message auth-message--error">{announcementError}</p>}
              {announcementMessage && <p className="auth-message auth-message--success">{announcementMessage}</p>}

              <div className="modal-actions modal-actions--start">
                <button type="submit" className="join-button" disabled={savingAnnouncements}>
                  {savingAnnouncements ? 'Saving...' : 'Save Announcements'}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </section>
  );
}

export default AdminToolsPage;
