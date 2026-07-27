import SectionHeader from '../components/SectionHeader';
import crmPdf from '../assets/resources/cadet-reference-manual.pdf';

const ribbonImageModules = import.meta.glob('../assets/ribbonPhotos/Ribbons/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
});

const ribbonImages = Object.fromEntries(
  Object.entries(ribbonImageModules).map(([path, source]) => [
    path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase(),
    source,
  ])
);

const ribbonNames = [
  [1, 'Meritorious Achievement'],
  [2, 'Distinguished Unit'],
  [3, 'Distinguished Cadet'],
  [4, 'Honor Cadet'],
  [5, 'Cadet Achievement'],
  [6, 'Unit Achievement'],
  [8, 'Naval Science IV Outstanding Cadet'],
  [9, 'Naval Science III Outstanding Cadet'],
  [10, 'Naval Science II Outstanding Cadet'],
  [11, 'Naval Science I Outstanding Cadet'],
  [12, 'Exemplary Conduct'],
  [13, 'Exemplary Personal Appearance'],
  [14, 'Physical Fitness'],
  [15, 'Participation'],
  [16, 'Unit Service'],
  [17, 'Community Service'],
  [18, 'Academic Team'],
  [19, 'Drill Team'],
  [20, 'Color Guard'],
  [21, 'STEM'],
  [23, 'Orienteering'],
  [24, 'Inter-Service Competition'],
  [25, 'Recruiting'],
  [26, 'Basic Leadership Training'],
  [27, 'Sea Cruise'],
];

const chainOfCommand = [
  ['Commander in Chief', 'The Honorable Donald J. Trump'],
  ['Vice President', 'The Honorable JD Vance'],
  ['Secretary of Defense', 'The Honorable Pete Hegseth'],
  ['Secretary of the Navy', 'The Honorable Terrance Emmert'],
  ['Acting Chief of Naval Operations / CNO', 'James Kilby'],
  ['Master Chief Petty Officer of the Navy', 'Master Chief Petty Officer James Honea'],
  ['Commandant of the Marine Corps', 'General Eric Smith'],
  ['Sergeant Major of the Marine Corps', 'Sergeant Major Carlos Ruiz'],
  ['Acting Chairman of the Joint Chiefs of Staff', 'Admiral Christopher Grady'],
  ['Vice Chairman of the Joint Chiefs of Staff', 'Admiral Christopher Grady'],
  ['Commander, Naval Education and Training Command', 'Rear Admiral Lower Half Jeffery Czerewko'],
  ['Commander, Naval Service Training Command', 'Rear Admiral Lower Half Craig T. Mattingly'],
  ['Speaker of the House', 'Mike Johnson'],
];

const generalOrders = [
  'Take charge of this post and all government property in view.',
  'Walk my post in a military manner keeping always on the alert and observing everything that takes place within sight or hearing.',
  'Report all violations of orders I am instructed to enforce.',
  'Repeat all calls from posts more distant from the guardhouse or the quarterdeck than my own.',
  'Quit my post only when properly relieved.',
  'Receive, obey, and pass on to the sentry who relieves me all orders from the commanding officer, command duty officer, officer of the day, officer of the deck, and all officers and petty officers of the watch only.',
  'Talk to no one except in the line of duty.',
  'Give the alarm in case of fire or disorder.',
  'Call the corporal of the guard or officer of the deck in any case not covered by instructions.',
  'Salute all officers and all colors and standards not cased.',
  'Be especially watchful at night, and during the time for challenging, challenge all persons on or near my post, and allow no one to pass without proper authority.',
];

const leadershipPrinciples = [
  'Know yourself and seek self-improvement.',
  'Be technically proficient.',
  'Seek responsibility and take responsibility for your actions.',
  'Make sound and timely decisions.',
  'Set the example.',
  'Know your people and look out for their well-being.',
  'Keep your workers informed.',
  'Develop a sense of responsibility in your workers.',
  'Ensure that tasks are understood, supervised, and accomplished.',
  'Train as a team.',
  'Use the full capabilities of your organization.',
];

