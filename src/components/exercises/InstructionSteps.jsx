/**
 * Numbered how-to steps for an exercise.
 *
 * The list comes straight from the exercise record, so instructions are data
 * rather than copy pasted into a page. The counter is zero padded for the
 * BeFit step look and is hidden from assistive tech because the ordered list
 * already announces positions.
 *
 * @param {{instructions: string[]}} props
 */
function InstructionSteps({ instructions }) {
  if (!Array.isArray(instructions) || instructions.length === 0) return null

  return (
    <ol className="instruction-steps">
      {instructions.map((step, index) => (
        <li key={`${index}-${step}`} className="instruction-steps__item">
          <span className="instruction-steps__number" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="instruction-steps__text">{step}</span>
        </li>
      ))}
    </ol>
  )
}

export default InstructionSteps