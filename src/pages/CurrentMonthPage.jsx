import SectionHeader from '../components/SectionHeader';

function CurrentMonthPage({ currentMonthSpotlight }) {
  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Monthly Spotlight"
        title={`Current Month: ${currentMonthSpotlight.month}`}
        text="A dedicated monthly page gives you one place to highlight recognition, share the Cadet Gazette, and summarize what matters right now."
      />

      <div className="two-column-layout">
        <article className="content-panel spotlight-panel">
          <p className="card-tag">Recognition</p>
          <h3>{currentMonthSpotlight.cadet}</h3>
          <p className="spotlight-name">{currentMonthSpotlight.cadetName}</p>
          <p>{currentMonthSpotlight.citation}</p>
        </article>

        <article className="content-panel spotlight-panel">
          <p className="card-tag">Newsletter</p>
          <h3>{currentMonthSpotlight.newsletterTitle}</h3>
          <p>{currentMonthSpotlight.newsletterSummary}</p>
          <a href="#newsletter-link" className="view-all-button">
            Open Gazette
          </a>
        </article>
      </div>
    </section>
  );
}

export default CurrentMonthPage;
