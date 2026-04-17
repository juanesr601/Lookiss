import { useState, useRef } from 'react';
import Avatar from './Avatar.jsx';
import { showToast } from './Toast.jsx';
import { mediaUrl } from '../config.js';
import api from '../api.js';
import '../styles/composer.css';

export default function Composer({ user, onPost }) {
  const [text, setText]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [preview, setPreview]     = useState(null);
  const [imageUrl, setImageUrl]   = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  // ── Subir imagen ─────────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      // Dejar que axios ponga el Content-Type con boundary correcto
      const res = await api.post('/upload/post-image', form, {
        headers: { 'Content-Type': undefined },
      });
      setImageUrl(res.data.url);
    } catch (err) {
      showToast('❌ Error al subir: ' + (err.response?.data?.error || err.message));
      setPreview(null);
      setImageUrl('');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setImageUrl('');
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Publicar post ────────────────────────────────────────────────────────────
  const handlePost = async () => {
    const trimmed = text.trim();
    if (!trimmed && !imageUrl) return;
    if (uploading) return showToast('Espera a que termine de subir la imagen');

    setLoading(true);
    try {
      // Enviar explícitamente como JSON con los campos correctos
      const payload = { text: trimmed, image: imageUrl };
      const res = await api.post('/posts', payload);
      onPost?.(res.data);
      setText('');
      removeImage();
      showToast('✨ Post publicado');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error desconocido';
      showToast('❌ ' + msg);
      console.error('[Composer] Error al publicar:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const canPost = (text.trim() || imageUrl) && !uploading && text.length <= 280;

  return (
    <div className="composer-card">
      {/* Fila avatar + textarea */}
      <div className="composer-top">
        <Avatar name={user?.name} src={mediaUrl(user?.avatar)} size={42} />
        <textarea
          className="composer-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`¿Qué estás pensando, ${user?.name?.split(' ')[0] ?? 'tú'}?`}
          rows={Math.max(2, text.split('\n').length)}
          onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') handlePost(); }}
        />
      </div>

      {/* Preview imagen */}
      {preview && (
        <div className="composer-preview">
          <img src={preview} alt="preview" />
          {uploading
            ? <div className="composer-preview-overlay"><span>⏳</span> Subiendo imagen...</div>
            : <button className="composer-remove-img" onClick={removeImage}>✕</button>
          }
        </div>
      )}

      {/* Barra de acciones */}
      <div className="composer-actions">
        <div className="composer-tools">
          <button className="composer-tool-btn" title="Subir foto" onClick={() => fileRef.current?.click()}>📷</button>
          {['🎬', '😊', '📍'].map((ic) => (
            <button key={ic} className="composer-tool-btn" onClick={() => showToast('Próximamente 🚀')}>{ic}</button>
          ))}
        </div>
        <div className="composer-right">
          {text.length > 0 && (
            <span className={`composer-char-count ${text.length > 280 ? 'over' : ''}`}>
              {text.length}/280
            </span>
          )}
          <button
            className="btn-primary"
            onClick={handlePost}
            disabled={!canPost || loading}
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* Input file oculto */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
