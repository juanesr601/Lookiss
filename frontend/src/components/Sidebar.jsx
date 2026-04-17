import { NavLink, useNavigate } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { useAuthStore } from '../store/authStore.js';
import { mediaUrl } from '../config.js';
import '../styles/sidebar.css';

const NAV = [
  { to: '/',              icon: '🏠', label: 'Inicio',         end: true },
  { to: '/explore',       icon: '🔍', label: 'Explorar' },
  { to: '/notifications', icon: '🔔', label: 'Notificaciones' },
  { to: '/messages',      icon: '💬', label: 'Mensajes' },
  { to: '/saved',         icon: '🔖', label: 'Guardados' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><h1>look<span>iss</span></h1></div>
      <nav className="sidebar-nav">
        {NAV.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{icon}</span><span>{label}</span>
          </NavLink>
        ))}
        <NavLink to={`/profile/${user?.handle}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">👤</span><span>Perfil</span>
        </NavLink>
      </nav>
      <div className="sidebar-user-card" onClick={handleLogout} title="Cerrar sesión">
        <Avatar name={user?.name} src={mediaUrl(user?.avatar)} size={36} fontSize={13} />
        <div className="user-info">
          <p>{user?.name}</p>
          <span>@{user?.handle} · Salir</span>
        </div>
      </div>
    </aside>
  );
}
