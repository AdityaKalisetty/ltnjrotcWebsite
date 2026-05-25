import SectionHeader from '../components/SectionHeader';

function ChainOfCommandPage({ chainOfCommand }) {
  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Company Leadership"
        title="Chain of Command"
        text="2026-2027 Company Chain of Command, showcasing our dedicated leaders and their roles in guiding our unit to success."
      />

      <div className="stacked-sections">
        {chainOfCommand.map((group) => (
          <section
            key={group.section}
            className={`content-panel chain-section chain-section--${group.variant}`}
          >
            <h3>{group.section}</h3>

            <div className="leadership-grid">
              {group.members.map((item) => (
                <article
                  key={`${group.section}-${item.role}-${item.name}`}
                  className="leader-card leader-card--photo"
                >
                  <div className="leader-photo-frame">
                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt={`${item.name} portrait`}
                        className="leader-photo"
                        style={{
                          objectPosition: item.photoPosition || 'center',
                        }}
                      />
                    ) : (
                      <div className="leader-photo-placeholder" aria-label={`${item.role} placeholder`}>
                        {item.placeholder}
                      </div>
                    )}
                  </div>
                  <h3>{item.role}</h3>
                  <p className="leader-name">{item.name}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export default ChainOfCommandPage;
