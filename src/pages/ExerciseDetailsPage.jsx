import { useParams } from 'react-router-dom'
import PagePlaceholder from '../components/ui/PagePlaceholder'

function ExerciseDetailsPage() {
  const { exerciseId } = useParams()
  return (
    <PagePlaceholder
      title="Exercise details"
      note={`Detail view for "${exerciseId}" will render here.`}
    />
  )
}

export default ExerciseDetailsPage