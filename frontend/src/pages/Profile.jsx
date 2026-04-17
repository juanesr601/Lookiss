import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import RightPanel from '../components/RightPanel.jsx';
import PostCard from '../components/PostCard.jsx';
import Avatar from '../components/Avatar.jsx';
import { showToast } from '../components/Toast.jsx';
import { mediaUrl } from '../config.js';
import { useAuthStore } from '../store/authStore.js';
import api from '../api.js';
import '../styles/profile.css';

export default function Profile() {
  const { handle } = useParams();
  const { user: me, setUser } = useAuthStore();
  const [profile, setProfile]   = useState(null);
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name:'', bio:'', location:'' });
  const [savingAvatar, setSavingAvatar] = useState(false);
  const avatarRef = useRef();
  const isMe = me?.handle === handle;

  useEffect(() => {
    setLoading(true); setEditMode(false);
    Promise.all([api.get(`/users/${handle}`), api.get(`/posts/user/${handle}`)])
      .then(([ur,pr]) => {
        setProfile(ur.data); setPosts(pr.data);
        setEditForm({ name:ur.data.name, bio:ur.data.bio||'', location:ur.data.location||'' });
      })
      .catch(() => showToast('Error cargando perfil'))
      .finally(() => setLoading(false));
  }, [handle]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/users/${profile.id}/follow`);
      setProfile((p) => ({...p, isFollowing:res.data.following, followers:p.followers+(res.data.following?1:-1)}));
    } catch { showToast('Error al seguir'); }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await api.put('/users/me', editForm);
      setProfile(res.data); setUser(res.data); setEditMode(false);
      showToast('✅ Perfil actualizado');
    } catch { showToast('Error al guardar'); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]; if(!file) return;
    setSavingAvatar(true);
    try {
      const form = new FormData(); form.append('avatar', file);
      const res = await api.post('/upload/avatar', form, { headers:{'Content-Type':undefined} });
      setProfile((p) => ({...p, avatar:res.data.url}));
      setUser({...me, avatar:res.data.url});
      showToast('🖼️ Foto de perfil actualizada');
    } catch { showToast('Error al subir la foto'); }
    finally { setSavingAvatar(false); }
  };

  const handleDelete = (id) => setPosts((prev) => prev.filter((p)=>p.id!==id));

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-area"><div style={{flex:1,textAlign:'center',padding:60,color:'var(--muted)'}}>Cargando perfil...</div></div></div>;
  if (!profile) return <div className="app-layout"><Sidebar /><div className="main-area"><div style={{flex:1,textAlign:'center',padding:60}}>Usuario no encontrado</div></div></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <div className="feed-column">
          <div className="card">
            <div className="profile-banner" />
            <div className="profile-body">
              <div className="profile-top-row">
                <div className="profile-avatar-wrapper">
                  <div className="profile-avatar-border">
                    <Avatar name={profile.name} src={mediaUrl(profile.avatar)} size={80} fontSize={28} />
                  </div>
                  {isMe && (
                    <>
                      <button className="profile-avatar-cam-btn" onClick={()=>avatarRef.current?.click()} title="Cambiar foto">
                        {savingAvatar ? '⏳' : '📷'}
                      </button>
                      <input ref={avatarRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarChange} />
                    </>
                  )}
                </div>
                {!isMe
                  ? <button className={`btn-follow ${profile.isFollowing?'following':''}`} style={{padding:'8px 22px',fontSize:14}} onClick={handleFollow}>{profile.isFollowing?'Siguiendo':'Seguir'}</button>
                  : <button className="btn-outline" onClick={()=>setEditMode(!editMode)}>{editMode?'Cancelar':'Editar perfil'}</button>
                }
              </div>
              {editMode ? (
                <div className="profile-edit-form">
                  {[['name','Nombre','Tu nombre'],['bio','Bio','Cuéntanos algo sobre ti'],['location','Ubicación','Ciudad, País']].map(([key,label,ph])=>(
                    <div key={key}>
                      <label>{label}</label>
                      <input className="input-field" value={editForm[key]} placeholder={ph} onChange={(e)=>setEditForm({...editForm,[key]:e.target.value})} />
                    </div>
                  ))}
                  <button className="btn-primary profile-edit-save" onClick={handleSaveEdit}>Guardar cambios</button>
                </div>
              ) : (
                <>
                  <h2 className="profile-name">{profile.name}</h2>
                  <p className="profile-handle">@{profile.handle}{profile.location?` · 📍 ${profile.location}`:''}</p>
                  {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                </>
              )}
              {!editMode && (
                <div className="profile-stats">
                  {[['Posts',profile.posts_count],['Seguidores',profile.followers],['Siguiendo',profile.following]].map(([label,val])=>(
                    <div key={label} className="profile-stat"><strong>{val}</strong><span>{label}</span></div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {posts.length===0
            ? <div className="card profile-empty"><p className="profile-empty-icon">📝</p><p>Sin publicaciones aún</p></div>
            : posts.map((p)=><PostCard key={p.id} post={p} currentUserId={me?.id} onDelete={handleDelete} />)
          }
        </div>
        <RightPanel />
      </div>
    </div>
  );
}
