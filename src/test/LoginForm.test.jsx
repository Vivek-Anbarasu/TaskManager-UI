import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/LoginForm';
import { toast } from 'react-toastify';
import axios from 'axios';

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

vi.mock('axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form with all elements', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\? register now/i)).toBeInTheDocument();
  });

  it('updates email input value when user types', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email Address');
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('updates password input value when user types', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'password123');
    
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows error toast when email is empty on submit', async () => {
    render(<LoginForm />);
    
    const form = screen.getByRole('button', { name: /log in/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fill out all required fields.');
    });
  });

  it('shows error toast when password is empty on submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email Address');
    await user.type(emailInput, 'test@example.com');
    
    const form = screen.getByRole('button', { name: /log in/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fill out all required fields.');
    });
  });

  it('successfully logs in with valid credentials', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: 'John Doe',
      headers: {
        authorization: 'Bearer test-token-123'
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/user/authenticate',
        { email: 'test@example.com', password: 'password123' }
      );
      expect(localStorage.getItem('accessToken')).toBe('test-token-123');
      expect(localStorage.getItem('name')).toBe('John Doe');
      expect(toast.success).toHaveBeenCalledWith('Successfully Logged In');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('clears form fields after successful login', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: 'John Doe',
      headers: {
        authorization: 'Bearer test-token-123'
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });
  });

  it('shows error toast when login fails with invalid credentials', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValueOnce(new Error('Unauthorized'));
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid Credentials');
    });
  });

  it('clears form fields even after failed login', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValueOnce(new Error('Unauthorized'));
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });
  });

  it('navigates to register page when clicking registration link', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const registerLink = screen.getByText(/don't have an account\? register now/i);
    await user.click(registerLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('handles missing authorization header gracefully', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: 'John Doe',
      headers: {}
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Authorization header not found or not in Bearer format.');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  it('handles authorization header without Bearer prefix', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: 'John Doe',
      headers: {
        authorization: 'InvalidFormat token-123'
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Authorization header not found or not in Bearer format.');
    });
    
    consoleSpy.mockRestore();
  });

  it('prevents default form submission', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: 'John Doe',
      headers: {
        authorization: 'Bearer test-token-123'
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const form = screen.getByRole('button', { name: /log in/i }).closest('form');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const submitSpy = vi.fn((e) => e.preventDefault());
    form.addEventListener('submit', submitSpy);
    
    fireEvent.submit(form);
    
    expect(submitSpy).toHaveBeenCalled();
  });

  it('has correct input placeholders', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('email input has correct type attribute', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email Address');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('password input has correct type attribute', () => {
    render(<LoginForm />);
    
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
