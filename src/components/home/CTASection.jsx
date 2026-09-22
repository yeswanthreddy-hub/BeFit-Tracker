import Reveal from './Reveal'
import Button from '../ui/Button'

function CTASection() {
  return (
    <section className="cta-band container" aria-labelledby="cta-title">
      <Reveal>
        <div className="cta-band__inner">
          <p className="cta-band__eyebrow">Ready when you are</p>
          <h2 className="cta-band__title" id="cta-title">
            Your next workout starts here.
          </h2>
          <p className="cta-band__sub">
            Start your free BeFit routine today — plan it, train it, and watch
            the streak grow.
          </p>
          <div className="cta-band__actions">
            <Button to="/register" variant="primary" size="lg">
              Start Training
            </Button>
            <Button to="/workouts" variant="secondary" size="lg">
              Explore Workouts
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default CTASection