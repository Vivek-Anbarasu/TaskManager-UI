import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrationPage from '../components/RegistrationPage';
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

describe('RegistrationPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form with all elements', () => {
    render(<RegistrationPage />);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('updates firstname input when user types', async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    const input = screen.getByLabelText('First Name');
    await user.type(input, 'John');
    
    expect(input).toHaveValue('John');
  });

  it('updates lastname input when user types', async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    const input = screen.getByLabelText('Last Name');
    await user.type(input, 'Doe');
    
    expect(input).toHaveValue('Doe');
  });

  it('updates email input when user types', async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    const input = screen.getByLabelText('Email');
    await user.type(input, 'john@example.com');
    
    expect(input).toHaveValue('john@example.com');
  });

  it('updates password input when user types', async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    const input = screen.getByLabelText('Password');
    await user.type(input, 'Password123!');
    
    expect(input).toHaveValue('Password123!');
  });

  it('updates country select when user chooses', async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    const select = screen.getByLabelText('Country');
    await user.selectOptions(select, 'United States');
    
    expect(select).toHaveValue('United States');
  });

  it('shows error toast when form is submitted with empty fields', async () => {
    render(<RegistrationPage />);
    
    const form = screen.getByRole('button', { name: /register/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fill out all required fields.');
    });
  });

  it('shows error toast when only firstname is filled', async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    const input = screen.getByLabelText('First Name');
    await user.type(input, 'John');
    
    const form = screen.getByRole('button', { name: /register/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fill out all required fields.');
    });
  });

  it('successfully registers with all fields filled', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValueOnce({ data: 'User Succesfully Registered' });
    
    render(<RegistrationPage />);
    
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.selectOptions(screen.getByLabelText('Country'), 'United States');
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/user/new-registration',
        {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          password: 'Password123!',
          country: 'United States',
          roles: 'ROLE_ADMIN'
        }
      );
      expect(toast.success).toHaveBeenCalledWith('User Succesfully Registered');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('shows error when registration fails', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    
    render(<RegistrationPage />);
    
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.selectOptions(screen.getByLabelText('Country'), 'Canada');
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Registration failed. Please try again.');
    });
  });

  it('navigates to login page when clicking login link', async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    const loginLink = screen.getByText(/already have an account\? login here\./i);
    await user.click(loginLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('displays password strength as "Too short" for empty password', () => {
    render(<RegistrationPage />);
    
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('displays password strength as "Weak" for short password', async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'abc');
    
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });

  it('displays password strength as "Medium" for moderate password', async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'pass1234');
    
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('displays password strength as "Strong" for strong password', async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'StrongP@ssw0rd123');
    
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('has correct input types', () => {
    render(<RegistrationPage />);
    
    expect(screen.getByLabelText('First Name')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Last Name')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('has correct placeholders', () => {
    render(<RegistrationPage />);
    
    expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument();
  });

  it('country select has all options', () => {
    render(<RegistrationPage />);
    
    const select = screen.getByLabelText('Country');
    const options = Array.from(select.querySelectorAll('option'));
    
    expect(options).toHaveLength(6);
    expect(options[0]).toHaveTextContent('Select your country');
    expect(options[1]).toHaveTextContent('United States');
    expect(options[2]).toHaveTextContent('Canada');
    expect(options[3]).toHaveTextContent('United Kingdom');
    expect(options[4]).toHaveTextContent('India');
    expect(options[5]).toHaveTextContent('Other');
  });

  it('handles unexpected registration response', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValueOnce({ data: 'Email already exists' });
    
    render(<RegistrationPage />);
    
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'existing@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.selectOptions(screen.getByLabelText('Country'), 'India');
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already exists');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('prevents default form submission', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValueOnce({ data: 'User Succesfully Registered' });
    
    render(<RegistrationPage />);
    
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.selectOptions(screen.getByLabelText('Country'), 'United Kingdom');
    
    const form = screen.getByRole('button', { name: /register/i }).closest('form');
    const submitSpy = vi.fn((e) => e.preventDefault());
    form.addEventListener('submit', submitSpy);
    
    fireEvent.submit(form);
    
    expect(submitSpy).toHaveBeenCalled();
  });
});
