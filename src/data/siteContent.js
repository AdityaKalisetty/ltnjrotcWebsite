const photoModules = import.meta.glob('../assets/carouselPhotos/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
});

const allPhotos = Object.entries(photoModules)
  .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath))
  .map(([path, src]) => ({
    src,
    name: path
      .split('/')
      .pop()
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]/g, ' '),
  }));

export const heroPhotos = allPhotos.map((photo) => photo.src);

const staffPhotoModules = import.meta.glob('../assets/StaffPhotos/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
});

const staffPhotos = Object.fromEntries(
  Object.entries(staffPhotoModules).map(([path, src]) => [
    path.split('/').pop(),
    src,
  ])
);

// load event photos grouped by folder name under assets/eventPhotos
const eventPhotoModules = import.meta.glob('../assets/eventPhotos/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
});

const eventGroupsMap = {
  competitions: {},
  ceremonies: {},
  socialsAndServices: {},
};

function normalizeCategory(raw) {
  if (!raw) return 'socialsAndServices';
  const normalized = raw.toString().trim().toLowerCase();
  if (normalized === 'competitions') return 'competitions';
  if (normalized === 'ceremonies') return 'ceremonies';
  if (normalized === 'socials & services' || normalized === 'socials and services') return 'socialsAndServices';
  return 'socialsAndServices';
}

Object.entries(eventPhotoModules).forEach(([path, src]) => {
  // path like ../assets/eventPhotos/CATEGORY/Event Name/file.jpg
  const parts = path.split('/');
  const fileName = parts.pop();
  const folderName = parts.pop() || 'misc';
  const categoryRaw = parts.pop();
  const category = normalizeCategory(categoryRaw);

  if (!eventGroupsMap[category][folderName]) eventGroupsMap[category][folderName] = [];
  eventGroupsMap[category][folderName].push({
    src,
    name: fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
  });
});

function parseEventTitleAndDate(raw) {
  const normalized = raw.replace(/[_]/g, ' ').replace(/,/g, ' ').trim();
  const nameDateMatch = normalized.match(/^((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?))\s+(\d{1,2}(?:-\d{1,2})?)\s*,?\s+(\d{4})(?:\s+(.+))?$/i);
  let title = normalized;
  let date = '';
  let sortDate = '';

  if (nameDateMatch) {
    const monthLabel = nameDateMatch[1];
    const daySegment = nameDateMatch[2];
    const year = nameDateMatch[3];
    const rest = nameDateMatch[4] ? nameDateMatch[4].trim() : '';
    const monthMap = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
    };
    const monthKey = monthLabel.slice(0, 3).toLowerCase();
    const month = monthMap[monthKey] || '01';
    const day = daySegment.split('-')[0].padStart(2, '0');

    date = `${monthLabel} ${parseInt(day, 10)}, ${year}`;
    sortDate = `${year}-${month}-${day}`;
    title = rest || normalized;
  } else {
    const numericMatch = normalized.match(/^\s*(\d{4}[-_ ]?\d{2}[-_ ]?\d{2}|\d{2}[-_ ]?\d{2}[-_ ]?\d{4}|\d{8})[ _-]+(.+)$/);
    if (numericMatch) {
      const dateString = numericMatch[1].replace(/[-_ ]/g, '');
      const rest = numericMatch[2].trim();
      let year = '';
      let month = '';
      let day = '';

      if (/^\d{8}$/.test(dateString)) {
        if (/^\d{4}/.test(dateString)) {
          year = dateString.slice(0, 4);
          month = dateString.slice(4, 6);
          day = dateString.slice(6, 8);
        } else {
          month = dateString.slice(0, 2);
          day = dateString.slice(2, 4);
          year = dateString.slice(4, 8);
        }
      }

      if (year && month && day) {
        date = `${year}-${month}-${day}`;
        sortDate = `${year}-${month}-${day}`;
        title = rest || normalized;
      }
    }
  }

  return { title, date, sortDate };
}

