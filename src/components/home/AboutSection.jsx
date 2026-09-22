const PILLARS = [
  'Workout planning',
  'Progress tracking',
  'Food awareness',
  'Consistency',
  'Personal guidance',
]

function AboutSection() {
  return (
    <section className="section-block container" id="about" aria-labelledby="about-title">
      <div className="about-grid">
        <div className="section-header">
          <p className="section-header__eyebrow">About BeFit</p>
          <h2 className="section-header__title" id="about-title">
            Fitness tracking, made simple
          </h2>
        </div>

        <div className="about-copy">
          <p>
            BeFit is designed to make fitness tracking simple, understandable,
            and motivating. Instead of burying you in dashboards, it wraps the
            essentials — planning, tracking, food awareness, and consistency —
            into one calm, focused app.
          </p>
          <p>
            Everything runs in your browser, and your data stays on your
            device. Plan a session, log it, and a clear picture of where you’re
            headed builds up naturally over time.
          </p>
          <ul className="about-chips" aria-label="What BeFit focuses on">
            {PILLARS.map((pillar) => (
              <li key={pillar}>
                <span className="chip">{pillar}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default AboutSection