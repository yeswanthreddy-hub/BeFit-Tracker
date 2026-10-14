/**
 * A titled, animated panel inside the Settings page.
 *
 * Keeps every section visually consistent: an eyebrow, a heading, an optional
 * description, an optional header action (e.g. a reset link) and the section
 * body. The heading id is derived from the section id so it always lines up
 * with `aria-labelledby`.
 */
function SettingsSection({ id, eyebrow = 'Settings', title, description = '', action = null, children }) {
  const titleId = `${id}-title`

  return (
    <section className="settings-section" aria-labelledby={titleId}>
      <header className="settings-section__head">
        <div className="settings-section__intro">
          {eyebrow && <p className="settings-section__eyebrow">{eyebrow}</p>}
          <h2 className="settings-section__title" id={titleId}>
            {title}
          </h2>
          {description && <p className="settings-section__desc">{description}</p>}
        </div>
        {action && <div className="settings-section__action">{action}</div>}
      </header>

      <div className="settings-section__body">{children}</div>
    </section>
  )
}

export default SettingsSection
