import SectionHeader from '../components/SectionHeader';
import crmPdf from '../assets/resources/cadet-reference-manual.pdf';

const rankImageModules = import.meta.glob('../assets/rankInsignias/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
});

const ribbonImageModules = import.meta.glob('../assets/ribbonPhotos/Ribbons/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
});

const rankImages = Object.fromEntries(
  Object.entries(rankImageModules).map(([path, src]) => [
    path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase(),
    src,
  ])
);

const ribbonImages = Object.fromEntries(
  Object.entries(ribbonImageModules).map(([path, src]) => [
    path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase(),
    src,
  ])
);

const enlistedRanks = [
  { label: 'Cadet Seaman Apprentice', short: 'SA' },
  { label: 'Cadet Seaman', short: 'SN' },
  { label: 'Cadet Petty Officer 3rd Class', short: 'PO3' },
  { label: 'Cadet Petty Officer 2nd Class', short: 'PO2' },
  { label: 'Cadet Petty Officer 1st Class', short: 'PO1' },
  { label: 'Cadet Chief Petty Officer', short: 'CPO' },
  { label: 'Cadet Senior Chief Petty Officer', short: 'SCPO' },
];

const officerRanks = [
  { label: 'Cadet Ensign', short: 'ENS' },
  { label: 'Cadet Lieutenant Junior Grade', short: 'LTJG' },
  { label: 'Cadet Lieutenant', short: 'LT' },
  { label: 'Cadet Lieutenant Commander', short: 'LCDR' },
  { label: 'Cadet Commander', short: 'CDR' },
];

const sampleRibbons = [
  'Meritorious Achievement',
  'Distinguished Unit',
  'Distinguished Cadet',
  'Honor Cadet',
  'Cadet Achievement',
  'Physical Fitness',
  'Color Guard',
  'Academic Team',
];

const crmSections = [
  { title: 'Cadet Rank', detail: 'CRM p. 35-36' },
  { title: 'Leadership', detail: 'CRM p. 36-37' },
  { title: 'Ribbons & Awards', detail: 'CRM p. 37-42' },
  { title: 'Ribbon Devices', detail: 'CRM p. 42-45' },
  { title: 'Uniforms', detail: 'CRM p. 46-59' },
  { title: 'Fitness & Safety', detail: 'CRM p. 73-79' },
];

const uniformChecks = [
  'Build a clean gig line from shirt front through belt buckle to trouser fly.',
  'Press the uniform, remove lint, and keep shoes inspection-ready before formation.',
  'Match belt, socks, undershirt, and shoes to the uniform being worn.',
  'Keep pockets flat and carry only what the uniform allows.',
];

const measurementCues = [
  {
    title: 'Name Tag',
    text: 'Center it on the right side, 1/4 inch above the pocket.',
  },
  {
    title: 'Ribbon Rack',
    text: 'Center it on the left side, 1/4 inch above the pocket.',
  },
  {
    title: 'Service Stars',
    text: 'Place stars 1/4 inch above the top ribbon row; multiple stars sit 1/4 inch apart.',
  },
  {
    title: 'Collar Insignia',
    text: 'Position the center 1 7/8 inches from the collar point on the bisecting line.',
  },
  {
    title: 'Garrison Cap',
    text: 'Rank/rate insignia sits 2 inches from the fore crease and 1 1/2 inches from the bottom edge.',
  },
  {
    title: 'Trouser Hem',
    text: 'Rear hem should fall about 2 inches from the deck with a single break in front.',
  },
];

const uniformTypes = [
  'Service Dress Blue',
  'Summer White',
  'Service Khaki',
  'Navy Working Uniform',
];

const cadetEssentials = [
  'Use proper Navy forms of address',
  'Know NJROTC and Navy chain of command',
  'Review the 11 principles of leadership',
  'Practice ORM and Training Time Out',
];

const workflowSteps = [
  'Register for competitions as soon as signups open.',
  'Upload required PDFs from the dashboard forms modal.',
  'Keep profile, ribbons, and photo current before inspection or travel.',
];

