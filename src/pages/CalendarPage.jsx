import SectionHeader from '../components/SectionHeader';

function CalendarPage({ calendarItems, weeklyPlan }) {
  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Company Calendar"
        title="Weekly Plan and Company Happenings"
        text="The weekly board gives cadets a quick read on the schedule, while company happenings still track the larger events and important dates."
      />

      <div className="weekly-plan-shell">
        <div className="weekly-plan-heading">
          <p className="weekly-plan-range">{weeklyPlan.rangeLabel}</p>
          <h3>{weeklyPlan.title}</h3>
        </div>

        <div className="weekly-plan-grid">
          {weeklyPlan.days.map((day) => (
            <article
              key={day.day}
              className={`week-day-column week-day-column--${day.theme}`}
            >
              <p className="week-day-rotation">{day.rotation}</p>
              <div className="week-day-pill">{day.day}</div>

              <div className="week-day-block">
                <p className="week-day-morning">{day.morning}</p>
                <p className="week-day-flag">{day.flagDetail}</p>
              </div>

              <div className="week-day-divider" />

              <div className="week-day-periods">
                {day.periods.map((period) => (
                  <p key={`${day.day}-${period}`} className="week-day-period">
                    {period}
                  </p>
                ))}
              </div>

              <div className="week-day-divider" />

              <div className="week-day-footer">{day.afternoon}</div>
            </article>
          ))}
        </div>

        <div className="weekly-plan-notes">
          {weeklyPlan.footerNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </div>

      <div className="content-panel company-happenings-panel">
        <h3>Company Happenings</h3>
        <div className="timeline">
          {calendarItems.map((item) => (
            <article key={`${item.date}-${item.title}`} className="timeline-card">
              <p className="timeline-date">{item.date}</p>
              <div>
                <h4>{item.title}</h4>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CalendarPage;
