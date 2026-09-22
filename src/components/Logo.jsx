function Logo({ size = 34, showWordmark = true, className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <svg
        className="logo__mark"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill="url(#befit-logo-gradient)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 14h3v-2a2 2 0 1 1 4 0v2h10v-2a2 2 0 1 1 4 0v2h3a2 2 0 0 0 0 4h-1v4h1a2 2 0 0 0 0 4h-3v2a2 2 0 1 1-4 0v-2H19v2a2 2 0 1 1-4 0v-2h-3a2 2 0 0 1 0-4h1v-4h-1a2 2 0 0 1 0-4Zm4 4h16v4H16v-4Z"
        />
        <defs>
          <linearGradient
            id="befit-logo-gradient"
            x1="10"
            y1="10"
            x2="38"
            y2="38"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#D4FF7A" />
            <stop offset="1" stopColor="#B9F34A" />
          </linearGradient>
        </defs>
      </svg>
      {showWordmark && <span className="logo__wordmark">BeFit</span>}
    </span>
  )
}

export default Logo