import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { ToastContainer } from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import Profile from './pages/Profile.jsx';
import Notifications from './pages/Notifications.jsx';
import Messages from './pages/Messages.jsx';
import Saved from './pages/Saved.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuthStore();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--dark2)' }}>
          look<span style={{ color: 'var(--pink)' }}>iss</span>
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>Cargando...</p>
      </div>
    </div>
  );
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { token, loading } = useAuthStore();
  if (loading) return null;
  return !token ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { init } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
        <Route path="/profile/:handle" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
