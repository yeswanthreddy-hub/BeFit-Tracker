function PagePlaceholder({ title, note }) {
  return (
    <section className="page-placeholder">
      <p className="page-placeholder__eyebrow">Coming soon</p>
      <h1>{title}</h1>
      <p className="page-placeholder__note">{note}</p>
    </section>
  )
}

export default PagePlaceholder