import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import logo from '../assets/task-manager-logo.svg';
import { toast } from 'react-toastify';
import API_CONFIG from '../config/api';
import { initRefreshOnLoad, cancelRefreshTimer } from '../config/tokenManager';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done', 'Blocked'];

const AI_STATUS_MAP = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  BLOCKED: 'Blocked',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [editingId, setEditingId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingStatus, setIsSuggestingStatus] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const authHeader = () => {
    const token = localStorage.getItem('accessToken');
    console.log('Using token:', token);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    // adjust current page if tasks change (e.g., after delete)
    const totalPages = Math.max(1, Math.ceil(tasks.length / pagination.pageSize));
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [tasks]);

  const columns = useMemo(() => [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: (info) => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (info) => {
        const value = info.getValue() || '';
        const parts = value.split(/(Acceptance Criteria:)/);
        return (
          <span>
            {parts.map((part, i) =>
              part === 'Acceptance Criteria:' ? <><br key={i} /><strong>{part}</strong></> : part
            )}
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const v = info.getValue() || '';
        const lc = v.toString().toLowerCase();
        const cls = lc.includes('done') ? 'done' : lc.includes('progress') ? 'inprogress' : lc.includes('blocked') ? 'blocked' : 'todo';
        return <span className={`badge ${cls}`}>{v}</span>;
      },
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="action-buttons">
          <button className="icon-btn" title="Edit" onClick={() => handleEdit(row.original)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#0b2340"/><path d="M20.71 7.04a1.0001 1.0001 0 000-1.41l-2.34-2.34a1.0001 1.0001 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#0b2340"/></svg>
          </button>
          <button className="icon-btn" title="Delete" onClick={() => handleDelete(row.original.id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12z" fill="#dc3545"/><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#dc3545"/></svg>
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: tasks,
    columns,
    state: { columnFilters, sorting, pagination },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    initRefreshOnLoad();
    fetchTasks();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.TASK_BASE()}/`, { headers: authHeader() });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
      if (err.response && err.response.status === 401) navigate('/login');
      else if (err.response && err.response.status === 404) setTasks([]);
      else toast.error('Failed to load tasks');
    }
  };

  const summarizeTasks = async () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    setIsSummarizing(true);
    try {
      const res = await axios.get(
        `${API_CONFIG.AI_BASE()}/summarize`,
        { headers: authHeader() }
      );
      setSummary(res.data);
      setShowSummary(true);
    } catch (err) {
      console.error('AI summarization failed', err);
      toast.error('Failed to summarize tasks. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const suggestStatus = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter a title and description first.');
      return;
    }
    setIsSuggestingStatus(true);
    try {
      const res = await axios.post(
        `${API_CONFIG.AI_BASE()}/suggest-status`,
        { title, description },
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );
      const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      const mappedStatus = AI_STATUS_MAP[parsed.status];
      if (mappedStatus) {
        setStatus(mappedStatus);
        toast.success(`Status suggested: ${mappedStatus}`);
      } else {
        toast.info(`AI returned an unrecognised status: ${parsed.status}`);
      }
    } catch (err) {
      console.error('AI status suggestion failed', err);
      toast.error('Failed to suggest status. Please try again.');
    } finally {
      setIsSuggestingStatus(false);
    }
  };

  const generateDescription = async () => {
    if (!title.trim()) {
      toast.error('Please enter a task title first.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await axios.post(
        `${API_CONFIG.AI_BASE()}/generate-description`,
        { title },
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );
      setDescription(res.data);
      toast.success('Description generated!');
    } catch (err) {
      console.error('AI generation failed', err);
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus(STATUS_OPTIONS[0]);
    setEditingId(null);
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please provide title and description.');
      return;
    }

    if (editingId) {
      // update via API
      (async () => {
        try {
          const payload = { id: editingId, title, description, status };
          await axios.put(`${API_CONFIG.TASK_BASE()}/`, payload, { headers: authHeader() });
          toast.success('Task updated');
          await fetchTasks();
        } catch (err) {
          console.error('Update failed', err);
          toast.error('Failed to update task');
        }
      })();
    } else {
      // create via API
      (async () => {
        try {
          const payload = { title, description, status };
          await axios.post(`${API_CONFIG.TASK_BASE()}/`, payload, { headers: authHeader() });
          toast.success('Task created');
          await fetchTasks();
        } catch (err) {
          console.error('Create failed', err);
          toast.error('Failed to create task');
        }
      })();
    }
    resetForm();
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  };

  const handleDelete = (id) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete(`${API_CONFIG.TASK_BASE()}/${id}`, { headers: authHeader() });
              toast.success('Task deleted');
              await fetchTasks();
            } catch (err) {
              console.error('Delete failed', err);
              toast.error('Failed to delete task');
            }
          }
        },
        {
          label: 'No',
        }
      ]
    });
  };

  const handleLogout = () => {
    cancelRefreshTimer();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <img src={logo} alt="Task Manager" className="dashboard-logo" />
          </div>
          <div className="controls">
            <div className="user-controls">
              <div className="welcome-text">Logged in as {localStorage.getItem('name')}</div>
              <button className="icon-btn" title="Logout" aria-label="Logout" onClick={handleLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 13v-2H7V8l-5 4 5 4v-3h9z" fill="#dc3545"/><path d="M20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" fill="#dc3545"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="main-content">
          <form className="task-form" onSubmit={handleAddOrUpdate} aria-label="task-form">
          <div className="form-row">
            <div className="form-col">
              <label className="field-label">Title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-col">
              <div className="description-label-row">
                <label className="field-label">Status</label>
                <button
                  type="button"
                  className="btn ai-generate-btn"
                  onClick={suggestStatus}
                  disabled={isSuggestingStatus}
                  title="Suggest status using AI"
                >
                  {isSuggestingStatus ? (
                    <span className="ai-spinner" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" fill="#fff"/><path d="M19 15l1.09 3.26L23 19l-2.91.74L19 23l-1.09-3.26L15 19l2.91-.74L19 15z" fill="#fff"/></svg>
                  )}
                  {isSuggestingStatus ? 'Suggesting…' : 'Suggest with AI'}
                </button>
              </div>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="description-label-row">
              <label className="field-label">Description</label>
              <button
                type="button"
                className="btn ai-generate-btn"
                onClick={generateDescription}
                disabled={isGenerating}
                title="Generate description using AI"
              >
                {isGenerating ? (
                  <span className="ai-spinner" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" fill="#fff"/><path d="M19 15l1.09 3.26L23 19l-2.91.74L19 23l-1.09-3.26L15 19l2.91-.74L19 15z" fill="#fff"/></svg>
                )}
                {isGenerating ? 'Generating…' : 'Generate with AI'}
              </button>
            </div>
            <textarea className="input textarea-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn">{editingId ? 'Update Task' : 'Create Task'}</button>
            <button type="button" className="btn secondary" onClick={resetForm}>Reset</button>
          </div>
        </form>

          

          <div className="table-area">
            <div className="table-toolbar">
              <button
                type="button"
                className="btn ai-summarize-btn"
                onClick={summarizeTasks}
                disabled={isSummarizing}
                title="Get an AI executive summary of all tasks"
              >
                {isSummarizing ? (
                  <span className="ai-spinner" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 10h16M4 14h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" fill="#fff" opacity="0.6"/></svg>
                )}
                {isSummarizing ? 'Summarizing…' : showSummary ? 'Hide Summary' : 'Summarize Tasks'}
              </button>
            </div>

            {showSummary && summary && (
              <div className="ai-summary-panel">
                <div className="ai-summary-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" fill="#6366f1"/></svg>
                  <span>AI Executive Summary</span>
                  <button className="summary-close-btn" onClick={() => setShowSummary(false)} title="Close">✕</button>
                </div>
                <div className="ai-summary-body">
                  {summary.split('\n').map((line, i) => (
                    line.trim() ? <p key={i} className="summary-line">{line}</p> : null
                  ))}
                </div>
              </div>
            )}

            <div>
              {tasks.length === 0 ? (
                <div className="empty">No tasks created.</div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className={`task-table`} role="table">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined} className={header.column.getCanSort() ? 'sortable-header' : ''}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <span className="sort-icon">{header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' ▲' : ' ▼') : header.column.getCanSort() ? ' ⇅' : ''}</span>
                          </th>
                        ))}
                      </tr>
                    ))}
                    {/* column filter row */}
                    <tr>
                      {table.getAllColumns().map((column) => (
                        <th key={column.id}>
                          {column.getCanFilter() ? (
                            <input className="column-search" placeholder={`Search ${column.id}`} value={column.getFilterValue() ?? ''} onChange={(e) => column.setFilterValue(e.target.value)} />
                          ) : null}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                   
                  </div>

                  <div className="pagination">
                <label className="page-size-label">
                  Show
                  <select
                    className="page-size-select"
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      const s = Number(e.target.value);
                      table.setPageSize(s);
                      table.setPageIndex(0);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  per page
                </label>
                <div className="pagination-info">Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} - {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length}</div>
                <button className="page-btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</button>
                {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((num) => (
                  <button key={num} className={`page-btn ${num - 1 === table.getState().pagination.pageIndex ? 'active' : ''}`} onClick={() => table.setPageIndex(num - 1)}>{num}</button>
                ))}
                <button className="page-btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Dashboard;