function buildEventGroups(categoryMap) {
  return Object.entries(categoryMap)
    .map(([folder, photos]) => {
      const raw = folder;
      const { title, date, sortDate } = parseEventTitleAndDate(raw);
      const slug = (title || raw)
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      return {
        title,
        date,
        sortDate,
        slug,
        description: '',
        photos: photos.sort((a, b) => a.name.localeCompare(b.name)),
      };
    })
    .sort((a, b) => {
      if (a.sortDate && b.sortDate) return b.sortDate.localeCompare(a.sortDate);
      if (a.sortDate) return -1;
      if (b.sortDate) return 1;
      return a.title.localeCompare(b.title);
    });
}

const eventGroups = {
  competitions: buildEventGroups(eventGroupsMap.competitions),
  ceremonies: buildEventGroups(eventGroupsMap.ceremonies),
  socialsAndServices: buildEventGroups(eventGroupsMap.socialsAndServices),
};

export const pages = [
  { id: 'home', label: 'Home' },
  { id: 'photos', label: 'Photos' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'chain-of-command', label: 'Chain of Command' },
  { id: 'current-month', label: 'Current Month' },
];

export const photoCollections = {
  competitions: eventGroups.competitions,
  ceremonies: eventGroups.ceremonies,
  socialsAndServices: eventGroups.socialsAndServices,
};

export const calendarItems = [
  {
    date: 'Summer 2026',
    title: 'Summer Break',
    detail: 'Regular company activities pause for summer break until the new school-year schedule is released. Have fun!',
  },
];

export const weeklyPlan = {
  rangeLabel: 'Week of May 25 - May 29',
  title: 'Plan of the Week',
  rotation: ['A', 'B', 'A', 'B', 'A'],
  footerNotes: [
    'No uniform wear on Friday.',
    'PT gear: civilian clothing, athletic wear, and tennis shoes.',
    'Supply hours: Thursday 0830-0850 and 1630-1800.',
  ],
  days: [
    {
      day: 'Monday',
      rotation: 'A',
      morning: 'PT 0715-0830',
      flagDetail: 'BDR: 0820 Flag Detail',
      periods: [
        '1st Period: Lesson',
        '2nd Period: Lesson',
        '3rd Period: Drill / PQs',
        '4th Period: No Class',
      ],
      afternoon: 'Color Guard 1645-1800',
      theme: 'a-day',
    },
    {
      day: 'Tuesday',
      rotation: 'B',
      morning: 'Admin / Planning Day',
      flagDetail: 'BDR: 0820 Flag Detail',
      periods: [
        '1st Period: No Class',
        '2nd Period: Lesson',
        '3rd Period: Lesson',
        '4th Period: Lesson',
      ],
      afternoon: 'Color Guard 1645-1800',
      theme: 'b-day',
    },
    {
      day: 'Wednesday',
      rotation: 'A',
      morning: 'Armed Exhibition 0715-0830',
      flagDetail: 'BDR: 0820 Flag Detail',
      periods: [
        '1st Period: Drill / PQs',
        '2nd Period: Drill / PQs',
        '3rd Period: Drill / PQs',
        '4th Period: No Class',
      ],
      afternoon: 'Staff Work / Team Prep',
      theme: 'a-day',
    },
    {
      day: 'Thursday',
      rotation: 'B',
      morning: 'Unarmed Exhibition 0715-0830',
      flagDetail: 'BDR: 0820 Flag Detail',
      periods: [
        '1st Period: No Class',
        '2nd Period: PT / CFC',
        '3rd Period: PT / CFC',
        '4th Period: PT / CFC',
      ],
      afternoon: 'PT 1645-1800',
      theme: 'b-day',
    },
    {
      day: 'Friday',
      rotation: 'A',
      morning: 'Command Check / Recovery',
      flagDetail: 'BDR: 0820 Flag Detail',
      periods: [
        '1st Period: PT / CFC',
        '2nd Period: PT / CFC',
        '3rd Period: PT / CFC',
        '4th Period: No Class',
      ],
      afternoon: 'Weekend Dismissal',
      theme: 'a-day',
    },
  ],
};

