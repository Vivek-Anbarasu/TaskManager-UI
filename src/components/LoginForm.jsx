import  { useState } from 'react';
import '../css/LoginForm.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_CONFIG from '../config/api';

const LoginForm = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error('Please fill out all required fields.');
      return;
    }

try {
      const response = await axios.post(`${API_CONFIG.USER_BASE()}/authenticate`, { email: email, password: password });
      const authorizationHeader = response.headers['authorization'];
      console.log(response);
      console.log(response.headers);
      if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        const token = authorizationHeader.substring(7); // Extract the token after 'Bearer '
        console.log('Received Bearer Token:', token);

        localStorage.setItem('accessToken', token);
        localStorage.setItem('name', response.data);
        toast.success("Successfully Logged In");
        navigate('/dashboard');
      
      } else {
        console.error('Authorization header not found or not in Bearer format.');
      }

    } catch (error) {
      console.log(error);
      toast.error("Invalid Credentials");
    }
    
    // Reset form fields
    setEmail('');
    setPassword('');
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
        
     

        <button type="submit" className="login-button">
          Log In
        </button>

        <div className="footer-link">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Don't have an account? Register Now</a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;