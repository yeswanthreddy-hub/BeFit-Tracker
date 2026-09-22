import Reveal from './Reveal'
import Button from '../ui/Button'

const STEPS = [
  {
    number: '01',
    title: 'Choose',
    text: 'Pick a ready-made plan from the library or build your own workout from a growing set of exercises.',
  },
  {
    number: '02',
    title: 'Train',
    text: 'Run your session — log sets, reps, and time as you go. BeFit keeps everything in sync.',
  },
  {
    number: '03',
    title: 'Track',
    text: 'Watch your completed workouts, streaks, and progress build a clear picture over time.',
  },
]

function HowItWorks() {
  return (
    <section className="section-block container" id="how" aria-labelledby="how-title">
      <div className="section-header section-header--center">
        <p className="section-header__eyebrow">How BeFit works</p>
        <h2 className="section-header__title" id="how-title">
          Your training, in three simple steps
        </h2>
        <p className="section-header__sub">
          No complicated setup. Continue where you left off, every day.
        </p>
      </div>

      <ol className="steps">
        {STEPS.map((step, index) => (
          <li className="step" key={step.number}>
            <Reveal delay={index * 130}>
              <span className="step__number" aria-hidden="true">
                {step.number}
              </span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__text">{step.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="how__action">
        <Reveal delay={140}>
          <Button to="/exercises" variant="secondary">
            Start exploring exercises
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

export default HowItWorks