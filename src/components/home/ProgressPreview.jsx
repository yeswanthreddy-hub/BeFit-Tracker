import Reveal from './Reveal'

const WEEKLY_ACTIVITY = [35, 60, 45, 75, 55, 90, 65]

const TILES = [
  {
    label: 'Current streak',
    value: '6 days',
    meta: 'best 12',
    bar: 72,
  },
  {
    label: 'Sessions this month',
    value: '18',
    meta: '+4 vs last month',
    bar: 45,
  },
  {
    label: 'Calories this week',
    value: '3,240',
    meta: '≈ 2,310 / day',
    bar: 62,
  },
  {
    label: 'Strength progress',
    value: '68%',
    meta: 'bench +2.5 kg',
    bar: 68,
  },
  {
    label: 'Protein target',
    value: '82%',
    meta: '146 / 180 g today',
    bar: 82,
  },
]

function ProgressPreview() {
  return (
    <section className="section-block container" id="progress" aria-labelledby="preview-title">
      <div className="section-header">
        <p className="section-header__eyebrow">Product preview</p>
        <h2 className="section-header__title" id="preview-title">
          See where your training is headed
        </h2>
        <p className="section-header__sub">
          Here’s the shape of what your dashboard will track. Real numbers
          appear once you start training.
        </p>
      </div>

      <Reveal>
        <div className="preview-window" role="img" aria-label="Preview of the BeFit dashboard showing sample fitness statistics">
          <div className="preview-window__bar">
            <span className="preview-window__dot" aria-hidden="true" />
            <span className="preview-window__dot" aria-hidden="true" />
            <span className="preview-window__dot" aria-hidden="true" />
            <span className="preview-window__title">Your dashboard</span>
          </div>

          <div className="preview-window__body" aria-hidden="true">
            <div className="preview-grid">
              {TILES.map((tile) => (
                <div className="preview-tile" key={tile.label}>
                  <p className="preview-tile__label">{tile.label}</p>
                  <p className="preview-tile__value">{tile.value}</p>
                  <p className="preview-tile__meta">{tile.meta}</p>
                  <div className="progress">
                    <div className="progress__fill" style={{ width: `${tile.bar}%` }} />
                  </div>
                </div>
              ))}

              <div className="preview-tile">
                <p className="preview-tile__label">Weekly activity</p>
                <div className="preview-tile__bars">
                  {WEEKLY_ACTIVITY.map((height, index) => (
                    <span
                      key={index}
                      className="preview-tile__bar"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <p className="preview-note">
        Sample preview only — your actual stats appear on your Dashboard once
        you log your first sessions.
      </p>
    </section>
  )
}

export default ProgressPreview