import { useState } from 'react'
import Button from '../ui/Button'
import { QUOTES } from '../../data/quotes'

function QuoteSection() {
  const [index, setIndex] = useState(0)
  const quote = QUOTES[index % QUOTES.length]

  const nextQuote = () => setIndex((current) => (current + 1) % QUOTES.length)

  return (
    <section className="quote-section container" aria-labelledby="quote-label">
      <p id="quote-label" className="section-header__eyebrow quote-section__eyebrow">
        Daily Motivation
      </p>

      <figure className="quote-section__card">
        <span className="quote-section__mark" aria-hidden="true">
          &ldquo;
        </span>
        <blockquote
          key={index}
          className="quote-section__text animate-fade-up"
          aria-live="polite"
        >
          {quote.text}
        </blockquote>
        <figcaption className="quote-section__source">— {quote.source}</figcaption>
      </figure>

      <div className="quote-section__action">
        <Button variant="ghost" size="sm" onClick={nextQuote} aria-label="Show next quote">
          Next quote
          <span aria-hidden="true">→</span>
        </Button>
      </div>
    </section>
  )
}

export default QuoteSection