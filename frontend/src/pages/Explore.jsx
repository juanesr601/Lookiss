import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import RightPanel from '../components/RightPanel.jsx';
import PostCard from '../components/PostCard.jsx';
import Avatar from '../components/Avatar.jsx';
import { showToast } from '../components/Toast.jsx';
import { mediaUrl } from '../config.js';
import { useAuthStore } from '../store/authStore.js';
import api from '../api.js';
import '../styles/explore.css';

export default function Explore() {
  const { user } = useAuthStore();
  const [tab, setTab]       = useState('posts');
  const [posts, setPosts]   = useState([]);
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/posts/explore'), api.get('/users/suggestions/all')])
      .then(([pr,ur]) => { setPosts(pr.data); setUsers(ur.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) return;
    const t = setTimeout(() => { api.get(`/users/search/${search}`).then((r)=>setUsers(r.data)); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleFollow = async (u, i) => {
    try {
      await api.post(`/users/${u.id}/follow`);
      setUsers((prev) => prev.map((x,idx) => idx===i ? {...x, isFollowing:!x.isFollowing} : x));
    } catch { showToast('Error al seguir'); }
  };
  const handleDelete = (id) => setPosts((prev) => prev.filter((p)=>p.id!==id));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <div className="feed-column">
          <div className="card" style={{padding:'14px 16px 0'}}>
            <div className="explore-search-bar">
              <span className="explore-search-icon">🔍</span>
              <input className="explore-search-input" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar personas, hashtags..." />
            </div>
            <div className="explore-tabs">
              {[['posts','Publicaciones'],['people','Personas']].map(([val,label]) => (
                <button key={val} className={`explore-tab ${tab===val?'active':''}`} onClick={()=>setTab(val)}>{label}</button>
              ))}
            </div>
          </div>
          {loading ? <div className="feed-loading">Cargando...</div>
          : tab==='posts'
            ? posts.map((p) => <PostCard key={p.id} post={p} currentUserId={user?.id} onDelete={handleDelete} />)
            : <div className="card"><div className="explore-people-list">
                {users.length===0 ? <p className="explore-empty">No se encontraron usuarios</p>
                : users.map((u,i) => (
                  <div key={u.id} className="explore-person-row">
                    <Link to={`/profile/${u.handle}`}><Avatar name={u.name} src={mediaUrl(u.avatar)} size={44} /></Link>
                    <div className="explore-person-info">
                      <Link to={`/profile/${u.handle}`} className="explore-person-name">{u.name}</Link>
                      <span className="explore-person-meta">@{u.handle} · {u.followers} seguidores</span>
                    </div>
                    {u.id!==user?.id && (
                      <button className={`btn-follow ${u.isFollowing?'following':''}`} onClick={()=>handleFollow(u,i)}>
                        {u.isFollowing?'Siguiendo':'Seguir'}
                      </button>
                    )}
                  </div>
                ))}
              </div></div>
          }
        </div>
        <RightPanel />
      </div>
    </div>
  );
}
