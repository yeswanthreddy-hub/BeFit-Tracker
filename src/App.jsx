import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './context/AuthProvider'
import { NotificationProvider } from './context/NotificationProvider'
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/auth/AuthLayout'
import PublicOnlyRoute from './components/routing/PublicOnlyRoute'
import ProtectedRoute from './components/routing/ProtectedRoute'
import Toaster from './components/ui/Toaster'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
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
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route element={<AuthLayout />}>
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
            </Route>

            <Route element={<AppLayout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
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
          <Toaster />
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  )
}

export default App
