import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'

function CategorySection() {
  return (
    <section
      className="section-block section-block--tint container"
      id="explore"
      aria-labelledby="categories-title"
    >
      <div className="section-header">
        <p className="section-header__eyebrow">Explore</p>
        <h2 className="section-header__title" id="categories-title">
          Find the training you love
        </h2>
        <p className="section-header__sub">
          Jump straight into the muscle group you want to work today.
        </p>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            to="/exercises"
            state={{ category: category.category }}
            className="category-tile card card--hover"
          >
            <span className="category-tile__code" aria-hidden="true">
              {category.code}
            </span>
            <span className="category-tile__body">
              <strong className="category-tile__label">{category.label}</strong>
              <span className="category-tile__tagline">{category.tagline}</span>
            </span>
            <span className="category-tile__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default CategorySection