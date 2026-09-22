function SectionHeader({
  eyebrow,
  title,
  sub,
  action,
  split = false,
  className = '',
}) {
  const classes = ['section-header', split ? 'section-header--split' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div>
        {eyebrow && <p className="section-header__eyebrow">{eyebrow}</p>}
        <h2 className="section-header__title">{title}</h2>
        {sub && <p className="section-header__sub">{sub}</p>}
      </div>
      {action && <div className="section-header__action">{action}</div>}
    </div>
  )
}

export default SectionHeader