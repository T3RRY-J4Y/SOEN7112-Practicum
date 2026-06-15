import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Patients from './pages/Patients.jsx'
import PatientDetail from './pages/PatientDetail.jsx'
import Appointments from './pages/Appointments.jsx'
import Queue from './pages/Queue.jsx'
import Billing from './pages/Billing.jsx'
import Claims from './pages/Claims.jsx'
import LabPharmacy from './pages/LabPharmacy.jsx'
import AuditLog from './pages/AuditLog.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="patients"
          element={
            <ProtectedRoute capability="patients.view">
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="patients/:id"
          element={
            <ProtectedRoute capability="patients.view">
              <PatientDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="appointments"
          element={
            <ProtectedRoute capability="appointments.view">
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="queue"
          element={
            <ProtectedRoute capability="queue.view">
              <Queue />
            </ProtectedRoute>
          }
        />
        <Route
          path="billing"
          element={
            <ProtectedRoute capability="billing.view">
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="claims"
          element={
            <ProtectedRoute capability="claims.view">
              <Claims />
            </ProtectedRoute>
          }
        />
        <Route
          path="lab"
          element={
            <ProtectedRoute capability="lab.view">
              <LabPharmacy />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit"
          element={
            <ProtectedRoute capability="audit.view">
              <AuditLog />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
