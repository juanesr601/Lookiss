import { useState, useEffect } from 'react';
import '../styles/toast.css';

let toastFn = null;

export function showToast(msg) {
  if (toastFn) toastFn(msg);
}

export function ToastContainer() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    toastFn = (m) => {
      setMsg(m);
      setVisible(true);
      setTimeout(() => setVisible(false), 2500);
    };
  }, []);

  if (!visible) return null;
  return <div className="toast">{msg}</div>;
}
