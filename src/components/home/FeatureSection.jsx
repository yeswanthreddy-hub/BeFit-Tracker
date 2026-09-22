const ICON_PROPS = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const ICONS = {
  planner: (
    <svg {...ICON_PROPS}>
      <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
      <path d="M9 2h6v4H9Z" />
      <path d="M9 11h6M9 14h6M9 17h4" />
    </svg>
  ),
  library: (
    <svg {...ICON_PROPS}>
      <path d="M5 3h13a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
      <path d="M7 20h13" />
      <path d="M12 7v9" />
    </svg>
  ),
  progress: (
    <svg {...ICON_PROPS}>
      <path d="M4 20h16" />
      <path d="M7 16l3.5-4 3 2.5L18 9" />
      <path d="M14 9h4v4" />
    </svg>
  ),
  food: (
    <svg {...ICON_PROPS}>
      <path d="M3.5 11h17" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21" />
    </svg>
  ),
  streaks: (
    <svg {...ICON_PROPS}>
      <path d="M13 3 6.5 13H11l-1 8L16.5 11H12l1-8Z" />
    </svg>
  ),
  ai: (
    <svg {...ICON_PROPS}>
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z" />
      <path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </svg>
  ),
}

const FEATURES = [
  {
    id: 'planner',
    icon: 'planner',
    title: 'Workout Planner',
    text: 'Build workouts from your saved exercises and string them into structured sessions with sets, reps, and clear intent.',
    featured: true,
  },
  {
    id: 'library',
    icon: 'library',
    title: 'Exercise Library',
    text: 'A growing catalog of moves for every muscle group with cues that help you train safely.',
  },
  {
    id: 'progress',
    icon: 'progress',
    title: 'Progress Tracking',
    text: 'Completed workouts, personal records, and weight trends add up to a picture you can actually read.',
  },
  {
    id: 'food',
    icon: 'food',
    title: 'Food Tracking',
    text: 'Log meals and macros so nutrition is a partner to your training, not a mystery.',
  },
  {
    id: 'streaks',
    icon: 'streaks',
    title: 'Fitness Streaks',
    text: 'Daily consistency builds streaks you can see — and guards the best run you’ve ever had.',
  },
  {
    id: 'ai',
    icon: 'ai',
    title: 'AI Fitness Insights',
    text: 'Clear, human-readable guidance on top of your data. Arriving in a future milestone.',
  },
]

function FeatureSection() {
  const featured = FEATURES.find((feature) => feature.featured)
  const rest = FEATURES.filter((feature) => !feature.featured)

  return (
    <section className="section-block container" id="features" aria-labelledby="features-title">
      <div className="section-header">
        <p className="section-header__eyebrow">What BeFit does</p>
        <h2 className="section-header__title" id="features-title">
          Everything you need to stay consistent
        </h2>
        <p className="section-header__sub">
          A few focused tools that work together — no noise, no backends, no sign-up walls.
        </p>
      </div>

      <div className="grid grid--cols-3 feature-grid">
        <article className="card card--hover card--featured feature-card feature-card--featured">
          <span className="feature-card__icon" aria-hidden="true">
            {ICONS[featured.icon]}
          </span>
          <div>
            <h3 className="card__title">{featured.title}</h3>
            <p className="card__text">{featured.text}</p>
          </div>
        </article>

        {rest.map((feature) => (
          <article className="card card--hover feature-card" key={feature.id}>
            <span className="feature-card__icon" aria-hidden="true">
              {ICONS[feature.icon]}
            </span>
            <h3 className="card__title">{feature.title}</h3>
            <p className="card__text">{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FeatureSection