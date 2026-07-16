import { useEffect, useState } from 'react';
import './App.css';
import logoSvg from './assets/LTNJROTC Logo.svg';
import SiteHeader from './components/SiteHeader';
import {
  calendarItems,
  chainOfCommand,
  currentMonthSpotlight,
  heroPhotos,
  pages,
  quickLinks,
  weeklyPlan,
} from './data/siteContent';
import CalendarPage from './pages/CalendarPage';
import ChainOfCommandPage from './pages/ChainOfCommandPage';
import CompetitionsPage from './pages/CompetitionsPage';
import HomePage from './pages/HomePage';
import PhotosPage from './pages/PhotosPage';
import EventGallery from './pages/EventGallery';
import { AuthProvider } from './context/AuthContext';
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext';
import LoginPage from './pages/LoginPage';
import CadetDashboard from './pages/CadetDashboard';
import AccountSetupPage from './pages/AccountSetupPage';
import EnrollmentPage from './pages/EnrollmentPage';
import UnitResourcesPage from './pages/UnitResourcesPage';
import AdminToolsPage from './pages/AdminToolsPage';
import CadetPortfoliosPage from './pages/CadetPortfoliosPage';

const themeOptions = [
  { id: 'light', label: 'Trailblazer', icon: 'T' },
  { id: 'dark', label: 'Navy Pride', icon: 'N' },
];

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

function AppShell() {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [activePage, setActivePage] = useState(() => getRouteFromHash());
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { calendarItems, competitionCatalog, currentMonthSpotlight, weeklyPlan, photoCollections } = useSiteContent();
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
            quickLinks={quickLinks}
          />
        );
    }
  };

  return (
    <div className="site-shell">
      <SiteHeader
        activePage={activePage.split('/')[0]}
        isScrolled={isScrolled}
        pages={pages}
      />

      <main>{renderPage()}</main>

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
