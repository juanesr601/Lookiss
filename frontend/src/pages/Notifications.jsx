import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import RightPanel from '../components/RightPanel.jsx';
import Avatar from '../components/Avatar.jsx';
import { mediaUrl } from '../config.js';
import api from '../api.js';
import '../styles/notifications.css';

const TYPE_LABELS = {
  like:    '❤️ dio like a tu publicación',
  comment: '💬 comentó tu publicación',
  follow:  '👤 empezó a seguirte',
};
const timeAgo = (ts) => {
  const s = Math.floor((Date.now()-ts)/1000);
  if(s<60) return 'ahora'; if(s<3600) return `${Math.floor(s/60)}m`;
  if(s<86400) return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}d`;
};

export default function Notifications() {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/notifications').then((r)=>setNotifs(r.data)).finally(()=>setLoading(false)); }, []);
  const markAll = async () => { await api.put('/notifications/read-all'); setNotifs((p)=>p.map((n)=>({...n,read:1}))); };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <div className="feed-column">
          <div className="card">
            <div className="notif-header">
              <h2 className="notif-title">Notificaciones</h2>
              <button className="notif-mark-btn" onClick={markAll}>Marcar todas como leídas</button>
            </div>
            {loading ? (
              <p style={{textAlign:'center',padding:32,color:'var(--muted)'}}>Cargando...</p>
            ) : notifs.length === 0 ? (
              <div className="notif-empty"><p className="notif-empty-icon">🔔</p><p>Sin notificaciones aún</p></div>
            ) : notifs.map((n) => (
              <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                <div className={`notif-dot ${n.read ? 'read' : 'unread'}`} />
                <Avatar name={n.from_name} src={mediaUrl(n.from_avatar)} size={38} fontSize={13} />
                <div className="notif-text">
                  <p><strong>{n.from_name}</strong> {TYPE_LABELS[n.type] || n.type}</p>
                  <span className="notif-time">{timeAgo(n.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <RightPanel />
      </div>
    </div>
  );
}