const shipTerms = [
  ['Aft', 'The rear part of a ship.'], ['Aloft', 'Above or on top of the deck.'],
  ['Amidships', 'Toward the middle of a ship.'], ['Bearing', 'The direction of an object, expressed from a chart or relative to the vessel heading.'],
  ['Bilge', 'The rounded lower part of a ship’s hull.'], ['Bow', 'The front part of a ship.'],
  ['Bridge', 'The platform above the main deck where ship controls are located.'], ['Brig', 'The ship’s jail.'],
  ['Bulkhead', 'An upright partition separating parts of a ship.'], ['Bunk', 'A bed on a ship.'],
  ['Buoy', 'An anchored float used to mark a position, hazard, shoal, or mooring.'], ['Capsize', 'To turn over.'],
  ['Chart', 'A map for navigators.'], ['Cleat', 'A fitting with horn-shaped ends to which lines are made fast.'],
  ['Compass', 'A magnetic or gyro navigation instrument.'], ['Current', 'The horizontal movement of water.'],
  ['Deck', 'A floor on a ship.'], ['Dock', 'A protected water area where vessels are moored; often a pier or wharf.'],
  ['Draft', 'The depth of water displaced by a ship.'], ['Fathom', 'A six-foot unit used to measure water depth.'],
  ['Fender', 'A cushion between boats or between a boat and pier that prevents damage.'], ['Fouled', 'Jammed, entangled, or dirtied.'],
  ['Freeboard', 'A ship’s height from the waterline to the main deck.'], ['Galley', 'A ship’s kitchen.'],
  ['Gear', 'A general term for ropes, blocks, tackle, and other equipment.'], ['Gee Dunk', 'A ship’s store.'],
  ['Gigline', 'The alignment line of the uniform shirt, belt buckle, and trousers.'], ['Hatch', 'A ship’s door.'],
  ['Hatchway', 'A covered deck opening that gives access to a lower deck.'], ['Head', 'A restroom on a ship.'],
  ['Helm', 'The wheel or tiller that controls the rudder.'], ['Hold', 'A below-deck cargo compartment.'],
  ['Hull', 'The main body of a ship.'], ['Jettison', 'To cast overboard or discard.'],
  ['Keel', 'The main beam extending along the bottom of a ship.'], ['Ladder', 'Stairs.'],
  ['Leeward', 'The direction away from the wind.'], ['Mooring', 'An arrangement that secures a boat to a buoy or pier.'],
  ['National Ensign', 'The national flag when flown by ships and boats.'], ['Overhead', 'The ship’s ceiling.'],
  ['Overboard', 'Over the side or out of the boat.'], ['Pennant', 'A tapered nautical flag used for identification.'],
  ['Pogey Bait', 'Candy or sweets.'], ['Port', 'When facing forward, the left side of a ship.'],
  ['Porthole', 'A ship’s window.'], ['Screw', 'Another name for a ship’s propeller.'],
  ['Scuttlebutt', 'A water fountain.'], ['Starboard', 'When facing forward, the right side of a ship.'],
  ['Stern', 'The rear end of a ship.'], ['Stow', 'To pack or store away in an orderly, compact manner.'],
  ['Superstructure', 'Structures built on a ship’s upper deck.'], ['Underway', 'In motion—not moored, anchored, or aground.'],
  ['Union Jack', 'The blue field of white stars from the national ensign, flown by U.S. warships at anchor or moored.'],
  ['Watch', 'A period of duty on a ship.'], ['Waterline', 'The line where the water meets a ship’s side.'],
];

