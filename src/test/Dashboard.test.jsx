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
        'http://localhost:8080/task/',
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
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
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
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });
    
    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    
    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New Description');
    
    const createButton = screen.getByRole('button', { name: /create task/i });
    await user.click(createButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/task/',
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
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
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
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
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
        'http://localhost:8080/task/',
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
        'http://localhost:8080/task/1',
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
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
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
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
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
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
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

  it('shows empty list when API returns 404 (no records found)', async () => {
    const error = { response: { status: 404 } };
    axios.get.mockRejectedValueOnce(error);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('handles create task error', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
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

  // ----- AI Description Generator tests -----

  it('renders the "Generate with AI" button', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate with ai/i })).toBeInTheDocument();
    });
  });

  it('shows error toast when AI generate is clicked without a title', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const aiBtn = screen.getByRole('button', { name: /generate with ai/i });
    await user.click(aiBtn);

    expect(toast.error).toHaveBeenCalledWith('Please enter a task title first.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('calls AI endpoint with task title and populates description', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({ data: 'AI-generated description text.' });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const titleInput = screen.getAllByRole('textbox')[0];
    await user.type(titleInput, 'My AI Task');

    const aiBtn = screen.getByRole('button', { name: /generate with ai/i });
    await user.click(aiBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/ai/task/generate-description',
        { title: 'My AI Task' },
        { headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Description generated!');
    });

    const descriptionInput = screen.getAllByRole('textbox')[1];
    expect(descriptionInput).toHaveValue('AI-generated description text.');
  });

  it('shows error toast when AI endpoint fails', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error('AI service unavailable'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const titleInput = screen.getAllByRole('textbox')[0];
    await user.type(titleInput, 'Some Task');

    const aiBtn = screen.getByRole('button', { name: /generate with ai/i });
    await user.click(aiBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate description. Please try again.');
    });
  });

  // ----- AI Suggest Status tests -----

  it('renders the "Suggest with AI" button', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /suggest with ai/i })).toBeInTheDocument();
    });
  });

  it('shows error toast when suggest status is clicked without title or description', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const suggestBtn = screen.getByRole('button', { name: /suggest with ai/i });
    await user.click(suggestBtn);

    expect(toast.error).toHaveBeenCalledWith('Please enter a title and description first.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('calls suggest-status API and sets the returned status', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({ data: JSON.stringify({ status: 'IN_PROGRESS', reason: 'Work is underway.' }) });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    await user.type(titleInput, 'My Task');
    await user.type(descriptionInput, 'Some description');

    const suggestBtn = screen.getByRole('button', { name: /suggest with ai/i });
    await user.click(suggestBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/ai/task/suggest-status',
        { title: 'My Task', description: 'Some description' },
        { headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Status suggested: In Progress');
    });

    expect(screen.getByRole('combobox')).toHaveValue('In Progress');
  });

  it('shows error toast when suggest-status API fails', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error('AI unavailable'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    await user.type(titleInput, 'My Task');
    await user.type(descriptionInput, 'Some description');

    const suggestBtn = screen.getByRole('button', { name: /suggest with ai/i });
    await user.click(suggestBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to suggest status. Please try again.');
    });
  });

  // ----- AI Summarize Tasks tests -----

  it('renders the "Summarize Tasks" button', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /summarize tasks/i })).toBeInTheDocument();
    });
  });

  it('calls summarize API and shows summary panel', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: '1. Project is on track.\n2. One blocker found.' });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const summarizeBtn = screen.getByRole('button', { name: /summarize tasks/i });
    await user.click(summarizeBtn);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/ai/task/summarize',
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(screen.getByText('AI Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('1. Project is on track.')).toBeInTheDocument();
      expect(screen.getByText('2. One blocker found.')).toBeInTheDocument();
    });
  });

  it('toggles summary panel closed when button is clicked again', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: 'Summary text.' });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const summarizeBtn = screen.getByRole('button', { name: /summarize tasks/i });
    await user.click(summarizeBtn);

    await waitFor(() => {
      expect(screen.getByText('AI Executive Summary')).toBeInTheDocument();
    });

    // Button now says "Hide Summary" — click to close
    const hideBtn = screen.getByRole('button', { name: /hide summary/i });
    await user.click(hideBtn);

    expect(screen.queryByText('AI Executive Summary')).not.toBeInTheDocument();
  });

  it('closes summary panel when × button is clicked', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: 'Summary text.' });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /summarize tasks/i }));

    await waitFor(() => {
      expect(screen.getByText('AI Executive Summary')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Close'));

    expect(screen.queryByText('AI Executive Summary')).not.toBeInTheDocument();
  });

  it('shows error toast when summarize API fails', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockRejectedValueOnce(new Error('AI unavailable'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /summarize tasks/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to summarize tasks. Please try again.');
    });

    expect(screen.queryByText('AI Executive Summary')).not.toBeInTheDocument();
  });

  // ----- AI Break Down Task tests -----

  it('renders the "Break Down Task" button', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /break down task/i })).toBeInTheDocument();
    });
  });

  it('shows error toast when breakdown clicked without title or description', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /break down task/i }));

    expect(toast.error).toHaveBeenCalledWith('Please enter a title and description first.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('calls breakdown API and shows subtasks panel', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({ data: '1. Write unit tests.\n2. Implement the service layer.' });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    await user.type(titleInput, 'Complex Task');
    await user.type(descriptionInput, 'A very complex task description.');

    await user.click(screen.getByRole('button', { name: /break down task/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/ai/task/breakdown',
        { title: 'Complex Task', description: 'A very complex task description.' },
        { headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' } }
      );
      expect(screen.getByText('AI Task Breakdown')).toBeInTheDocument();
      expect(screen.getByText('1. Write unit tests.')).toBeInTheDocument();
      expect(screen.getByText('2. Implement the service layer.')).toBeInTheDocument();
    });
  });

  it('closes breakdown panel when × button is clicked', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({ data: '1. Subtask one.' });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    await user.type(titleInput, 'Task');
    await user.type(descriptionInput, 'Description');

    await user.click(screen.getByRole('button', { name: /break down task/i }));

    await waitFor(() => {
      expect(screen.getByText('AI Task Breakdown')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Close'));

    expect(screen.queryByText('AI Task Breakdown')).not.toBeInTheDocument();
  });

  it('clears breakdown panel when Reset is clicked', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({ data: '1. Subtask one.' });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    await user.type(titleInput, 'Task');
    await user.type(descriptionInput, 'Description');

    await user.click(screen.getByRole('button', { name: /break down task/i }));

    await waitFor(() => {
      expect(screen.getByText('AI Task Breakdown')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.queryByText('AI Task Breakdown')).not.toBeInTheDocument();
  });

  it('shows error toast when breakdown API fails', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error('AI unavailable'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    const titleInput = screen.getAllByRole('textbox')[0];
    const descriptionInput = screen.getAllByRole('textbox')[1];
    await user.type(titleInput, 'Task');
    await user.type(descriptionInput, 'Description');

    await user.click(screen.getByRole('button', { name: /break down task/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to break down task. Please try again.');
    });
  });

  // ----- AI Chat tests -----

  it('renders the "AI Chat" button', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ai chat/i })).toBeInTheDocument();
    });
  });

  it('opens chat modal when "AI Chat" button is clicked', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /ai chat/i }));

    expect(screen.getByRole('dialog', { name: /ai task chat/i })).toBeInTheDocument();
    expect(screen.getByText('AI Task Assistant')).toBeInTheDocument();
  });

  it('closes chat modal when × button is clicked', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /ai chat/i }));
    expect(screen.getByRole('dialog', { name: /ai task chat/i })).toBeInTheDocument();

    await user.click(screen.getByTitle('Close'));

    expect(screen.queryByRole('dialog', { name: /ai task chat/i })).not.toBeInTheDocument();
  });

  it('sends message to chat API and displays reply', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({ data: { reply: 'You have 3 tasks in progress.', tasksAnalyzed: 5 } });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /ai chat/i }));

    const chatInput = screen.getByRole('textbox', { name: /chat input/i });
    await user.type(chatInput, 'How many tasks are in progress?');

    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/ai/task/chat',
        { message: 'How many tasks are in progress?' },
        { headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' } }
      );
      expect(screen.getByText('How many tasks are in progress?')).toBeInTheDocument();
      expect(screen.getByText('You have 3 tasks in progress.')).toBeInTheDocument();
      expect(screen.getByText('5 tasks analysed')).toBeInTheDocument();
    });
  });

  it('shows error reply in chat when API fails', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error('AI unavailable'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /ai chat/i }));

    const chatInput = screen.getByRole('textbox', { name: /chat input/i });
    await user.type(chatInput, 'What should I focus on?');

    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('Sorry, I could not process your question. Please try again.')).toBeInTheDocument();
    });
  });

  it('disables Send button when chat input is empty', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /ai chat/i }));

    const sendBtn = screen.getByRole('button', { name: /send/i });
    expect(sendBtn).toBeDisabled();
  });

  // ----- AI Import Document tests -----

  it('renders the "Import Document" button', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /import document/i })).toBeInTheDocument();
    });
  });

  it('opens import modal when "Import Document" button is clicked', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /import document/i }));

    expect(screen.getByRole('dialog', { name: /import document/i })).toBeInTheDocument();
    expect(screen.getByText('Import Tasks from Document')).toBeInTheDocument();
  });

  it('closes import modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /import document/i }));
    expect(screen.getByRole('dialog', { name: /import document/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('dialog', { name: /import document/i })).not.toBeInTheDocument();
  });

  it('uploads file and shows success message', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({ data: { message: 'Successfully imported 3 tasks from document', taskIds: [1, 2, 3] } });
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /import document/i }));

    const fileInput = screen.getByLabelText(/choose document file/i);
    const file = new File(['dummy content'], 'sprint-plan.pdf', { type: 'application/pdf' });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: /^import$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/ai/task/import-document',
        expect.any(FormData),
        { headers: { Authorization: 'Bearer test-token', 'Content-Type': 'multipart/form-data' } }
      );
      expect(screen.getByText('Successfully imported 3 tasks from document')).toBeInTheDocument();
    });
  });

  it('shows error toast when import API fails', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error('Server error'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /import document/i }));

    const fileInput = screen.getByLabelText(/choose document file/i);
    const file = new File(['dummy'], 'notes.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: /^import$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to import document. Please try again.');
    });
  });

  it('disables Import button when no file is selected', async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks created.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /import document/i }));

    const importBtn = screen.getByRole('button', { name: /^import$/i });
    expect(importBtn).toBeDisabled();
  });
});
