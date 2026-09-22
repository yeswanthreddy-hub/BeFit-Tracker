import { useInView } from '../../hooks/useInView'

/**
 * Lightweight scroll-reveal wrapper. Content fades up once it enters
 * the viewport. Delays are applied via the CSS variable-aware inline
 * transition-delay. Animations collapse under prefers-reduced-motion.
 */
function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const [ref, inView] = useInView()

  return (
    <Tag
      ref={ref}
      className={`reveal${inView ? ' reveal--in' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Reveal