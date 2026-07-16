import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  calendarItems as defaultCalendarItems,
  competitionCatalog as defaultCompetitionCatalog,
  currentMonthSpotlight as defaultCurrentMonthSpotlight,
  photoCollections as defaultPhotoCollections,
  weeklyPlan as defaultWeeklyPlan,
} from '../data/siteContent';
import { supabase } from '../lib/supabaseClient';

const SiteContentContext = createContext(null);

const SECTION_TO_DB_KEY = {
  competitionCatalog: 'competition_catalog',
  calendarItems: 'calendar_items',
  weeklyPlan: 'weekly_plan',
  currentMonthSpotlight: 'current_month_spotlight',
  photoCollections: 'photo_collections',
};

const DEFAULT_CONTENT = {
  competitionCatalog: defaultCompetitionCatalog,
  calendarItems: defaultCalendarItems,
  weeklyPlan: defaultWeeklyPlan,
  currentMonthSpotlight: defaultCurrentMonthSpotlight,
  photoCollections: defaultPhotoCollections,
};

function cloneDefaultContent() {
  return {
    competitionCatalog: JSON.parse(JSON.stringify(DEFAULT_CONTENT.competitionCatalog)),
    calendarItems: JSON.parse(JSON.stringify(DEFAULT_CONTENT.calendarItems)),
    weeklyPlan: JSON.parse(JSON.stringify(DEFAULT_CONTENT.weeklyPlan)),
    currentMonthSpotlight: JSON.parse(JSON.stringify(DEFAULT_CONTENT.currentMonthSpotlight)),
    photoCollections: JSON.parse(JSON.stringify(DEFAULT_CONTENT.photoCollections)),
  };
}

function readSectionValue(rawValue, fallbackValue) {
  if (rawValue == null) {
    return fallbackValue;
  }

  if (typeof rawValue === 'string') {
    try {
      return JSON.parse(rawValue);
    } catch (error) {
      return fallbackValue;
    }
  }

  return rawValue;
}

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(() => cloneDefaultContent());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshContent = async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('site_content')
      .select('key, value')
      .in('key', Object.values(SECTION_TO_DB_KEY));

    if (loadError) {
      setError(loadError.message || 'Unable to load site content.');
      setContent(cloneDefaultContent());
      setLoading(false);
      return;
    }

    const nextContent = cloneDefaultContent();

    Object.entries(SECTION_TO_DB_KEY).forEach(([sectionName, dbKey]) => {
      const row = data?.find((item) => item.key === dbKey);
      nextContent[sectionName] = readSectionValue(row?.value, nextContent[sectionName]);
    });

    setContent(nextContent);
    setLoading(false);
  };

  useEffect(() => {
    void refreshContent();
  }, []);

  const saveSection = async (sectionName, value) => {
    const dbKey = SECTION_TO_DB_KEY[sectionName];

    if (!dbKey) {
      return { error: new Error(`Unknown site content section: ${sectionName}`) };
    }

    const { error: saveError } = await supabase.from('site_content').upsert(
      { key: dbKey, value },
      { onConflict: 'key' }
    );

    if (saveError) {
      return { error: saveError };
    }

    setContent((current) => ({
      ...current,
      [sectionName]: value,
    }));

    return { error: null };
  };

  const value = useMemo(
    () => ({
      ...content,
      loading,
      error,
      refreshContent,
      saveSection,
    }),
    [content, loading, error]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);

  if (!context) {
    throw new Error('useSiteContent must be used within SiteContentProvider');
  }

  return context;
}
