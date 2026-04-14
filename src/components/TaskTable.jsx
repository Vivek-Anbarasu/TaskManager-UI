import { Fragment, useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

const TaskTable = ({
  tasks,
  handleEdit,
  handleDelete,
  isSummarizing,
  showSummary,
  setShowSummary,
  summary,
  summarizeTasks,
  onOpenImport,
  onOpenChat,
}) => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

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
              part === 'Acceptance Criteria:' ? <Fragment key={i}><br /><strong>{part}</strong></Fragment> : part
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
  ], [handleEdit, handleDelete]);

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

  return (
    <div className="table-area">
      <div className="table-toolbar">
        <button
          type="button"
          className="btn ai-import-btn"
          onClick={onOpenImport}
          title="Import tasks from a PDF or Word document"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16l-4-4h3V4h2v8h3l-4 4z" fill="#fff"/><path d="M4 20h16v-4h-2v2H6v-2H4v4z" fill="#fff"/></svg>
          Import Document
        </button>
        <button
          type="button"
          className="btn ai-chat-btn"
          onClick={onOpenChat}
          title="Ask AI about your tasks"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          AI Chat
        </button>
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
              <table className="task-table" role="table">
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
  );
};

export default TaskTable;
