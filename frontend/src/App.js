import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserDashboard from './components/dashboard/UserDashboard';
import MaintainerDashboard from './components/dashboard/MaintainerDashboard';
import FieldHeadDashboard from './components/dashboard/FieldHeadDashboard';
import History from './components/dashboard/History';
import ReportForm from './components/reports/ReportForm';
import ReportList from './components/reports/ReportList';
import AllReports from './components/reports/AllReports';
import ReportDetails from './components/reports/ReportDetails';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // Show nothing while loading to prevent premature redirects
  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  // Show loading while auth is being checked
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/user-dashboard" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/maintainer-dashboard" element={
            <ProtectedRoute allowedRoles={['maintainer']}>
              <MaintainerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/fieldhead-dashboard" element={
            <ProtectedRoute allowedRoles={['field_head']}>
              <FieldHeadDashboard />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute allowedRoles={['field_head']}>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/report-form" element={
            <ProtectedRoute>
              <ReportForm />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <ReportList />
            </ProtectedRoute>
          } />
          <Route path="/all-reports" element={
            <ProtectedRoute allowedRoles={['field_head']}>
              <AllReports />
            </ProtectedRoute>
          } />
          <Route path="/report/:id" element={
            <ProtectedRoute>
              <ReportDetails />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            user ? (
              user.role === 'user' ? <Navigate to="/user-dashboard" replace /> :
              user.role === 'maintainer' ? <Navigate to="/maintainer-dashboard" replace /> :
              user.role === 'field_head' ? <Navigate to="/fieldhead-dashboard" replace /> :
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