function UnitResourcesPage() {
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="page-section unit-resources-page">
      <SectionHeader eyebrow="Cadet Tools" title="General Knowledge" text="Core NJROTC knowledge for study, drill, boards, and everyday cadet life." />

      <div className="general-knowledge-shell">
        <aside className="general-knowledge-nav" aria-label="General Knowledge sections">
          <p className="card-tag">On this page</p>
          <button type="button" onClick={() => scrollToSection('cfm')}>CFM</button>
          <button type="button" onClick={() => scrollToSection('chain-of-command')}>Chain of Command</button>
          <button type="button" onClick={() => scrollToSection('general-orders')}>General Orders</button>
          <button type="button" onClick={() => scrollToSection('cadet-creed')}>Cadet Creed</button>
          <button type="button" onClick={() => scrollToSection('leadership-principles')}>Leadership Principles</button>
          <button type="button" onClick={() => scrollToSection('ribbons')}>Ribbons</button>
          <button type="button" onClick={() => scrollToSection('ship-terminology')}>Ship Terminology</button>
        </aside>

        <div className="unit-resources-layout general-knowledge-layout">
        <section id="cfm" className="content-panel unit-resource-panel unit-resource-panel--hero">
          <p className="card-tag">Official Reference</p>
          <h3>Cadet Field Manual</h3>
          <p>Use the Cadet Field Manual (CFM) as the official reference for NJROTC standards and procedures.</p>
          <div className="unit-resource-actions"><a href={crmPdf} target="_blank" rel="noreferrer" className="join-button">Open CFM PDF</a></div>
        </section>

        <section id="chain-of-command" className="content-panel unit-resource-panel unit-resource-panel--wide">
          <p className="card-tag">Chain of Command</p>
          <h3>National and Navy Leadership</h3>
          <ol className="knowledge-command-list">
            {chainOfCommand.map(([title, name]) => <li key={title}><strong>{title}:</strong> {name}</li>)}
          </ol>
        </section>

        <section id="general-orders" className="content-panel unit-resource-panel unit-resource-panel--wide">
          <p className="card-tag">General Orders</p>
          <h3>Eleven General Orders of a Sentry</h3>
          <ol className="knowledge-orders-list">
            {generalOrders.map((order) => <li key={order}>To {order}</li>)}
          </ol>
        </section>

        <section id="cadet-creed" className="content-panel unit-resource-panel">
          <p className="card-tag">Cadet Creed</p>
          <h3>Our Commitment</h3>
          <p className="knowledge-creed">I am a Navy Junior ROTC Cadet. I strive to promote patriotism and to become an informed and responsible citizen. I respect those in positions of authority. I support those who have defended freedom and democracy around the world. I proudly embrace the Navy’s core values of Honor, Courage, and Commitment. I am committed to excellence and the fair treatment of all.</p>
        </section>

        <section id="leadership-principles" className="content-panel unit-resource-panel">
          <p className="card-tag">Leadership</p>
          <h3>Eleven Leadership Principles</h3>
          <ol className="knowledge-principles-list">
            {leadershipPrinciples.map((principle) => <li key={principle}>{principle}</li>)}
          </ol>
        </section>

        <section id="ribbons" className="content-panel unit-resource-panel unit-resource-panel--wide">
          <p className="card-tag">Ribbon Reference</p>
          <h3>NJROTC Ribbons</h3>
          <p className="unit-resource-note">Shown in official order of precedence, highest to lowest.</p>
          <div className="knowledge-ribbon-grid">
            {ribbonNames.map(([, name]) => (
              <article key={name}>
                <img src={ribbonImages[name.toLowerCase()]} alt={`${name} ribbon`} />
                <strong>{name}</strong>
              </article>
            ))}
          </div>
        </section>

        <section id="ship-terminology" className="content-panel unit-resource-panel unit-resource-panel--wide">
          <p className="card-tag">Basic Ship Terminology</p>
          <h3>Speak Navy</h3>
          <div className="knowledge-terms-grid">
            {shipTerms.map(([term, definition]) => <article key={term}><strong>{term}</strong><span>{definition}</span></article>)}
          </div>
        </section>
        </div>
      </div>
    </section>
  );
}

export default UnitResourcesPage;
