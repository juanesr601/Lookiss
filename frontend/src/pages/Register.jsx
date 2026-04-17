import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import '../styles/auth.css';

const FIELDS = [
  { key: 'name',     label: 'Nombre completo',   type: 'text',     placeholder: 'Tu nombre' },
  { key: 'handle',   label: 'Usuario (@handle)',  type: 'text',     placeholder: 'sin espacios, ej: mariag' },
  { key: 'email',    label: 'Email',              type: 'email',    placeholder: 'tu@email.com' },
  { key: 'password', label: 'Contraseña',         type: 'password', placeholder: 'Mínimo 6 caracteres' },
];

export default function Register() {
  const [form, setForm]     = useState({ name:'', handle:'', email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate     = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.handle || !form.email || !form.password)
      return setError('Completa todos los campos');
    if (form.password.length < 6)
      return setError('La contraseña debe tener al menos 6 caracteres');
    if (!/^[a-z0-9_]+$/i.test(form.handle))
      return setError('El handle solo puede tener letras, números y _');
    setLoading(true);
    try {
      await register({ ...form, handle: form.handle.toLowerCase() });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">look<span>iss</span></div>
        <p className="auth-subtitle">Crea tu cuenta y únete 💗</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-form">
          {FIELDS.map(({ key, label, type, placeholder }) => (
            <div key={key} className="auth-field">
              <label>{label}</label>
              <input
                className="input-field"
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          ))}

          <button
            className="btn-primary auth-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </div>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
