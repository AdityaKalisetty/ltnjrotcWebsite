import SectionHeader from '../components/SectionHeader';

function EnrollmentPage() {
  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Enrollment"
        title="Enrollment Information Coming Soon."
        text="This page is set aside for enrollment details and will be filled in as the program materials are ready."
      />

      <div className="content-panel">
        <p>
          Check back soon for enrollment steps, important forms, contact information, and
          upcoming onboarding details for new cadets and families.
        </p>
      </div>
    </section>
  );
}

export default EnrollmentPage;
