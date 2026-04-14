import { useState, useTransition } from 'react';
import '../css/LoginForm.css';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { USER_BASE } from '../config/api';
import { scheduleRefresh } from '../config/tokenManager';

const LoginForm = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill out all required fields.');
      return;
    }
    startTransition(async () => {
      try {
        const response = await axios.post(`${USER_BASE()}/authenticate`, { email, password });
        const authorizationHeader = response.headers['authorization'];
        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
          const token = authorizationHeader.substring(7);
          localStorage.setItem('accessToken', token);
          localStorage.setItem('name', response.data);
          scheduleRefresh(token);
          toast.success("Successfully Logged In");
          navigate('/dashboard');
        }
      } catch {
        toast.error("Invalid Credentials");
      }
      setEmail('');
      setPassword('');
    });
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Task Manager</h2>
        
        <div className="input-group">
          <label htmlFor="email" className="login-label">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
            placeholder="you@example.com"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="password" className="login-label">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
            placeholder="••••••••"
          />
        </div>
        
     

        <button type="submit" className="login-button" disabled={isPending}>
          {isPending ? 'Logging in…' : 'Log In'}
        </button>

        <div className="footer-link">
          <Link to="/register">Don't have an account? Register Now</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;