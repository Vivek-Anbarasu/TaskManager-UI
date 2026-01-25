
import { useState } from 'react';
import '../css/RegistrationPage.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../config/api';

const RegistrationPage = () => {
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState('ADMIN');

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Too short', color: '#e0e0e0' };
    let score = 0;
    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 10;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[!@#$%^&*]/.test(pwd)) score += 20;
    if (score > 100) score = 100;
    let label = 'Weak';
    let color = '#d9534f';
    if (score >= 70) { label = 'Strong'; color = '#28a745'; }
    else if (score >= 40) { label = 'Medium'; color = '#f0ad4e'; }
    return { score, label, color };
  };

  const registerApplication = async (e) => {

    e.preventDefault();

    if (!firstname || !lastname || !email || !password || !country) {
      toast.error('Please fill out all required fields.');
      return;
    }

    try {
      console.log("Sending registration request");
      const response = await axios.post(`${API_CONFIG.USER_BASE()}/new-registration`, {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        country: country,
        roles: role
      });

      if (response && response.data === 'User Succesfully Registered') {
        toast.success(response.data);
        navigate('/login');
      } else {
        const msg = (response && response.data) ? response.data : 'Registration failed';
        toast.error(msg);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

 

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={(registerApplication)}>
        <h2 className="register-title">Create Account</h2>

        <label htmlFor="firstname" className="register-label">First Name</label>
        <input
          className="register-input"
          type="text"
          placeholder="Enter your first name"
          required
          id="firstname"
          name="firstname"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          autoComplete="given-name"
        />

        <label htmlFor="lastname" className="register-label">Last Name</label>
        <input
          className="register-input"
          type="text"
          placeholder="Enter your last name"
          required
          id="lastname"
          name="lastname"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          autoComplete="family-name"
        />

        <label htmlFor="email" className="register-label">Email</label>
        <input
          className="register-input"
          type="email"
          placeholder="you@example.com"
          required
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
        />

        <label htmlFor="password" className="register-label">Password</label>
        <input
          className="register-input"
          type="password"
          placeholder="********"
          id="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
       

        {/* Password strength meter */}
        {(() => {
          const { score, label, color } = calculatePasswordStrength(password);
          return (
            <div className="pw-meter">
              <div className="pw-meter-bar">
                <div className="pw-meter-fill" style={{ width: `${score}%`, background: color }} />
              </div>
              <div className="pw-meter-label" style={{ color }}>{label}</div>
            </div>
          );
        })()}

        <label htmlFor="country" className="register-label">Country</label>
        <select
          className="register-input"
          required
          id="country"
          name="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">Select your country</option>
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="India">India</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="role" className="register-label">Role</label>
        <select
          className="register-input"
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>


        <button type="submit" className="register-button">Register</button>

        <div className="footer-link">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Already have an account? Login here.</a>
        </div>
      </form>
    </div>
  );
};

export default RegistrationPage;
