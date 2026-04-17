import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { showToast } from './Toast.jsx';
import { mediaUrl } from '../config.js';
import api from '../api.js';
import '../styles/postCard.css';

const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

export default function PostCard({ post, onDelete, currentUserId }) {
  const [liked, setLiked]             = useState(post.liked);
  const [likes, setLikes]             = useState(post.likes);
  const [saved, setSaved]             = useState(post.saved);
  const [showComments, setShowCom]    = useState(false);
  const [comments, setComments]       = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingCom, setLoadingCom]   = useState(false);
  const [imgOpen, setImgOpen]         = useState(false);

  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${post.id}/like`);
      setLiked(res.data.liked);
      setLikes(res.data.count);
    } catch { showToast('Error al dar like'); }
  };

  const handleSave = async () => {
    try {
      const res = await api.post(`/posts/${post.id}/save`);
      setSaved(res.data.saved);
      showToast(res.data.saved ? '🔖 Guardado' : 'Removido de guardados');
    } catch { showToast('Error al guardar'); }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingCom(true);
      try {
        const res = await api.get(`/posts/${post.id}/comments`);
        setComments(res.data);
      } catch { showToast('Error cargando comentarios'); }
      finally { setLoadingCom(false); }
    }
    setShowCom(!showComments);
  };

  const handleComment = async (e) => {
    if (e.key && e.key !== 'Enter') return;
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/posts/${post.id}/comments`, { text: commentText });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
    } catch { showToast('Error al comentar'); }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.origin + `/profile/${post.author?.handle}`);
    showToast('🔗 Enlace copiado');
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este post?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      onDelete?.(post.id);
      showToast('Post eliminado');
    } catch { showToast('Error al eliminar'); }
  };

  const totalComments = post.comments_count + Math.max(0, comments.length - post.comments_count);

  return (
    <>
      <div className="post-card">
        <div className="post-header">
          <Link to={`/profile/${post.author?.handle}`}>
            <Avatar name={post.author?.name} src={mediaUrl(post.author?.avatar)} size={42} />
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <Link to={`/profile/${post.author?.handle}`} className="post-author-name">
                  {post.author?.name}
                </Link>
                <span className="badge">✓</span>
              </div>
              {currentUserId === post.user_id && (
                <button className="post-menu-btn" onClick={handleDelete} title="Eliminar">⋯</button>
              )}
            </div>
            <div className="post-meta">@{post.author?.handle} · {timeAgo(post.created_at)}</div>
          </div>
        </div>

        {post.text && <div className="post-body">{post.text}</div>}

        {post.image && (
          <img
            src={mediaUrl(post.image)}
            alt="post"
            className="post-image"
            onClick={() => setImgOpen(true)}
          />
        )}

        <div className="post-actions">
          <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
            <span className="action-icon">{liked ? '❤️' : '🤍'}</span> {likes}
          </button>
          <button className="action-btn" onClick={toggleComments}>
            <span className="action-icon">💬</span> {totalComments}
          </button>
          <button className="action-btn" onClick={handleShare}>
            <span className="action-icon">🔄</span> Compartir
          </button>
          <button className={`action-btn ${saved ? 'liked' : ''}`} onClick={handleSave}>
            <span className="action-icon">{saved ? '🔖' : '📄'}</span>
          </button>
        </div>

        {showComments && (
          <div className="comments-section">
            {loadingCom && <p style={{ textAlign:'center', color:'var(--muted)', fontSize:13 }}>Cargando...</p>}
            {comments.map((c) => (
              <div key={c.id} className="comment-item">
                <Avatar name={c.author_name} src={mediaUrl(c.author_avatar)} size={28} fontSize={10} />
                <div className="comment-bubble">
                  <strong>{c.author_name}</strong>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}
            <div className="comment-input-row">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleComment}
                placeholder="Escribe un comentario..."
              />
              <button className="send-btn" onClick={handleComment}>↑</button>
            </div>
          </div>
        )}
      </div>

      {imgOpen && post.image && (
        <div className="lightbox-overlay" onClick={() => setImgOpen(false)}>
          <img src={mediaUrl(post.image)} alt="post" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
          <button className="lightbox-close" onClick={() => setImgOpen(false)}>✕</button>
        </div>
      )}
    </>
  );
}
