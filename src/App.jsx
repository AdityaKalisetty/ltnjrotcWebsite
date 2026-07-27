import { useEffect, useState } from 'react';
import './App.css';
import logoSvg from './assets/LTNJROTC Logo.svg';
import SiteHeader from './components/SiteHeader';
import {
  chainOfCommand,
  heroPhotos,
  pages,
} from './data/siteContent';
import CalendarPage from './pages/CalendarPage';
import ChainOfCommandPage from './pages/ChainOfCommandPage';
import CompetitionsPage from './pages/CompetitionsPage';
import HomePage from './pages/HomePage';
import PhotosPage from './pages/PhotosPage';
import EventGallery from './pages/EventGallery';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext';
import LoginPage from './pages/LoginPage';
import CadetDashboard from './pages/CadetDashboard';
import AccountSetupPage from './pages/AccountSetupPage';
import EnrollmentPage from './pages/EnrollmentPage';
import UnitResourcesPage from './pages/UnitResourcesPage';
import AdminToolsPage from './pages/AdminToolsPage';
import SupplyToolsPage from './pages/SupplyToolsPage';
import CadetPortfoliosPage from './pages/CadetPortfoliosPage';

const themeOptions = [
  { id: 'light', label: 'Trailblazer', icon: 'T' },
  { id: 'dark', label: 'Navy Pride', icon: 'N' },
];
const overdueTickerCopy = 'Overdue Forms • '.repeat(20);

const getRouteFromHash = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const searchParams = new URLSearchParams(window.location.search);

  if (!hash) {
    if (searchParams.get('auth_flow') === 'recovery') {
      return 'account/setup';
    }

    return 'home';
  }

  // return full hash (may include subroutes like "photos/event/slug")
  return hash;
};

function parseJsonList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function hasOverdueForms(profile, dismissedRequirementKeys = new Set()) {
  if (parseJsonList(profile?.overdue_forms).some((form) => {
    const requirementKey = `competition:${form?.competition_id || form?.id || form?.competition_name || form?.name || ''}`;
    return !dismissedRequirementKeys.has(requirementKey);
  })) return true;

  return parseJsonList(profile?.competition_signups).some((competition) => {
    if (competition?.completed) return false;
    const requirementKey = `competition:${competition?.competition_id || competition?.id || competition?.competition_name || competition?.name}`;
    if (dismissedRequirementKeys.has(requirementKey)) return false;
    const dueTime = Date.parse(competition?.due_date || competition?.date || '');
    return !Number.isNaN(dueTime) && dueTime < Date.now();
  });
}

