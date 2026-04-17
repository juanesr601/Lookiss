import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import '../styles/auth.css';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate  = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) return setError('Completa todos los campos');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">look<span>iss</span></div>
        <p className="auth-subtitle">Bienvenido de vuelta ✨</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-form">
          {[
            { key: 'email',    label: 'Email',      type: 'email',    placeholder: 'tu@email.com' },
            { key: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, type, placeholder }) => (
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
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </div>

        <p className="auth-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
