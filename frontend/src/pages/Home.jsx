import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import RightPanel from '../components/RightPanel.jsx';
import PostCard from '../components/PostCard.jsx';
import Composer from '../components/Composer.jsx';
import Avatar from '../components/Avatar.jsx';
import { useAuthStore } from '../store/authStore.js';
import api from '../api.js';
import '../styles/home.css';

const STORIES = ['María G.','Diego M.','Valentina L.','Andrés T.','Sofía V.','Luis P.','Camila R.'];

export default function Home() {
  const { user } = useAuthStore();
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/feed')
      .then((r) => setPosts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePost   = (p) => setPosts((prev) => [p, ...prev]);
  const handleDelete = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <div className="feed-column">

          {/* Stories */}
          <div className="card">
            <div className="stories-row">
              {STORIES.map((name) => (
                <div key={name} className="story-item">
                  <div className="story-ring">
                    <Avatar name={name} size={50} fontSize={17} />
                  </div>
                  <span className="story-label">{name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Composer */}
          <Composer user={user} onPost={handlePost} />

          {/* Feed */}
          {loading ? (
            <div className="feed-loading">Cargando publicaciones...</div>
          ) : posts.length === 0 ? (
            <div className="card feed-empty">
              <p className="feed-empty-icon">👋</p>
              <p className="feed-empty-title">Tu feed está vacío</p>
              <p className="feed-empty-sub">Sigue a otras personas para ver sus publicaciones aquí</p>
            </div>
          ) : (
            posts.map((p) => (
              <PostCard key={p.id} post={p} currentUserId={user?.id} onDelete={handleDelete} />
            ))
          )}
        </div>
        <RightPanel />
      </div>
    </div>
  );
}
