import { BrowserRouter, Routes, Route } from 'react-router-dom'

import AppLayout from './components/layout/AppLayout'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ExercisesPage from './pages/ExercisesPage'
import ExerciseDetailsPage from './pages/ExerciseDetailsPage'
import WorkoutLibraryPage from './pages/WorkoutLibraryPage'
import WorkoutSessionPage from './pages/WorkoutSessionPage'
import CompletedWorkoutsPage from './pages/CompletedWorkoutsPage'
import DietPage from './pages/DietPage'
import ProgressPage from './pages/ProgressPage'
import AiTrackerPage from './pages/AiTrackerPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AppLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:exerciseId" element={<ExerciseDetailsPage />} />
          <Route path="/workouts" element={<WorkoutLibraryPage />} />
          <Route path="/workouts/:workoutId" element={<WorkoutSessionPage />} />
          <Route path="/completed" element={<CompletedWorkoutsPage />} />
          <Route path="/diet" element={<DietPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/ai-tracker" element={<AiTrackerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App