function getRankImage(short) {
  return rankImages[short.toLowerCase()] || null;
}

function getRibbonImage(name) {
  return ribbonImages[name.toLowerCase()] || null;
}

function QuickGrid({ items }) {
  return (
    <div className="unit-quick-grid">
      {items.map((item) => (
        <article key={item.title} className="unit-quick-card">
          <strong>{item.title}</strong>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function RankGrid({ title, ranks }) {
  return (
    <div className="unit-rank-group">
      <div className="unit-resource-subhead">
        <p className="card-tag">{title}</p>
      </div>
      <div className="unit-rank-grid">
        {ranks.map((rank) => (
          <article key={rank.short} className="unit-rank-card">
            <span className="unit-rank-badge">
              {getRankImage(rank.short) ? (
                <img src={getRankImage(rank.short)} alt={rank.label} />
              ) : (
                <span>{rank.short}</span>
              )}
            </span>
            <strong>{rank.short}</strong>
            <p>{rank.label}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function UnitResourcesPage() {
  return (
    <section className="page-section unit-resources-page">
      <SectionHeader
        eyebrow="Cadet Tools"
        title="Unit Resources"
        text="CRM-based quick reference for uniforms, measurements, ranks, awards, and the cadet basics you use most."
      />

      <div className="unit-resources-layout">
        <section className="content-panel unit-resource-panel unit-resource-panel--hero">
          <p className="card-tag">Official CRM</p>
          <h3>Cadet Reference Manual, 2024</h3>
          <p>
            This page mirrors the sections cadets actually reach for most: rank, ribbons, devices, uniforms,
            fitness, safety, and day-of-inspection placement checks.
          </p>
          <div className="unit-resource-actions">
            <a href={crmPdf} target="_blank" rel="noreferrer" className="join-button">
              Open CRM PDF
            </a>
            <a href="#/dashboard" className="ghost-button">
              Back to Dashboard
            </a>
          </div>
          <p className="unit-resource-note">
            Use this as the fast view. Use the CRM as the final authority before inspection, boards, or travel.
          </p>
          <QuickGrid items={crmSections} />
        </section>

        <section className="content-panel unit-resource-panel">
          <p className="card-tag">Uniform Basics</p>
          <h3>Inspection Ready</h3>
          <ul className="unit-resource-list">
            {uniformChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="unit-chip-row">
            {uniformTypes.map((item) => (
              <span key={item} className="unit-chip">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="content-panel unit-resource-panel">
          <p className="card-tag">Measurements</p>
          <h3>Exact Placement Cues</h3>
          <div className="unit-measurement-grid">
            {measurementCues.map((item) => (
              <article key={item.title} className="unit-measurement-card">
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-panel unit-resource-panel unit-resource-panel--wide">
          <p className="card-tag">Rank Recognition</p>
          <h3>Cadet Rank Board</h3>
          <div className="unit-rank-board">
            <RankGrid title="Enlisted" ranks={enlistedRanks} />
            <RankGrid title="Officer" ranks={officerRanks} />
          </div>
        </section>

        <section className="content-panel unit-resource-panel">
          <p className="card-tag">Awards</p>
          <h3>Ribbon Reference</h3>
          <div className="unit-ribbon-grid">
            {sampleRibbons.map((name) => (
              <article key={name} className="unit-ribbon-card">
                <span className="unit-ribbon-art">
                  {getRibbonImage(name) ? <img src={getRibbonImage(name)} alt={name} /> : <span>{name}</span>}
                </span>
                <strong>{name}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="content-panel unit-resource-panel">
          <p className="card-tag">Cadet Essentials</p>
          <h3>What To Know Weekly</h3>
          <ul className="unit-resource-list">
            {cadetEssentials.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ol className="unit-resource-steps">
            {workflowSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <div className="unit-resource-actions unit-resource-actions--stacked">
            <a href="#/competitions" className="ghost-button">
              Competition Registration
            </a>
            <a href="#/chain-of-command" className="ghost-button">
              Chain of Command
            </a>
          </div>
        </section>
      </div>
    </section>
  );
}

export default UnitResourcesPage;
