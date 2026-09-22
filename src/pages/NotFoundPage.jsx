import { Link } from 'react-router-dom'
import PagePlaceholder from '../components/ui/PagePlaceholder'

function NotFoundPage() {
  return (
    <PagePlaceholder
      title="Page not found"
      note={
        <>
          This page doesn&apos;t exist. Head back to the{' '}
          <Link to="/dashboard">dashboard</Link>.
        </>
      }
    />
  )
}

export default NotFoundPage