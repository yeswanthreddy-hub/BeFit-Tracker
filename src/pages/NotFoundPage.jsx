import Button from '../components/ui/Button'
import './NotFoundPage.css'

function NotFoundPage() {
  return (
    <section className="page not-found">
      <div className="not-found__body">
        <p className="page-placeholder__eyebrow">404</p>
        <h1>Page Not Found</h1>
        <p className="page-placeholder__note">
          We couldn&apos;t find the page you were looking for. It may have been
          moved, renamed, or never existed.
        </p>
        <div className="not-found__actions">
          <Button to="/dashboard" variant="primary">
            Back to Dashboard
          </Button>
          <Button to="/" variant="secondary">
            Go Home
          </Button>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