export const chainOfCommand = [
  {
    section: 'Instructors',
    variant: 'instructors',
    members: [
      {
        role: 'Senior Naval Science Instructor',
        name: 'Lieutenant Colonel Hamartrya Tharpe',
        photo: null,
        placeholder: 'SNI',
      },
      {
        role: 'Naval Science Instructor',
        name: 'Senior Chief Petty Officer Keven Scullin',
        photo: null,
        placeholder: 'NSI',
      },
    ],
  },
  {
    section: 'Triad',
    variant: 'triad',
    members: [
      {
        role: 'Commanding Officer',
        name: 'C/LT John Sini Abraham',
        photo: staffPhotos['CO John Sini Abraham.jpg'],
        placeholder: 'CO',
        photoPosition: 'center 40%',
      },
      {
        role: 'Executive Officer',
        name: 'C/LTJG Vikram Palani',
        photo: staffPhotos['XO Vikram Palani.jpg'],
        placeholder: 'XO',
      },
      {
        role: 'Command Master Chief',
        name: 'C/SCPO Adit Vallecha',
        photo: staffPhotos['CMC Adit Vallecha.jpg'],
        placeholder: 'CMC',
      },
    ],
  },
  {
    section: 'Department Heads',
    variant: 'departments',
    members: [
      {
        role: 'Operations Officer',
        name: 'Currently No One',
        photo: null,
        placeholder: 'OPS',
      },
      {
        role: 'Admin Officer',
        name: 'C/ENS Aanve Pathangey',
        photo: staffPhotos['AdminO Aanve Pathangey.jpg'],
        placeholder: 'ADMIN',
      },
      {
        role: 'Supply Officer',
        name: 'C/ENS Adhya Pathangey',
        photo: staffPhotos['SupplyO Adhya Pathangey.jpg'],
        placeholder: 'SUPPLY',
        photoPosition: 'center 30%',
      },
      {
        role: 'Public Affairs Officer',
        name: 'C/ENS Jason Thatcher',
        photo: staffPhotos['PAO Jason Thatcher.jpg'],
        placeholder: 'PAO',
      },
      {
        role: 'Services Officer',
        name: 'C/ENS Haidyn Phares',
        photo: staffPhotos['ServicesO Haidyn Phares.jpg'],
        placeholder: 'SERV',
      },
      {
        role: 'Training Officer',
        name: 'C/ENS Daniel Potter',
        photo: staffPhotos['TrainingO Daniel Potter.jpg'],
        placeholder: 'TRNG',
      },
    ],
  },
  {
    section: 'Platoon Commanders',
    variant: 'platoons',
    members: [
      {
        role: '1st Platoon',
        name: 'C/ENS Lily Xi',
        photo: staffPhotos['PC1 Lily Xi.jpg'],
        placeholder: 'P1',
      },
      {
        role: '2nd Platoon',
        name: 'C/ENS Lucy Xi',
        photo: staffPhotos['PC2 Lucy Xi.jpg'],
        placeholder: 'P2',
      },
      {
        role: '3rd Platoon',
        name: 'C/ENS Meet Parikh',
        photo: staffPhotos['PC3 Meet Parikh.jpg'],
        placeholder: 'P3',
      },
    ],
  },
];

export const currentMonthSpotlight = {
  month: 'May 2026',
  cadet: 'Cadet of the Month',
  cadetName: 'Cadet Name',
  citation:
    'Recognized for consistent leadership, academic discipline, and setting the tone for younger cadets.',
  newsletterTitle: 'The Cadet Gazette',
  newsletterSummary:
    "This month's issue can spotlight company news, upcoming events, awards, team updates, and service hours.",
};

export const quickLinks = [
  {
    title: 'Photos by Category',
    text: 'Browse images organized by Competitions, Ceremonies, and Socials & Services.',
    href: '#/photos',
  },
  {
    title: 'Company Calendar',
    text: 'Keep families and cadets updated on upcoming company happenings.',
    href: '#/calendar',
  },
  {
    title: 'Current Month',
    text: 'Feature the Cadet of the Month and the latest Cadet Gazette.',
    href: '#/current-month',
  },
];
