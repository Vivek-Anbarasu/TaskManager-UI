import { useState, useCallback, useEffect } from 'react';
import { cancelRefreshTimer } from '../config/tokenManager';

export function useAuth(navigate) {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setUserName(localStorage.getItem('name') ?? '');
  }, []);

  const authHeader = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const handleLogout = useCallback(() => {
    cancelRefreshTimer();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    navigate('/login');
  }, [navigate]);

  return { userName, authHeader, handleLogout };
}
