
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentSurveyPage from './pages/StudentSurveyPage'
import SurveyEditorPage from './pages/SurveyEditorPage'
import PresentSurveyPage from './pages/PresentSurveyPage'
import ResultsPage from './pages/ResultsPage'

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 text-gray-900">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">
          Classroom Survey
        </h1>

        <p>Quick in-class understanding checks</p>

        <a
          href="/login"
          className="inline-block rounded bg-blue-600 px-6 py-3 text-white"
        >
          Instructor Login
        </a>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/surveys/new" element={<SurveyEditorPage />} />
            <Route path="/surveys/:id/edit" element={<SurveyEditorPage />} />
            <Route
              path="/surveys/:id/present"
              element={<PresentSurveyPage />}
            />
            <Route
              path="/surveys/:id/results"
              element={<ResultsPage />}
            />
          </Route>

          <Route path="/s/:slug" element={<StudentSurveyPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
