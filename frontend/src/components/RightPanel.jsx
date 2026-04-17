import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { showToast } from './Toast.jsx';
import { mediaUrl } from '../config.js';
import api from '../api.js';
import '../styles/rightPanel.css';

const TRENDS = [
  { tag: '#DesarrolloWeb',  count: '2.4k posts' },
  { tag: '#Medellín',       count: '5.1k posts' },
  { tag: '#Diseño2026',     count: '1.8k posts' },
  { tag: '#RecetasFáciles', count: '3.7k posts' },
  { tag: '#MúsicaLatina',   count: '6.2k posts' },
];

export default function RightPanel() {
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => { api.get('/users/suggestions/all').then((r) => setSuggestions(r.data.slice(0,4))).catch(()=>{}); }, []);
  const handleFollow = async (u, i) => {
    try {
      await api.post(`/users/${u.id}/follow`);
      setSuggestions((prev) => prev.map((x,idx) => idx===i ? {...x, isFollowing: !x.isFollowing} : x));
    } catch { showToast('Error al seguir'); }
  };
  return (
    <aside className="right-column">
      {suggestions.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <p className="right-section-title">Sugerencias para ti</p>
          {suggestions.map((u,i) => (
            <div key={u.id} className="suggestion-item">
              <Link to={`/profile/${u.handle}`}><Avatar name={u.name} src={mediaUrl(u.avatar)} size={38} fontSize={13} /></Link>
              <div className="suggestion-info">
                <Link to={`/profile/${u.handle}`} className="suggestion-name">{u.name}</Link>
                <span className="suggestion-handle">@{u.handle}</span>
              </div>
              <button className={`btn-follow ${u.isFollowing?'following':''}`} onClick={() => handleFollow(u,i)}>
                {u.isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="card trends-card">
        <p className="right-section-title">Tendencias</p>
        {TRENDS.map((t) => (
          <div key={t.tag} className="trend-item">
            <p className="trend-category">Tendencia</p>
            <p className="trend-tag">{t.tag}</p>
            <p className="trend-count">{t.count}</p>
          </div>
        ))}
      </div>
      <p className="right-footer">© 2026 Lookiss · Hecho con 💗</p>
    </aside>
  );
}
