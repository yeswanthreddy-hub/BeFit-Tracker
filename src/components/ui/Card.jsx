function Card({
  title,
  hover = false,
  interactive = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'card',
    hover ? 'card--hover' : '',
    interactive ? 'card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...rest}>
      {title && <h3 className="card__title">{title}</h3>}
      {children}
    </div>
  )
}

export default Card