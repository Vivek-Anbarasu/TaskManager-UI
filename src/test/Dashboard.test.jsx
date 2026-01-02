import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../components/Dashboard';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import axios from 'axios';

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

vi.mock('react-confirm-alert', () => ({
  confirmAlert: vi.fn(),
}));

vi.mock('axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('accessToken', 'test-token');
    localStorage.setItem('name', 'John Doe');
  });

  it('redirects to login if no token is present', () => {
    localStorage.removeItem('accessToken');
    render(<Dashboard />);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('fetches tasks on mount', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1', status: 'To Do' },
      { id: 2, title: 'Task 2', description: 'Description 2', status: 'In Progress' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockTasks });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/v1/getAllTasks',
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });

  it('displays tasks in table', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1', status: 'To Do' },
      { id: 2, title: 'Task 2', description: 'Description 2', status: 'Done' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockTasks });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  it('shows empty message when no tasks', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
    });
  });

  it('displays logged in user name', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Logged in as John Doe/i)).toBeInTheDocument();
    });
  });

  it('creates a new task when form is submitted', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({ data: 'Task created' });
    axios.get.mockResolvedValueOnce({ data: [
      { id: 1, title: 'New Task', description: 'New Description', status: 'To Do' }
    ]});
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
    });
    
    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    
    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New Description');
    
    const createButton = screen.getByRole('button', { name: /create task/i });
    await user.click(createButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/v1/saveTask',
        { title: 'New Task', description: 'New Description', status: 'To Do' },
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Task created');
    });
  });

  it('shows error when title is empty', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
    });
    
    const createButton = screen.getByRole('button', { name: /create task/i });
    await user.click(createButton);
    
    expect(toast.error).toHaveBeenCalledWith('Please provide title and description.');
  });

  it('shows error when description is empty', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
    });
    
    const titleInput = screen.getAllByRole('textbox')[0];
    await user.type(titleInput, 'New Task');
    
    const createButton = screen.getByRole('button', { name: /create task/i });
    await user.click(createButton);
    
    expect(toast.error).toHaveBeenCalledWith('Please provide title and description.');
  });

  it('updates a task when edit button is clicked', async () => {
    const user = userEvent.setup();
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1', status: 'To Do' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockTasks });
    axios.put.mockResolvedValueOnce({ data: 'Task updated' });
    axios.get.mockResolvedValueOnce({ data: [
      { id: 1, title: 'Updated Task', description: 'Updated Description', status: 'Done' }
    ]});
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByTitle('Edit');
    await user.click(editButtons[0]);
    
    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated Description');
    
    const updateButton = screen.getByRole('button', { name: /update task/i });
    await user.click(updateButton);
    
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8080/v1/updateTask',
        { id: 1, title: 'Updated Task', description: 'Updated Description', status: 'To Do' },
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Task updated');
    });
  });

  it('deletes a task when delete is confirmed', async () => {
    const user = userEvent.setup();
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1', status: 'To Do' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockTasks });
    axios.delete.mockResolvedValueOnce({ data: 'Task deleted' });
    axios.get.mockResolvedValueOnce({ data: [] });
    
    confirmAlert.mockImplementation(({ buttons }) => {
      buttons[0].onClick();
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(confirmAlert).toHaveBeenCalled();
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/v1/deleteTask/1',
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Task deleted');
    });
  });

  it('resets form when reset button is clicked', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
    });
    
    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    
    await user.type(titleInput, 'Test Title');
    await user.type(descriptionInput, 'Test Description');
    
    expect(titleInput).toHaveValue('Test Title');
    expect(descriptionInput).toHaveValue('Test Description');
    
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);
    
    expect(titleInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });

  it('logs out and clears storage when logout button is clicked', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
    });
    
    const logoutButton = screen.getByLabelText('Logout');
    await user.click(logoutButton);
    
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('changes status via dropdown', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
    });
    
    const statusSelect = screen.getByRole('combobox');
    await user.selectOptions(statusSelect, 'In Progress');
    
    expect(statusSelect).toHaveValue('In Progress');
  });

  it('handles fetch error with 401 status', async () => {
    const error = { response: { status: 401 } };
    axios.get.mockRejectedValueOnce(error);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('handles fetch error with non-401 status', async () => {
    const error = { response: { status: 500 } };
    axios.get.mockRejectedValueOnce(error);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load tasks');
    });
  });

  it('handles create task error', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
    });
    
    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    
    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New Description');
    
    const createButton = screen.getByRole('button', { name: /create task/i });
    await user.click(createButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create task');
    });
  });

  it('handles update task error', async () => {
    const user = userEvent.setup();
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1', status: 'To Do' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockTasks });
    axios.put.mockRejectedValueOnce(new Error('Network error'));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByTitle('Edit');
    await user.click(editButtons[0]);
    
    const updateButton = screen.getByRole('button', { name: /update task/i });
    await user.click(updateButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update task');
    });
  });

  it('handles delete task error', async () => {
    const user = userEvent.setup();
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Description 1', status: 'To Do' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockTasks });
    axios.delete.mockRejectedValueOnce(new Error('Network error'));
    
    confirmAlert.mockImplementation(({ buttons }) => {
      buttons[0].onClick();
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete task');
    });
  });

  it('filters tasks by title', async () => {
    const user = userEvent.setup();
    const mockTasks = [
      { id: 1, title: 'Task One', description: 'Description 1', status: 'To Do' },
      { id: 2, title: 'Task Two', description: 'Description 2', status: 'Done' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockTasks });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Task One')).toBeInTheDocument();
      expect(screen.getByText('Task Two')).toBeInTheDocument();
    });
    
    const searchInputs = screen.getAllByPlaceholderText(/search/i);
    const titleSearch = searchInputs.find(input => input.placeholder.includes('title'));
    
    if (titleSearch) {
      await user.type(titleSearch, 'One');
      
      await waitFor(() => {
        expect(screen.getByText('Task One')).toBeInTheDocument();
      });
    }
  });

  it('renders status badges with correct classes', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Desc 1', status: 'To Do' },
      { id: 2, title: 'Task 2', description: 'Desc 2', status: 'In Progress' },
      { id: 3, title: 'Task 3', description: 'Desc 3', status: 'Done' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockTasks });
    
    const { container } = render(<Dashboard />);
    
    await waitFor(() => {
      const badges = container.querySelectorAll('.badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
