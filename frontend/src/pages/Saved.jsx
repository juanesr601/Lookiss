import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import RightPanel from '../components/RightPanel.jsx';
import PostCard from '../components/PostCard.jsx';
import { useAuthStore } from '../store/authStore.js';
import api from '../api.js';

export default function Saved() {
  const { user } = useAuthStore();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/saved/mine').then((r) => setPosts(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <div className="feed-column">
          <div style={{ marginBottom:14 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text)' }}>
              🔖 Posts guardados
            </h2>
          </div>

          {loading ? (
            <div className="feed-loading">Cargando...</div>
          ) : posts.length === 0 ? (
            <div className="card feed-empty">
              <p className="feed-empty-icon">🔖</p>
              <p className="feed-empty-title">Sin posts guardados</p>
              <p className="feed-empty-sub">Toca el ícono de guardar en cualquier publicación</p>
            </div>
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} currentUserId={user?.id} onDelete={handleDelete} />)
          )}
        </div>
        <RightPanel />
      </div>
    </div>
  );
}
