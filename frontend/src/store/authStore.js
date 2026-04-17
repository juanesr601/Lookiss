import { create } from 'zustand';
import api from '../api.js';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('lookiss_token'),
  loading: true,

  init: async () => {
    const token = localStorage.getItem('lookiss_token');
    if (!token) return set({ loading: false });
    try {
      const res = await api.get('/users/me');
      set({ user: res.data, token, loading: false });
    } catch {
      localStorage.removeItem('lookiss_token');
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('lookiss_token', res.data.token);
    set({ user: res.data.user, token: res.data.token });
    return res.data;
  },

  register: async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('lookiss_token', res.data.token);
    set({ user: res.data.user, token: res.data.token });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('lookiss_token');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));
