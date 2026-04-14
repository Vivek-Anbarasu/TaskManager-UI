import LoginForm from './components/LoginForm';
import './css/App.css'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationPage from './components/RegistrationPage';
import Dashboard from './components/Dashboard';

export const App = () => {

  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add a default route or homepage */}
        <Route path="/" element={<LoginForm />} />
      </Routes>
    </Router>
      <ToastContainer /> 
    </div>
  );
}

export default App;