import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Daily from './pages/Daily'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'
import People from './pages/People'
import Habits from './pages/Habits'
import Reviews from './pages/Reviews'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — all app routes live inside Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/daily" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="daily"     element={<Daily />} />
            <Route path="tasks"     element={<Tasks />} />
            <Route path="projects"  element={<Projects />} />
            <Route path="people"    element={<People />} />
            <Route path="habits"    element={<Habits />} />
            <Route path="reviews"   element={<Reviews />} />
            <Route path="reviews/:type" element={<Reviews />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
