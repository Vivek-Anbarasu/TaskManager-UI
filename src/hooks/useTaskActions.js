import { useState, useCallback, useTransition } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { TASK_BASE } from '../config/api';

export const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done', 'Blocked'];

export function useTaskActions({ authHeader, navigate }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, startSubmitTransition] = useTransition();

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${TASK_BASE()}/`, { headers: authHeader() });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/login');
      else if (err.response && err.response.status === 404) setTasks([]);
      else toast.error('Failed to load tasks');
    }
  }, [authHeader, navigate]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setStatus(STATUS_OPTIONS[0]);
    setEditingId(null);
  }, []);

  const handleAddOrUpdate = useCallback((e, onSuccess) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please provide title and description.');
      return;
    }
    startSubmitTransition(async () => {
      if (editingId) {
        try {
          await axios.put(`${TASK_BASE()}/`, { id: editingId, title, description, status }, { headers: authHeader() });
          toast.success('Task updated');
          await fetchTasks();
        } catch {
          toast.error('Failed to update task');
        }
      } else {
        try {
          await axios.post(`${TASK_BASE()}/`, { title, description, status }, { headers: authHeader() });
          toast.success('Task created');
          await fetchTasks();
        } catch {
          toast.error('Failed to create task');
        }
      }
      resetForm();
      onSuccess?.();
    });
  }, [title, description, status, editingId, authHeader, fetchTasks, resetForm]);

  const handleEdit = useCallback((task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  }, []);

  const handleDelete = useCallback((id) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete(`${TASK_BASE()}/${id}`, { headers: authHeader() });
              toast.success('Task deleted');
              await fetchTasks();
            } catch {
              toast.error('Failed to delete task');
            }
          },
        },
        { label: 'No' },
      ],
    });
  }, [authHeader, fetchTasks]);

  return {
    tasks, title, setTitle, description, setDescription,
    status, setStatus, editingId, isSubmitting,
    fetchTasks, resetForm, handleAddOrUpdate, handleEdit, handleDelete,
  };
}
