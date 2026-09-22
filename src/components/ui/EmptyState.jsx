function EmptyState({ title, note, action }) {
  return (
    <div className="state state--empty">
      <p className="state__title">{title}</p>
      {note && <p className="state__note">{note}</p>}
      {action && <div className="state__action">{action}</div>}
    </div>
  )
}

export default EmptyState