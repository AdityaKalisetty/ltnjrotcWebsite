function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="page-header">
      <p className="section-kicker">{eyebrow}</p>
      <h2>{title}</h2>
      {text && <p className="page-intro">{text}</p>}
    </div>
  );
}

export default SectionHeader;
