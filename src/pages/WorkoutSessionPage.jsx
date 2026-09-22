import { useParams } from 'react-router-dom'
import PagePlaceholder from '../components/ui/PagePlaceholder'

function WorkoutSessionPage() {
  const { workoutId } = useParams()
  return (
    <PagePlaceholder
      title="Workout session"
      note={`Active session for "${workoutId}" will run here.`}
    />
  )
}

export default WorkoutSessionPage