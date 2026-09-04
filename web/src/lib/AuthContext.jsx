import { createContext, useContext, useEffect, useState } from 'react';
import { USE_MOCK } from './config';
import { n8nVerifyPassword } from './n8nApi';

const AuthContext = createContext(null);

const STORAGE_KEY = 're_token';

// In mock mode we act as an already-signed-in owner so you can develop without
// an n8n instance running.
const MOCK_USER = {
  id: 'mock-owner',
  email: 'owner@example.com',
  role: 'owner',
  name: 'Owner',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }
    // Check if there's already a valid token in localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUser({ id: 'owner', email: 'owner', role: 'owner', name: 'Owner' });
    }
    setLoading(false);
  }, []);

  async function login(_email, password) {
    if (USE_MOCK) {
      setUser(MOCK_USER);
      return;
    }
    
    // Verify password locally against the VITE_N8N_API_TOKEN environment variable
    const validPassword = import.meta.env.VITE_N8N_API_TOKEN || 'demo123';
    if (password !== validPassword) {
      throw new Error('Incorrect password');
    }
    
    // Store a session token
    localStorage.setItem(STORAGE_KEY, password);
    setUser({ id: 'owner', email: 'owner', role: 'owner', name: 'Owner' });
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}