function AppShell() {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [activePage, setActivePage] = useState(() => getRouteFromHash());
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openAnnouncementId, setOpenAnnouncementId] = useState(null);
  const { profile } = useAuth();
  const [dismissedRequirementKeys, setDismissedRequirementKeys] = useState(() => new Set());

  useEffect(() => {
    if (!profile?.id) {
      setDismissedRequirementKeys(new Set());
      return undefined;
    }

    let active = true;
    void supabase
      .from('cadet_form_overrides')
      .select('requirement_key')
      .eq('cadet_id', profile.id)
      .then(({ data }) => {
        if (active) setDismissedRequirementKeys(new Set((data || []).map((item) => item.requirement_key)));
      });

    return () => { active = false; };
  }, [profile?.id]);
  const {
    announcements,
    calendarItems,
    competitionCatalog,
    currentMonthSpotlight,
    weeklyPlan,
    photoCollections,
  } = useSiteContent();
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('ltnjrotc-theme');

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return 'dark';
  });

  useEffect(() => {
    const favicon =
      document.querySelector("link[rel='icon']") ||
      document.createElement('link');

    favicon.setAttribute('rel', 'icon');
    favicon.setAttribute('type', 'image/svg+xml');
    favicon.setAttribute('href', logoSvg);
    document.head.appendChild(favicon);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('ltnjrotc-theme', theme);
  }, [theme]);

  const posterAnnouncements = announcements.filter((announcement) => announcement.imageUrl);
  const openPosterAnnouncement = posterAnnouncements.find((announcement) => announcement.id === openAnnouncementId) || null;

  useEffect(() => {
    if (posterAnnouncements.length > 0 && !openAnnouncementId) {
      setOpenAnnouncementId(posterAnnouncements[0].id);
    }
  }, [announcements]);

  useEffect(() => {
    const syncRoute = () => {
      setActivePage(getRouteFromHash());
      setIsThemeMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', syncRoute);

    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll(
        'main .page-header, main .content-panel, main .recruiting-video-section, main .announcements-section'
      )
    );

    if (!revealTargets.length) {
      return undefined;
    }

    const reveal = (element) => element.classList.add('is-visible');

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach(reveal);
      return undefined;
    }

    revealTargets.forEach((element) => element.classList.add('scroll-reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -4% 0px' }
    );

    revealTargets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [
    activePage,
    announcements,
    calendarItems,
    competitionCatalog,
    currentMonthSpotlight,
    photoCollections,
    weeklyPlan,
  ]);

  useEffect(() => {
    if (heroPhotos.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActivePhotoIndex((currentIndex) => (currentIndex + 1) % heroPhotos.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (activePhotoIndex >= heroPhotos.length) {
      setActivePhotoIndex(0);
    }
  }, [activePhotoIndex]);

  const showPreviousPhoto = () => {
    setActivePhotoIndex((currentIndex) =>
      currentIndex === 0 ? heroPhotos.length - 1 : currentIndex - 1
    );
  };

  const showNextPhoto = () => {
    setActivePhotoIndex((currentIndex) => (currentIndex + 1) % heroPhotos.length);
  };

  const renderPage = () => {
    const base = activePage.split('/')[0];

    if (activePage.startsWith('photos/event/')) {
      const eventSlug = activePage.replace(/^photos\/event\//, '');
      return <EventGallery eventSlug={eventSlug} photoCollections={photoCollections} />;
    }

    switch (base) {
      case 'photos':
        return <PhotosPage photoCollections={photoCollections} />;
      case 'calendar':
        return (
          <CalendarPage
            calendarItems={calendarItems}
            currentMonthSpotlight={currentMonthSpotlight}
            weeklyPlan={weeklyPlan}
          />
        );
      case 'chain-of-command':
        return <ChainOfCommandPage chainOfCommand={chainOfCommand} />;
      case 'enrollment':
        return <EnrollmentPage />;
      case 'competitions':
        return <CompetitionsPage competitionCatalog={competitionCatalog} />;
      case 'unit-resources':
        return <UnitResourcesPage />;
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return <CadetDashboard competitionCatalog={competitionCatalog} />;
      case 'portfolios':
        return <CadetPortfoliosPage competitionCatalog={competitionCatalog} />;
      case 'admin':
        return <AdminToolsPage />;
      case 'supply':
        return <SupplyToolsPage />;
      case 'account':
        if (activePage.startsWith('account/setup')) {
          return <AccountSetupPage />;
        }
        return <LoginPage />;
      default:
        return (
          <HomePage
            heroPhotos={heroPhotos}
            activePhotoIndex={activePhotoIndex}
            onPreviousPhoto={showPreviousPhoto}
            onNextPhoto={showNextPhoto}
            onSelectPhoto={setActivePhotoIndex}
            announcements={announcements}
          />
        );
    }
  };

  return (
    <div className="site-shell">
      {announcements.length > 0 && (
        <aside className="announcement-bar" aria-label="Announcements">
          <div className="announcement-bar-items">
            {announcements.map((announcement) => (
              <div className="announcement-bar-item" key={announcement.id || announcement.title}>
                <strong>{announcement.title}</strong>
                {announcement.summary && <span>{announcement.summary}</span>}
                {announcement.imageUrl && (
                  <button type="button" onClick={() => setOpenAnnouncementId(announcement.id)}>
                    View poster
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>
      )}

      <SiteHeader
        activePage={activePage.split('/')[0]}
        isScrolled={isScrolled}
        pages={pages}
      />

      {hasOverdueForms(profile, dismissedRequirementKeys) && (
        <a className="overdue-forms-banner" href="#/dashboard" aria-label="Overdue forms: open your dashboard">
          <span className="overdue-forms-ticker" aria-hidden="true">
            <span>{overdueTickerCopy}</span>
            <span>{overdueTickerCopy}</span>
          </span>
          <span className="sr-only">Overdue Forms</span>
        </a>
      )}

      <main>{renderPage()}</main>

      {openPosterAnnouncement && (
        <div className="announcement-popup-backdrop" role="dialog" aria-modal="true" aria-label={openPosterAnnouncement.title} onClick={() => setOpenAnnouncementId(null)}>
          <article className="announcement-popup" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="announcement-popup-close" aria-label="Close announcement" onClick={() => setOpenAnnouncementId(null)}>×</button>
            <img src={openPosterAnnouncement.imageUrl} alt={openPosterAnnouncement.title} />
            <div className="announcement-popup-copy"><p className="card-tag">Announcement</p><h2>{openPosterAnnouncement.title}</h2>{openPosterAnnouncement.body && <p>{openPosterAnnouncement.body}</p>}</div>
          </article>
        </div>
      )}

      <div className="floating-theme-menu">
        {isThemeMenuOpen && (
          <div className="floating-theme-options" aria-label="Theme options">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`floating-theme-option${theme === option.id ? ' is-active' : ''}`}
                onClick={() => {
                  setTheme(option.id);
                  setIsThemeMenuOpen(false);
                }}
              >
                <span className="floating-theme-option-icon" aria-hidden="true">
                  {option.icon}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="floating-theme-toggle"
          aria-label="Open themes menu"
          aria-expanded={isThemeMenuOpen}
          onClick={() => setIsThemeMenuOpen((currentValue) => !currentValue)}
        >
          <span className="floating-theme-toggle-copy">Themes</span>
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SiteContentProvider>
        <AppShell />
      </SiteContentProvider>
    </AuthProvider>
  );
}

export default App;
