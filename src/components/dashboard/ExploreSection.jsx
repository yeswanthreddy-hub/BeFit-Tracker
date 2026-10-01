import { Link } from 'react-router-dom'
import SectionHeader from '../ui/SectionHeader'
import { EXPLORE_DESTINATIONS } from '../../data/workoutTemplates'

/**
 * Explore tiles for the rest of BeFit.
 *
 * Every tile is a real <Link> to an existing route, so there are no dead
 * buttons. Routes that are still placeholders simply render their placeholder
 * page, which is the honest state of those features today.
 */
function ExploreSection() {
  return (
    <section className="explore" aria-labelledby="explore-heading">
      <SectionHeader
        eyebrow="Explore"
        title="Go a little deeper"
        sub="The rest of BeFit is one tap away."
      />

      <h3 className="visually-hidden" id="explore-heading">
        BeFit sections
      </h3>

      <ul className="explore__grid">
        {EXPLORE_DESTINATIONS.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="explore__tile card card--hover">
              <span className="explore__title">{item.title}</span>
              <span className="explore__text">{item.text}</span>
              <span className="explore__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ExploreSection