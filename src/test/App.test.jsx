import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the components
vi.mock('../components/LoginForm', () => ({
  default: ({ toggleForm }) => <div data-testid="login-form">Login Form</div>
}));

vi.mock('../components/RegistrationPage', () => ({
  default: ({ toggleForm }) => <div data-testid="registration-page">Registration Page</div>
}));

vi.mock('../components/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>
}));

vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container">Toast Container</div>,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  it('renders App container div', () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });

  it('always renders ToastContainer', () => {
    render(<App />);
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });
});
