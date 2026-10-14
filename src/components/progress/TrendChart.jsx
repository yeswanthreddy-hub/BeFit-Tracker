/**
 * Nutrition trend line chart (calories or protein over time).
 *
 * A small hand-rolled SVG chart: no charting library, responsive through a
 * viewBox, and drawn entirely from real logged values. When a target exists it
 * is drawn as a dashed reference line so the athlete can see the gap at a
 * glance; the same information is also given as text for screen readers.
 *
 * @param {{points: {label: string, value: number}[], target?: number,
 *   unit?: string, accent?: 'primary'|'accent', title?: string,
 *   emptyNote?: string}} props
 */
function TrendChart({ points = [], target = 0, unit = '', accent = 'primary', title, emptyNote }) {
  if (!points || points.length === 0) {
    return <p className="trend-chart__empty">{emptyNote ?? 'No data for this range yet.'}</p>
  }

  const width = 640
  const height = 240
  const pad = { top: 22, right: 18, bottom: 32, left: 48 }
  const innerWidth = width - pad.left - pad.right
  const innerHeight = height - pad.top - pad.bottom

  const values = points.map((point) => point.value)
  const max = niceMax(Math.max(...values, target || 0, 1))
  const count = points.length

  const x = (index) =>
    count === 1 ? pad.left + innerWidth / 2 : pad.left + (index / (count - 1)) * innerWidth
  const y = (value) => pad.top + innerHeight - (value / max) * innerHeight

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index).toFixed(1)} ${y(point.value).toFixed(1)}`)
    .join(' ')

  const areaPath = `${linePath} L ${x(count - 1).toFixed(1)} ${(pad.top + innerHeight).toFixed(1)} L ${x(0).toFixed(1)} ${(pad.top + innerHeight).toFixed(1)} Z`

  const gridValues = [0, max / 2, max]
  const tickIndexes = xTickIndexes(count)

  const average = Math.round(values.reduce((sum, value) => sum + value, 0) / count)
  const summary = `${title ?? 'Trend'} chart. Average ${average}${unit ? ` ${unit}` : ''}${
    target > 0 ? `, target ${target}${unit ? ` ${unit}` : ''}` : ''
  } across ${count} point${count === 1 ? '' : 's'}.`

  return (
    <figure className={`trend-chart trend-chart--${accent}`} aria-label={title}>
      <svg
        className="trend-chart__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={summary}
        preserveAspectRatio="xMidYMid meet"
      >
        {gridValues.map((value) => (
          <g key={value}>
            <line
              className="trend-chart__grid"
              x1={pad.left}
              x2={width - pad.right}
              y1={y(value)}
              y2={y(value)}
            />
            <text className="trend-chart__axis" x={pad.left - 8} y={y(value) + 4} textAnchor="end">
              {Math.round(value)}
            </text>
          </g>
        ))}

        {target > 0 && (
          <line
            className="trend-chart__target"
            x1={pad.left}
            x2={width - pad.right}
            y1={y(target)}
            y2={y(target)}
          />
        )}

        <path className="trend-chart__area" d={areaPath} />
        <path className="trend-chart__line" d={linePath} />

        {points.map((point, index) => (
          <circle
            key={point.label + index}
            className="trend-chart__dot"
            cx={x(index)}
            cy={y(point.value)}
            r={count > 40 ? 0 : 3}
          />
        ))}

        {tickIndexes.map((index) => (
          <text
            key={index}
            className="trend-chart__axis"
            x={x(index)}
            y={height - 10}
            textAnchor="middle"
          >
            {points[index].label}
          </text>
        ))}
      </svg>

      <figcaption className="trend-chart__legend">
        <span className="trend-chart__key trend-chart__key--line">Daily value</span>
        {target > 0 && (
          <span className="trend-chart__key trend-chart__key--target">
            Target {target}
            {unit ? ` ${unit}` : ''}
          </span>
        )}
      </figcaption>

      <ul className="visually-hidden">
        {points.map((point, index) => (
          <li key={point.label + index}>
            {point.label}: {point.value}
            {unit ? ` ${unit}` : ''}
          </li>
        ))}
      </ul>
    </figure>
  )
}

/** Round a maximum up to a readable axis top. */
function niceMax(value) {
  const safe = Math.max(1, Math.ceil(value))
  const magnitude = 10 ** Math.floor(Math.log10(safe))
  const normalized = safe / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

/** At most five evenly spaced x-axis labels so they never overlap. */
function xTickIndexes(count) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index)
  const wanted = 5
  const step = (count - 1) / (wanted - 1)
  const indexes = new Set()
  for (let i = 0; i < wanted; i += 1) indexes.add(Math.round(i * step))
  return Array.from(indexes)
}

export default TrendChart
