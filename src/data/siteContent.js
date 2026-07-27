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

export const pages = [
  { id: 'home', label: 'Home' },
  { id: 'chain-of-command', label: 'Chain of Command' },
  { id: 'enrollment', label: 'Enrollment' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'photos', label: 'Photos' },
];

export const photoCollections = {
  competitions: [],
  ceremonies: [],
  socialsAndServices: [],
};

export const competitionCatalog = [
  {
    id: 'area-19-championships-2026',
    name: 'Area 19 Championships',
    types: ['Drill', 'Academic', 'Physical Training'],
    description:
      'Regional drill and academic competition for cadets across Area 19. Teams compete in regulation drill, written academics, and leadership exercises.',
    date: 'June 14, 2026',
    location: 'Northlake High School',
    registrationCloses: 'June 1, 2026',
    formRequirements: [
      { id: 'parental-consent', label: 'Parental Consent' },
      { id: 'alternative-transportation', label: 'Alternative Transportation' },
      { id: 'form-3', label: 'Form 3' },
    ],
  },
  {
    id: 'eagle-talons-pt-meet-2026',
    name: 'Eagle Talons PT Meet',
    types: ['Physical Training'],
    description:
      'A competitive PT meet testing endurance, strength, and teamwork with other NJROTC units from the region.',
    date: 'June 22, 2026',
    location: 'Lebanon Trail High School',
    registrationCloses: 'June 10, 2026',
    formRequirements: [
      { id: 'parental-consent', label: 'Parental Consent' },
      { id: 'medical-release', label: 'Medical Release' },
    ],
  },
];

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
        photo: staffPhotos['SNSI Hamartrya Tharpe.jpg'],
        placeholder: 'SNSI',
      },
      {
        role: 'Naval Science Instructor',
        name: 'Senior Chief Petty Officer Keven Scullin',
        photo: staffPhotos['NSI Keven Scullin.jpg'],
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
        name: 'C/ENS Suraj Gurematti',
        photo: staffPhotos['OpsO Suraj Gurematti.jpg'],
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
    title: 'Company Calendar',
    text: 'View the training schedule, company happenings, and the monthly spotlight in one place.',
    href: '#/calendar',
  },
  {
    title: 'Leadership Directory',
    text: 'Find the company chain of command and the cadets leading each section of the unit.',
    href: '#/chain-of-command',
  },
  {
    title: 'Photo Archive',
    text: 'Browse ceremonies, competitions, and service events from across the year.',
    href: '#/photos',
  },
];

export const announcements = [];
