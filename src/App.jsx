import LoginForm from './components/LoginForm';
import './css/App.css'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationPage from './components/RegistrationPage';
import Dashboard from './components/Dashboard';
import { useState } from "react";


export const App = () => {

  const [currentForm, setCurrentForm] = useState('login');

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  }

  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm toggleForm={toggleForm} />} />
        <Route path="/register" element={<RegistrationPage toggleForm={toggleForm} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add a default route or homepage */}
        <Route path="/" element={<LoginForm toggleForm={toggleForm} />} />
      </Routes>
    </Router>
      <ToastContainer /> 
    </div>
  );
}

export default App;