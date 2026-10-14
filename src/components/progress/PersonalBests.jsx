/**
 * Personal bests / achievements.
 *
 * Only achievements supported by real data are ever shown as earned; everything
 * else sits in a clearly separate "Locked" group with a plain "what is left"
 * hint, so a badge can never look earned when it is not.
 */
function PersonalBests({ earned = [], locked = [] }) {
  const totalCount = earned.length + locked.length

  return (
    <section className="bests card" aria-labelledby="bests-heading">
      <div className="bests__head">
        <div>
          <h2 className="bests__title" id="bests-heading">
            Personal bests
          </h2>
          <p className="bests__note">
            {earned.length} of {totalCount} achievements unlocked
          </p>
        </div>
      </div>

      {earned.length === 0 ? (
        <p className="bests__empty">
          No achievements yet. Complete a workout or reach a target to unlock your first badge.
        </p>
      ) : (
        <ul className="bests__grid">
          {earned.map((item) => (
            <li className="best best--earned" key={item.id}>
              <span className="best__badge" aria-hidden="true">
                ★
              </span>
              <span className="best__body">
                <span className="best__title">{item.title}</span>
                <span className="best__note">{item.note}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {locked.length > 0 && (
        <div className="bests__locked">
          <h3 className="bests__locked-title">Locked</h3>
          <ul className="bests__grid">
            {locked.map((item) => (
              <li className="best best--locked" key={item.id}>
                <span className="best__badge" aria-hidden="true">
                  ☆
                </span>
                <span className="best__body">
                  <span className="best__title">{item.title}</span>
                  <span className="best__note">{item.hint}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default PersonalBests
